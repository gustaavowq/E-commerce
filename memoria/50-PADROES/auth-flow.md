# Padrão: Auth flow completo

> Snippets prontos pra colar. Tudo testado no Miami Store + endurecido pelo pentest.

## Backend

### `src/backend/src/lib/jwt.ts`

```ts
import jwt from 'jsonwebtoken'
import crypto from 'node:crypto'
import { env } from '../config/env.js'

export function signAccessToken(payload: { sub: string; role: string }): string {
  return jwt.sign(payload, env.JWT_SECRET, { expiresIn: env.JWT_EXPIRES_IN })
}

export function verifyAccessToken(token: string): { sub: string; role: string } {
  return jwt.verify(token, env.JWT_SECRET) as { sub: string; role: string }
}

export function generateRefreshTokenRaw(): string {
  return crypto.randomBytes(48).toString('base64url')
}

export function hashRefreshToken(raw: string): string {
  return crypto.createHash('sha256').update(raw).digest('hex')
}

export function expiresInToDate(expiresIn: string): Date {
  return new Date(Date.now() + expiresInToMs(expiresIn))
}

export function expiresInToMs(s: string): number {
  // '15m' → 900_000; '30d' → 2_592_000_000
  const m = s.match(/^(\d+)([smhd])$/)
  if (!m) throw new Error(`Invalid expires_in: ${s}`)
  const n = Number(m[1])
  return n * { s: 1_000, m: 60_000, h: 3_600_000, d: 86_400_000 }[m[2] as 's'|'m'|'h'|'d']
}
```

### `src/backend/src/lib/password.ts`

```ts
import bcrypt from 'bcryptjs'

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12)
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash)
}
```

### `src/backend/src/middleware/auth.ts`

```ts
import type { Request, Response, NextFunction } from 'express'
import { verifyAccessToken } from '../lib/jwt.js'
import { errors } from '../lib/api-response.js'

declare global {
  namespace Express { interface Request { user?: { sub: string; role: string } } }
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  // Aceita cookie OU Authorization: Bearer (pra testes/CLI)
  const token = req.cookies['access_token']
    ?? (req.headers.authorization?.startsWith('Bearer ') ? req.headers.authorization.slice(7) : null)

  if (!token) return next(errors.unauthorized())
  try {
    req.user = verifyAccessToken(token)
    next()
  } catch {
    next(errors.unauthorized('Token inválido ou expirado'))
  }
}

export function requireRole(role: 'ADMIN' | 'CUSTOMER') {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user)              return next(errors.unauthorized())
    if (req.user.role !== role) return next(errors.forbidden())
    next()
  }
}

// Pra rotas que precisam saber se tem user (mas não exigem)
export async function loadCurrentUser(req: Request, _res: Response, next: NextFunction) {
  const token = req.cookies['access_token']
  if (token) try { req.user = verifyAccessToken(token) } catch {}
  next()
}
```

### `src/backend/src/routes/auth.ts` — login + register + refresh

