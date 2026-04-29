# 🔐 Padrão: Auth flow completo (consolidado)

> Backend + frontend lado-a-lado. Snippets prontos pra colar.
> Substitui dispersão de [[auth-flow]] + [[login-redirect-pattern]] como **fonte primária**.
> Endurecido pelo pentest Miami + saga Dados Inválidos Kore + 3 fluxos redirect testados.

Versão 1.0 — 2026-04-29.

## 📋 Checklist completo de auth (15 itens binários)

Antes de declarar auth pronto, validar:

- [ ] JWT_SECRET real (`openssl rand -base64 48`)
- [ ] Refresh token com rotation + reuse detection
- [ ] Cookies `httpOnly`, `secure` (prod), `sameSite` correto pra cross-domain
- [ ] `/auth/register` força `role: 'CUSTOMER'` (ignora body)
- [ ] `/auth/login` mensagem idêntica pra "user inexistente" e "senha errada"
- [ ] `/auth/forgot-password` NÃO retorna URL na response
- [ ] `/auth/reset-password` invalida refresh tokens do user (todos devices)
- [ ] Bcrypt cost ≥ 10
- [ ] Senha forte (regex letra+numero+especial, blocklist)
- [ ] Schema validators com `.strict()` + error-handler com `_form`
- [ ] Rate limit 10 req/min em `/auth/*`
- [ ] Frontend `LoginForm` lê `?redirect=` e respeita
- [ ] Helper `redirectAfterLogin(user)` único pra email/senha + Google OAuth
- [ ] ADMIN sem `?redirect=` vai pro `NEXT_PUBLIC_DASHBOARD_URL`
- [ ] Logout sem `window.location.reload()`

## Backend — 7 arquivos

### `src/lib/jwt.ts`

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

### `src/lib/password.ts`

```ts
import bcrypt from 'bcryptjs'

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12)
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash)
}
```

### `src/middleware/auth.ts`

```ts
import type { Request, Response, NextFunction } from 'express'
import { verifyAccessToken } from '../lib/jwt.js'
import { errors } from '../lib/api-response.js'

declare global {
  namespace Express { interface Request { user?: { sub: string; role: string } } }
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
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

export async function loadCurrentUser(req: Request, _res: Response, next: NextFunction) {
  const token = req.cookies['access_token']
  if (token) try { req.user = verifyAccessToken(token) } catch {}
  next()
}
```

### `src/routes/auth.ts`

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
import { requireAuth } from '../middleware/auth.js'

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

// POST /auth/register
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
        role: 'CUSTOMER',  // ← forçado, ignora body
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
    if (!user || !(await verifyPassword(body.password, user.passwordHash))) {
      throw errors.unauthorized('Email ou senha incorretos')  // ← mesma mensagem
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
      // Reuse detection
      await prisma.refreshToken.updateMany({
        where: { userId: stored.userId, revokedAt: null },
        data:  { revokedAt: new Date() },
      })
      clearAuthCookies(res)
      throw errors.unauthorized('Refresh reusado — sessão invalidada por segurança')
    }
    const user = await prisma.user.findUnique({ where: { id: stored.userId } })
    if (!user) throw errors.unauthorized()

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

// GET /auth/me
authRouter.get('/me', requireAuth, async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.sub },
      select: { id: true, email: true, name: true, role: true, createdAt: true },
    })
    if (!user) throw errors.unauthorized()
    return ok(res, { user })
  } catch (err) { next(err) }
})

// POST /auth/forgot-password
authRouter.post('/forgot-password', authLimiter, async (req, res, next) => {
  try {
    const body = forgotPasswordSchema.parse(req.body)
    const user = await prisma.user.findUnique({ where: { email: body.email } })
    if (!user) return ok(res, { message: 'Se esse email existir, mandaremos instruções' })
    const raw = crypto.randomBytes(32).toString('base64url')
    const tokenHash = hashRefreshToken(raw)
    await prisma.passwordResetToken.create({
      data: { userId: user.id, tokenHash, expiresAt: new Date(Date.now() + 60 * 60 * 1000) },
    })
    const resetUrl = `${env.STORE_URL}/auth/reset?token=${raw}`
    if (isDev) console.log(`[dev] reset URL pra ${user.email}: ${resetUrl}`)
    // TODO(resend): mandar email real quando integrar Resend
    return ok(res, { message: 'Se esse email existir, mandaremos instruções' })  // ← NUNCA URL na response
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
      prisma.refreshToken.updateMany({
        where: { userId: stored.userId, revokedAt: null },
        data:  { revokedAt: new Date() },
      }),
    ])
    return ok(res, { message: 'Senha redefinida' })
  } catch (err) { next(err) }
})
```

### `src/validators/auth.ts`

```ts
import { z } from 'zod'

