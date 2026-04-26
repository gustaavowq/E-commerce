# Vercel — Deploy Loja + Painel (Passo-a-passo)

> Guia executável testado no deploy do Miami Store. Quem segue: **05-devops** (com Tech Lead validando).

## O que sai daqui

- Loja (Next.js 14) com URL pública
- Painel admin (Next.js 14) com URL pública
- Free tier infinito pra projetos pessoais (uso comercial: paid plan)

## Pré-requisitos

- Backend já deployado no Railway com URL pública (ver [railway-passo-a-passo](railway-passo-a-passo.md))
- URL do Railway copiada (ex: `https://api-production-cd06.up.railway.app`)
- Repo no GitHub com código em `src/frontend/` e `src/dashboard/`

## Vai deployar 2 projetos separados

**Loja** (`src/frontend/`) e **Painel** (`src/dashboard/`) são apps Next.js distintos. Cada um vira um project no Vercel. Mesmo repo, root directories diferentes.

## Passos — Loja (frontend)

### 1. Importar repo

1. https://vercel.com → **Sign Up** → **Continue with GitHub**
2. **Add New** → **Project** → seleciona o repo
3. Aparece tela de configuração

### 2. Configurar import

| Campo | Valor |
|---|---|
| Project Name | `[marca]-loja` (ex: `miami-store`) — vira `[marca]-loja.vercel.app` |
| Framework Preset | **Next.js** ⚠️ NÃO clica em "Other" — Vercel detecta sozinho. Se aparecer "Other", expande **Framework Preset** e seleciona Next.js manualmente. Ver [09-vercel-application-preset](../30-LICOES/09-vercel-application-preset.md) |
| Root Directory | clica **Edit** → seleciona `src/frontend` → **Continue** |
| Build Command | (deixa default — `next build`) |
| Output Directory | (default) |

### 3. Environment Variables

Antes de clicar Deploy, expande **Environment Variables**:

| Variável | Valor |
|---|---|
| `NEXT_PUBLIC_API_URL` | URL Railway (ex: `https://api-production-cd06.up.railway.app`) |
| `INTERNAL_API_URL` | mesma URL Railway (Vercel não tem rede interna — fallback usa esta) |
| `NEXT_PUBLIC_DASHBOARD_URL` | URL do painel (vai preencher no passo 7) |
| `NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY` | TEST-xxx ou APP_USR-xxx (mesma key pública usada no Railway) |
| `NEXT_PUBLIC_WHATSAPP_NUMBER` | número WhatsApp do lojista (formato `5511999999999`) |
| `NEXT_PUBLIC_GA4_ID` | (opcional — Measurement ID do GA4 se cliente tiver) |
| `NEXT_PUBLIC_PIXEL_ID` | (opcional — Meta Pixel ID se cliente tiver) |

### 4. Deploy

**Deploy** → aguarda ~2min. Quando terminar, copia a URL (ex: `https://miami-store.vercel.app`).

### 5. Smoke test loja

Abre a URL → loja deve carregar. Verificar:
- ✅ Header com nav, logo, ícone carrinho
- ✅ Produtos carregam (se backend já tem seed)
- ✅ Console (F12) sem erro CORS

Se erro CORS: backend precisa ter essa URL em `CORS_ORIGIN` — voltar ao Railway e atualizar.

## Passos — Painel (dashboard)

### 6. Importar repo (segundo project)

Repete os passos 1-4, mas com:

| Campo | Valor |
|---|---|
| Project Name | `[marca]-painel` |
| Root Directory | `src/dashboard` |
| Framework Preset | **Next.js** |

Environment Variables:

| Variável | Valor |
|---|---|
| `NEXT_PUBLIC_API_URL` | URL Railway (mesma da loja) |
| `INTERNAL_API_URL` | URL Railway |
| `NEXT_PUBLIC_STORE_URL` | URL da loja (do passo 4) — usada em "Ver loja" e logout |

Deploy → copia URL (ex: `https://miami-painel.vercel.app`).

### 7. Atualizar referências cruzadas

