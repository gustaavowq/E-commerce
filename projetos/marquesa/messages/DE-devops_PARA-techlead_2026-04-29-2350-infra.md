# DE: devops | PARA: techlead | 2026-04-29 23:50

## Status

Infra de deploy da Marquesa pronta. Tudo idempotente, alinhado às convenções da VPS Ever Growth.

## Arquivos criados

- `infra/docker-compose.yml` — DEV: só Postgres em `localhost:5433` (API/web rodam local com hot reload)
- `infra/docker-compose.prod.yml` — PROD: db + api + web no formato `gustavo-marquesa-{db,api,web}`, bind 127.0.0.1, mem/cpu limits, log rotation, network bridge interna `marquesa-net`
- `infra/nginx/marquesa.conf` — site config com upstream pra 8210 (web) e 8211 (api), rate limit (auth 5r/s, api 20r/s), security headers, gzip, location especial pro webhook MP, healthz público
- `infra/scripts/setup-vps.sh` — bootstrap idempotente: valida envs, build, up, espera DB healthy, `migrate deploy`, seed condicional (só se 0 imóveis), nginx + certbot, smoke test
- `infra/.env.example` — DB_PASSWORD do compose
- `backend/.env.production.example` — template de prod (NODE_ENV, JWT, MP, COOKIE_SECURE=true, CORS pro domínio)
- `frontend/.env.production.example` — `NEXT_PUBLIC_API_URL`, `INTERNAL_API_URL=http://api:8211` (SSR direto pelo container, sem ir até nginx)
- `DEPLOY.md` — passo-a-passo end-to-end com troubleshooting + comandos úteis
- `.gitignore` — bloqueia `.env*` exceto `.example`

## Decisões e correções

1. **Dockerfile do frontend tinha `COPY ../copy ../copy`** — quebra porque `..` sai do build context. Reescrevi: o build context do `web` no compose agora é `..` (raiz `projetos/marquesa/`) e o Dockerfile faz `COPY frontend/` + `COPY copy/`. Symlink garante que o import `../copy` em código siga funcionando.
2. **Compose dev sem API/web** — backend e frontend rodam local com `npm run dev` pra hot reload. Container só pra DB (porta 5433 evita conflito com Postgres locais 5432).
3. **Backend já monta rotas com e sem prefixo `/api`** (`mountRoutes('')` + `mountRoutes('/api')`), então o nginx faz `proxy_pass http://upstream` mantendo o path original — sem strip — e funciona dos dois lados.
4. **Webhook MP em `location =`** (match exato) antes do `/api/` genérico — anti rate-limit e timeout dedicado.
5. **`COOKIE_DOMAIN` vazio** (memoria 30-LICOES/06): single-domain `marquesa.gustavo.agenciaever.cloud` não precisa setar; default funciona, evita repetir bug Kore Tech.
6. **Faixa de portas:** 8210 web + 8211 api (faixa 8200-8299 livre na VPS).

## Validações feitas

- `docker compose -f docker-compose.yml config` — OK
- `docker compose -f docker-compose.prod.yml config` (com envs placeholder) — OK
- `bash -n setup-vps.sh` — sintaxe OK
- **Não rodou `docker compose up`** — Docker Desktop offline na máquina dev. Ficou TODO de validar build dos containers em ambiente com daemon ativo (próxima sessão ou direto na VPS).

## Handoff (não-DevOps)

- **Cliente / Gustavo**: pedir DNS A pro Jean (`marquesa.gustavo.agenciaever.cloud → 187.127.17.153`) antes do deploy.
- **Cliente / Gustavo**: prover token MP **PRODUCTION** (com chave Pix cadastrada na conta) — sem isso reserva fica em mock.
- **Backend**: confirmar que `prisma db seed` printa as senhas geradas no console (memoria diz que sim, mas é o que `setup-vps.sh` espera).
- **Frontend**: confirmar que o build standalone usa `INTERNAL_API_URL` em SSR e `NEXT_PUBLIC_API_URL` no browser. Se algum fetch SSR estiver hardcoded em `NEXT_PUBLIC_*`, vai vazar pra fora do datacenter.

## Sugestão pro QA (smoke pós-deploy)

```bash
curl -I  https://marquesa.gustavo.agenciaever.cloud
curl -sf https://marquesa.gustavo.agenciaever.cloud/healthz
curl -sf 'https://marquesa.gustavo.agenciaever.cloud/api/imoveis?limit=1' | head -c 300
```

E manualmente: login admin → CRUD imóvel; login cliente → PDP → reserva com Pix; conferir que cookie é `Secure` + `HttpOnly` no devtools.

## Bloqueios

Nenhum técnico. Aguardando DNS Jean + token MP production pra validar prod fim-a-fim.
