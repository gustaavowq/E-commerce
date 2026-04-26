# 🚨 #10 Railway "Suggested Variables" importa placeholders inseguros do `.env.example`

**Severidade:** CRÍTICO

## Sintoma

User entra na aba Variables do Railway. Vê seção "Suggested Variables" com 28 entradas detectadas no código:
- `JWT_SECRET=troque_isso_em_producao_use_openssl_rand_base64_48`
- `DB_PASSWORD=postgres_dev_only_change_me`
- `NODE_ENV=development`
- `COOKIE_DOMAIN=.miami.test`
- ... etc

User clica "Add" pra todas. Resultado: prod sobe com **secrets de dev** que estão **commitados no repo**.

## Causa raiz

Railway escaneia `.env.example` (que TEM que estar commitado pra outros devs poderem rodar) e oferece auto-importar como Variables. Não distingue placeholder de valor real.

## Fix aplicado (post-fato)

1. **Deletar todas as inseguras** do Railway:
   - `JWT_SECRET` (substituir por `openssl rand -base64 48`)
   - `DB_PASSWORD`, `DB_USER`, `DB_NAME`, `DB_PORT` (irrelevantes — `DATABASE_URL` cobre)
   - `COOKIE_DOMAIN` (vazio em Railway — ver [[07-cookie-domain-railway]])
   - `BACKEND_PORT`, `FRONTEND_PORT`, `DASHBOARD_PORT` (irrelevantes)
   - `ANTHROPIC_API_KEY` (não usado pelo backend)
   - `MERCADOPAGO_WEBHOOK_URL` (atualizar pra URL real)

2. Restart backend pra pegar valores limpos.

## Prevenção (próximo e-commerce)

**NÃO clicar em "Suggested Variables" no Railway.** Em vez disso:

1. Aba **Variables** → botão **Raw Editor**
2. Colar lista limpa de [[../20-DECISOES/env-vars-canonicas]] com valores reais
3. Salvar

Lista mínima pro backend Railway (só essas):
```
DATABASE_URL=${{Postgres.DATABASE_URL}}
JWT_SECRET=<openssl rand -base64 48>
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=30d
NODE_ENV=production
PORT=3001
COOKIE_SAMESITE=none
CORS_ORIGIN=https://loja.vercel.app,https://admin.vercel.app
SHIPPING_FLAT_RATE=15
SHIPPING_ORIGIN_CEP=01310-100
SEED_ADMIN_EMAIL=admin@loja.com
SEED_ADMIN_PASSWORD=<senha forte>
SEED_ADMIN_NAME=Admin Loja
CEP_API_URL=https://viacep.com.br/ws
MERCADOPAGO_TOKEN=<APP_USR-... do MP>
MERCADOPAGO_PUBLIC_KEY=<APP_USR-... do MP>
MERCADOPAGO_WEBHOOK_URL=https://api.railway.app/api/webhooks/mercadopago
MERCADOPAGO_WEBHOOK_SECRET=<gerado no painel MP>
WHATSAPP_NUMBER=5511999999999
WHATSAPP_DEFAULT_MESSAGE=Olá! Vi a loja e quero tirar uma dúvida.
CLOUDINARY_URL=cloudinary://KEY:SECRET@CLOUD_NAME
```

## Reforço no playbook de deploy

[[../60-DEPLOY/railway-passo-a-passo]] tem aviso destacado: **NUNCA clicar em "Suggested Variables"**.
