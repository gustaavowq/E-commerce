// Middleware de autenticação. Lê access token do cookie OU header Authorization.
import type { Request, Response, NextFunction } from 'express'
import { verifyAccessToken, type UserRole } from '../lib/jwt.js'
import { errors } from '../lib/api-response.js'
import { prisma } from '../lib/prisma.js'

export type AuthUser = {
  id: string
  role: UserRole
}

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: AuthUser
    }
  }
}

function extractToken(req: Request): string | null {
  const cookieToken = req.cookies?.access_token
  if (cookieToken) return cookieToken

  const auth = req.header('authorization')
  if (auth?.startsWith('Bearer ')) return auth.slice(7)

  return null
}

// extractUser: opcional. Coloca req.user se houver token válido. Não bloqueia.
export function extractUser(req: Request, _res: Response, next: NextFunction): void {
  const token = extractToken(req)
  if (!token) return next()

  try {
    const payload = verifyAccessToken(token)
    req.user = { id: payload.sub, role: payload.role }
  } catch {
    // token inválido/expirado: ignora silenciosamente
  }
  next()
}

// requireAuth: bloqueia se não tiver user
export function requireAuth(req: Request, _res: Response, next: NextFunction): void {
  if (!req.user) return next(errors.unauthorized())
  next()
}

// requireRole: bloqueia se a role não bater. Aceita string ou array.
export function requireRole(role: UserRole | UserRole[]) {
  const allowed = Array.isArray(role) ? role : [role]
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) return next(errors.unauthorized())
    if (!allowed.includes(req.user.role)) {
      return next(errors.forbidden(`Esta ação requer role ${allowed.join(' ou ')}`))
    }
    next()
  }
}

// loadCurrentUser: carrega o User completo do banco (campos seguros).
export async function loadCurrentUser(req: Request) {
  if (!req.user) return null
  return prisma.user.findUnique({
    where: { id: req.user.id },
    select: {
      id: true, email: true, name: true, phone: true,
      role: true, emailVerifiedAt: true, createdAt: true,
    },
  })
}
