# 🛒 E-Commerce Multi-Agent System

> Time de 9 agentes Senior orquestrados pra criar e-commerce completo (loja + painel admin + API + deploy) em **≤ 4 horas** pra qualquer nicho.

## 🧠 Memória operacional

**LEIA PRIMEIRO** quando começar projeto novo:

📍 **`memoria/00-INICIO.md`** — índice de toda memória operacional
   - Decisões pré-aprovadas (stack, auth, deploy)
   - Lições críticas dos projetos anteriores (NÃO repetir)
   - Playbooks (kickoff, deploy, security, bugbash)
   - Padrões de código reusáveis
   - Templates por nicho (moda, eletrônicos, alimentação, beleza, ...)

A memória existe pra **reduzir perguntas redundantes ao cliente**. Tudo que está lá já está decidido — mude só com pedido explícito.

## 🚀 Quando o cliente diz "vamos criar e-commerce de [nicho]"

**Invoque a skill `ecommerce-tech-lead`** (auto-detectada por contexto). Ela executa `memoria/10-PLAYBOOKS/kickoff-novo-ecommerce.md`.

Resumo da sequência:
1. **Pesquisa o nicho autonomamente** (Fase 0 — WebSearch + WebFetch, 10-25min) e escreve em `projetos/[slug]/PESQUISA-NICHO.md`
2. **Apresenta proposta validada** ao cliente (Fase 0.5 — não interrogatório)
3. Cliente confirma + fornece nome/logo/cores/contas
4. Cria estrutura em `projetos/[slug]/` (docs + código), posta brief em `projetos/[slug]/messages/`
5. Dispara as 8 outras skills em paralelo (`ecommerce-backend`, `ecommerce-designer`, etc)
6. Roda security audit + bug bash
7. Deploy via `memoria/60-DEPLOY/railway-passo-a-passo.md` + `vercel-passo-a-passo.md`
8. **Acumula aprendizado:** atualiza `memoria/70-NICHOS/[nicho].md`

**Métrica de sucesso**: ≤ 15 mensagens cliente↔assistente até deploy público.

## Equipe (9 skills do Claude Code)

Cada agente é uma **skill auto-invocável** em `.claude/skills/ecommerce-*/SKILL.md`. Detectada automaticamente por contexto (descrição em frontmatter) ou invocada explicitamente: `/ecommerce-backend`, `/ecommerce-designer`, etc.

| # | Skill | Quando invoca |
|---|---|---|
| 00 | [`ecommerce-tech-lead`](.claude/skills/ecommerce-tech-lead/SKILL.md) | "vamos criar e-commerce", pesquisa de nicho, coordenação multi-agente |
| 01 | [`ecommerce-backend`](.claude/skills/ecommerce-backend/SKILL.md) | Schema Prisma, endpoints, auth, MercadoPago, seed |
| 02 | [`ecommerce-designer`](.claude/skills/ecommerce-designer/SKILL.md) | Paleta, brand-brief, mood, tipografia |
| 03 | [`ecommerce-frontend`](.claude/skills/ecommerce-frontend/SKILL.md) | Componentes Next.js loja/painel |
| 04 | [`ecommerce-data-analyst`](.claude/skills/ecommerce-data-analyst/SKILL.md) | KPIs, dashboard endpoints, alertas |
| 05 | [`ecommerce-devops`](.claude/skills/ecommerce-devops/SKILL.md) | Docker, Nginx, deploy Railway+Vercel |
| 06 | [`ecommerce-qa`](.claude/skills/ecommerce-qa/SKILL.md) | Smoke E2E, pentest, bug bash, aprovação deploy |
| 07 | [`ecommerce-copywriter`](.claude/skills/ecommerce-copywriter/SKILL.md) | Descrições, copy UI, emails, microcopy |
| 08 | [`ecommerce-growth`](.claude/skills/ecommerce-growth/SKILL.md) | SEO, GA4/Pixel, cupons, newsletter |