**Loja** → Settings → Environment Variables:
- Editar `NEXT_PUBLIC_DASHBOARD_URL` com URL do painel → **Redeploy** (Deployments → 3 pontinhos → Redeploy)

**Backend Railway** → Variables:
- Editar `CORS_ORIGIN` com as duas URLs:
  ```
  https://miami-store.vercel.app,https://miami-painel.vercel.app
  ```
  Sem espaços. Sem trailing slash. Salva → Railway redeploy auto.

### 8. Smoke test final

1. Abre URL da **loja** → produtos carregam
2. Abre URL do **painel** → tela de login
3. Login com `SEED_ADMIN_EMAIL` + `SEED_ADMIN_PASSWORD`
4. Deve entrar no dashboard, KPIs aparecem
5. Cria 1 produto teste no painel → confere se aparece na loja (depois de F5)

## Troubleshooting

**"Module not found: Can't resolve 'X'"**
Falta dep no `package.json`. Rodar `npm install` localmente, commitar `package-lock.json` atualizado, redeploy.

**Login dá 401, mas backend tá ok**
1. `NEXT_PUBLIC_API_URL` aponta pra Railway, sem trailing slash
2. Backend tem essa URL exata em `CORS_ORIGIN`
3. Backend `COOKIE_SAMESITE=none` (cross-domain)
4. Painel está em domínio Vercel separado (esperado pro MVP — cookie não vaza entre `loja.vercel.app` e `painel.vercel.app`)

**Login persiste mas perde sessão entre loja e painel**
Esperado nessa fase. URLs `.vercel.app` são domínios separados. Solução: comprar domínio próprio (ver seção abaixo).

**Build falha com "ENOENT package.json"**
Root Directory está errado. Settings → General → Root Directory → ajustar pra `src/frontend` ou `src/dashboard`.

**SSR fetch falha com timeout**
`INTERNAL_API_URL` apontando pra `http://backend:3001` (URL docker dev) em vez da URL Railway. Trocar pra URL pública do Railway.

## Domínio próprio (depois, ~R$ 40/ano)

1. Compra domínio em https://registro.br
2. **Vercel** loja → Settings → Domains → adiciona `miamistore.com.br` → Vercel dá DNS records → cola no registro.br
3. **Vercel** painel → Domains → adiciona `admin.miamistore.com.br`
4. **Railway** backend → Settings → Domains → adiciona `api.miamistore.com.br`
5. Volta no Railway → Variables:
   - `CORS_ORIGIN`: troca pras URLs novas
   - `COOKIE_DOMAIN`: `.miamistore.com.br` (com ponto antes — compartilha entre subdomínios)
   - `COOKIE_SAMESITE`: `lax` (mais seguro, agora que é mesmo domínio)
6. Frontend e painel: `NEXT_PUBLIC_API_URL` → `https://api.miamistore.com.br`

Sessão fica compartilhada entre `loja` e `admin.loja` automaticamente.

## CSP (Content Security Policy)

`src/frontend/next.config.js` e `src/dashboard/next.config.js` têm CSP configurado. Toda vez que adicionar host externo (Cloudinary, MercadoPago, GA4, Pixel), atualizar `connect-src` e `img-src`. Ver [05-csp-connect-src](../30-LICOES/05-csp-connect-src.md).

## Métrica de sucesso

- ✅ Lighthouse Performance ≥ 80 mobile (testar em /produtos/[slug])
- ✅ Sem erro CORS no console
- ✅ Login admin no painel funciona
- ✅ Compra teste no MP sandbox completa

## Custo

- Free tier infinito pra hobby
- Comercial: Hobby OK pra MVP. Pro (US$ 20/mês) só se: > 100GB bandwidth, custom domain SSO, ou time colaborando.

## Ver também

- [railway-passo-a-passo](railway-passo-a-passo.md) — backend
- [env-vars-canonicas](../20-DECISOES/env-vars-canonicas.md)
- [05-csp-connect-src](../30-LICOES/05-csp-connect-src.md) — quando atualizar CSP
- [09-vercel-application-preset](../30-LICOES/09-vercel-application-preset.md) — armadilha do framework preset
