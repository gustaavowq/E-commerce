# Railway — Deploy Backend + Postgres (Passo-a-passo)

> Guia executável testado no deploy do Miami Store. Quem segue: **05-devops** (com Tech Lead validando).

## O que sai daqui

- Backend (Express + Prisma) rodando 24/7 com URL pública
- Postgres 16 provisionado e conectado
- Migrations + seed automáticos no boot
- Free tier (US$ 5/mês de crédito Railway, suficiente pra MVP)

## Pré-requisitos

- Repo no GitHub com código em `projetos/miami-store/backend/` (Dockerfile presente)
- Conta GitHub conectável ao Railway
- `JWT_SECRET` gerado: `openssl rand -base64 48` (NUNCA usar placeholder — ver [01-jwt-secret-placeholder](../30-LICOES/01-jwt-secret-placeholder.md))
- Decisão sobre `COOKIE_DOMAIN`: vazio se URLs ainda forem `.vercel.app + .railway.app` (cross-domain), `.dominio.com.br` se já comprou domínio próprio (ver [02-cookie-cross-domain](../30-LICOES/02-cookie-cross-domain.md))

## Passos

### 1. Criar projeto

1. https://railway.com → **Login with GitHub**
2. **+ New Project** → **Deploy from GitHub repo** → escolhe o repo
3. Primeiro deploy vai falhar (sem Postgres nem env). Normal — segue.

### 2. Adicionar Postgres

1. Dentro do projeto: **+ Create** → **Database** → **PostgreSQL**
2. Espera ~30s provisionar
3. Railway cria variável referenciável `${{Postgres.DATABASE_URL}}` automaticamente

### 3. Configurar serviço backend

Clica no quadrado do **backend** (não Postgres) → aba **Settings**:

| Campo | Valor |
|---|---|
| Root Directory | `projetos/miami-store/backend` |
| Watch Paths | `projetos/miami-store/backend/**` |
| Builder | Dockerfile (auto-detectado pelo `Dockerfile`) |
| Start Command | (vazio — vem do Dockerfile CMD) |

Em **Networking** → **Generate Domain**. Copia a URL gerada (`xxx-production.up.railway.app`). Vai usar em todo lugar.

### 4. Setar variáveis (aba Variables)

⚠️ **NÃO clica em "Suggested Variables"** — Railway tenta auto-popular alguns valores que conflitam com o que precisamos. Adiciona uma a uma manualmente. Ver [10-suggested-variables-railway](../30-LICOES/10-suggested-variables-railway.md).

| Variável | Valor |
|---|---|
| `DATABASE_URL` | `${{Postgres.DATABASE_URL}}` (referência, não copia o valor) |
| `JWT_SECRET` | (output do `openssl rand -base64 48`) |
| `JWT_EXPIRES_IN` | `15m` |
| `JWT_REFRESH_EXPIRES_IN` | `30d` |
| `NODE_ENV` | `production` |
| `PORT` | `3001` |
| `CORS_ORIGIN` | (deixa vazio agora — preenche no passo 7 com URL do Vercel) |
| `COOKIE_SAMESITE` | `none` (obrigatório enquanto loja e painel forem domínios diferentes) |
| `COOKIE_DOMAIN` | (DEIXA VAZIO se URLs `.vercel.app + .railway.app` — ver [07-cookie-domain-railway](../30-LICOES/07-cookie-domain-railway.md)) |
| `SHIPPING_FLAT_RATE` | `15` |
| `SHIPPING_ORIGIN_CEP` | (CEP do depósito, ex: `01310-100`) |
| `SEED_ADMIN_EMAIL` | (email do admin inicial) |
| `SEED_ADMIN_PASSWORD` | (senha forte ≥10 chars, mix de maiúscula/número/special) |
| `SEED_ADMIN_NAME` | (nome do admin) |
| `MERCADOPAGO_TOKEN` | `TEST-xxx` (sandbox) ou `APP_USR-xxx` (prod real) |
| `MERCADOPAGO_PUBLIC_KEY` | mesma fonte |
| `MERCADOPAGO_WEBHOOK_SECRET` | (configurado em "Suas integrações" no painel MP — obrigatório em prod) |
| `CLOUDINARY_URL` | `cloudinary://API_KEY:API_SECRET@CLOUD_NAME` (do dashboard Cloudinary) |