```ts
import { Router, type Request, type Response } from 'express'
import rateLimit from 'express-rate-limit'
import crypto from 'node:crypto'
import { prisma } from '../lib/prisma.js'
import { hashPassword, verifyPassword } from '../lib/password.js'
import {
  signAccessToken, generateRefreshTokenRaw, hashRefreshToken,
  expiresInToDate, expiresInToMs,
} from '../lib/jwt.js'
import { ok, created, errors } from '../lib/api-response.js'
import { registerSchema, loginSchema, forgotPasswordSchema, resetPasswordSchema } from '../validators/auth.js'
import { env, isDev, isProd } from '../config/env.js'

export const authRouter: Router = Router()

const authLimiter = rateLimit({
  windowMs: 60_000,
  limit: 10,
  message: { success: false, error: { code: 'RATE_LIMITED', message: 'Muitas tentativas, espere um pouco' } },
})

function setAuthCookies(res: Response, accessToken: string, refreshTokenRaw: string) {
  const sameSite = env.COOKIE_SAMESITE === 'none' ? 'none' as const : 'lax' as const
  const secure = isProd || sameSite === 'none'
  const cookieBase = {
    httpOnly: true,
    secure,
    sameSite,
    path: '/',
    ...(env.COOKIE_DOMAIN ? { domain: env.COOKIE_DOMAIN } : {}),
  }
  res.cookie('access_token',  accessToken,     { ...cookieBase, maxAge: expiresInToMs(env.JWT_EXPIRES_IN) })
  res.cookie('refresh_token', refreshTokenRaw, { ...cookieBase, maxAge: expiresInToMs(env.JWT_REFRESH_EXPIRES_IN) })
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

// POST /auth/register — cria CUSTOMER (NUNCA aceitar role no body)
authRouter.post('/register', authLimiter, async (req, res, next) => {
  try {
    const body = registerSchema.parse(req.body)
    const exists = await prisma.user.findUnique({ where: { email: body.email } })
    if (exists) throw errors.conflict('Email já cadastrado')

    const user = await prisma.user.create({
      data: {
        email: body.email,
        name: body.name,
        passwordHash: await hashPassword(body.password),
        phone: body.phone,
        cpf: body.cpf,
        role: 'CUSTOMER',  // forçado, ignora qualquer role no body
      },
      select: { id: true, email: true, name: true, role: true, createdAt: true },
    })

    const accessToken = signAccessToken({ sub: user.id, role: user.role })
    const refreshRaw  = await issueRefreshToken(user.id, req)
    setAuthCookies(res, accessToken, refreshRaw)

    return created(res, { user, accessToken })
  } catch (err) { next(err) }
})

// POST /auth/login
authRouter.post('/login', authLimiter, async (req, res, next) => {
  try {
    const body = loginSchema.parse(req.body)
    const user = await prisma.user.findUnique({ where: { email: body.email } })
    // mesma mensagem nos 2 casos pra evitar email enumeration
    if (!user || !(await verifyPassword(body.password, user.passwordHash))) {
      throw errors.unauthorized('Email ou senha incorretos')
    }

    const accessToken = signAccessToken({ sub: user.id, role: user.role })
    const refreshRaw  = await issueRefreshToken(user.id, req)
    setAuthCookies(res, accessToken, refreshRaw)

    return ok(res, {
      user: { id: user.id, email: user.email, name: user.name, role: user.role, createdAt: user.createdAt },
      accessToken,
    })
  } catch (err) { next(err) }
})

// POST /auth/refresh — rotation com reuse detection
authRouter.post('/refresh', async (req, res, next) => {
  try {
    const raw = req.cookies['refresh_token']
    if (!raw) throw errors.unauthorized()

    const tokenHash = hashRefreshToken(raw)
    const stored = await prisma.refreshToken.findUnique({ where: { tokenHash } })

    if (!stored || stored.expiresAt < new Date() || stored.revokedAt) {
      throw errors.unauthorized('Refresh inválido')
    }
    if (stored.usedAt) {
      // Reuse detection: token já usado → alguém roubou. Invalida TODOS desse user.
      await prisma.refreshToken.updateMany({
        where: { userId: stored.userId, revokedAt: null },
        data:  { revokedAt: new Date() },
      })
      clearAuthCookies(res)
      throw errors.unauthorized('Refresh reusado — sessão invalidada por segurança')
    }

    const user = await prisma.user.findUnique({ where: { id: stored.userId } })
    if (!user) throw errors.unauthorized()

    // Marca usado, emite novo
    await prisma.refreshToken.update({ where: { id: stored.id }, data: { usedAt: new Date() } })
    const newAccess  = signAccessToken({ sub: user.id, role: user.role })
    const newRefresh = await issueRefreshToken(user.id, req)
    setAuthCookies(res, newAccess, newRefresh)

    return ok(res, { user: { id: user.id, email: user.email, name: user.name, role: user.role }, accessToken: newAccess })
  } catch (err) { next(err) }
})

// POST /auth/logout
authRouter.post('/logout', async (req, res, next) => {
  try {
    const raw = req.cookies['refresh_token']
    if (raw) {
      await prisma.refreshToken.updateMany({
        where: { tokenHash: hashRefreshToken(raw), revokedAt: null },
        data:  { revokedAt: new Date() },
      })
    }
    clearAuthCookies(res)
    return ok(res, { message: 'Saiu' })
  } catch (err) { next(err) }
})

// POST /auth/forgot-password — NÃO retornar URL na response
authRouter.post('/forgot-password', authLimiter, async (req, res, next) => {
  try {
    const body = forgotPasswordSchema.parse(req.body)
    const user = await prisma.user.findUnique({ where: { email: body.email } })
    // Sempre retorna 200 mesma mensagem (não enumera emails)
    if (!user) return ok(res, { message: 'Se esse email existir, mandaremos instruções' })

    const raw = crypto.randomBytes(32).toString('base64url')
    const tokenHash = hashRefreshToken(raw)  // mesmo SHA256 do refresh
    await prisma.passwordResetToken.create({
      data: {
        userId: user.id,
        tokenHash,
        expiresAt: new Date(Date.now() + 60 * 60 * 1000),  // 1h
      },
    })

    const resetUrl = `${env.STORE_URL}/auth/reset?token=${raw}`
    if (isDev) console.log(`[dev] reset URL pra ${user.email}: ${resetUrl}`)
    // TODO(resend): mandar email real quando integrar Resend
    // SEMPRE retornar mesma mensagem, sem URL (pra não vazar em prod)
    return ok(res, { message: 'Se esse email existir, mandaremos instruções' })
  } catch (err) { next(err) }
})

// POST /auth/reset-password
authRouter.post('/reset-password', authLimiter, async (req, res, next) => {
  try {
    const body = resetPasswordSchema.parse(req.body)
    const tokenHash = hashRefreshToken(body.token)
    const stored = await prisma.passwordResetToken.findUnique({ where: { tokenHash } })

    if (!stored || stored.expiresAt < new Date() || stored.usedAt) {
      throw errors.badRequest('Link inválido ou expirado')
    }

    await prisma.$transaction([
      prisma.user.update({
        where: { id: stored.userId },
        data:  { passwordHash: await hashPassword(body.password) },
      }),
      prisma.passwordResetToken.update({
        where: { id: stored.id },
        data:  { usedAt: new Date() },
      }),
      // Revoga todos os refresh do user (força relogin em todos devices)
      prisma.refreshToken.updateMany({
        where: { userId: stored.userId, revokedAt: null },
        data:  { revokedAt: new Date() },
      }),
    ])

    return ok(res, { message: 'Senha redefinida' })
  } catch (err) { next(err) }
})
```