const PASSWORD_BLOCKLIST = [
  '12345678', 'password', 'qwerty', 'abcd1234', 'senha1234',
  'admin1234', '123456789', '1234567890', 'qwerty123', 'password1',
  'iloveyou', 'welcome1', 'changeme', 'letmein', 'superman', 'master12',
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
}).strict()  // ← ignora role no body

export const loginSchema = z.object({
  email:    z.string().email().toLowerCase(),
  password: z.string().min(1).max(200),  // login não exige strong (users antigos)
}).strict()

export const forgotPasswordSchema = z.object({
  email: z.string().email().toLowerCase(),
}).strict()

export const resetPasswordSchema = z.object({
  token:    z.string().min(20),
  password: strongPassword,
}).strict()
```

### `src/middleware/error-handler.ts` (com `_form`)

```ts
import { ZodError } from 'zod'
import type { ErrorRequestHandler } from 'express'
import { ApiError } from '../lib/api-error.js'

export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  // Zod com `_form` (defesa em profundidade saga 26)
  if (err instanceof ZodError) {
    const flat = err.flatten()
    const details: Record<string, string[]> = { ...flat.fieldErrors }
    if (flat.formErrors.length > 0) {
      details._form = flat.formErrors  // ← chave especial pra raiz
    }
    return res.status(422).json({
      success: false,
      error: { code: 'VALIDATION_ERROR', message: 'Dados inválidos', details },
    })
  }
  // ApiError
  if (err instanceof ApiError) {
    return res.status(err.status).json({
      success: false,
      error: { code: err.code, message: err.message, ...(err.details ? { details: err.details } : {}) },
    })
  }
  // Fallback 500
  console.error('[error-handler]', err)
  return res.status(500).json({
    success: false,
    error: { code: 'INTERNAL', message: 'Erro inesperado' },
  })
}
```

### Google OAuth callback (resumo)

```ts
// backend/src/routes/auth-google.ts
authRouter.post('/google/callback', async (req, res, next) => {
  try {
    const { idToken } = req.body
    const payload = await verifyGoogleIdToken(idToken)  // google-auth-library
    if (!payload?.email) throw errors.unauthorized()

    let user = await prisma.user.findUnique({ where: { email: payload.email } })
    if (!user) {
      user = await prisma.user.create({
        data: {
          email: payload.email,
          name: payload.name ?? payload.email,
          passwordHash: '',  // sem senha; só Google
          role: 'CUSTOMER',
          provider: 'google',
        },
      })
    }
    const accessToken = signAccessToken({ sub: user.id, role: user.role })
    const refreshRaw  = await issueRefreshToken(user.id, req)
    setAuthCookies(res, accessToken, refreshRaw)
    return ok(res, { user: { id: user.id, email: user.email, name: user.name, role: user.role } })
  } catch (err) { next(err) }
})
```

## Frontend — 5 arquivos

### `src/stores/auth.ts`

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

### `src/app/providers.tsx`

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
    getMe()
      .then(r => setUser(r.user))
      .catch(() => setUser(null))
      .finally(() => setHydrated(true))
  }, [setUser, setHydrated])

  return <QueryClientProvider client={client}>{children}</QueryClientProvider>
}
```

### `src/lib/api.ts`

```ts
const baseUrl = process.env.NEXT_PUBLIC_API_URL ?? '/api'

export class ApiError extends Error {
  constructor(public status: number, public code: string, message: string, public details?: any) {
    super(message)
  }
}

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
    credentials: 'include',  // ← cookie httpOnly cross-origin
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

### `src/lib/api-error.ts` — `describeApiError`

```ts
import { ApiError } from './api'

const FIELD_LABELS_PT: Record<string, string> = {
  name: 'Nome', email: 'Email', password: 'Senha', phone: 'Telefone',
  cpf: 'CPF', price: 'Preço', stock: 'Estoque', /* ... */
}

