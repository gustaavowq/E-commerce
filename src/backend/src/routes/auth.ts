// Rotas de autenticação. Cadastro público SEMPRE cria CUSTOMER (regra do
// kickoff). Login funciona pra ambas roles e o cliente decide o redirect.
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

// Rate limit anti-bruteforce nas rotas sensíveis. O Nginx já limita também,
// mas dupla camada nunca fez mal.
const authLimiter = rateLimit({
  windowMs: 60_000,
  limit: 10,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { success: false, error: { code: 'RATE_LIMITED', message: 'Muitas tentativas, espere um pouco' } },
})

// Helper pra setar cookies de auth (httpOnly + secure + sameSite)
// Em DEV: SameSite=Lax + Domain=.miami.test (compartilha entre subdomínios)
// Em PROD com COOKIE_SAMESITE=none: SameSite=None + Secure (cross-site, ex:
//   loja em vercel.app + api em railway.app). Exige HTTPS, qual ambos têm.
function setAuthCookies(res: Response, accessToken: string, refreshTokenRaw: string) {
  const sameSite = env.COOKIE_SAMESITE === 'none' ? 'none' as const : 'lax' as const
  // SameSite=None EXIGE Secure=true. Forçamos isso pra evitar config quebrada.
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

// Cria refresh token no banco (guarda só o hash, devolve o raw pro cookie)
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
// POST /api/auth/register — cadastro público (sempre CUSTOMER)
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
// POST /api/auth/login — login pra CUSTOMER ou ADMIN
// Merge automático do carrinho de visitante pro carrinho do user.
// =====================================================================
authRouter.post('/login', authLimiter, async (req, res, next) => {
  try {
    const body = loginSchema.parse(req.body)

    const user = await prisma.user.findUnique({ where: { email: body.email } })
    if (!user) throw errors.unauthorized('Email ou senha incorretos')

    const valid = await verifyPassword(body.password, user.passwordHash)
    if (!valid) throw errors.unauthorized('Email ou senha incorretos')

    // Merge cart de visitante (cookie guest_sid) → cart do user
    const guestSid = req.cookies?.guest_sid
    if (guestSid && user.role === 'CUSTOMER') {
      try {
        await mergeGuestCart(guestSid, user.id)
      } catch (e) {
        // não bloqueia o login se merge falhar
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

// Junta carrinho de visitante (sessionId) com carrinho do user logado.
// Pra cada item do guest cart: se o user já tem o mesmo variationId, soma
// as quantidades respeitando estoque. Se não tem, transfere o item.
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

  // Marca o cart de visitante como mergeado pra não ressuscitar
  await prisma.cart.update({
    where: { id: guestCart.id },
    data:  { status: 'converted', convertedAt: new Date() },
  })
}

// =====================================================================
// POST /api/auth/refresh — rotaciona refresh + gera novo access
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

    // Token já revogado MAS continua sendo apresentado → indica reuso/roubo.
    // Revoga TODOS os refresh tokens daquele usuário pra forçar re-login.
    if (tokenRecord.revokedAt) {
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

    // Emite o novo refresh primeiro (precisa do ID pra linkar replacedById)
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
    // Revoga o antigo apontando pro novo (chain pra detectar reuso)
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
// POST /api/auth/logout — revoga refresh + limpa cookies
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
// POST /api/auth/logout-all — revoga TODAS as sessões ativas do usuário
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
// POST /api/auth/forgot-password — gera token (entrega por email/whatsapp)
// SEMPRE responde 200 mesmo se email não existir (anti-enumeração).
// Em DEV, retorna o link de reset direto na response pra facilitar teste.
// =====================================================================
const forgotLimiter = rateLimit({
  windowMs: 60 * 60_000,  // 1h
  limit: 5,                // 5 tentativas por hora por IP
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { success: false, error: { code: 'RATE_LIMITED', message: 'Muitas tentativas, espere uma hora' } },
})

authRouter.post('/forgot-password', forgotLimiter, async (req, res, next) => {
  try {
    const { email } = forgotPasswordSchema.parse(req.body)
    const user = await prisma.user.findUnique({ where: { email } })

    // Resposta padrão (não revela se email existe)
    const standardResponse = {
      message: 'Se este email tiver cadastro, enviamos um link de recuperação. Confere a caixa de entrada e o spam.',
    }

    if (!user) {
      // Mesmo delay artificial pra não dar pra enumerar via timing
      await new Promise(r => setTimeout(r, 200))
      return ok(res, standardResponse)
    }

    // Gera token (single-use, expira em 1h)
    const rawToken = crypto.randomBytes(32).toString('base64url')
    const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex')

    // Invalida tokens antigos não usados desse user (só o mais recente vale)
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

    // Em prod: aqui chama o serviço de email/whatsapp.
    // Em dev: SOMENTE log no servidor (NUNCA na response — pentest 2026-04-26
    // mostrou que isso permitia takeover de conta por qualquer attacker que
    // soubesse o email da vítima).
    const resetUrl = buildResetUrl(req, rawToken)
    if (isDev) {
      console.log(`[dev] reset url: ${resetUrl}`)
    }

    // TODO: integrar com serviço de email (SES/SendGrid) ou WhatsApp Business API
    // pra enviar resetUrl pro user.email
    return ok(res, standardResponse)
  } catch (err) { next(err) }
})

function buildResetUrl(req: Request, rawToken: string): string {
  // Detecta de onde veio (loja vs painel) pra mandar pro lugar certo
  const origin = req.header('origin') ?? req.header('referer') ?? 'http://miami.test'
  const cleanOrigin = new URL(origin).origin
  return `${cleanOrigin}/auth/reset?token=${rawToken}`
}

// =====================================================================
// POST /api/auth/reset-password — usa o token e seta nova senha
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

    // Atomicamente: marca token usado, troca senha, revoga sessões antigas
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

    // Já loga o user com a nova senha (UX melhor que mandar pra /login)
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
// GET /api/auth/me — usuário atual (requer auth)
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