Cada SKILL.md lista:
- Identidade + escopo (frontmatter description = trigger)
- Decisões pré-aprovadas (não pergunta)
- Top rules + anti-padrões
- Checklist de cada bloco de trabalho
- Ferramentas (WebSearch, Bash, etc)
- Formato de relatório pra outros agentes

## Estrutura

**Regra de ouro:** root tem só 3 arquivos (`.gitignore`, `README.md`, `CLAUDE.md` — exigidos pelas ferramentas) + 3 pastas. **Tudo de cada projeto vive dentro de `projetos/[slug]/`** — código, docs, `.env`, `DEPLOY.md`, brand-brief, jornada, mensagens entre agentes. Não existe `src/` ou `outros/` no root.

```
ecommerce-agents/
├── CLAUDE.md                     ← este arquivo (Claude Code lê do root)
├── README.md                     ← capa do framework (GitHub mostra do root)
├── .gitignore                    ← regras git (lê do root)
│
├── .claude/skills/               ← 9 skills (ecommerce-*) — fonte única dos agentes
├── memoria/                      ← knowledge base reusável (decisões, lições, padrões)
└── projetos/
    └── miami-store/              ← cada projeto = uma pasta auto-contida
        ├── README.md             ← visão geral do projeto
        ├── COMO-FUNCIONA.md      ← explicação didática
        ├── JORNADA.md            ← cronologia
        ├── DECISOES-ESPECIFICAS.md
        ├── DEPLOY.md             ← passo-a-passo Railway + Vercel
        ├── .env                  ← segredos (não commitado)
        ├── .env.example          ← template
        ├── brand-brief.md
        ├── api-contracts.md      ← contratos de API
        ├── design/               ← logo, tokens
        ├── assets/
        ├── messages/             ← canal entre agentes (DE-X_PARA-Y_*.md)
        ├── scripts/              ← setup-hosts.ps1 etc
        ├── backend/              ← Express + Prisma + JWT
        ├── frontend/             ← Next.js 14 (loja)
        ├── dashboard/            ← Next.js 14 (painel admin)
        └── infra/                ← docker-compose + nginx
```

Detalhes em `memoria/20-DECISOES/estrutura-pastas.md`.

## Stack canônica (não muda sem pedido explícito)

- **Backend:** Node 20 + Express + TypeScript + Prisma 5 + PostgreSQL 16
- **Frontend (loja + painel):** Next.js 14 (App Router) + Tailwind + Zustand + TanStack Query
- **Infra dev:** Docker Compose + Nginx (subdomain routing) + Cloudflare Quick Tunnel (demo)
- **Deploy prod:** Railway (backend + Postgres) + Vercel (loja + painel)
- **Imagens:** Cloudinary
- **Pagamento:** MercadoPago (Pix focus)
- **Email:** Resend (futuro)

Detalhes em `memoria/20-DECISOES/stack.md`.

## Comunicação entre agentes

Mensagens em `projetos/[slug]/messages/` no formato:

```
DE-{agente}_PARA-{agente}_YYYY-MM-DD-{topico}.md
```

Cada agente termina bloco de trabalho com **uma** mensagem (não a cada arquivo). Tech Lead consolida, Tech Lead aprova fase, segue.

## Princípio fundamental

> "Decida sozinho com base na memória. Pergunte ao cliente **só** o que é específico do nicho/marca dele."

O Miami Store demorou ~50 mensagens. Próximo deve fazer em ≤ 15 (com pesquisa de nicho front-load).

## Quando atualizar a memória

Toda vez que aprender algo novo (bug que não estava capturado, padrão que funcionou bem, decisão que valeu a pena). Adicionar em:

- Bug novo descoberto → `memoria/30-LICOES/`
- Padrão novo testado → `memoria/50-PADROES/`
- Nicho novo abordado → `memoria/70-NICHOS/`

A memória é viva. Quanto mais rica, mais rápido o próximo projeto.
