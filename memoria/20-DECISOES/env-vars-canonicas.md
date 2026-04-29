# Decisão: Env vars canônicas

> Lista exaustiva de toda variável de ambiente que o sistema usa. **Use os mesmos nomes em qualquer e-commerce.**

## Backend (Railway / docker-compose)

### Auth & cookies (CRÍTICAS)

```
JWT_SECRET=<openssl rand -base64 48>           # OBRIGATÓRIO. Trocar antes de prod
JWT_EXPIRES_IN=15m                              # access token
JWT_REFRESH_EXPIRES_IN=30d                      # refresh
COOKIE_SAMESITE=none                            # 'lax' em local com domínio compartilhado, 'none' em prod cross-site
COOKIE_DOMAIN=                                  # vazio em Railway/Cloudflare; .miamistore.com.br em prod com domínio próprio
```

### Database

```
DATABASE_URL=postgresql://user:pass@host:5432/db?schema=public
# No Railway: ${{Postgres.DATABASE_URL}}     ← referência ao serviço Postgres
```

### Server

```
NODE_ENV=production                             # 'development' em dev local
PORT=3001
CORS_ORIGIN=https://loja.com,https://admin.loja.com   # CSV dos hosts permitidos
```

### Seed (só pro primeiro deploy)

```
SEED_ADMIN_EMAIL=admin@loja.com
SEED_ADMIN_PASSWORD=<senha forte 12+ chars>     # OBRIGATÓRIO se quiser seed criar admin
SEED_ADMIN_NAME=Admin Loja
```

### Frete

```
SHIPPING_FLAT_RATE=15.00
SHIPPING_ORIGIN_CEP=01310-100                   # de onde sai o produto
```

### MercadoPago

```
MERCADOPAGO_TOKEN=APP_USR-xxxxx                  # TEST-xxxxx em sandbox
MERCADOPAGO_PUBLIC_KEY=APP_USR-xxxxx
MERCADOPAGO_WEBHOOK_URL=https://api.loja.com/api/webhooks/mercadopago
MERCADOPAGO_WEBHOOK_SECRET=<gerado no painel MP>  # HMAC secret pra validar
```

### Cloudinary (upload imagens)

```
CLOUDINARY_URL=cloudinary://KEY:SECRET@CLOUD_NAME
# OU separadas:
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
```

### CEP API (cálculo de frete)

```
CEP_API_URL=https://viacep.com.br/ws
```

### WhatsApp (botão flutuante e contato)

```
WHATSAPP_NUMBER=5511999999999
WHATSAPP_DEFAULT_MESSAGE=Olá! Vi a loja no Insta e quero tirar uma dúvida.
```

## Frontend loja (Vercel)

```
NEXT_PUBLIC_API_URL=https://api.loja.com         # browser usa essa
INTERNAL_API_URL=https://api.loja.com            # SSR usa essa (igual em Vercel)
NEXT_PUBLIC_DASHBOARD_URL=https://admin.loja.com # link "Painel" pra admin logado
NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY=APP_USR-xxxx
NEXT_PUBLIC_WHATSAPP_NUMBER=5511999999999
```

## Painel admin (Vercel)

```
NEXT_PUBLIC_API_URL=https://api.loja.com
INTERNAL_API_URL=https://api.loja.com
NEXT_PUBLIC_STORE_URL=https://loja.com           # link "Ver loja" no painel
```

## Em ambos Frontends — ATENÇÃO ao CSP

`next.config.mjs` headers `Content-Security-Policy` precisa incluir o host da API em `connect-src`:

```ts
"connect-src 'self' https://*.up.railway.app https://*.vercel.app https://api.mercadopago.com",
```

Ver [[../30-LICOES/05-csp-connect-src]].

## Anti-padrões

- ❌ Hardcoded `localhost` em URL de prod
- ❌ `NEXT_PUBLIC_*` com segredos (vazam pro client por design)
- ❌ Default fraco em `SEED_ADMIN_PASSWORD` no `env.ts` schema (`.optional()`, sem default)
- ❌ Default fraco em `JWT_SECRET` (`.optional()` ou throw se vazio)
- ❌ Esquecer `projetos/miami-store/infra/.env` quando atualizar `.env` raiz (compose lê o do infra) — ver [[../30-LICOES/06-env-files-multiplos]]

## Arquivo `.env.example` (commitado, valores são placeholders)

Sempre commitar `.env.example` com **todas** as vars listadas acima e valores tipo `<gerar com openssl>` ou `TEST-xxxxx`. Cliente copia e preenche.
