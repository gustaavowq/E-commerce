// Camada fina sobre jsonwebtoken pra padronizar payload + erros.
// Access token (curto, 15min) vai no payload do JWT.
// Refresh token é opaco (random base64url, hasheado no DB).
import jwt, { type JwtPayload, type SignOptions } from 'jsonwebtoken'
import crypto from 'node:crypto'
import { env } from '../config/env.js'

export type UserRole = 'USER' | 'ADMIN' | 'ANALYST'

export type AccessTokenPayload = JwtPayload & {
  sub:  string         // userId
  role: UserRole
}

export function signAccessToken(payload: { userId: string; role: UserRole }): string {
  const opts: SignOptions = {
    expiresIn: env.JWT_EXPIRES_IN as SignOptions['expiresIn'],
    issuer:    'marquesa',
    audience:  'marquesa-app',
  }
  return jwt.sign({ sub: payload.userId, role: payload.role }, env.JWT_SECRET, opts)
}

export function verifyAccessToken(token: string): AccessTokenPayload {
  const decoded = jwt.verify(token, env.JWT_SECRET, {
    issuer:   'marquesa',
    audience: 'marquesa-app',
  })
  if (typeof decoded === 'string') {
    throw new Error('Token inválido (string payload)')
  }
  return decoded as AccessTokenPayload
}

// Refresh tokens são opacos (random) — guardamos hash no banco e enviamos
// o valor cru no cookie. Cada refresh rotaciona o token (revoga o antigo).
export function generateRefreshTokenRaw(): string {
  return crypto.randomBytes(48).toString('base64url')
}

export function hashRefreshToken(raw: string): string {
  return crypto.createHash('sha256').update(raw).digest('hex')
}

// Helpers pra calcular expiração baseado em strings tipo "30d", "1h"
export function expiresInToMs(expiresIn: string): number {
  const match = expiresIn.match(/^(\d+)([smhd])$/)
  if (!match) throw new Error(`Formato inválido de expiresIn: ${expiresIn}`)
  const num  = Number(match[1])
  const unit = match[2] as 's' | 'm' | 'h' | 'd'
  const multipliers: Record<'s' | 'm' | 'h' | 'd', number> = {
    s: 1000, m: 60_000, h: 3_600_000, d: 86_400_000,
  }
  return num * multipliers[unit]
}

export function expiresInToDate(expiresIn: string, from = new Date()): Date {
  return new Date(from.getTime() + expiresInToMs(expiresIn))
}
