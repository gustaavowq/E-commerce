# 📁 Estrutura de Pastas do Projeto — REGRA DE OURO

> **Mantido pelo Tech Lead. NUNCA misture as duas camadas abaixo.**

Este projeto tem **duas camadas distintas** que vivem no mesmo repositório mas não se misturam:

| Camada | O que é | Onde mora | Quem mexe |
|---|---|---|---|
| 🤖 **Sistema de Agentes** | Configs dos agentes Claude (AGENT.md) e canal de mensagens entre eles | `agents/`, `shared/` | Tech Lead (você) configurando o time |
| 🛠️ **Produto Real** | Código que vira a loja Miami Store rodando em produção | `src/`, `docs/`, `assets/` | Os agentes durante o desenvolvimento |

**Por que separar:** se misturar, ninguém entende mais o que é orquestração e o que é produto. Daqui a 3 meses você não vai conseguir versionar o produto sem versionar junto a config dos agentes — e vice-versa.

---

## 🗂️ Mapa completo

```
ecommerce-agents/                       ← raiz do repo
│
├── CLAUDE.md                           ← entry point pro Claude Code
├── README.md                           ← como rodar em outro PC
├── .env.example                        ← variáveis de ambiente
├── .gitignore
│
├── 🤖 agents/                          ← CAMADA 1 — sistema de agentes
│   ├── 00-tech-lead/AGENT.md
│   ├── 01-backend/AGENT.md
│   ├── 02-designer/AGENT.md
│   ├── 03-frontend/AGENT.md
│   ├── 04-data-analyst/AGENT.md
│   ├── 05-devops/AGENT.md
│   └── 06-qa/AGENT.md
│
├── 🤖 shared/                          ← CAMADA 1 — comunicação entre agentes
│   └── messages/
│       ├── DE-techlead_PARA-todos_*.md
│       ├── DE-backend_PARA-frontend_*.md
│       ├── BUG-001_*.md
│       └── ...
│
├── 📚 docs/                            ← CAMADA 2 — documentação do PRODUTO
│   ├── architecture.md                 ← decisões técnicas
│   ├── agent-communication.md          ← protocolo (ponte entre as camadas)
│   ├── project-structure.md            ← este arquivo
│   ├── brand-brief.md                  ← identidade da marca Miami Store
│   ├── instagram-photo-extraction.md   ← guia de assets
│   ├── api-contracts.md                ← endpoints (Backend mantém)
│   ├── kpis.md                         ← métricas (Data Analyst mantém)
│   ├── setup.md                        ← guia DevOps de subir o ambiente
│   └── design/
│       ├── design-system.md            ← tokens, componentes, wireframes
│       └── wireframes/                 ← imagens/figmas se houver
│
├── 🎨 assets/                          ← CAMADA 2 — referências visuais
│   └── miami-instagram/                ← fotos baixadas pra inspiração
│
└── 💻 src/                             ← CAMADA 2 — código que vira produção
    │
    ├── backend/                        ← API Node.js + Express + Prisma
    │   ├── src/
    │   │   ├── index.ts                ← entrypoint
    │   │   ├── config/                 ← env, db, logger
    │   │   ├── routes/                 ← rotas Express
    │   │   ├── controllers/            ← handlers
    │   │   ├── services/               ← lógica de negócio
    │   │   ├── middleware/             ← auth, errorHandler, rate limit
    │   │   ├── validators/             ← schemas Zod
    │   │   ├── utils/                  ← helpers
    │   │   └── __tests__/              ← Jest + Supertest (QA encosta aqui)
    │   ├── prisma/
    │   │   ├── schema.prisma
    │   │   ├── migrations/             ← gerado por prisma migrate
    │   │   └── seed.ts                 ← admin inicial, marcas
    │   ├── package.json
    │   ├── tsconfig.json
    │   ├── Dockerfile.dev
    │   └── .dockerignore
    │
    ├── frontend/                       ← Next.js — LOJA do cliente
    │   ├── src/
    │   │   ├── app/                    ← App Router (Next 14)
    │   │   ├── components/
    │   │   ├── hooks/
    │   │   ├── services/               ← API client, MercadoPago SDK
    │   │   ├── stores/                 ← Zustand (cart, auth)
    │   │   └── lib/                    ← utils
    │   ├── public/
    │   ├── package.json
    │   ├── tsconfig.json
    │   ├── tailwind.config.ts
    │   ├── next.config.mjs
    │   ├── Dockerfile.dev
    │   └── .dockerignore
    │
    ├── dashboard/                      ← Next.js — PAINEL ADMIN do lojista
    │   ├── src/
    │   │   ├── app/
    │   │   │   ├── (auth)/login/
    │   │   │   └── (admin)/
    │   │   │       ├── page.tsx        ← dashboard KPIs
    │   │   │       ├── products/
    │   │   │       └── orders/
    │   │   ├── components/
    │   │   │   └── charts/             ← Recharts (Data Analyst valida)
    │   │   └── ...
    │   ├── package.json
    │   ├── tailwind.config.ts
    │   ├── Dockerfile.dev
    │   └── .dockerignore
    │
    ├── infra/                          ← DevOps — orquestração
    │   ├── docker-compose.yml          ← centro do mundo dev
    │   ├── nginx/
    │   │   └── conf.d/default.conf
    │   ├── scripts/
    │   │   └── wait-for-postgres.sh
    │   └── .gitignore
    │
    └── e2e/                            ← Playwright tests (QA mantém)
        ├── playwright.config.ts
        └── tests/
```

