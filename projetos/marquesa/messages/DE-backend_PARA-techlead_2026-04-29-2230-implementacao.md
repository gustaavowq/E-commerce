# DE: backend | PARA: techlead | 2026-04-29 22:30

## Status

Backend Marquesa implementado, typecheck passando (`tsc --noEmit` zero errors), servidor sobe em `npm run dev` (porta 8211). DB local não disponível no ambiente, então a migração `prisma migrate dev` não foi executada — fica como passo do DevOps/QA quando subir Postgres.

## O que ficou pronto

### Estrutura
```
projetos/marquesa/backend/
├── package.json + tsconfig.json + Dockerfile + .dockerignore
├── .env.example
├── README.md
├── prisma/
│   ├── schema.prisma         (User, Imovel, Reserva, Lead, RefreshToken, PasswordResetToken, SiteSettings)
│   └── seed.ts
└── src/
    ├── index.ts              (bootstrap + helmet + cors + rate-limit global)
    ├── config/env.ts         (validação Zod, treat empty-string como undefined)
    ├── lib/                  (api-response, jwt, password, prisma, logger)
    ├── middlewares/          (auth, error, rateLimit)
    ├── services/
    │   ├── mercadoPago.ts   (createReservaPreference + getPaymentMetadata; mock em dev sem token)
    │   └── reservaExpiry.ts (job setInterval 1h: ATIVA + APROVADO + expirada → libera imóvel)
    ├── validators/           (auth, imovel, reserva, lead — Zod)
    ├── routes/
    │   ├── auth.ts           (register/login/refresh/logout/forgot/reset/me)
    │   ├── imoveis.ts        (lista + detalhe público com filtros)
    │   ├── reservas.ts       (POST cria preferência MP, GET /me, GET /:id)
    │   ├── leads.ts          (POST público)
    │   └── admin/
    │       ├── index.ts     (master, exige ADMIN ou ANALYST)
    │       ├── imoveis.ts   (CRUD + soft delete pra INATIVO)
    │       ├── reservas.ts  (lista, detalhe, PATCH cancelar/converter/estender)
    │       ├── clientes.ts  (read-only)
    │       └── dashboard.ts (KPIs + séries temporais)
    └── webhooks/mercadoPago.ts (HMAC + idempotência via webhookEventId UNIQUE)
```

### Endpoints (todos os do brief, mais alguns)

- **Público:** `GET /healthz`, `GET /`, `GET /api/imoveis` (paginação + filtros tipo/status/bairro/cidade/preco/quartos/destaque/search/sort), `GET /api/imoveis/:slug`, `POST /api/leads`
- **Auth:** `POST /api/auth/register|login|refresh|logout|forgot-password|reset-password`, `GET /api/auth/me`
- **Cliente:** `POST /api/reservas`, `GET /api/reservas/me`, `GET /api/reservas/:id`
- **Admin (ADMIN+ANALYST):** `GET/POST/PATCH/DELETE /api/admin/imoveis`, `GET /api/admin/reservas`, `PATCH /api/admin/reservas/:id`, `GET /api/admin/clientes/...`, `GET /api/admin/dashboard/kpis|series`
- **Webhook:** `POST /api/webhooks/mercadopago`

Rotas montadas duplicadas (com e sem `/api`) pra suportar nginx que faz strip de `/api/` (mesma trick do Miami).

### Regras de negócio implementadas

- ✅ Reserva só vira `ATIVA` + imóvel só vira `RESERVADO` depois do webhook MP `APROVADO`
- ✅ Bloqueio de 2ª reserva ATIVA pro mesmo imóvel (409)
- ✅ `expiraEm = paidAt + RESERVA_DURACAO_DIAS dias` (default 7)
- ✅ Job interno expira reservas e libera imóvel (mas só se imóvel ainda estiver `RESERVADO` — não pisa em CONVERTIDA/EM_NEGOCIACAO)
- ✅ Sinal default 2% (configurável via env e por imóvel via `precoSinal`)
- ✅ Webhook idempotente
- ✅ JWT 15m access + 7d refresh com rotação + detecção de reuso (revoga TODA chain do user)
- ✅ Anti-enumeração no `/forgot-password` (sempre 200 com mesma mensagem + delay artificial)

## Decisões que precisei tomar

