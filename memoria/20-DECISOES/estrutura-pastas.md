# Decisão: Estrutura de pastas

> ⚠️ **Atualizado 2026-04-29:** **convenção "projeto auto-contido"**. Cada e-commerce vive inteiro dentro de `projetos/[slug]/` — código, docs, `.env`, deploy. Não existe mais `src/` no root. Miami Store migrado nesta data; lições da migração registradas em `memoria/30-LICOES/`.

## Regra de ouro

```
ecommerce-agents/
├── CLAUDE.md                    ← entry point (Claude Code lê do root)
├── README.md                    ← capa do framework (GitHub mostra)
├── .gitignore                   ← git lê do root
│
├── .claude/skills/              ← 9 skills do Claude Code (1 por agente)
│   ├── ecommerce-tech-lead/SKILL.md
│   ├── ecommerce-backend/SKILL.md
│   ├── ecommerce-designer/SKILL.md
│   ├── ecommerce-frontend/SKILL.md
│   ├── ecommerce-data-analyst/SKILL.md
│   ├── ecommerce-devops/SKILL.md
│   ├── ecommerce-qa/SKILL.md
│   ├── ecommerce-copywriter/SKILL.md
│   └── ecommerce-growth/SKILL.md
│
├── memoria/                     ← knowledge base persistente (essa pasta)
│
├── outros/                      ← shared/messages, docs técnicas, scripts
│   ├── shared/messages/         ← canal de comunicação entre agentes
│   │   └── DE-{agente}_PARA-{agente}_YYYY-MM-DD-{topico}.md
│   ├── docs/                    ← contratos de API, ADRs
│   └── scripts/                 ← setup-hosts.ps1, etc
│
└── projetos/                    ← um projeto por subpasta, auto-contido
    └── miami-store/
        ├── README.md            ← visão geral, status, URLs
        ├── COMO-FUNCIONA.md     ← explicação didática
        ├── JORNADA.md           ← cronologia
        ├── DECISOES-ESPECIFICAS.md
        ├── DEPLOY.md            ← Railway + Vercel passo-a-passo
        ├── .env                 ← segredos do projeto (gitignored)
        ├── .env.example
        ├── brand-brief.md
        ├── design/              ← logo, tokens, mood
        ├── assets/              ← imagens da marca
        │
        ├── backend/             ← Express + Prisma
        │   ├── Dockerfile           ← prod multi-stage
        │   ├── Dockerfile.dev       ← dev com hot-reload
        │   ├── railway.json         ← config Railway
        │   ├── package.json         ← tsx EM dependencies (ver 30-LICOES/03)
        │   ├── prisma/
        │   │   ├── schema.prisma
        │   │   ├── seed.ts          ← idempotente (upsert por slug/email)
        │   │   └── migrations/
        │   └── src/
        │       ├── index.ts
        │       ├── config/env.ts    ← Zod schema das envs
        │       ├── lib/             ← prisma, jwt, password, coupon, mercadopago
        │       ├── middleware/auth.ts
        │       ├── routes/          ← auth, products, cart, orders, webhooks, admin/*
        │       └── validators/
        │
        ├── frontend/            ← Next.js 14 (loja)
        │   ├── Dockerfile.dev
        │   ├── next.config.mjs      ← headers CSP
        │   ├── package.json
        │   └── src/
        │       ├── app/             ← pages (App Router)
        │       ├── components/
        │       ├── stores/          ← Zustand (auth, cart, wishlist)
        │       ├── services/
        │       └── lib/
        │
        ├── dashboard/           ← Next.js 14 (painel admin)
        │   └── src/             ← mesma estrutura do frontend
        │
        └── infra/
            ├── docker-compose.yml   ← postgres + backend + frontend + dashboard + nginx
            └── nginx/conf.d/default.conf
```

## Princípios

1. **Root mínimo.** Só os 3 arquivos exigidos pelas ferramentas (`.gitignore`, `README.md`, `CLAUDE.md`) + 4 pastas (`.claude/`, `memoria/`, `outros/`, `projetos/`). Nada solto.
2. **Projeto auto-contido.** Tudo do projeto vive dentro da pasta dele — incluindo `.env`, `DEPLOY.md`, brand-brief. Quem clica em `projetos/miami-store/` vê o projeto inteiro.
3. **Framework reusável fora do projeto.** Skills (`.claude/skills/`), memória (`memoria/`) e canais (`outros/shared/messages/`) servem qualquer projeto.
4. **Docker-compose por projeto.** Cada `projetos/[slug]/infra/docker-compose.yml` é independente — nunca compartilhar containers entre projetos.

## Como criar projeto novo

```bash
mkdir -p projetos/[slug]/{backend,frontend,dashboard,infra}
# copia template do projeto-referência (Miami por enquanto)
cp -r projetos/miami-store/{backend,frontend,dashboard,infra} projetos/[slug]/
# ajusta nome em package.json, schema.prisma, brand, etc
```

## Padrão de nome de arquivo

- `kebab-case.ts` pra utilities
- `PascalCase.tsx` pra componentes React
- `camelCase` em variáveis e funções
- `SCREAMING_SNAKE` em env vars e constantes

## ⚠️ Arquivos sensíveis no .gitignore

```
.env
.env.local
!.env.example
.next/
*.tsbuildinfo
.claude/
node_modules/
projetos/*/backend/prisma/dev.db
```

Ver [[../30-LICOES/08-prisma-tsbuildinfo-gitignore]] sobre o `*.tsbuildinfo` (não `.tsbuildinfo`).

## Histórico

- **2026-04-26** — convenção pasta-mãe categoria/cliente em `src/[categoria]/[cliente]/` (descontinuada).
- **2026-04-29** — convenção projeto auto-contido em `projetos/[slug]/` (atual). Miami migrado, `src/` raiz removido.
