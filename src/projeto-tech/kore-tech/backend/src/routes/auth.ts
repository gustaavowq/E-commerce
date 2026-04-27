// Rotas de autenticação. Cadastro público SEMPRE cria CUSTOMER.
// Login funciona pra ambas roles e o cliente decide o redirect.
//
// Lições aplicadas:
//   - JWT_SECRET sem default (lição #01) — cai no env.ts
//   - Refresh com rotation + reuse detection (anti-roubo de token)
//   - Forgot/reset não vaza URL na response (lição do Miami pentest)
//   - Auth limiter por IP+rota
import { Router, type Request, type Response, type NextFunction } from 'express'
import rateLimit from 'express-rate-limit'
import crypto from 'node:crypto'
import { prisma } from '../lib/prisma.js'
import { hashPassword, verifyPassword } from '../lib/password.js'
import {
  signAccessToken,
  generateRefreshTokenRaw,
  hashRefreshToken,
  expiresInToDate,
  expiresInToMs,
} from '../lib/jwt.js'
import { ok, created, errors } from '../lib/api-response.js'
import {
  registerSchema, loginSchema,
  forgotPasswordSchema, resetPasswordSchema,
} from '../validators/auth.js'
import { requireAuth, loadCurrentUser } from '../middleware/auth.js'
import { env, isDev, isProd } from '../config/env.js'

export const authRouter: Router = Router()

const authLimiter = rateLimit({
  windowMs: 60_000,
  limit: 10,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { success: false, error: { code: 'RATE_LIMITED', message: 'Muitas tentativas, espere um pouco' } },
})

const forgotLimiter = rateLimit({
  windowMs: 60 * 60_000,
  limit: 5,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { success: false, error: { code: 'RATE_LIMITED', message: 'Muitas tentativas, espere uma hora' } },
})

function setAuthCookies(res: Response, accessToken: string, refreshTokenRaw: string) {
  const sameSite = env.COOKIE_SAMESITE === 'none' ? 'none' as const : 'lax' as const
  // SameSite=None EXIGE Secure=true.
  const secure = isProd || sameSite === 'none'

  const cookieBase = {
    httpOnly: true,
    secure,
    sameSite,
    path:     '/',
    ...(env.COOKIE_DOMAIN ? { domain: env.COOKIE_DOMAIN } : {}),
  }
  res.cookie('access_token',  accessToken, {
    ...cookieBase,
    maxAge: expiresInToMs(env.JWT_EXPIRES_IN),
  })
  res.cookie('refresh_token', refreshTokenRaw, {
    ...cookieBase,
    maxAge: expiresInToMs(env.JWT_REFRESH_EXPIRES_IN),
  })
}

function clearAuthCookies(res: Response) {
  const opts = { path: '/', ...(env.COOKIE_DOMAIN ? { domain: env.COOKIE_DOMAIN } : {}) }
  res.clearCookie('access_token',  opts)
  res.clearCookie('refresh_token', opts)
}

async function issueRefreshToken(userId: string, req: Request): Promise<string> {
  const raw = generateRefreshTokenRaw()
  await prisma.refreshToken.create({
    data: {
      userId,
      tokenHash: hashRefreshToken(raw),
      expiresAt: expiresInToDate(env.JWT_REFRESH_EXPIRES_IN),
      userAgent: req.header('user-agent')?.slice(0, 200),
      ip:        req.ip,
    },
  })
  return raw
}

// =====================================================================
// POST /auth/register
// =====================================================================
authRouter.post('/register', authLimiter, async (req, res, next) => {
  try {
    const body = registerSchema.parse(req.body)

    const existing = await prisma.user.findUnique({ where: { email: body.email } })
    if (existing) throw errors.conflict('Email já cadastrado')

    const passwordHash = await hashPassword(body.password)
    const user = await prisma.user.create({
      data: {
        email:        body.email,
        passwordHash,
        name:         body.name,
        phone:        body.phone,
        cpf:          body.cpf?.replace(/\D/g, ''),
        role:         'CUSTOMER',  // FORÇADO — nunca lê do body
      },
      select: { id: true, email: true, name: true, role: true, createdAt: true },
    })

    const accessToken = signAccessToken({ userId: user.id, role: user.role })
    const refreshTokenRaw = await issueRefreshToken(user.id, req)
    setAuthCookies(res, accessToken, refreshTokenRaw)

    return created(res, { user, accessToken })
  } catch (err) {
    next(err)
  }
})