### 5. Redeploy

**Deployments** → 3 pontinhos do último deploy → **Redeploy**. Espera ficar verde (~3min).

### 6. Smoke test

Abre `https://SUA-URL.up.railway.app/healthz` no browser. Deve retornar:
```json
{"status":"ok","db":"connected"}
```

Se 502 ou erro: aba **Deployments** → clica deploy → **View Logs**. Bugs comuns:
- `Error: Cannot find module 'tsx'` → `tsx` está em devDependencies. Mover pra `dependencies` ([03-tsx-dependencies](../30-LICOES/03-tsx-dependencies.md))
- `tsconfig.tsbuildinfo not writable` → `tsbuildinfo` precisa estar gitignored ([08-tsbuildinfo-gitignore](../30-LICOES/08-tsbuildinfo-gitignore.md))
- `JWT_SECRET length insufficient` → não rodou `openssl rand -base64 48` ([01-jwt-secret-placeholder](../30-LICOES/01-jwt-secret-placeholder.md))

### 7. Voltar e setar `CORS_ORIGIN`

Após Vercel deployar (ver [vercel-passo-a-passo](vercel-passo-a-passo.md)), volta aqui:

**Variables** → edita `CORS_ORIGIN`:
```
https://loja-url.vercel.app,https://painel-url.vercel.app
```
Sem espaços. Sem `/` no final. Salva → redeploy automático.

### 8. Seed (primeira vez OU sempre que reset)

**O Dockerfile já roda `prisma migrate deploy` no boot.** O seed é separado.

Opções:
- **Local**: `railway link` (escolhe projeto) → `railway run -s backend npm run seed`
- **Railway CLI no painel**: aba **CLI** do projeto → `npx prisma db seed --schema=prisma/schema.prisma`

⚠️ **Não colocar o seed em `startCommand`** — sobrescreve edições do admin a cada redeploy. Ver [04-seed-startcommand](../30-LICOES/04-seed-startcommand.md).

## Troubleshooting

**"P3009: migrate found failed migration"**
Postgres ficou em estado intermediário. Solução simples: Postgres → Settings → Delete Service → recria → reconecta `DATABASE_URL` no backend → redeploy.

**Backend hibernando após inatividade**
Free tier hiberna após ~10min sem request. Primeiro request "acorda" (3-5s lento). Pra evitar: cron job externo pinga `/healthz` a cada 5min, OU upgrade pra paid (US$ 5/mês reais).

**Cookies não persistem após login**
Verificar:
1. `COOKIE_SAMESITE=none` setado
2. `COOKIE_DOMAIN` está vazio (não `.railway.app` — bloqueado pela PSL — ver [02-cookie-cross-domain](../30-LICOES/02-cookie-cross-domain.md))
3. `CORS_ORIGIN` exato (sem trailing slash)
4. Backend respondendo com `Set-Cookie` (verificar em DevTools → Network → Response Headers)

**Webhook MercadoPago não chega**
1. URL pública configurada no painel MP em "Notificações" → `https://SUA-URL.up.railway.app/api/webhooks/mercadopago`
2. `MERCADOPAGO_WEBHOOK_SECRET` setado igual ao secret do painel MP
3. Logs do backend mostram tentativas com `401`? Secret divergente

## Métrica de sucesso

- ✅ `/healthz` retorna 200 com `db:"connected"`
- ✅ `/products` retorna array (vazio antes do seed, ≥1 depois)
- ✅ Login admin no painel funciona
- ✅ Sem erro 5xx nos primeiros 5min

## Custo

- Backend: ~US$ 1-3/mês (escala com tráfego)
- Postgres: ~US$ 1/mês (free tier dá 1GB)
- Total no MVP: dentro dos US$ 5 grátis

## Ver também

- [vercel-passo-a-passo](vercel-passo-a-passo.md) — frontend + painel
- [env-vars-canonicas](../20-DECISOES/env-vars-canonicas.md) — todas as envs e seu propósito
- [30-LICOES/INDEX](../30-LICOES/INDEX.md) — armadilhas conhecidas (LEIA antes do primeiro deploy)
