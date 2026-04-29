# Decisão: Padrão de deploy

## Topologia

```
┌─────────────────────┐     ┌──────────────────────┐
│   Vercel (loja)     │     │   Vercel (painel)    │
│   loja.vercel.app   │     │   admin.vercel.app   │
└──────────┬──────────┘     └──────────┬───────────┘
           │                            │
           │  fetch credentials:include │
           ↓                            ↓
       ┌────────────────────────────────────────┐
       │       Railway (backend + Postgres)      │
       │       api.railway.app                   │
       │       - Express + Prisma                │
       │       - Postgres como serviço linkado   │
       └────────────────────────────────────────┘
```

## Por que essa topologia

- **Vercel** pra loja+painel: edge global grátis, build Next.js otimizado, preview por PR
- **Railway** pro backend+Postgres: mesma plataforma, free tier US$5/mês, deploy via Dockerfile, gerencia migrations no startCommand
- **Cloudinary** pra imagens: CDN + otimização automática, free 25k uploads/mês

## Cuidados (lições do Miami Store)

### 1. Cookie cross-domain entre Vercel e Railway

Como `*.vercel.app` e `*.up.railway.app` estão na **Public Suffix List**, browser não permite compartilhar cookie via `Domain=.vercel.app`.

**Solução**: cookie é setado pelo backend no domínio dele (`*.up.railway.app`). Browser inclui em qualquer fetch pra `*.up.railway.app` se:
- `credentials: 'include'` no fetch
- `SameSite=None`, `Secure=true` no cookie
- `Access-Control-Allow-Credentials: true` no CORS
- `Access-Control-Allow-Origin` com origin específico (não `*`)

**Não setar `COOKIE_DOMAIN`** em Railway/Vercel. Ver [[../30-LICOES/02-cookie-cross-domain]].

### 2. Middleware Next server-side no painel

Se você fizer `middleware.ts` no painel pra bloquear sem cookie, ele NÃO vai funcionar — porque o cookie tá em outro domínio. Use só guard client-side no `(admin)/layout.tsx`.

Em prod com domínio próprio compartilhado (`*.miamistore.com.br`), middleware volta a funcionar. Documentar isso.

### 3. railway.json define startCommand

`projetos/miami-store/backend/railway.json`:

```json
{
  "$schema": "https://railway.com/railway.schema.json",
  "build": {
    "builder": "DOCKERFILE",
    "dockerfilePath": "Dockerfile"
  },
  "deploy": {
    "startCommand": "sh -c 'npx prisma migrate deploy && node dist/index.js'",
    "healthcheckPath": "/healthz",
    "healthcheckTimeout": 100,
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 5
  }
}
```

**Não** incluir `npx prisma db seed` no startCommand permanente — sobrescreve edições do admin. Usar só na primeira vez. Ver [[../30-LICOES/04-seed-startcommand]].

### 4. tsx em dependencies

Pro `prisma db seed` rodar (que invoca `tsx prisma/seed.ts`), `tsx` precisa estar em `dependencies`, não `devDependencies` — porque o Dockerfile faz `npm ci --omit=dev`.

Ver [[../30-LICOES/03-tsx-dependencies]].

### 5. Body limit Express

Pra Cloudinary upload base64 funcionar, subir limite:

```ts
app.use(express.json({ limit: '15mb' }))
```

Default 100kb não cabe imagem.

### 6. CSP `connect-src` precisa incluir hosts

Frontend (loja+painel) precisa do CSP listando o domínio da API:

```
"connect-src 'self' https://*.up.railway.app https://*.vercel.app https://api.mercadopago.com"
```

Sem isso, browser bloqueia fetch antes de sair. "Erro inesperado" no login. Ver [[../30-LICOES/05-csp-connect-src]].

## Sequência de deploy testada

1. **Backend no Railway primeiro** (ver [[../60-DEPLOY/railway-passo-a-passo]])
   - Conta GitHub → Login Railway → New Project → Deploy from repo
   - Adicionar Postgres
   - Setar env vars (lista em [[env-vars-canonicas]])
   - Generate Domain → copiar URL
   - Aguardar build verde + healthz responder
   - **NÃO clicar em "Suggested Variables"** — vem com placeholders inseguros do `.env.example`. Usar Raw Editor + colar lista limpa
   - Rodar seed UMA vez via Custom Start Command, depois reverter

2. **Loja no Vercel** (ver [[../60-DEPLOY/vercel-passo-a-passo]])
   - Add New Project → repo
   - **Root Directory: `projetos/miami-store/frontend`** (clicar Edit, navegar)
   - Application Preset: Next.js (clicar manualmente — Vercel reseta ao mudar Root)
   - Env vars: `NEXT_PUBLIC_API_URL`, `INTERNAL_API_URL`, `NEXT_PUBLIC_DASHBOARD_URL`, `NEXT_PUBLIC_WHATSAPP_NUMBER`
   - Deploy → copiar URL

3. **Painel no Vercel** (mesmo processo, root `projetos/miami-store/dashboard`)
   - Env vars: `NEXT_PUBLIC_API_URL`, `INTERNAL_API_URL`, `NEXT_PUBLIC_STORE_URL`

4. **Voltar no Railway** e atualizar `CORS_ORIGIN` com URLs Vercel reais (separadas por vírgula, sem espaço, sem `/` no fim)

5. **Setar Cloudinary no Railway** se for usar upload: `CLOUDINARY_URL=cloudinary://KEY:SECRET@CLOUD_NAME`

6. Smoke E2E: login, criar produto, upload foto, fechar pedido

## Custo (free tier)

- Railway: US$ 5/mês crédito grátis (cobre Postgres + backend pra demo)
- Vercel: free hobby pra 2 projetos
- Cloudinary: free 25k uploads
- **Total mensal pra demo: R$ 0**

Em produção real com tráfego: ~R$ 50–100/mês (Railway escala, Cloudinary mantém free se ≤25k/mês).
