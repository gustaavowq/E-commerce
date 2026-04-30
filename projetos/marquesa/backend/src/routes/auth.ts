// Rotas de autenticação. Cadastro público sempre USER. Login retorna user+role
// pra cliente decidir redirect (ADMIN/ANALYST → /painel, USER → /).
import { Router, type Request, type Response } from 'express'
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
import { requireAuth, loadCurrentUser } from '../middlewares/auth.js'
import { authLimiter, forgotLimiter } from '../middlewares/rateLimit.js'
import { env, isDev, isProd } from '../config/env.js'
import { logger } from '../lib/logger.js'

export const authRouter: Router = Router()

// Cookie helpers ------------------------------------------------------------
function setAuthCookies(res: Response, accessToken: string, refreshTokenRaw: string) {
  const sameSite = env.COOKIE_SAMESITE === 'none' ? 'none' as const
                 : env.COOKIE_SAMESITE === 'strict' ? 'strict' as const
                 : 'lax' as const
  // SameSite=None EXIGE Secure=true.
  const secure = env.COOKIE_SECURE || isProd || sameSite === 'none'

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
// POST /api/auth/register
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
        role:         'USER',  // FORÇADO — nunca lê do body
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
// POST /api/auth/login
// =====================================================================
authRouter.post('/login', authLimiter, async (req, res, next) => {
  try {
    const body = loginSchema.parse(req.body)

    const user = await prisma.user.findUnique({ where: { email: body.email } })
    if (!user) throw errors.unauthorized('Email ou senha incorretos')

    const valid = await verifyPassword(body.password, user.passwordHash)
    if (!valid) throw errors.unauthorized('Email ou senha incorretos')

    const accessToken = signAccessToken({ userId: user.id, role: user.role })
    const refreshTokenRaw = await issueRefreshToken(user.id, req)
    setAuthCookies(res, accessToken, refreshTokenRaw)

    return ok(res, {
      user: { id: user.id, email: user.email, name: user.name, role: user.role },
      accessToken,
    })
  } catch (err) {
    next(err)
  }
})

// =====================================================================
// POST /api/auth/refresh — rotaciona refresh + gera novo access
// Detecta REUSO: se token revogado é apresentado, revoga TUDO da chain.
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
      // Reuso detectado: revoga TODOS os refresh tokens daquele usuário
      await prisma.refreshToken.updateMany({
        where: { userId: tokenRecord.userId, revokedAt: null },
        data:  { revokedAt: new Date() },
      })
      clearAuthCookies(res)
      logger.warn({ userId: tokenRecord.userId }, '[auth] Reuso de refresh token detectado, sessão revogada')
      throw errors.unauthorized('Sessão revogada por motivo de segurança. Faça login de novo.')
    }

    const user = await prisma.user.findUnique({
      where:  { id: tokenRecord.userId },
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
// POST /api/auth/logout
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
// POST /api/auth/forgot-password — anti-enumeração: sempre 200
// =====================================================================
authRouter.post('/forgot-password', forgotLimiter, async (req, res, next) => {
  try {
    const { email } = forgotPasswordSchema.parse(req.body)
    const user = await prisma.user.findUnique({ where: { email } })

    const standardResponse = {
      message: 'Se este email tiver cadastro, enviamos um link de recuperação.',
    }

    if (!user) {
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
        expiresAt: new Date(Date.now() + 60 * 60_000),
        ip:        req.ip,
        userAgent: req.header('user-agent')?.slice(0, 200),
      },
    })

    const resetUrl = buildResetUrl(req, rawToken)
    if (isDev) {
      // Em DEV, log no servidor pra facilitar teste (NUNCA na response).
      logger.info({ resetUrl }, '[dev] reset url')
    }
    // TODO integrar serviço de email (Resend) — fora do escopo MVP.

    return ok(res, standardResponse)
  } catch (err) {
    next(err)
  }
})

function buildResetUrl(req: Request, rawToken: string): string {
  const origin = req.header('origin') ?? req.header('referer') ?? env.PUBLIC_WEB_URL
  const cleanOrigin = new URL(origin).origin
  return `${cleanOrigin}/auth/reset?token=${rawToken}`
}

// =====================================================================
// POST /api/auth/reset-password
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
        id: record.user.id, email: record.user.email,
        name: record.user.name, role: record.user.role,
      },
    })
  } catch (err) {
    next(err)
  }
})

// =====================================================================
// GET /api/auth/me
// =====================================================================
authRouter.get('/me', requireAuth, async (req, res, next) => {
  try {
    const user = await loadCurrentUser(req)
    if (!user) throw errors.unauthorized()
    return ok(res, { user })
  } catch (err) {
    next(err)
  }
})
