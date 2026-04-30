# Security audit — Marquesa (OWASP Top 10)

**De:** QA · **Para:** Tech Lead · **Data:** 2026-04-29
**Método:** code review estático (sem browser real). Backend, frontend, infra.

Legenda: OK / RISCO / FALHA

---

## A01 — Broken Access Control · OK

**Painel `/painel/*` (Next middleware):** `frontend/src/middleware.ts` checa cookie `access_token` e redireciona pra `/auth/login?redirect=...`. Não decodifica JWT (acertado, backend é fonte de verdade).
**RoleGate (cliente) `frontend/src/app/painel/RoleGate.tsx`:** após hidratar, redireciona USER pra `/`, sem-cookie pra login. Renderiza null enquanto avalia (sem flicker).
**Backend `/api/admin/*` (`backend/src/routes/admin/index.ts:13`):** `requireAuth + requireRole(['ADMIN','ANALYST'])` global no router. ANALYST tem só GET — POST/PATCH/DELETE em imóveis e PATCH em reservas tem `requireRole('ADMIN')` adicional.
**IDOR `GET /api/reservas/:id` (`reservas.ts:154`):** valida `isOwner || isStaff`, retorna 403 se nem dono nem staff. OK.
**Mass assignment `POST /api/auth/register` (`auth.ts:88`):** `role: 'USER'` HARD-CODED. Body com `role: 'ADMIN'` é silenciosamente ignorado pelo Zod. OK.

## A02 — Cryptographic Failures · OK

**bcrypt cost 10 (`lib/password.ts`):** `bcryptjs` (não bcrypt nativo, evita problema Alpine), recomendado pelo brief.
**JWT_SECRET fail-fast prod (`config/env.ts:75-83`):** se `NODE_ENV=production` e secret começa com `dev_only_`, mata o processo. Min 32 chars no zod.
**Cookies httpOnly (`auth.ts:34-48`):** `httpOnly: true`, `secure` ativa em prod ou quando SameSite=None, path `/`. Domain só seta se env explícito.
**Refresh token opaco:** 48 bytes random base64url, sha256-hash no DB, raw no cookie. Bom padrão.
**Reset token:** 32 bytes random base64url + sha256 no DB, expira 60min, marca `usedAt`.
**Webhook MP HMAC (`webhooks/mercadoPago.ts:41-50`):** SHA-256 + `timingSafeEqual` (constant-time). Manifest segue spec MP. Sem secret, loga warn e aceita (acertado pra dev).

## A03 — Injection · OK

**Prisma:** todas queries usam parameterized API. Os 3 `$queryRaw` em `admin/dashboard.ts:110-132` usam tagged template literals (`${since}` é binding parametrizado, não interpolação string). OK.
**Validação Zod:** todos POST/PATCH (`registerSchema`, `loginSchema`, `imovelWriteSchema`, `imovelPatchSchema`, `createLeadSchema`, `createReservaSchema`, `adminPatchReservaSchema`). 422 com fieldErrors+formErrors (lição 26 capturada).
**Body size:** `express.json({ limit: '5mb' })` — generoso mas aceitável. Considerar 1mb pra MVP.

## A04 — Insecure Design · OK

**Rate limit login (`middlewares/rateLimit.ts:17`):** `authLimiter` 5/min/IP, `skipSuccessfulRequests: true` (correto — só conta tentativas falhas).
**Rate limit forgot (`rateLimit.ts:30`):** 5/h/IP.
**Rate limit global (`rateLimit.ts:5`):** 100 req/min/IP.
**Rate limit view (`viewRateLimit.ts`):** in-memory Map, 30min/IP+slug, retorna 204 silencioso. OK pra 1 instância (limitação documentada no comment).
**Trust proxy `index.ts:31`:** `trust proxy: 1` setado — req.ip reflete X-Forwarded-For do nginx. Sem isso o rate-limit seria bypassed.
**Anti-enumeração forgot (`auth.ts:216-258`):** sempre retorna 200 com a mesma mensagem (`standardResponse`), `setTimeout(200ms)` quando user não existe pra equalizar timing. Sem `_devResetUrl` no body. OK.
**Refresh token rotation com detecção de reuso (`auth.ts:150-159`):** se token já revogado é reapresentado, revoga toda a chain do usuário. Excelente.

