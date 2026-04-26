# De: DevOps (Agente 05)
# Para: Todos
# Data: 2026-04-25
# Assunto: ENTREGA — Ambiente dev funcional (Sprint 1)
# Prioridade: Alta

## Contexto
Sprint 1 do DevOps entregue. O ambiente local sobe com **um comando** e expõe Postgres + Backend + Nginx prontos pra uso. Frontend e Dashboard ficaram como **stubs comentados** no compose — vão ser ativados quando o Frontend (Agente 03) entregar a primeira versão dos apps.

## O que foi entregue

### `src/infra/`
- `docker-compose.yml` — Postgres 16 + Backend (build local) + Nginx 1.27. Volume persistente do banco. Healthcheck do Postgres antes do backend subir.
- `nginx/conf.d/default.conf` — proxy reverso com:
  - `/api/*` → backend (rate limit 20 req/s/IP)
  - `/api/auth/(login|register)` → backend com rate limit mais agressivo (5 req/s/IP)
  - `/healthz` → backend
  - `/admin/*` e `/` → comentados (frontend/dashboard)
  - Headers básicos de segurança (X-Content-Type-Options, X-Frame-Options, Referrer-Policy)
- `scripts/wait-for-postgres.sh` — helper se algum container precisar esperar o banco

### `src/backend/`
- `package.json` — Express 4 + Prisma 5 + Zod + bcryptjs + jsonwebtoken + helmet + cors + cookie-parser + morgan + mercadopago + pino. Dev deps: tsx, vitest, supertest, types.
- `tsconfig.json` — strict mode + ESM (NodeNext) + path alias `@/*`
- `Dockerfile.dev` — Node 20 alpine, instala deps, gera Prisma client, roda `prisma migrate deploy && npm run dev` (hot reload via tsx watch)
- `.dockerignore`
- `src/index.ts` — Express básico com Prisma client compartilhado, healthcheck `/healthz` que faz `SELECT 1`, error handler global, graceful shutdown

### Raiz
- `.env.example` atualizado — agora tem `CORS_ORIGIN`, `WHATSAPP_NUMBER`, `SHIPPING_ORIGIN_CEP`, `MERCADOPAGO_WEBHOOK_URL`, `JWT_REFRESH_EXPIRES_IN`
- `.gitignore` criado — protege `.env`, `node_modules`, builds, migrations locais, assets do Instagram (não versionar conteúdo de terceiros)
- `README.md` reescrito — quick start Docker, comandos úteis, tabela de endpoints, troubleshooting

## Como subir (DESDE A RAIZ DO REPO)

```bash
cp .env.example .env
cd src/infra
docker compose up -d
curl http://localhost/healthz
```

Esperado: `{"success":true,"data":{"status":"ok",...}}`

## O que cada agente precisa fazer agora

### → Backend (Agente 01)
**Pode começar a codar.** O esqueleto Express + Prisma + healthz já está no ar. Ordem sugerida:
1. Criar `src/backend/prisma/seed.ts` com:
   - 1 ADMIN inicial (email do `.env`)
   - Marcas (Lacoste, Nike, Adidas, Tommy)
   - Categorias (Polos, Tênis, Bonés, Conjuntos…)
2. Rodar `prisma migrate dev --name init` pra gerar a primeira migration
3. Implementar `src/backend/src/routes/auth.ts` (register/login/refresh/logout) com:
   - Cadastro público SEMPRE como CUSTOMER (regra do kickoff)
   - JWT em cookie httpOnly
   - bcryptjs com cost 12
4. Implementar `src/backend/src/routes/products.ts` (listar, filtrar por brand+category+size)
5. Documentar tudo em `docs/api-contracts.md`

### → Frontend (Agente 03)
Aguarde o Backend terminar `auth` + `products`. Em paralelo, pode:
1. Criar `src/frontend/` com `npx create-next-app@latest --typescript --tailwind --app .`
2. Configurar `tailwind.config.ts` importando os tokens do `docs/design/design-system.md`
3. Layout-base com header/footer baseado nos wireframes
4. Quando estiver pronto, **descomentar o serviço `frontend` no docker-compose.yml** (DevOps avisa o que mudar)

### → Dashboard (segunda app Frontend)
Mesma ideia do Frontend, mas em `src/dashboard/`. Pode esperar a loja sair primeiro.

### → Designer (Agente 02)
Já tem o design-system pronto. Próximo: validar se as paletas batem com o material que o lojista vai usar (logo, cores impressas, etc.) e refinar wireframes pra Figma se a equipe escalar.

### → Data Analyst (Agente 04)
Antes do Backend criar os endpoints `/api/dashboard/*`, defina em `docs/kpis.md`:
- Quais métricas vão pro painel admin
- SQL de cada uma (ou pseudo-código)
- Filtros disponíveis (período, marca, categoria)

### → QA (Agente 06)
Pode preparar o esqueleto de testes:
1. `src/backend/__tests__/healthz.test.ts` — primeiro teste, valida que `/healthz` responde 200 com Postgres up
2. `src/e2e/playwright.config.ts` com viewport mobile como padrão (regra do AGENT.md atualizado)

## O que NÃO está pronto ainda
- ❌ Frontend container (descomenta no compose quando o app existir)
- ❌ Dashboard container (idem)
- ❌ HTTPS (mkcert) — não é necessário em dev, mas será no MercadoPago em prod
- ❌ Backup automático do Postgres
- ❌ CI/CD (GitHub Actions) — Sprint 3
- ❌ Containers de produção (Dockerfile.prod multi-stage)

## Bloqueios em aberto pro Tech Lead
1. **Cliente precisa fornecer:**
   - Token MercadoPago real (sandbox por enquanto está OK)
   - Número WhatsApp oficial
   - CEP de origem do envio
   - Logo da Miami Store em alta resolução (PNG transparente)
   - CNPJ pra rodapé
2. **Decidir:** vamos hospedar onde em produção? (Hetzner / Railway / DigitalOcean / VPS própria) — afeta o Dockerfile.prod e CI/CD do próximo sprint.

## Próximo passo esperado
Tech Lead repassa pro Backend (Agente 01) começar o seed + migrations + rotas de auth.
