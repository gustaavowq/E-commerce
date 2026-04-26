# 🚀 Deploy da Miami Store

Guia passo-a-passo pra subir tudo na nuvem e ter um link público pra mostrar.

**Stack final:**
- **Loja** → Vercel · `https://miami-store.vercel.app`
- **Painel admin** → Vercel · `https://miami-admin.vercel.app`
- **API + Postgres** → Railway · `https://miami-api.up.railway.app`

**Custo:** R$ 0/mês dentro dos free tiers (Railway dá US$ 5/mês de crédito grátis).

---

## ⚙️ O que já tá pronto no código

Tudo que segue eu já preparei. Você só precisa **clicar** nos serviços.

✅ `Dockerfile` de produção do backend (multi-stage, slim)
✅ `railway.json` apontando pra build via Docker
✅ `vercel.json` nos dois Next.js
✅ Cookies em modo `SameSite=None` quando `COOKIE_SAMESITE=none` (necessário pra cross-domain)
✅ `INTERNAL_API_URL` cai no `NEXT_PUBLIC_API_URL` se não tiver setado (Vercel não tem rede interna)
✅ Migrations Prisma rodam automaticamente no boot do backend
✅ Build prod testado localmente nos 3 projetos
✅ Commit inicial pronto

---

## 📋 Passos (ordem importa)

### 1. Subir o código pro GitHub

Você precisa ter conta no GitHub. Se não tem, cria em https://github.com/signup (grátis, 30 segundos).

**1.1.** Cria um repo novo em https://github.com/new
- Nome: `miami-store` (ou o que quiser)
- Visibilidade: **Private** (pode deixar Public se quiser, mas Private é mais seguro)
- **NÃO** marca "Initialize with README" (já temos)
- Clica **Create repository**

**1.2.** O GitHub vai mostrar um bloco "…or push an existing repository". Copia o trecho que começa com `git remote add origin`. Vai ser tipo:
```bash
git remote add origin https://github.com/SEU_USUARIO/miami-store.git
git branch -M main
git push -u origin main
```

**1.3.** Cola isso no terminal (PowerShell ou Git Bash) na pasta do projeto e roda. Vai pedir login no GitHub na primeira vez (abre janela do browser).

---

### 2. Deploy do **backend** no Railway

**2.1.** Abre https://railway.com → **Login with GitHub** → autoriza.

**2.2.** Na página inicial, clica **+ New Project** → **Deploy from GitHub repo** → escolhe `miami-store`.

**2.3.** Railway vai começar a fazer deploy automaticamente, mas vai falhar (ainda não tem Postgres nem env). Tudo certo, é só seguir.

**2.4.** Adiciona Postgres:
- Dentro do projeto, clica **+ Create** → **Database** → **PostgreSQL**
- Espera ~30 segundos provisionar
- O Railway cria automaticamente uma variável `DATABASE_URL` que vai aparecer pro backend usar

**2.5.** Configura o serviço backend:
- Clica no quadrado do backend (não o do Postgres)
- Aba **Settings**:
  - **Root Directory**: `src/backend` (importante! sem isso o Railway tenta buildar a raiz toda)
  - **Watch Paths**: `src/backend/**` (só rebuilda quando muda backend)
- Clica **Generate Domain** em "Networking" pra ter uma URL pública (vai ficar algo tipo `miami-api-production.up.railway.app`)
- **COPIA essa URL**. Vai precisar daqui pra frente.

**2.6.** Aba **Variables** do backend, clica **+ New Variable** pra cada uma:

