// Sessão de visitante pra carrinho. Cookie httpOnly de longa duração.
// Quando o visitante faz login, o controller de auth faz merge do cart.
import type { Request, Response } from 'express'
import crypto from 'node:crypto'
import { env, isProd } from '../config/env.js'

const COOKIE = 'guest_sid'
const ONE_YEAR_MS = 365 * 24 * 60 * 60 * 1000

export function getOrCreateGuestSession(req: Request, res: Response): string {
  const existing = req.cookies?.[COOKIE]
  if (existing && typeof existing === 'string' && existing.length >= 16) return existing

  const fresh = crypto.randomUUID()
  res.cookie(COOKIE, fresh, {
    httpOnly: true,
    secure:   isProd,
    sameSite: 'lax',
    maxAge:   ONE_YEAR_MS,
    path:     '/',
    ...(env.COOKIE_DOMAIN ? { domain: env.COOKIE_DOMAIN } : {}),
  })
  return fresh
}

export function clearGuestSession(res: Response): void {
  const opts = { path: '/', ...(env.COOKIE_DOMAIN ? { domain: env.COOKIE_DOMAIN } : {}) }
  res.clearCookie(COOKIE, opts)
}