## A05 — Security Misconfiguration · RISCO MÉDIO

**Helmet `index.ts:33-41`:** ligado MAS com CSP, COOP, COEP, CORP e frameguard desligados ("DevOps liga via nginx"). X-Frame-Options DENY tá no nginx OK. CSP tá no Next (`next.config.mjs:5-18`) OK. **Mas** o Express direto (rota `/healthz` e `/api/*` se nginx escapar) servirá sem CSP/COOP. Aceitável pq nginx termina TLS, mas vale documentar.
**CSP Next:** allow `https://images.unsplash.com`, `cloudinary.com`, `maps.gstatic.com`, GA, Pixel. `connect-src` lista API + GA + FB. Frame-src libera `https://www.google.com` e `maps.google.com` (necessário pro embed PDP). Sem `unsafe-eval` em prod (só dev). OK.
**CORS `index.ts:43-46`:** `origin: env.CORS_ORIGIN.split(',')`, `credentials: true`. Em prod precisa setar `CORS_ORIGIN=https://marquesa.gustavo.agenciaever.cloud` no `.env.production`. Sem set explícito cai no default `http://localhost:3000` — confere `.env.production.example`.
**`.env.example` DATABASE_URL porta 5432, docker-compose dev expõe 5433** — usuário copia .env e falha ao conectar. Pequeno, mas trava primeira run.
**RISCO:** PdpMap usa iframe `https://www.google.com/maps?q=...&output=embed`. Sites com X-Frame-Options DENY do Google podem renderizar OK porque está em domínio Google, mas vale validar no smoke (alguns ad-blockers bloqueiam).

## A06 — Vulnerable Components · RISCO MÉDIO (1 high, 3 moderate)

**Backend `npm audit` (prod deps):**
- `mercadopago` depende de `uuid <14.0.0` (GHSA-w5hq-g745-h8pq, **moderate**, missing buffer bounds). Fix exige downgrade de `mercadopago` pra `0.5.0` (breaking). Aceitável pra MVP (uuid é interno do SDK).

**Frontend `npm audit` (prod deps):**
- `next` 14.x — **5 advisories** incluindo **HIGH** (DoS via Image Optimizer remotePatterns, HTTP request smuggling em rewrites, request deserialization DoS). Fix força upgrade pra `next@16.2.4` — breaking.
- `postcss <8.5.10` (transitivo via Next): **moderate**, XSS via unescaped `</style>`.

**Recomendação:** patch Next 14 pra última 14.x estável (`npm install next@latest --save` dentro de major 14 se houver patch) ou aceitar risco MVP e abrir issue de upgrade pra 15. Documentar no DEPLOY.md.

## A07 — Auth Failures · OK

**Senha forte (`validators/auth.ts:14-20`):** min 10 chars, letra+número+especial, blocklist 17 senhas comuns (`marquesa1`, `password123`, etc).
**Refresh rotation:** já comentado em A01/A04. Logout invalida refresh (`auth.ts:197-211`). Reset-password revoga TODOS os refresh do user em transação (`auth.ts:285-298`).
**Brute-force `authLimiter`:** 5/min/IP. Em produção sob nginx, additionally `limit_req zone=marquesa_auth burst=10 nodelay` aplica (5r/s window). Defesa em camadas OK.
**FALHA:** **Frontend register form valida senha min 8** (`RegisterForm.tsx:19`), backend exige 10 + especial. Usuário vai aceitar `password1` no client e tomar 422 no submit. Microcopy `erros.senha_curta` diz "8 caracteres". Confunde. **AJUSTAR**.