### `src/backend/src/validators/auth.ts`

```ts
import { z } from 'zod'

const PASSWORD_BLOCKLIST = [
  '12345678', 'password', 'qwerty', 'abcd1234', 'senha1234',
  'admin1234', 'miami2026', '123456789', '1234567890',
  'qwerty123', 'password1', 'iloveyou', 'welcome1',
  'changeme', 'letmein', 'superman', 'master12',
]

export const strongPassword = z.string()
  .min(10, 'Mínimo 10 caracteres')
  .max(128)
  .regex(/[A-Za-z]/, 'Precisa de letra')
  .regex(/[0-9]/, 'Precisa de número')
  .regex(/[^A-Za-z0-9]/, 'Precisa de caractere especial')
  .refine(s => !PASSWORD_BLOCKLIST.includes(s.toLowerCase()), 'Senha muito comum')

export const registerSchema = z.object({
  email:    z.string().email().toLowerCase(),
  password: strongPassword,
  name:     z.string().min(2).max(100),
  phone:    z.string().min(8).max(20).optional(),
  cpf:      z.string().min(11).max(14).optional(),
}).strict()  // strict = ignora `role: 'ADMIN'` se vier no body

export const loginSchema = z.object({
  email:    z.string().email().toLowerCase(),
  password: z.string().min(1).max(200),  // login não exige strong (pra usuários antigos com senha curta logarem)
}).strict()

export const forgotPasswordSchema = z.object({
  email: z.string().email().toLowerCase(),
}).strict()

export const resetPasswordSchema = z.object({
  token:    z.string().min(20),
  password: strongPassword,
}).strict()
```

