## Fixes aplicados

1. **`src/backend/src/routes/auth.ts:355-368`** — removido `_devResetUrl` da response do `/forgot-password`. Em dev agora só faz `console.log('[dev] reset url: ...')` server-side. **Verificação:** `curl -s -X POST :3001/auth/forgot-password -d '{"email":"admin@miami.store"}'` retornou só `{ message }` (sem `_devResetUrl`); link saiu no `docker logs miami-backend`.

2. **`src/backend/src/config/env.ts:38-43`** — `SEED_ADMIN_PASSWORD` agora `z.string().min(10).optional()` (sem default). **`prisma/seed.ts:22-49`** — `seedAdmin()` retorna `null` com warning se a env não existir ou tiver < 10 chars; main não loga mais a senha. **`.env.example`** — bloco `Seed (admin inicial)` adicionado com `SEED_ADMIN_PASSWORD=` vazio + comentário; também adicionei `MERCADOPAGO_WEBHOOK_SECRET=`. **Verificação:** `docker exec -e SEED_ADMIN_PASSWORD= miami-backend npm run prisma:seed` imprimiu `⚠ SEED_ADMIN_PASSWORD ausente — admin NÃO criado.` e o admin existente não foi tocado.

3. **CORS** — `src/backend/src/index.ts:49-52` usa apenas `env.CORS_ORIGIN.split(',')`. Não há fallback hardcoded com tunnels antigos em nenhum arquivo do backend. Nada a remover. (Default em `env.ts` é `http://localhost`, inofensivo.)

4. **`src/backend/src/validators/auth.ts`** — extraí `strongPassword` reutilizado em register e reset: `min(10)`, `regex(/[A-Za-z]/)`, `regex(/[0-9]/)`, `regex(/[^A-Za-z0-9]/)` + blocklist `COMMON_PASSWORDS` com 19 entries (`abcd1234`, `miami2026`, `password`, `qwerty`, `12345678` etc.). **Verificação:** `register` com `abcd1234` retornou 400 com 3 erros (min 10, falta especial, comum); senha forte `S3curaSenh4!#` retornou 201.

5. **`src/backend/src/routes/webhooks.ts:1-67`** — adicionada `verifyMpSignature()` que parseia `x-signature` (`ts=...,v1=...`), monta `id:<id>;request-id:<rid>;ts:<ts>;`, calcula HMAC-SHA256 com `MERCADOPAGO_WEBHOOK_SECRET`, compara com `crypto.timingSafeEqual`. Se a env existir e a assinatura não bater, retorna 401 antes de qualquer DB write. Se a env vazia, log warning e segue (compat dev). Env adicionada em `config/env.ts` e `.env.example`.

## Typecheck
- Backend: OK (`docker exec miami-backend npx tsc --noEmit` saiu silencioso, exit 0).

## Re-testes
- forgot-password sem `_devResetUrl`: OK
- senha `abcd1234` rejeitada: OK
- admin não recriado (sem env): OK

## Pendências
- Nenhuma do meu lado. Avisar DevOps pra setar `MERCADOPAGO_WEBHOOK_SECRET` e `SEED_ADMIN_PASSWORD` no Railway antes do próximo deploy/seed.
