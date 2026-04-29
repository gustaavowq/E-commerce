# DE: 05-devops PARA: 00-tech-lead — Infra Audit (2026-04-26)

## Status containers
OK. 5/5 up: miami-frontend (3000), miami-dashboard (3002), miami-backend (3001, 2h up), miami-postgres (healthy), miami-nginx. Nenhum reiniciando, nenhum unhealthy. Smoke nas 3 URLs públicas: loja=200, api/healthz=200, painel/login=200. Cloudflared rodando (tunnels do dia 26/04 13:47Z, ~2h up). API responde com `Access-Control-Allow-Origin` e `access-control-allow-credentials: true` corretos.

## Env vars
OK no geral, MAS:
- `frontend.NEXT_PUBLIC_API_URL` e `dashboard.NEXT_PUBLIC_API_URL` apontam pra called-measuring (correto)
- `frontend.NEXT_PUBLIC_DASHBOARD_URL` aponta pra dropped-models (correto)
- `dashboard.NEXT_PUBLIC_STORE_URL` aponta pra tunes-tap (correto)
- `backend.CORS_ORIGIN` inclui os 3 tunnels + miami.test/localhost (OK)
- `backend.COOKIE_SAMESITE=none` (OK pra cross-site)
- `backend.COOKIE_DOMAIN` não setado (OK — não pode setar `.miami.test` em cloudflare)
- ALERTA: `backend.NODE_ENV=development`. Funciona pq `setAuthCookies` força `secure=true` quando `sameSite==='none'`, mas em prod-like deveria ser `production`.
- Chaves de teste óbvias ainda presentes: `JWT_SECRET=troque_isso_em_producao_*`, `MERCADOPAGO_PUBLIC_KEY=TEST-xxx`, db pwd `postgres_dev_only_change_me`. Aceitável pra MVP em tunnel, BLOQUEADOR pra produção.

## Logs
OK. Backend só com 200/304/401 esperados (login admin foi 200 várias vezes — confirma que login HTTP em si funciona). Frontend e dashboard limpos, único warn é `Cross origin request detected ... allowedDevOrigins` (next dev avisando sobre HMR, não é erro funcional).

## Cookie cross-domain — CONFIRMADO COMO BUG DO LOGIN ADMIN
**É exatamente isso que o cliente reportou.** Fluxo atual:
1. Admin abre `tunes-tap.../login` → POST pra `called-measuring.../api/auth/login` → 200, API responde `Set-Cookie: access_token; refresh_token` SEM `Domain=` → cookie é gravado APENAS em `called-measuring-relay-alarm.trycloudflare.com`.
2. `AuthForm.tsx:62` faz `window.location.href = NEXT_PUBLIC_DASHBOARD_URL` → vai pra `dropped-models...`.
3. Painel chama `/auth/me` → browser manda pra `called-measuring...` (com cookie OK), MAS o painel também tem auth gate próprio que checa cookie/sessão local em `dropped-models...` → não tem → kicka pra /login de novo.

O comentário em AuthForm.tsx linha 57 ainda diz "Cookie é compartilhado entre subdomínios (Domain=.miami.test)" — isso só vale no fluxo nginx/`miami.test` local. Em cloudflare quick-tunnel cada serviço tá em zona apex DIFERENTE de `trycloudflare.com`, e o navegador trata como cross-site total. Não tem como compartilhar cookie httpOnly entre eles sem proxy reverso unificando os 3 sob um mesmo host.

## Recomendações priorizadas
1. **Fix login admin (BLOQUEADOR cliente):** colocar os 3 serviços atrás de UM tunnel só, com paths (ex: `meu-tunnel.../`, `meu-tunnel.../admin`, `meu-tunnel.../api`). Cookie passa a ser same-origin e o problema some. Alternativa rápida: o painel chama `/auth/me` no mount, e se 401, mostra tela "Sessão não encontrada — entrar pelo painel" com form próprio que loga DIRETO no domínio do painel (POST de painel pra api, browser grava cookie no contexto da página painel, e como `SameSite=None+Secure` o cookie volta pra api em requests subsequentes). Hoje o login só acontece no domínio da loja.
2. Trocar `NODE_ENV=development` → `production` no backend pra ativar caminhos prod (logs, error masking, secure cookies sem depender do trick `sameSite==='none'`).
3. Antes de qualquer cliente real: rotacionar `JWT_SECRET`, senha postgres, e trocar `MERCADOPAGO_PUBLIC_KEY` TEST→ chave real.
4. Renomear/atualizar comentário em `AuthForm.tsx:57-58` que cita `Domain=.miami.test` — desatualizado e enganoso.
5. Tunnels quick-tunnel não têm uptime guarantee (warning no log). Pra demo agendada com cliente, migrar pra named tunnel.
