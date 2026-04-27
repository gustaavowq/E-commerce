# DE: devops | PARA: techlead | Data: 2026-04-26
## Sprint 1 — Kore Tech (infra completa, sem deploy real)

## Status

- ✅ Docker Compose validado (`docker compose config --quiet` passa)
- ✅ Nginx config validado (`nginx -t` no container 1.27-alpine retorna OK)
- ✅ Estrutura independente do Miami (network própria, volume nomeado próprio, portas deslocadas)
- ✅ Lições críticas aplicadas: `.env` único na raiz do projeto (#06), JWT placeholder com aviso explícito (#01), seed só manual (#04), CORS sem `*` (#07), `tsx` em deps (já estava no package.json do backend)
- ⛔ **Sem deploy real** (demo fictícia conforme brief)

## Arquivos entregues

### Infra
| Path | O que é |
|---|---|
| `src/projeto-tech/kore-tech/infra/docker-compose.yml` | 5 services (postgres, backend, frontend, dashboard, nginx) — independente do Miami |
| `src/projeto-tech/kore-tech/infra/nginx/conf.d/default.conf` | 3 vhosts subdomain + headers de segurança + rate limit |

### Raiz do projeto
| Path | O que é |
|---|---|
| `src/projeto-tech/kore-tech/.env.example` | Todas as envs com placeholder seguro + comentário "onde pegar" |
| `src/projeto-tech/kore-tech/.gitignore` | Bloqueia `.env`, `node_modules`, `.next`, `dist`, etc — INCLUI proteção contra `.env` em subpastas (lição #06) |
| `src/projeto-tech/kore-tech/README.md` | Setup em 8 passos pra rodar local em PC novo, comandos comuns, troubleshooting |

### Configs deploy (placeholder, NÃO subir)
| Path | O que é |
|---|---|
| `src/projeto-tech/kore-tech/backend/railway.json` | (já existia — feito pelo backend) builder Dockerfile, healthcheck `/healthz`, sem seed em start |
| `src/projeto-tech/kore-tech/frontend/vercel.json` | Placeholder com comentário detalhado de quando deployar |
| `src/projeto-tech/kore-tech/dashboard/vercel.json` | Placeholder com comentário detalhado de quando deployar |

### Dockerfiles auxiliares (criados por mim, esperando outro agente preencher o app)
| Path | O que é |
|---|---|
| `src/projeto-tech/kore-tech/frontend/Dockerfile.dev` | Next.js 14 dev, porta 3001, hot reload via WATCHPACK_POLLING |
| `src/projeto-tech/kore-tech/frontend/.dockerignore` | Padrão |
| `src/projeto-tech/kore-tech/dashboard/Dockerfile.dev` | Next.js 14 dev, porta 3002, hot reload — **espera package.json com `"dev": "next dev -p 3002"`** |
| `src/projeto-tech/kore-tech/dashboard/.dockerignore` | Padrão |

### Script
| Path | O que é |
|---|---|
| `outros/scripts/setup-kore-tech.ps1` | Windows: auto-eleva, adiciona `loja.kore.test`, `admin.kore.test`, `api.kore.test` ao hosts file (idempotente, preserva customizações), flusha DNS, testa resolução |

## Mapa de portas (não conflita com Miami)

| Serviço    | Host | Container | Por quê |
|---|---|---|---|
| postgres   | 5433 | 5432 | Miami já usa 5432 |
| backend    | 4001 | 4001 | Backend do Kore Tech roda em 4001 (verificado em Dockerfile.dev e package.json do backend) |
| frontend   | 3001 | 3001 | `next dev -p 3001` (script já no package.json do frontend) |
| dashboard  | 3002 | 3002 | `next dev -p 3002` (espera o frontend agent setar isso) |
| nginx      | 8081 | 80   | Reverse proxy subdomínios `.test` |

Network: `kore-tech-net` (bridge isolada do `miami-net`).
Volume: `kore_tech_postgres_data` (qualificado pra não conflitar).

## Como rodar local (resumo TL;DR)

```bash
cd src/projeto-tech/kore-tech
cp .env.example .env
# editar .env: trocar JWT_SECRET (openssl rand -base64 48) e SEED_ADMIN_PASSWORD

# (opcional) hosts file:
# Windows admin: outros/scripts/setup-kore-tech.ps1
# Linux/Mac: echo "127.0.0.1 loja.kore.test admin.kore.test api.kore.test" | sudo tee -a /etc/hosts

cd infra
docker compose up -d
docker compose exec backend npx prisma migrate deploy
docker compose exec backend npx prisma db seed

# acessar:
# http://loja.kore.test:8081      (ou http://localhost:3001 sem hosts file)
# http://admin.kore.test:8081     (ou http://localhost:3002)
# http://api.kore.test:8081       (ou http://localhost:4001)
```

## Pendências (não bloqueantes — outros agentes finalizam)

### Backend (já em andamento)
- ⚠️ Falta o agente backend criar:
  - `prisma/schema.prisma` (modelos Product, PCBuild, CompatibilityRule, Persona, WaitlistSubscription, etc)
  - `prisma/migrations/` (primeira migration)
  - `prisma/seed.ts` (8 personas, ~30 componentes, 8 PCs montados, etc)
  - `src/index.ts` + rotas
  - `package-lock.json` (`npm install` local antes do primeiro `docker compose up` ajuda no cache do build)
- Espera: `/healthz` endpoint pra healthcheck do Railway (já configurado no railway.json)
- Espera: `/auth/*` sob esse prefixo pra rate limit do Nginx funcionar

### Frontend
- ✅ Dockerfile.dev pronto
- ⚠️ Falta o agente frontend popular `src/app/`, `package-lock.json` e validar que `npm run dev` sobe na 3001 (já está no script)
- ⚠️ `.env.example` do frontend tem `INTERNAL_API_URL=http://backend:3001` mas backend roda em **4001** — corrigi no docker-compose (passa via env), mas o agente frontend pode querer atualizar o próprio `.env.example` dele pra consistência

### Dashboard
- ✅ Dockerfile.dev pronto
- ⛔ Diretório `dashboard/` está praticamente vazio (só `src/{app,components,lib,services}/` placeholder). Precisa do agente frontend criar:
  - `package.json` com `"dev": "next dev -p 3002"` e `"start": "next start -p 3002"`
  - `next.config.mjs` com mesma CSP do frontend (`connect-src` lista `http://localhost:4001` etc)
  - `tsconfig.json`, `tailwind.config.ts`, etc
  - `src/app/layout.tsx`, páginas

Sem esses arquivos, `docker compose up dashboard` vai falhar no `npm install`. Os outros 4 services (postgres, backend, frontend, nginx) sobem normalmente.

### Designer / outros
- Nenhuma pendência minha pra eles. Tokens visuais não afetam infra.

## Riscos identificados

1. **Risco baixo — `INTERNAL_API_URL` divergente.** O `frontend/.env.example` (criado pelo agente frontend) aponta `http://backend:3001`, mas backend Kore Tech usa porta interna **4001** (não 3001 como Miami). Mitigado: docker-compose injeta `INTERNAL_API_URL=http://backend:4001` por env (vence o `.env.example`). Mas se alguém rodar fora do Compose lendo o `.env.example` literal, vai quebrar. Recomendo o frontend agent atualizar.

2. **Risco baixo — `SEED_ADMIN_PASSWORD` não validada por força.** O `.env.example` documenta "≥10 chars + especial" mas backend não força. Mitigado por aviso no README. Backend agent pode querer adicionar Zod check no script de seed.

3. **Risco médio — primeira execução demora.** `docker compose up` primeira vez = build de 4 imagens (postgres pulla rapidinho, backend/frontend/dashboard fazem `npm install` cada). Estimativa: 3-5 min em conexão decente. Documentei no README.

4. **Risco baixo — porta 8081 ocupada.** Em alguns ambientes Windows (TeamViewer, VPNs corporativas) a 8081 vem tomada. Resolvi via env `NGINX_PORT=8081` configurável. Cliente troca se precisar.

5. **Risco médio — .env duplicado (lição #06).** Se alguém criar `infra/.env` por engano, Compose vai carregar ele primeiro e sobrescrever os defaults do projeto. Mitigações:
   - `.gitignore` bloqueia `**/.env` (não permite commit acidental)
   - README destaca o aviso
   - `docker-compose.yml` tem comentário no header avisando

6. **Risco zero (design) — credenciais reais.** Demo fictícia, todos os tokens são placeholders. NÃO subir esse `.env.example` modificado com chaves reais por engano.

## Validações executadas

- `nginx -t` (container 1.27-alpine, mesma versão do compose): **syntax is ok, configuration file test is successful**
- `docker compose config --quiet`: **OK** (com `.env` temporário pra resolver interpolação; warnings sobre variáveis não setadas no shell — esperado, pois o `env_file` resolve em runtime, não em parse)
- Conferência manual de portas vs Miami: zero conflito (5433/4001/3001/3002/8081 vs 5432/3001/3000/3002/80)

## Próximo

- Aguardando agentes backend, frontend e dashboard preencherem seus respectivos diretórios. Quando todos reportarem ao Tech Lead, posso fazer um teste integrado (`docker compose up -d` + `npx prisma migrate deploy` + `curl http://api.kore.test:8081/healthz`).
- Sprint 2 (integração + bug bash): assumirei que vou ajudar a debugar issues de env/CORS/CSP/cookie quando aparecerem.
- Sprint 3 (security audit): rodarei `npm audit` em backend/frontend/dashboard, validarei headers reais com `curl -I`, conferirei rate limits com `wrk`.

## Bloqueios

Nenhum. Tudo entregue.

— DevOps, 2026-04-26