## A08 — Data Integrity · OK

**Webhook MP idempotente (`webhooks/mercadoPago.ts:84-88`):** `webhookEventId` UNIQUE no schema; checa antes de processar. Re-consulta MP via `getPaymentMetadata(paymentId)` ao invés de confiar no body.
**`mpPaymentId` UNIQUE no schema (`schema.prisma:208`):** dois webhooks pro mesmo paymentId não criam duplicata.
**Transações em ops compostas:**
- Reset-password (`auth.ts:285-298`): mark token used + update user + revoke all refresh — `$transaction`.
- Reserva creation (`reservas.ts:67-84`): create reserva + bump lastInteractionAt — `$transaction`.
- Lead creation (`leads.ts:24-41`): create lead + bump lastInteractionAt — `$transaction`.
- Webhook MP (`mercadoPago.ts:109-148`): update reserva + (conditional) update imovel — `$transaction`.
- Job expiry (`reservaExpiry.ts:31-57`): cada reserva em transação separada com optimistic lock (`where: { id, status: 'ATIVA' }`).
**Snapshot de preço (`reservas.ts:58`):** `precoSnapshot` no momento da reserva — KPI Data-Analyst não distorce se admin reprecificar.

## A09 — Logging · OK

**pino estruturado (`lib/logger.ts`):** pretty em dev, JSON em prod. `LOG_LEVEL` configurável.
**Eventos críticos logados:**
- Reuso de refresh token (`auth.ts:157`).
- Webhook MP processed/ignored/invalid signature (`mercadoPago.ts:67, 75, 102, 150`).
- Reserva intent criada (`reservas.ts:116`).
- Reservas expiradas tick (`reservaExpiry.ts:64`).
- Errors via errorHandler (`middlewares/error.ts:53-59`) com path + method + userId + stack (em dev).
**Sem PII bruto:** logs incluem `userId`, `reservaId`, `imovelId` — sem senhas, tokens, ou email/CPF. OK.
**Reset URL em dev:** logado no servidor (`auth.ts:251`), nunca na response. OK.

## A10 — SSRF · OK

**Sem fetches externos não validados.** O único fetch externo do backend é o SDK MercadoPago (URLs hardcoded). Webhooks MP usam re-consulta autenticada via SDK.
**Upload de imagem:** NÃO HÁ. Schema `Imovel.fotos` é array de strings (URLs). Validador `imovelWriteSchema.fotos` exige `z.array(z.string().url())`. Frontend admin (`ImovelForm`) aceita URLs colocadas pelo admin. Trust pro admin. Em V2 com upload Cloudinary direto, validar allowlist de host.
**`buildResetUrl` (`auth.ts:261-265`):** usa `req.header('origin')` mas faz `new URL(origin).origin` (resolve só a parte safe). Fallback `env.PUBLIC_WEB_URL`. Aceitável.

---

## Resumo

| Cat | Status | Bloq? |
|---|---|---|
| A01 Access Control | OK | Não |
| A02 Crypto | OK | Não |
| A03 Injection | OK | Não |
| A04 Insecure Design | OK | Não |
| A05 Misconfig | RISCO médio (CORS env + DB url 5432 vs 5433) | Não, ajustar |
| A06 Vulnerable Components | RISCO (Next 14 high, mercadopago/uuid moderate) | Não, V1.1 |
| A07 Auth | RISCO (senha mismatch frontend↔backend) | **SIM** |
| A08 Data Integrity | OK | Não |
| A09 Logging | OK | Não |
| A10 SSRF | OK | Não |

**Bloqueador:** senha mínima divergente entre frontend (8) e backend (10 + especial). Cliente novo cadastra, backend rejeita 422, sem mensagem clara de qual regra falhou. Fix em `RegisterForm.tsx`, `microcopy.json` e `validators/auth.ts` (alinhar mensagem).