// =====================================================================
// POST /auth/login
// =====================================================================
authRouter.post('/login', authLimiter, async (req, res, next) => {
  try {
    const body = loginSchema.parse(req.body)

    const user = await prisma.user.findUnique({ where: { email: body.email } })
    if (!user) throw errors.unauthorized('Email ou senha incorretos')

    const valid = await verifyPassword(body.password, user.passwordHash)
    if (!valid) throw errors.unauthorized('Email ou senha incorretos')

    // Merge cart de visitante → cart do user
    const guestSid = req.cookies?.guest_sid
    if (guestSid && user.role === 'CUSTOMER') {
      try {
        await mergeGuestCart(guestSid, user.id)
      } catch (e) {
        console.warn('[auth/login] cart merge falhou:', e)
      }
    }

    const accessToken = signAccessToken({ userId: user.id, role: user.role })
    const refreshTokenRaw = await issueRefreshToken(user.id, req)
    setAuthCookies(res, accessToken, refreshTokenRaw)

    return ok(res, {
      user: {
        id:    user.id,
        email: user.email,
        name:  user.name,
        role:  user.role,
      },
      accessToken,
    })
  } catch (err) {
    next(err)
  }
})

async function mergeGuestCart(guestSid: string, userId: string): Promise<void> {
  const guestCart = await prisma.cart.findFirst({
    where:   { sessionId: guestSid, status: 'active' },
    include: { items: { include: { variation: { select: { stock: true } } } } },
    orderBy: { updatedAt: 'desc' },
  })
  if (!guestCart || guestCart.items.length === 0) return

  const userCart = await prisma.cart.findFirst({
    where:   { userId, status: 'active' },
    orderBy: { updatedAt: 'desc' },
  }) ?? await prisma.cart.create({ data: { userId, status: 'active' } })

  for (const item of guestCart.items) {
    const existing = await prisma.cartItem.findUnique({
      where: { cartId_variationId: { cartId: userCart.id, variationId: item.variationId } },
    })
    const targetQty = Math.min(
      item.variation.stock,
      (existing?.quantity ?? 0) + item.quantity,
    )
    if (targetQty <= 0) continue

    if (existing) {
      await prisma.cartItem.update({ where: { id: existing.id }, data: { quantity: targetQty } })
    } else {
      await prisma.cartItem.create({
        data: {
          cartId:      userCart.id,
          productId:   item.productId,
          variationId: item.variationId,
          quantity:    targetQty,
        },
      })
    }
  }

  await prisma.cart.update({
    where: { id: guestCart.id },
    data:  { status: 'converted', convertedAt: new Date() },
  })
}

// =====================================================================
// POST /auth/refresh — rotaciona refresh + emite novo access
// Detecta REUSO: se token revogado é apresentado, alguém roubou. Revoga TUDO.
// =====================================================================
authRouter.post('/refresh', async (req, res, next) => {
  try {
    const raw = req.cookies?.refresh_token
    if (!raw) throw errors.unauthorized('Refresh token ausente')

    const tokenRecord = await prisma.refreshToken.findUnique({
      where: { tokenHash: hashRefreshToken(raw) },
    })
    if (!tokenRecord) {
      clearAuthCookies(res)
      throw errors.unauthorized('Refresh token inválido')
    }
    if (tokenRecord.expiresAt < new Date()) {
      clearAuthCookies(res)
      throw errors.unauthorized('Refresh token expirado')
    }

    if (tokenRecord.revokedAt) {
      // Reuse → roubo. Revoga toda a chain.
      await prisma.refreshToken.updateMany({
        where: { userId: tokenRecord.userId, revokedAt: null },
        data:  { revokedAt: new Date() },
      })
      clearAuthCookies(res)
      console.warn(`[auth] Reuso de refresh token detectado pra user ${tokenRecord.userId}, sessão revogada`)
      throw errors.unauthorized('Sessão revogada por motivo de segurança. Faça login de novo.')
    }

    const user = await prisma.user.findUnique({
      where: { id: tokenRecord.userId },
      select: { id: true, role: true, email: true, name: true },
    })
    if (!user) {
      clearAuthCookies(res)
      throw errors.unauthorized('Usuário não encontrado')
    }

    const newRaw = generateRefreshTokenRaw()
    const newToken = await prisma.refreshToken.create({
      data: {
        userId:    user.id,
        tokenHash: hashRefreshToken(newRaw),
        expiresAt: expiresInToDate(env.JWT_REFRESH_EXPIRES_IN),
        userAgent: req.header('user-agent')?.slice(0, 200),
        ip:        req.ip,
      },
    })
    await prisma.refreshToken.update({
      where: { id: tokenRecord.id },
      data:  { revokedAt: new Date(), replacedById: newToken.id },
    })

    const accessToken = signAccessToken({ userId: user.id, role: user.role })
    setAuthCookies(res, accessToken, newRaw)

    return ok(res, { user, accessToken })
  } catch (err) {
    next(err)
  }
})

