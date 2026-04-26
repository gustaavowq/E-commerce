# Decisão: Padrão de autenticação

> Implementar igual em qualquer e-commerce. Padrão testado no Miami Store.

## Estratégia

**JWT em cookie httpOnly + refresh token rotation com reuse detection**

### Por que cookie httpOnly e não localStorage?
- Resistente a XSS (JS não tem acesso)
- Browser manda automaticamente em requests
- Funciona em SSR (Next RSC pode validar server-side)

### Por que refresh token rotation com reuse detection?
- Access token curto (15 min) limita janela de ataque
- Refresh longo (30 dias) mantém UX boa
- Se um refresh já usado for reapresentado → invalida TODOS os refresh do user (alguém roubou)

## Estrutura de tokens

| Token | Onde fica | Vida | Conteúdo |
|---|---|---|---|
| `access_token` | Cookie httpOnly Secure SameSite=lax/none | 15min | JWT signed: `{ sub, role, iat, exp }` |
| `refresh_token` | Cookie httpOnly Secure SameSite=lax/none | 30 dias | Token raw aleatório (hash no banco, igual senha) |

## Cookie config

```ts
// src/backend/src/routes/auth.ts — função setAuthCookies
function setAuthCookies(res: Response, accessToken: string, refreshTokenRaw: string) {
  const sameSite = env.COOKIE_SAMESITE === 'none' ? 'none' : 'lax'
  // SameSite=None EXIGE Secure=true
  const secure = isProd || sameSite === 'none'

  const cookieBase = {
    httpOnly: true,
    secure,
    sameSite,
    path: '/',
    ...(env.COOKIE_DOMAIN ? { domain: env.COOKIE_DOMAIN } : {}),
  }

  res.cookie('access_token',  accessToken,     { ...cookieBase, maxAge: 15 * 60 * 1000 })
  res.cookie('refresh_token', refreshTokenRaw, { ...cookieBase, maxAge: 30 * 24 * 60 * 60 * 1000 })
}
```

## ⚠️ Cuidados com Domain

- **Local dev** (subdomínios `.loja.test`): `COOKIE_DOMAIN=.loja.test` → cookie compartilhado entre loja, painel, api
- **Cloudflare Quick Tunnel**: NÃO setar COOKIE_DOMAIN — cada tunnel é domínio diferente, PSL bloqueia compartilhamento. Ver [[../30-LICOES/02-cookie-cross-domain]]
- **Domínio próprio prod**: `COOKIE_DOMAIN=.miamistore.com.br` + `COOKIE_SAMESITE=lax` (com domínio compartilhado, não precisa de None)
- **Vercel + Railway separados**: NÃO setar Domain. Cada API call do frontend pra backend leva o cookie (browser inclui em cross-origin se SameSite=None+Secure+credentials:include)

## Endpoints obrigatórios

```
POST /auth/register      → cria CUSTOMER (NUNCA aceitar role no body — mass assignment)
POST /auth/login         → seta cookies + retorna user
POST /auth/logout        → limpa cookies + invalida refresh
POST /auth/logout-all    → invalida todos refresh do user
POST /auth/refresh       → roda rotation; detecta reuse
GET  /auth/me            → valida cookie e retorna user atual
POST /auth/forgot-password → cria token (HASH no banco, exp 1h, single-use). NUNCA retornar token na response
POST /auth/reset-password  → consome token, rehasha senha, revoga refreshes
```

## Validação de senha (Zod)

```ts
// Mínimo 10 chars + letra + número + special + blocklist comum
const strongPassword = z.string()
  .min(10, 'Mínimo 10 caracteres')
  .regex(/[A-Za-z]/, 'Precisa de letra')
  .regex(/[0-9]/, 'Precisa de número')
  .regex(/[^A-Za-z0-9]/, 'Precisa de caractere especial')
  .refine(s => !PASSWORD_BLOCKLIST.includes(s.toLowerCase()), 'Senha muito comum')

const PASSWORD_BLOCKLIST = [
  '12345678', 'password', 'qwerty', 'abcd1234', 'senha1234', 'admin1234',
  // adicionar a senha do nicho que vazaria fácil — ex: nome da marca + ano
]
```

## Bcrypt cost factor

`bcryptjs.hash(password, 12)` — equilibra segurança vs UX (login ~150ms em hardware decente). Não baixar de 10. Não subir de 12 sem benchmark.

## Middleware de proteção

```ts
// src/backend/src/middleware/auth.ts
requireAuth   // 401 se cookie ausente/inválido. Popula req.user
requireRole(role: 'ADMIN'|'CUSTOMER')  // 403 se role não bate
```

Aplicar `requireAuth + requireRole('ADMIN')` em **TODO** `/api/admin/*` no router master, não rota a rota (evita esquecer).

## Painel admin

- **NÃO deve ter middleware Next server-side** se cookie tá em domínio diferente do painel (caso Cloudflare/Vercel separado).
- Em vez disso, valida client-side no `(admin)/layout.tsx` chamando `/auth/me` (cookie da API vai junto via credentials:include).
- Em prod com domínio próprio compartilhado, middleware Next vale a pena.

## CORS

```ts
app.use(cors({
  origin: env.CORS_ORIGIN.split(',').map(s => s.trim()),
  credentials: true,
}))
```

Allowlist tem que incluir: domínio loja, domínio painel, e qualquer URL de preview Vercel se você usar.

## Anti-padrões (não fazer)

- ❌ Salvar token em localStorage/sessionStorage
- ❌ Aceitar `role` no body do `/register`
- ❌ Mensagem diferente em `login` pra "user inexistente" vs "senha errada" (enumeration)
- ❌ Reset URL na response do `/forgot-password` (já vazou em demo!)
- ❌ JWT_SECRET com valor padrão hardcoded — sempre `openssl rand -base64 48`
