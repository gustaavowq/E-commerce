# Auth bug — admin login no painel

**De:** 01-backend
**Para:** 00-tech-lead
**Data:** 2026-04-26

## Diagnóstico
O login NÃO está quebrado — `POST /auth/login` retorna 200 com `role: ADMIN` e seta cookies corretamente. O que está quebrado é o **transporte de cookie cross-site entre dashboard e backend**, que vivem em tunnels Cloudflare distintos.

## Causa raiz
`src/infra/docker-compose.yml:161` configura o dashboard com `NEXT_PUBLIC_API_URL=https://called-measuring-relay-alarm.trycloudflare.com`, enquanto o painel é servido em `https://dropped-models-colin-deutsch.trycloudflare.com`. O backend (`src/backend/src/routes/auth.ts:39-58`, `setAuthCookies`) seta `access_token` com `Secure; SameSite=None` mas **sem atributo `Domain`** (porque `COOKIE_DOMAIN` está vazio no `.env`). Resultado: o cookie fica escopado no domínio do backend (`called-measuring-...`) e o middleware do dashboard (`src/dashboard/src/middleware.ts:26`) não consegue ler `access_token` no domínio dele (`dropped-models-...`) → redireciona pra `/login` mesmo após login bem-sucedido. Tentar setar `COOKIE_DOMAIN=.trycloudflare.com` também NÃO funciona: `trycloudflare.com` está na Public Suffix List, então browsers ignoram o atributo Domain.

Verificação que fiz:
- Banco: usuário existe (`id=cmof717w10000au9oh5ot5mb0`, `role=ADMIN`, hash `$2a$12$zHuABASES1nX9...`).
- Curl direto: `200 OK`, retorna `accessToken` + `Set-Cookie` válidos.
- Logs do backend: dezenas de `POST /auth/login 200` recentes — nenhum 401/500.
- Senha bate com seed (`prisma/seed.ts:24`, default `miami2026`).

## Fix sugerido
Duas opções, em ordem de preferência:

**Opção A (recomendada, sem mudar código):** servir backend e dashboard pelo MESMO host via nginx, sob paths diferentes (`/api` → backend, `/` → dashboard) e expor um único tunnel Cloudflare. Aí o cookie passa a ser same-site automaticamente.
- Ajustar `src/infra/nginx/conf.d/*.conf` (se não existir, criar) com upstreams pra `dashboard:3002` e `backend:3001`.
- No `.env` do dashboard: `NEXT_PUBLIC_API_URL=/api` (mesmo origin).
- Subir UM tunnel cloudflare apontando pra `nginx:80`.

**Opção B (paliativa, sem cookie):** trocar autenticação do dashboard pra Bearer token no `Authorization` header (token em `localStorage`). Backend já aceita header (`src/backend/src/middleware/auth.ts`). Custos: perde httpOnly (XSS pode roubar token), middleware Next precisa virar client-side.

Não recomendo configurar `COOKIE_DOMAIN=.trycloudflare.com` — a PSL bloqueia.

## Verificação (Tech Lead confirma com)
1. Após o fix, abrir `https://<host-unico>/login`, logar com `admin@miami.store / miami2026`.
2. DevTools → Application → Cookies: ver `access_token` no MESMO domínio do dashboard.
3. Navegar pra `/orders` → carrega sem redirect pra `/login`.
4. `docker logs miami-backend --tail 5` mostra `GET /auth/me 200` (não 401).

Aguardo aprovação antes de implementar.