---

## 🚫 Anti-patterns proibidos

1. **Não criar pasta de agente dentro de `src/`.** Agente é meta-info, não código de produto.
2. **Não criar código de produto dentro de `agents/`.** Aquela pasta só tem `AGENT.md`.
3. **Não fazer cross-import entre `src/frontend` e `src/dashboard`.** São apps Next.js independentes. Se precisarem compartilhar código, criar `src/shared-ui/` (avisar o Tech Lead antes).
4. **Não rodar comandos `npm`/`pnpm`/`yarn` na raiz do repo.** Sempre dentro de `src/backend/`, `src/frontend/` ou `src/dashboard/`.
5. **Não commitar `node_modules/`, `.env`, `prisma/migrations/migration_lock.toml.local` ou builds (`.next/`, `dist/`).** O `.gitignore` cuida disso, mas não tente burlar.
6. **Não colocar fotos de produto reais em `assets/`** — essa pasta é só pra **referência** (Instagram). Fotos de produto rodam pelo Backend (storage/CDN).

---

## 🔄 Como uma feature percorre as camadas

Exemplo: "implementar tela de produto".

```
1. Designer (agent 02) lê        →  docs/brand-brief.md, docs/design/design-system.md
2. Designer entrega              →  docs/design/wireframes/produto.md (atualiza design-system se necessário)
3. Backend (agent 01) lê         →  docs/design/design-system.md (pra entender tipos), prisma/schema.prisma
4. Backend cria                  →  src/backend/src/routes/products.ts + controllers + service
5. Backend documenta             →  docs/api-contracts.md (endpoint, request, response)
6. Backend avisa                 →  shared/messages/DE-backend_PARA-frontend_produto.md
7. Frontend (agent 03) lê        →  docs/api-contracts.md + docs/design/design-system.md
8. Frontend cria                 →  src/frontend/src/app/products/[slug]/page.tsx + components
9. Frontend avisa                →  shared/messages/DE-frontend_PARA-qa_produto.md
10. QA (agent 06) testa          →  src/e2e/tests/product.spec.ts
11. QA reporta bug ou aprova     →  shared/messages/BUG-XXX.md ou DE-qa_PARA-techlead_aprovado.md
```

Note como **as camadas só se cruzam via `docs/` (contratos) e `shared/messages/` (sinalização)**. Nunca por chamada direta de função entre camadas.

---

## ✅ Checklist quando criar um novo arquivo

Antes de salvar qualquer arquivo novo, pergunte:

- [ ] Esse arquivo é **config de agente** (AGENT.md, system prompt) → `agents/{NN-nome}/`
- [ ] Esse arquivo é **mensagem entre agentes** → `shared/messages/`
- [ ] Esse arquivo é **documento sobre o produto** → `docs/` (e a subpasta correta: `design/`, etc.)
- [ ] Esse arquivo é **código que roda em produção** → `src/{backend|frontend|dashboard|infra|e2e}/`
- [ ] Esse arquivo é **referência visual/asset bruto** → `assets/`

Se não se encaixa em nenhum, pergunta no `shared/messages/` antes de criar.