| Variável | Valor |
|----------|-------|
| `DATABASE_URL` | `${{Postgres.DATABASE_URL}}` (referência ao Postgres do Railway) |
| `JWT_SECRET` | (gera uma string aleatória de 64+ chars: roda `openssl rand -base64 48` ou usa https://generate-secret.vercel.app/64) |
| `JWT_EXPIRES_IN` | `15m` |
| `JWT_REFRESH_EXPIRES_IN` | `30d` |
| `NODE_ENV` | `production` |
| `PORT` | `3001` |
| `CORS_ORIGIN` | (vai preencher depois — primeiro precisamos da URL do Vercel) |
| `COOKIE_SAMESITE` | `none` |
| `SHIPPING_FLAT_RATE` | `15` |
| `SHIPPING_ORIGIN_CEP` | `01310-100` |
| `SEED_ADMIN_EMAIL` | `admin@miami.store` |
| `SEED_ADMIN_PASSWORD` | (gera uma senha forte; isso vai ser teu login no painel) |
| `SEED_ADMIN_NAME` | `Admin Miami Store` |
| `MERCADOPAGO_TOKEN` | (deixa vazio por enquanto, ou põe um TEST-... do MercadoPago Sandbox) |

**2.7.** Aba **Deployments** → clica nos 3 pontinhos do último deploy → **Redeploy**. Aguarda ficar verde (~3 min).

**2.8.** Testa: abre `https://SUA-URL-RAILWAY.up.railway.app/healthz` no navegador. Deve retornar JSON com `"status":"ok"`.

**2.9.** Roda o seed (admin + catalogo Lacoste) uma vez:
- Aba **Settings** do backend → role até **Service** → **Restart**? Não. Use o terminal:
- Aba **CLI** do projeto (em cima): `railway run npx prisma db seed --schema=src/backend/prisma/schema.prisma`
- OU pelo terminal local: `railway link` (escolhe o projeto) → `railway run -s backend npx prisma db seed`

> Se não funcionar, abre `https://SUA-URL-RAILWAY.up.railway.app/products` — se voltar `[]`, seed não rodou. Pode rodar manualmente: clica em "..." no deploy → "View Logs" → vai ver os comandos que rodam.

---

### 3. Deploy da **loja** (frontend) no Vercel

**3.1.** Abre https://vercel.com → **Sign Up** → **Continue with GitHub** → autoriza.

**3.2.** Clica **Add New** → **Project** → seleciona o repo `miami-store` → **Import**.

**3.3.** Configurações de import:
- **Project Name**: `miami-store` (vai virar `miami-store.vercel.app`)
- **Root Directory**: clica em **Edit** → seleciona `src/frontend` → **Continue**
- **Framework Preset**: Next.js (auto-detectado)

**3.4.** Antes de clicar Deploy, expande **Environment Variables** e adiciona:

| Variável | Valor |
|----------|-------|
| `NEXT_PUBLIC_API_URL` | `https://SUA-URL-RAILWAY.up.railway.app` (a URL do passo 2.5) |
| `INTERNAL_API_URL` | `https://SUA-URL-RAILWAY.up.railway.app` (mesmo valor) |
| `NEXT_PUBLIC_WHATSAPP_NUMBER` | `5511999999999` (ou o teu número real) |

**3.5.** Clica **Deploy**. Aguarda ~2 min. Quando terminar, **copia a URL** (vai ser tipo `https://miami-store.vercel.app`).

---

### 4. Deploy do **painel admin** (dashboard) no Vercel

Mesmo processo do passo 3, mas:

**4.1.** Vercel → **Add New Project** → mesmo repo `miami-store` → **Import**.

**4.2.**
- **Project Name**: `miami-admin`
- **Root Directory**: `src/dashboard`
- **Framework Preset**: Next.js

**4.3.** Environment Variables:

| Variável | Valor |
|----------|-------|
| `NEXT_PUBLIC_API_URL` | `https://SUA-URL-RAILWAY.up.railway.app` |
| `INTERNAL_API_URL` | `https://SUA-URL-RAILWAY.up.railway.app` |

**4.4.** Deploy. Vai virar `https://miami-admin.vercel.app`.

---

### 5. Atualizar CORS no Railway (com as URLs do Vercel)

Volta no Railway → backend → **Variables** → edita `CORS_ORIGIN`:

```
https://miami-store.vercel.app,https://miami-admin.vercel.app
```

(Sem espaços. Coloca as URLs reais que o Vercel te deu.)

Salva. O Railway re-deploya automaticamente (~1 min).

---

### 6. Teste final

✅ Abre `https://miami-store.vercel.app` → loja deve carregar com produtos
✅ Abre `https://miami-admin.vercel.app/login` → loga com admin@miami.store + a senha do `SEED_ADMIN_PASSWORD`
✅ No painel, clica em "Visão geral" → deve aparecer KPIs

Se algo não funcionar, o problema mais comum é:
- **CORS error no console (F12)** → confere `CORS_ORIGIN` no Railway, tem que ter as URLs exatas do Vercel (com `https://`, sem barra no final)
- **API 502** → Railway tá hibernando ou falhou. Vai em Deployments → ver logs
- **Cookie não persiste** → confirma que `COOKIE_SAMESITE=none` tá no Railway

---

## 🌐 Domínio próprio (opcional, R$ 40/ano)

Quando quiser ter `miamistore.com.br` no lugar dos `.vercel.app`:

1. Compra o domínio em https://registro.br (R$ 40/ano)
2. **Vercel**: cada projeto → **Settings** → **Domains** → adiciona `miamistore.com.br` (loja) e `admin.miamistore.com.br` (painel). Vercel te dá os DNS records pra colar no registro.br
3. **Railway**: backend → **Settings** → **Domains** → adiciona `api.miamistore.com.br`. Mesma coisa.
4. Vai no Railway, atualiza `CORS_ORIGIN` pras novas URLs e seta `COOKIE_DOMAIN=.miamistore.com.br` e troca `COOKIE_SAMESITE=lax` (com domínio compartilhado, não precisa mais de `none`).

Aí o cookie de login vale entre loja e painel automaticamente, e tudo fica com cadeado verde profissional.

---

## 🔧 Troubleshooting

**Build falha no Railway com "P3009: migrate found failed migration"**
Aconteceu porque o Postgres ficou em estado intermediário. Soluções:
1. Mais simples: Railway → Postgres → **Settings** → **Delete Service** → recria → adiciona DATABASE_URL de novo no backend
2. Ou roda `railway run -s backend npx prisma migrate resolve --rolled-back NOME_DA_MIGRATION`

**"Module not found: Can't resolve 'XXX'"** no Vercel
Falta dep no `package.json`. Verifica se rodou `npm install` localmente antes de commitar (gera lockfile atualizado).

**Pix não funciona em prod**
Você precisa de `MERCADOPAGO_TOKEN` real do MercadoPago. Vai em https://www.mercadopago.com.br/developers/panel/credentials, pega um TEST token (sandbox) ou APP token (prod), e cola na variável.

**Sessão "perde" entre loja e painel**
É esperado nessa primeira versão. Loja e painel são domínios diferentes (`.vercel.app`) então cookies não compartilham. Resolve com domínio próprio (passo de cima).

---

## 📊 O que ficou de fora (próximas iterações)

- HTTPS local com `mkcert` (já tem em prod, só falta replicar em dev)
- Email transacional real (forgot-password ainda só loga URL no console)
- WhatsApp Business API integrado (botão flutuante já tem, link automático ainda não)
- Lighthouse CI no Vercel (pra catar regressão de performance)
- Sentry pra erros em prod
- CDN de imagens (hoje servimos do `/public/products/`, OK pra MVP)
