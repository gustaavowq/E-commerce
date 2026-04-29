# DE: Tech Lead | PARA: TIME | Data: 2026-04-26

## SECURITY AUDIT APROVADO ✅

Cliclo de pentest + fix + retest fechado. 4 críticos, 6 altos e ~10 médios endereçados.

## Resumo dos fixes

### Críticos (4) — todos fechados
1. **JWT_SECRET placeholder** → trocado por `openssl rand -base64 48`. Sincronizado em `.env` (raiz) E `src/infra/.env` (legado). Backend recreate. JWT forjado com secret antigo retorna **401**.
2. **`_devResetUrl` em forgot-password** → removido do response. Token só aparece em `docker logs`. Confirmado via curl.
3. **`SEED_ADMIN_PASSWORD=miami2026` default** → tirado do schema (`.optional()`). Seed pula admin se env ausente.
4. **Stored XSS via MarkdownLite** → `escapeHtml()` adicionado antes dos regex bold/link em `policies/[slug]/page.tsx`.

### Altos (6) — todos fechados
- CSP, X-Frame-Options DENY, Referrer-Policy, Permissions-Policy: adicionados via `next.config.mjs` em loja e painel
- HSTS + headers globais no nginx (3 vhosts)
- Webhook MercadoPago: HMAC-SHA256 com `timingSafeEqual` (env `MERCADOPAGO_WEBHOOK_SECRET`)
- Senha fraca: regex agora exige min 10 + special char + blocklist 19 entries. `abcd1234` rejeitada com 422
- CORS_ORIGIN: já vinha sem fallback hardcoded (validado)
- X-Frame-Options duplicado (Helmet+nginx): `frameguard: false` no Helmet, nginx fica como única fonte

### Pós-fix
- **Senha admin rotacionada**: `miami2026` (vazada e na blocklist) → senha nova forte
- **44 refresh tokens revogados** (todas as sessões antigas mortas)

## Não-fix (deixados pro deploy real)
- Next 14→15 upgrade (4 CVEs HIGH em DoS/request-smuggling/image-optimizer) — breaking changes, vai pro DEPLOY.md
- `NODE_ENV=production` — quebra hot-reload em dev, setar no Railway
- Container USER non-root
- Postgres porta fechada
- Cookie cross-domain Cloudflare (PSL bloqueia) — em prod com domínio próprio some

## Validação final

Manual via PowerShell. 5/5 vetores críticos:
```
JWT forjado:                401 ✅
miami2026 (vazada):         401 ✅
Senha nova:                 200 ✅
_devResetUrl no response:   ausente ✅
abcd1234 (fraca):           422 ✅
```

## Credenciais novas

`admin@miami.store / Mi4mi!Store#26AdmCh4ng3`

Bom trabalho time. Próximo ciclo: deploy real (Railway + Vercel) com checklist de produção.