export function describeApiError(err: unknown): { title: string; body: string } {
  if (!(err instanceof ApiError)) return { title: 'Erro inesperado', body: 'Tenta de novo em alguns segundos' }

  if (err.code === 'VALIDATION_ERROR' && err.details && typeof err.details === 'object') {
    const fields = err.details as Record<string, string[] | undefined>
    const fieldItems = Object.entries(fields)
      .filter(([k, v]) => k !== '_form' && Array.isArray(v) && v.length > 0)
      .map(([k, v]) => `${FIELD_LABELS_PT[k] ?? k}: ${v?.[0]}`)
    if (fieldItems.length > 0) return { title: 'Corrige antes de salvar', body: fieldItems.join(' · ') }
    if (Array.isArray(fields._form) && fields._form.length > 0) {
      return { title: 'Não foi possível salvar', body: fields._form.join(' · ') }
    }
  }

  if (err.code === 'UNAUTHORIZED') return { title: 'Sessão expirada', body: 'Faz login de novo pra continuar' }
  if (err.code === 'FORBIDDEN')    return { title: 'Sem permissão', body: 'Essa ação não está disponível pra esse usuário' }
  if (err.code === 'CONFLICT')     return { title: 'Conflito', body: err.message }
  if (err.code === 'NOT_FOUND')    return { title: 'Não encontrado', body: err.message }
  if (err.code === 'RATE_LIMITED') return { title: 'Devagar', body: 'Espera um pouco antes de tentar de novo' }

  return { title: 'Erro', body: err.message }
}
```

### `src/components/LoginForm.tsx` com `redirectAfterLogin`

```tsx
'use client'
import { useRouter, useSearchParams } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useAuth } from '@/stores/auth'
import { login } from '@/services/auth'
import { describeApiError } from '@/lib/api-error'
import { toast } from '@/components/Toast'
import type { User } from '@/services/types'

const schema = z.object({ email: z.string().email(), password: z.string().min(1) })
type FormData = z.infer<typeof schema>

export function LoginForm() {
  const router = useRouter()
  const params = useSearchParams()
  const setUser = useAuth(s => s.setUser)
  const form = useForm<FormData>({ resolver: zodResolver(schema) })

  function redirectAfterLogin(user: User) {
    const redirect = params.get('redirect')
    if (redirect) {
      router.push(redirect)
      return
    }
    if (user.role === 'ADMIN') {
      const dashboardUrl = process.env.NEXT_PUBLIC_DASHBOARD_URL ?? '/'
      window.location.href = dashboardUrl  // hard nav porque domínio diferente
      return
    }
    router.push('/account')
  }

  async function onSubmit(data: FormData) {
    try {
      const { user } = await login(data)
      setUser(user)
      redirectAfterLogin(user)
    } catch (err) {
      toast.push({ tone: 'error', ...describeApiError(err) })
    }
  }

  function handleGoogleSuccess(user: User) {
    setUser(user)
    redirectAfterLogin(user)  // ← MESMO helper
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      {/* email + password inputs */}
      <Button type="submit">Entrar</Button>
      <GoogleOAuthButton onSuccess={handleGoogleSuccess} />
    </form>
  )
}
```

### Página protegida pattern

```tsx
'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/stores/auth'

export default function ProtectedPage() {
  const router = useRouter()
  const { user, hydrated } = useAuth()

  useEffect(() => {
    if (hydrated && !user) {
      router.replace(`/auth/login?redirect=${encodeURIComponent('/account')}`)
    }
  }, [hydrated, user, router])

  if (!hydrated) return <Skeleton />
  if (!user) return null
  return <Content user={user} />
}
```

## Painel admin

### `ProtectedRoute` HOC

```tsx
// dashboard/src/components/ProtectedRoute.tsx
'use client'
import { useEffect, type ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/stores/auth'

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const router = useRouter()
  const { user, hydrated } = useAuth()

  useEffect(() => {
    if (!hydrated) return
    if (!user) {
      // Painel manda pra LOJA login (loja é dono do auth)
      const storeUrl = process.env.NEXT_PUBLIC_STORE_URL
      window.location.href = `${storeUrl}/auth/login?redirect=${process.env.NEXT_PUBLIC_DASHBOARD_URL}`
      return
    }
    if (user.role !== 'ADMIN') {
      router.replace('/sem-permissao')
    }
  }, [hydrated, user, router])

  if (!hydrated) return <Skeleton />
  if (!user || user.role !== 'ADMIN') return null
  return <>{children}</>
}
```

## 🚫 10 anti-padrões consolidados

1. **localStorage token** — XSS pega tudo. Cookie httpOnly sempre.
2. **JWT_SECRET placeholder** — pentest forja JWT admin (lição 1).
3. **`role` no body /register** — sem `.strict()` user vira ADMIN sozinho.
4. **Mensagem diferente em /login** — vaza email enumeration.
5. **Vazar reset URL na response** — log público vira phishing.
6. **Cookie sem `httpOnly`** — XSS rouba.
7. **Senha sem regex force** — `abcd1234` passa.
8. **Bcrypt cost < 10** — bruteforce trivial.
9. **`window.location.reload()` no logout** — UX ruim.
10. **Login sem `?redirect=`** — perde contexto, conversão cai.

## Padrões relacionados (mantidos por compat)
- [[auth-flow]] — versão antiga, ponteiro pra este doc
- [[login-redirect-pattern]] — versão antiga, ponteiro pra este doc
- [[../30-LICOES/01-jwt-secret-placeholder]]
- [[../30-LICOES/02-cookie-cross-domain]]
- [[../30-LICOES/14-zustand-persist-race]]
- [[../30-LICOES/26-dados-invalidos-silencioso]]
