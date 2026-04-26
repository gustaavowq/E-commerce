# Decisão: Segurança baseline

> Tudo isso vai em **todo** e-commerce desde o sprint 1. Não é opcional.

## Backend

### Helmet (config testada)

```ts
// src/backend/src/index.ts
app.use(helmet({
  contentSecurityPolicy: false,         // CSP gerenciado pelo Next/nginx, não Helmet
  crossOriginResourcePolicy: false,     // CORP=same-origin quebra fetch cross-origin
  crossOriginOpenerPolicy:   false,
  crossOriginEmbedderPolicy: false,
  frameguard: false,                    // X-Frame-Options sai do nginx (DENY), não duplicar
}))
```

### CORS

```ts
app.use(cors({
  origin: env.CORS_ORIGIN.split(',').map(s => s.trim()),
  credentials: true,                    // pra cookies httpOnly cross-origin
}))
```

NÃO usar `origin: '*'` mesmo em dev — quebra `credentials: true`.

### Rate limit (anti brute-force)

```ts
import rateLimit from 'express-rate-limit'

const authLimiter = rateLimit({
  windowMs: 60_000,
  limit: 10,
  message: { success: false, error: { code: 'RATE_LIMITED', message: 'Muitas tentativas' } },
})

router.post('/login', authLimiter, ...)
router.post('/register', authLimiter, ...)
router.post('/forgot-password', authLimiter, ...)
```

Nginx também limita (defesa em profundidade) — ver [[../50-PADROES/nginx-config]].

### Body size

```ts
app.use(express.json({ limit: '15mb' }))   // pra aceitar imagem base64 do upload
```

### Trust proxy

```ts
app.set('trust proxy', 1)   // Railway/Vercel/Nginx tão na frente
```

### Validação Zod em TUDO

Toda rota que recebe body usa `schema.parse(req.body)` antes de tocar Prisma. Mass assignment fica impossível.

```ts
const body = productCreateSchema.parse(req.body)   // throws ZodError → 422 automático
```

### Webhook MercadoPago HMAC

```ts
// src/backend/src/routes/webhooks.ts
const signature = req.header('x-signature')
const requestId = req.header('x-request-id')
const expected = crypto.createHmac('sha256', env.MERCADOPAGO_WEBHOOK_SECRET)
  .update(`id:${id};request-id:${requestId};ts:${ts};`)
  .digest('hex')
if (!crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(received))) {
  return res.status(401).json({ ok: false })
}
```

## Frontend (Next.js loja + painel)

### Headers globais via `next.config.mjs`

```ts
async headers() {
  const isDev = process.env.NODE_ENV !== 'production'
  const csp = [
    "default-src 'self'",
    isDev ? "script-src 'self' 'unsafe-inline' 'unsafe-eval'"
          : "script-src 'self' 'unsafe-inline'",
    "style-src 'self' 'unsafe-inline' fonts.googleapis.com",
    "font-src 'self' fonts.gstatic.com data:",
    "img-src 'self' data: https: blob:",
    "connect-src 'self' https://*.up.railway.app https://*.vercel.app https://api.mercadopago.com",
    "frame-src 'self' https://www.google.com",   // Google Maps em /contato
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
  ].join('; ')

  return [{
    source: '/:path*',
    headers: [
      { key: 'X-Frame-Options', value: 'DENY' },
      { key: 'X-Content-Type-Options', value: 'nosniff' },
      { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
      { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
      { key: 'Content-Security-Policy', value: csp },
    ],
  }]
}
```

CRÍTICO: ver [[../30-LICOES/05-csp-connect-src]].

### Sanitização XSS

Quando renderizar markdown ou conteúdo gerado por admin (policies, descrições), **escapar HTML antes** de aplicar regex de bold/link:

```ts
function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function inline(s: string): string {
  return escapeHtml(s)   // <-- ANTES dos replaces de markdown
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" ...>$1</a>')
}
```

## Nginx (subdomínio dev)

Headers obrigatórios em **todos** os 3 server blocks (api, admin, frontend):

```nginx
add_header X-Content-Type-Options    "nosniff" always;
add_header X-Frame-Options           "DENY"    always;
add_header Referrer-Policy           "strict-origin-when-cross-origin" always;
add_header Permissions-Policy        "camera=(), microphone=(), geolocation=()" always;
add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
```

Rate limit na zona auth:

```nginx
limit_req_zone $binary_remote_addr zone=apilimit:10m rate=20r/s;
limit_req_zone $binary_remote_addr zone=authlimit:10m rate=5r/s;

location ~ ^/auth/(login|register) {
    limit_req zone=authlimit burst=10 nodelay;
    proxy_pass http://backend_upstream;
}
```

## Pré-deploy checklist (NÃO subir sem rodar)

- [ ] `JWT_SECRET` é `openssl rand -base64 48` (não placeholder)
- [ ] `SEED_ADMIN_PASSWORD` é forte (não default)
- [ ] `NODE_ENV=production` em prod
- [ ] `_devResetUrl` removido da response do `/forgot-password`
- [ ] `escapeHtml()` aplicado em todo markdown gerado por admin
- [ ] CSP `connect-src` inclui hosts da API
- [ ] Headers nginx aplicados em api + frontend + admin
- [ ] CORS allowlist NÃO tem `*`
- [ ] Webhook MP valida HMAC se `MERCADOPAGO_WEBHOOK_SECRET` setado
- [ ] `npm audit` rodado em backend, frontend, dashboard
- [ ] Senha admin rotacionada se foi vazada em algum lugar (chat, screenshot, doc)

Ver [[../10-PLAYBOOKS/security-audit]] pra varredura completa.