1. **MP via Preference API (não Payment direto):** Permite cliente escolher Pix/cartão/boleto no checkout MP, e o webhook só lida com `payment` notifications. Mais simples que orquestrar Payment manual e dá UX mais fluida pro sinal.
2. **Reserva criada como `ATIVA` mas com `pagamentoStatus PENDENTE`:** No brief, "ATIVA" significa "intent vigente". Só vira "trava de imóvel" quando o webhook confirma. O job de expiração filtra por `status=ATIVA AND pagamentoStatus=APROVADO` — pendentes não expiram nem prendem o imóvel. Isso evita o status `EXPIRADA` ser confundido com "MP rejeitou".
3. **Reuso de Reserva PENDENTE:** Se o cliente clica "Reservar" 2x sem pagar, reusamos a Reserva pendente existente (não cria múltiplas órfãs). A preference é gerada nova só nesse caso.
4. **`empty string` em .env vira `undefined`:** Tratado via `.transform()` no Zod pra todos optional strings (`MERCADOPAGO_*`, `SEED_*_PASSWORD`, `WHATSAPP_NUMBER`, etc). Sem isso, `.optional()` falhava em string vazia.
5. **Soft delete = `status: INATIVO`:** DELETE não destrói row (mantém histórico de leads/reservas).
6. **Expiraçào: optimistic lock com `where: { status: 'ATIVA' }`** no `update`. Se admin moveu pra outro status no meio, ignora silenciosamente.
7. **`bcryptjs` cost 10** (brief pediu) — não bcrypt nativo (memória 30-LICOES).
8. **Sem cookie domain hardcoded:** `COOKIE_DOMAIN` só seta se preencher explicitamente no env. Em prod single-domain do brief, não precisa setar.

## Smoke test feito

- ✅ `npm install` ok (214 pacotes)
- ✅ `npx prisma generate` ok
- ✅ `npx tsc --noEmit` zero errors
- ✅ `npx tsx src/index.ts` sobe sem crash, log "Marquesa Backend rodando em :8211"
- ✅ `curl http://localhost:8211/` retorna `{"success":true,"data":{"service":"Marquesa Backend"...}}`
- ⚠️ `curl /api/imoveis` falhou só pq Postgres não tá rodando (esperado)

## ⚠️ Bloqueios pra outros agentes / atenção

- **DevOps:** precisa subir Postgres `gustavo-marquesa-db` antes do deploy. Container API mapeia `127.0.0.1:8211` (faixa Ever Growth). Dockerfile pronto, USER non-root.
- **DevOps:** em prod precisa setar `JWT_SECRET` + `JWT_REFRESH_SECRET` (32+ chars cada — boot falha com default em prod), `MERCADOPAGO_ACCESS_TOKEN` PRODUCTION + `MERCADOPAGO_WEBHOOK_SECRET`, `CORS_ORIGIN=https://marquesa.gustavo.agenciaever.cloud`, `PUBLIC_API_URL` + `PUBLIC_WEB_URL` apontando pro domínio real.
- **Copywriter:** o seed lê `projetos/marquesa/assets/catalogo.json`. Schema esperado documentado em `prisma/seed.ts` (`type CatalogoImovel`). Sem catálogo, popula 3 placeholders (Itaim/Pinheiros/Itaipava) só pra desenvolvimento.
- **Frontend:** principais shapes pra consumir:
  - Login retorna `{ user: { id, email, name, role }, accessToken }` — frontend usa `role` pra decidir redirect (`USER` → `/`, `ADMIN/ANALYST` → `/painel`)
  - `POST /api/reservas` retorna `{ reserva: {...}, sandbox: bool }` com `mpInitPoint` pra abrir checkout MP
  - Filtros do catálogo: `?tipo=&precoMin=&precoMax=&quartosMin=&bairro=&cidade=&search=&sort=&page=&limit=`
  - Paginação volta em `meta: { page, limit, total, totalPages }`
- **QA:** smoke E2E pendente (precisa DB + uma sessão real). Sugestão de fluxo: register → login (cliente) → GET imoveis → POST reservas → simular webhook MP local com `curl` payload `{type:'payment',data:{id:'xxx'}}` → confirmar imóvel `RESERVADO`.
- **Integração de email:** TODO marcado em `auth.ts` no `/forgot-password`. Em dev o reset URL vai pro log (não pra response — memória pentest 2026-04-26).

## Próximos passos sugeridos

1. DevOps sobe Postgres + roda `npm run prisma:migrate:dev --name init` pra criar tabelas
2. Copywriter entrega `catalogo.json` → roda `npm run prisma:seed`
3. Frontend pode começar a integrar (todos endpoints públicos + auth funcionam após migração)
4. QA smoke E2E + pentest sobre auth/IDOR

Typecheck: ✅ OK
Migrations: ⚠️ não executadas (sem Postgres no ambiente)
