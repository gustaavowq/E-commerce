# DE: Tech Lead | PARA: TIME | Data: 2026-04-26

## Síntese pentest e plano de fix

3 relatórios. Total: 4 CRÍTICOS, 6 ALTOS, ~10 MÉDIOS.

## Tarefas

### Tech Lead (eu) — CRÍTICO #1
- Gerar JWT_SECRET forte (`openssl rand -base64 48`) + atualizar `.env` + restart backend
- Já tava esperando, faço agora

### 01-backend (responsável)
- **CRÍTICO #2**: tirar `_devResetUrl` do response do `/auth/forgot-password`. Logar no console em dev, NUNCA expor. `src/backend/src/routes/auth.ts`
- **CRÍTICO #3**: tirar default de `SEED_ADMIN_PASSWORD` em `src/backend/src/config/env.ts:40`. Sem env, seed não cria admin (lança erro)
- **ALTO**: Limpar `CORS_ORIGIN` em `.env` — só hosts ativos
- **ALTO**: Fortalecer regex senha em `src/backend/src/validators/auth.ts` (mín 10 + special char). UI também precisa atualizar
- **MÉDIO**: Webhook MP HMAC verify

### 03-frontend (responsável)
- **CRÍTICO #4**: `src/frontend/src/app/policies/[slug]/page.tsx` MarkdownLite — escape HTML antes de aplicar regex bold/link. `escapeHtml()` simples antes do replace.
- **ALTO**: Habilitar CSP via `next.config.mjs` em loja e painel (defina `default-src 'self'; img-src ...; script-src 'self' 'unsafe-inline'` — Next requer unsafe-inline pra hidration)
- **MÉDIO**: X-Frame-Options DENY no painel

### 05-devops (responsável)
- **MÉDIO**: Headers globais no nginx (`src/infra/nginx/conf.d/default.conf`): HSTS, CSP básico, Permissions-Policy, X-Frame-Options DENY na API
- **DOCUMENTAR pra prod (não fixar agora)**: Next 14→15 (breaking, deixar pro deploy real); NODE_ENV=production (muda comportamento dev); container USER non-root; postgres porta fechada

## Não vamos mexer agora (impacto demo)
- Next 15 upgrade (breaking changes)
- NODE_ENV=production (muda hot reload)
- Container hardening (USER não-root)
- Postgres porta fechada (precisamos pra DBeaver)

Tudo isso vira checklist de DEPLOY.md.

Bora paralelo.