// =====================================================================
// POST /auth/logout
// =====================================================================
authRouter.post('/logout', async (req, res, next) => {
  try {
    const raw = req.cookies?.refresh_token
    if (raw) {
      await prisma.refreshToken.updateMany({
        where: { tokenHash: hashRefreshToken(raw), revokedAt: null },
        data:  { revokedAt: new Date() },
      })
    }
    clearAuthCookies(res)
    return ok(res, { message: 'Logout realizado' })
  } catch (err) {
    next(err)
  }
})

// =====================================================================
// POST /auth/logout-all
// =====================================================================
authRouter.post('/logout-all', requireAuth, async (req, res, next) => {
  try {
    const userId = req.user!.id
    const result = await prisma.refreshToken.updateMany({
      where: { userId, revokedAt: null },
      data:  { revokedAt: new Date() },
    })
    clearAuthCookies(res)
    return ok(res, { message: 'Todas as sessões encerradas', revoked: result.count })
  } catch (err) { next(err) }
})

// =====================================================================
// POST /auth/forgot-password — sempre 200 padrão (anti enumeração).
// NUNCA retorna URL na response. Só log em dev.
// =====================================================================
authRouter.post('/forgot-password', forgotLimiter, async (req, res, next) => {
  try {
    const { email } = forgotPasswordSchema.parse(req.body)
    const user = await prisma.user.findUnique({ where: { email } })

    const standardResponse = {
      message: 'Se este email tiver cadastro, enviamos um link de recuperação. Confere a caixa de entrada e o spam.',
    }

    if (!user) {
      // Delay artificial pra não dar pra enumerar via timing
      await new Promise(r => setTimeout(r, 200))
      return ok(res, standardResponse)
    }

    const rawToken = crypto.randomBytes(32).toString('base64url')
    const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex')

    await prisma.passwordResetToken.updateMany({
      where: { userId: user.id, usedAt: null },
      data:  { usedAt: new Date() },
    })

    await prisma.passwordResetToken.create({
      data: {
        userId:    user.id,
        tokenHash,
        expiresAt: new Date(Date.now() + 60 * 60_000),  // 1h
        ip:        req.ip,
        userAgent: req.header('user-agent')?.slice(0, 200),
      },
    })

    const resetUrl = buildResetUrl(req, rawToken)
    if (isDev) {
      // Sprint 2 — logger estruturado, redact em prod (env.NODE_ENV !== dev
      // bloqueia esta linha de qualquer forma). Não vaza em response.
      req.log.debug({ resetUrl, email: user.email }, 'password reset url generated (dev only)')
    }

    // TODO(resend): integrar Resend pra mandar email pra user.email
    return ok(res, standardResponse)
  } catch (err) { next(err) }
})

function buildResetUrl(req: Request, rawToken: string): string {
  const origin = req.header('origin') ?? req.header('referer') ?? env.STORE_URL ?? 'http://loja.kore.test'
  const cleanOrigin = new URL(origin).origin
  return `${cleanOrigin}/auth/reset?token=${rawToken}`
}

// =====================================================================
// POST /auth/reset-password
// =====================================================================
authRouter.post('/reset-password', authLimiter, async (req, res, next) => {
  try {
    const body = resetPasswordSchema.parse(req.body)

    const tokenHash = crypto.createHash('sha256').update(body.token).digest('hex')
    const record = await prisma.passwordResetToken.findUnique({
      where: { tokenHash },
      include: { user: { select: { id: true, email: true, name: true, role: true } } },
    })
    if (!record || record.usedAt || record.expiresAt < new Date()) {
      throw errors.badRequest('Token inválido ou expirado. Solicita um novo.')
    }

    const newHash = await hashPassword(body.password)

    await prisma.$transaction([
      prisma.passwordResetToken.update({
        where: { id: record.id },
        data:  { usedAt: new Date() },
      }),
      prisma.user.update({
        where: { id: record.userId },
        data:  { passwordHash: newHash },
      }),
      prisma.refreshToken.updateMany({
        where: { userId: record.userId, revokedAt: null },
        data:  { revokedAt: new Date() },
      }),
    ])

    const accessToken = signAccessToken({ userId: record.user.id, role: record.user.role })
    const refreshTokenRaw = await issueRefreshToken(record.user.id, req)
    setAuthCookies(res, accessToken, refreshTokenRaw)

    return ok(res, {
      message: 'Senha alterada. Você já tá logado.',
      user: {
        id:    record.user.id,
        email: record.user.email,
        name:  record.user.name,
        role:  record.user.role,
      },
    })
  } catch (err) { next(err) }
})

// =====================================================================
// GET /auth/me
// =====================================================================
authRouter.get('/me', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await loadCurrentUser(req)
    if (!user) throw errors.unauthorized()
    return ok(res, { user })
  } catch (err) {
    next(err)
  }
})