## Frontend (Loja Next.js)

### `src/frontend/src/stores/auth.ts`

```ts
'use client'
import { create } from 'zustand'
import type { User } from '@/services/types'

type AuthState = {
  user: User | null
  hydrated: boolean
  setUser: (u: User | null) => void
  setHydrated: (h: boolean) => void
}

export const useAuth = create<AuthState>()((set) => ({
  user: null,
  hydrated: false,
  setUser: (user) => set({ user }),
  setHydrated: (hydrated) => set({ hydrated }),
}))
```

### `src/frontend/src/app/providers.tsx` — hydrate via /auth/me

```tsx
'use client'
import { useState, useEffect, type ReactNode } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useAuth } from '@/stores/auth'
import { getMe } from '@/services/auth'

export function Providers({ children }: { children: ReactNode }) {
  const [client] = useState(() => new QueryClient({
    defaultOptions: { queries: { staleTime: 30_000, refetchOnWindowFocus: false } },
  }))
  const { setUser, setHydrated } = useAuth()

  useEffect(() => {
    getMe().then(r => setUser(r.user)).catch(() => setUser(null)).finally(() => setHydrated(true))
  }, [setUser, setHydrated])

  return <QueryClientProvider client={client}>{children}</QueryClientProvider>
}
```

### `src/frontend/src/lib/api.ts` — fetch wrapper com credentials

```ts
const baseUrl = process.env.NEXT_PUBLIC_API_URL ?? '/api'

export async function api<T>(path: string, opts: RequestInit & { query?: Record<string, any> } = {}): Promise<T> {
  const { query, ...rest } = opts
  let url = baseUrl + path
  if (query) {
    const sp = new URLSearchParams()
    for (const [k, v] of Object.entries(query)) {
      if (v !== undefined && v !== null && v !== '') sp.set(k, String(v))
    }
    if (sp.toString()) url += '?' + sp.toString()
  }
  const res = await fetch(url, {
    ...rest,
    credentials: 'include',                     // ← cookie httpOnly cross-origin
    headers: { 'Content-Type': 'application/json', ...(rest.headers ?? {}) },
  })
  const json = await res.json().catch(() => ({}))
  if (!res.ok || json.success === false) {
    throw new ApiError(res.status, json.error?.code ?? 'UNKNOWN', json.error?.message ?? 'Erro', json.error?.details)
  }
  return json.data as T
}

export const get   = <T>(p: string, o?: any) => api<T>(p, { ...o, method: 'GET'   })
export const post  = <T>(p: string, body?: any, o?: any) => api<T>(p, { ...o, method: 'POST',  body: JSON.stringify(body ?? {}) })
export const patch = <T>(p: string, body?: any, o?: any) => api<T>(p, { ...o, method: 'PATCH', body: JSON.stringify(body ?? {}) })
export const del   = <T>(p: string, o?: any) => api<T>(p, { ...o, method: 'DELETE'})
```

## Anti-padrões (não repetir Miami Store)

- ❌ Salvar token em localStorage
- ❌ Default fraco em JWT_SECRET
- ❌ Aceitar `role` em /register
- ❌ Mensagem diferente em /login pra "user inexistente"
- ❌ Vazar reset URL na response
- ❌ Cookie sem `httpOnly` ou `Secure`
- ❌ Senha sem regex de force (bypass com `abcd1234`)
- ❌ Bcrypt cost < 10
