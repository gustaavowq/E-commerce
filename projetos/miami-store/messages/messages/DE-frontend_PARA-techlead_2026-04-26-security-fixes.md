## Fixes aplicados

1. **`src/frontend/src/app/policies/[slug]/page.tsx`** — adicionado `escapeHtml()` e chamado dentro de `inline()` ANTES dos regex de bold/link.
   - Antes: `function inline(s) { return s.replace(/\*\*.../...).replace(/\[.../...) }`
   - Depois: `function inline(s) { return escapeHtml(s).replace(/\*\*.../...).replace(/\[.../...) }`
   - Revisão de comportamento: `<script>alert(1)</script>` em policy vira `&lt;script&gt;alert(1)&lt;/script&gt;` (renderizado como texto literal). `**bold**` e `[link](url)` continuam funcionando porque `*`, `[`, `]`, `(`, `)` não são alterados pelo escape.

2. **`src/frontend/next.config.mjs` (loja)** — adicionada `async headers()` exportando X-Frame-Options DENY, X-Content-Type-Options, Referrer-Policy, Permissions-Policy e Content-Security-Policy. CSP usa `'unsafe-eval'` em script-src apenas quando `NODE_ENV !== 'production'` (Next HMR precisa).

3. **`src/dashboard/next.config.mjs` (painel)** — mesma `async headers()` aplicada. Mesma lógica condicional pra `'unsafe-eval'` em dev.

## Typecheck
- Frontend: OK (saída vazia em `npx tsc --noEmit`)
- Dashboard: OK (saída vazia em `docker exec miami-dashboard npx tsc --noEmit`)

## Verificação CSP
Após `docker compose restart frontend dashboard`:

**Loja (porta 3000, `/policies/privacy` e `/contato`):**
- `X-Frame-Options: DENY`
- `X-Content-Type-Options: nosniff`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Permissions-Policy: camera=(), microphone=(), geolocation=()`
- `Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline' fonts.googleapis.com; font-src 'self' fonts.gstatic.com data:; img-src 'self' data: https: blob:; connect-src 'self' https://*.trycloudflare.com https://api.mercadopago.com; frame-src 'self' https://www.google.com; object-src 'none'; base-uri 'self'; form-action 'self'`

**Painel (direto na porta 3002 do container `miami-dashboard`):** mesmos 5 headers, mesmo CSP.

OBS pro Tech Lead: o `curl http://localhost:3001/` (rota via nginx) ainda retorna `X-Frame: SAMEORIGIN` e `Referrer: no-referrer` — esses headers vêm do nginx upstream, fora do meu escopo. O app do painel emite os headers corretos; precisa o DevOps ajustar/passar-through em `src/infra/nginx/*` pra os clientes verem o CSP completo no painel via :3001.

## Smoke
- `/policies/privacy` (loja) renderiza HTTP 200: OK
- `/contato` (loja, iframe Google Maps) renderiza HTTP 200: OK — `frame-src 'self' https://www.google.com` cobre o embed
- Bundles Next continuam carregando (script-src com `'unsafe-inline' 'unsafe-eval'` em dev)
