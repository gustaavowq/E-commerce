# Playbook: Deploy Railway + Vercel

> Sequência testada que evita as 10 armadilhas de [[../30-LICOES/INDEX]].

## Pré-requisitos

- [ ] GitHub: repo criado e código pushed
- [ ] Lições lidas: [[../30-LICOES/01-jwt-secret-placeholder|01]], [[../30-LICOES/02-cookie-cross-domain|02]], [[../30-LICOES/05-csp-connect-src|05]], [[../30-LICOES/10-suggested-variables-railway|10]]
- [ ] Decisões revisadas: [[../20-DECISOES/env-vars-canonicas]], [[../20-DECISOES/deploy-pattern]]
- [ ] Conta criada: Railway, Vercel, Cloudinary (opcional), MercadoPago (pra pagamento real)

## Fase 1 — Backend no Railway (~10 min)

1. https://railway.com → **Login with GitHub** → autoriza
2. **+ New Project** → **Deploy from GitHub repo** → escolhe o repo
3. Primeiro deploy vai falhar — ignore, segue
4. **+ Create** → **Database** → **PostgreSQL** (espera ~30s)
5. Click no quadrado **backend** (não o Postgres)
6. Aba **Settings**:
   - **Source** → **Add Root Directory** → `src/backend`
   - **Build** → confirma que **Builder = Dockerfile** (puxado do `railway.json`)
   - **Networking** → **Generate Domain** → **Target port: 3001** → copia URL gerada
7. Aba **Variables**:
   - ⚠️ **NÃO** clicar em "Suggested Variables" (importa placeholders do `.env.example` — ver [[../30-LICOES/10-suggested-variables-railway|lição 10]])
   - Botão **Raw Editor** → colar lista de [[../20-DECISOES/env-vars-canonicas]] com valores reais
   - **Crítico**: `DATABASE_URL=${{Postgres.DATABASE_URL}}` (literal com chaves)
   - Salvar → Railway redeploya sozinho
8. Aba **Deployments** → aguarda último ficar verde (~3 min)
9. Smoke: abre `<URL>/healthz` no browser → deve retornar `{"success":true,"data":{"status":"ok",...}}`

### Rodar seed UMA vez

10. Aba **Settings** → **Custom Start Command** → cola:
    ```
    sh -c 'npx prisma migrate deploy && npx prisma db seed && node dist/index.js'
    ```
11. Aguarda redeploy → Deploy logs mostram `🌱 Seeding...` `✔ Produtos: N`
12. Confirma: `<URL>/products` retorna lista (não `data:[]`)
13. **CRÍTICO** voltar Custom Start Command pra:
    ```
    sh -c 'npx prisma migrate deploy && node dist/index.js'
    ```
    (sem isso, próximo redeploy sobrescreve edições do admin — ver [[../30-LICOES/04-seed-startcommand|lição 4]])

## Fase 2 — Loja no Vercel (~5 min)

1. https://vercel.com → **Sign Up with GitHub**
2. **Add New** → **Project** → escolhe repo → **Import**
3. **Project Name**: `<marca>-loja` (ex: `miami-store`, `maria-fitness`)
4. **Root Directory** → **Edit** → navega até `src/frontend`
5. **CRÍTICO**: depois de mudar Root, **Application Preset** reseta. Clica e seleciona **Next.js** manualmente — ver [[../30-LICOES/09-vercel-application-preset|lição 9]]
6. Expande **Environment Variables** e adiciona (Production and Preview):
   ```
   NEXT_PUBLIC_API_URL          = https://<URL-railway>
   INTERNAL_API_URL             = https://<URL-railway>
   NEXT_PUBLIC_DASHBOARD_URL    = https://<URL-painel-vercel>     ← (deixa vazio agora, atualiza depois)
   NEXT_PUBLIC_WHATSAPP_NUMBER  = 5511999999999
   ```
7. **Deploy** → aguarda ~2 min → copia URL gerada (`<projeto>.vercel.app`)

## Fase 3 — Painel no Vercel (~5 min)

Mesmo processo, mas:

- **Project Name**: `<marca>-painel`
- **Root Directory**: `src/dashboard`
- Env vars:
  ```
  NEXT_PUBLIC_API_URL    = https://<URL-railway>
  INTERNAL_API_URL       = https://<URL-railway>
  NEXT_PUBLIC_STORE_URL  = https://<URL-loja-vercel>
  ```
- Deploy → copia URL

## Fase 4 — Fechar o ciclo (~3 min)

1. **Voltar no Railway** → backend → Variables → editar `CORS_ORIGIN`:
   ```
   https://<URL-loja>.vercel.app,https://<URL-painel>.vercel.app
   ```
   Sem espaço, sem `/` no fim. Salvar → redeploy automático.

2. **Voltar no Vercel da loja** → Settings → Environment Variables → editar `NEXT_PUBLIC_DASHBOARD_URL` com a URL real do painel
3. Forçar redeploy: **Deployments** → 3 pontinhos no último → **Redeploy**

## Fase 5 — Cloudinary (opcional, se for usar upload de imagem)

1. https://cloudinary.com → criar conta → Dashboard
2. Copia o `CLOUDINARY_URL` no formato `cloudinary://KEY:SECRET@CLOUDNAME`
3. Railway → backend → Variables → adicionar `CLOUDINARY_URL` com esse valor
4. Salva → redeploy automático

## Fase 6 — Smoke E2E (~5 min)

1. Abrir loja → carrega com produtos ✓
2. Header: clicar Loja → categoria ✓
3. PDP: ver produto, adicionar ao carrinho ✓
4. Carrinho: ver barra "frete grátis acima de R$X" ✓
5. Checkout: input de cupom + WhatsApp opt-in ✓
6. Login admin (`admin@loja.com / <senha>`) ✓
7. Redirect pro painel ✓
8. Painel: ver KPIs, produtos com filtros, badge pendentes ✓
9. Editar produto: testar upload Cloudinary ✓ (se configurado)
10. DevTools console: nenhum CSP error ✓ — ver [[../30-LICOES/05-csp-connect-src|lição 5]]

## Custos

- Railway: usa $5/mês de crédito grátis (Postgres + backend pra demo cabem)
- Vercel: free hobby ilimitado
- Cloudinary: free 25k uploads/mês
- **Total: R$ 0** pra demo

## Rotas críticas pra testar pós-deploy

- `<api>/healthz` → 200
- `<api>/products` → array com produtos
- `<api>/auth/login` POST com admin → 200 + Set-Cookie
- `<loja>/` → renderiza
- `<painel>/login` → renderiza

## Rollback rápido

Railway: aba Deployments → clica num deploy verde anterior → 3 pontinhos → **Promote to Production**

Vercel: Deployments → escolhe um anterior → **Promote**

## Quando comprar domínio próprio (R$ 40/ano)

Vai em [registro.br](https://registro.br) → compra `.com.br` → aponta DNS:
- `loja.<marca>.com.br` → CNAME pra `cname.vercel-dns.com`
- `admin.<marca>.com.br` → CNAME pra `cname.vercel-dns.com`
- `api.<marca>.com.br` → CNAME pra Railway

E muda no Railway: `COOKIE_DOMAIN=.<marca>.com.br`, `COOKIE_SAMESITE=lax`. CORS atualiza pros novos hosts. Aí cookies funcionam de verdade entre os 3 (sem Cloudflare PSL bloqueando).

Ver [[../30-LICOES/02-cookie-cross-domain|lição 2]] sobre cookie cross-domain.
