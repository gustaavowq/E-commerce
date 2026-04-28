# 🚀 NOVO E-COMMERCE — playbook atualizado

> "Todo projeto novo nasce com mobile-first, audit obrigatório, zero toast genérico,
> zero design Lovable. Awwwards-tier ou nada."

Versão 2.0 do playbook após Kore Tech (2026-04-28). Substitui [kickoff-novo-ecommerce.md](./kickoff-novo-ecommerce.md) como **fonte primária**.

## ⚠️ REGRAS NÃO-NEGOCIÁVEIS

Antes de começar QUALQUER projeto, ler em voz alta:

1. **Mobile first obrigatório** desde o primeiro componente. NÃO desenvolver desktop e adaptar mobile depois.
2. **QA agent roda audit de 27 pontos** antes de qualquer deploy de feature de UI.
3. **Sempre separar tipos `Write` de tipos `Read`** em CRUD. `Partial<XxxDetail>` em PATCH = bug certo.
4. **Bug que volta 2x = diagnóstico errado.** Despachar QA pra reproduzir antes de mais bandagem.
5. **Depth pack cinematográfico como padrão visual** (aurora + light beam + vignette + grain + active underline). Hero quadrado raso = recusa.
6. **Zero toast genérico.** Sempre `describeApiError(err)` com lista de campos. "Dados inválidos" sem detalhe = bug do frontend.
7. **Não iniciar dev sem aprovação do Creative Director** (UI/UX + Motion aprovados via brand-brief). Skill `ecommerce-designer` define brand-brief antes de qualquer código.

## 🎬 Fluxo canônico

### Fase 0 — Pesquisa de nicho (autonoma, 10-25min)
- WebSearch + WebFetch: top 5 BR + top 3 EUA + top 3 Europa concorrentes
- Output em `projetos/[slug]/PESQUISA-NICHO.md` seguindo [pesquisa-nicho-template.md](../50-PADROES/pesquisa-nicho-template.md)
- Inclui: ticket médio, variações típicas, jargão, mood visual, canal aquisição, regulatórios, KPIs, integrações comuns

### Fase 0.5 — Proposta validada ao cliente (1 mensagem)
Não interrogatório — **apresentar entendimento** e pedir confirmação. Plano + cupons + KPIs + integrações + 5 pedidos finais (nome/logo/cores/contas/domínio).

### Fase 1 — Setup
- Repo dedicado por projeto (`gustaavowq/X-tech` ou similar) — NÃO monorepo subpath
- Estrutura canônica em `memoria/20-DECISOES/estrutura-pastas.md`
- Stack canônica em `memoria/20-DECISOES/stack.md` (Next.js 14 + Express + PostgreSQL + Prisma + Railway + Vercel)

### Fase 2 — Design system primeiro
- Skill `ecommerce-designer` cria `brand-brief.md` com:
  - Paleta (tokens Tailwind)
  - Tipografia
  - Mood visual (com referências reais de Unsplash/Pexels)
  - **Depth pack cinematográfico** (ver [DESIGN-PROFISSIONAL.md](../50-PADROES/DESIGN-PROFISSIONAL.md))
  - Motion policies (spring snappy/gentle, ease-kore)
- Aprovação do user antes de codar UI

### Fase 3 — Backend + DB primeiro
- Schema Prisma completo (validar shape com `validar-shape-backend.md`)
- Endpoints REST `/api/*` com Zod validators
- **CRÍTICO**: error-handler.ts envia `formErrors` em `details._form` (defesa em profundidade)
- Auth flow completo (JWT + refresh + login Google)
- Seed inicial com dados realistas + seed-fake.ts pra demo

### Fase 4 — Frontend mobile-first
- Cada componente nasce respondendo 375px → 768px → 1440px
- **NUNCA** começa lg:grid-cols-[Npx_1fr] sem ter o mobile fallback (bottom-sheet, sticky bar, drawer)
- Tipos `XxxWritePayload` separados de `XxxDetail`
- Form: `useForm + zodResolver` com schema dinâmico (criação rígida, edição flexível)
- Mutations: `onError: (err) => toast.push({ tone: 'error', ...describeApiError(err) })` SEMPRE

### Fase 5 — Painel admin tier-1
- Pacote mínimo (ver [painel-admin-tier-1.md](../50-PADROES/painel-admin-tier-1.md)):
  - Sidebar Linear-style + nav agrupado + layoutId active
  - DateRangePicker 5 presets + shortcuts
  - KpiCards com sparkline + AnimatedNumber + period comparison
  - SmartInsights (4 cards auto-gerados)
  - RevenueChart period overlay
  - DataTable v2 sortable + onRowClick (slide-over)
  - Command palette Cmd+K
  - Skeleton shimmer
  - Page transitions
  - HourlyHeatmap 7×24
  - CohortRetentionChart D30/60/90
  - SlideOver Stripe-style 480px com sync `?selected=ID`
  - FilterChips stackable em todas listas
  - Sonner toast
  - EmptyState com tone variants + admin-copy library
- **MobileFiltersSheet** reusable pra filtros mobile

### Fase 6 — Audit obrigatório (3 vetores)

#### Audit 1: Security
- `memoria/10-PLAYBOOKS/security-audit.md`
- Pentest: auth/IDOR/XSS/CSRF/injection
- JWT_SECRET real, CORS_ORIGIN real, env vars não placeholders

#### Audit 2: Mobile (NOVO — obrigatório)
- QA agent roda audit estático de **27 pontos** em viewport 375px
- Reporta bugs por severidade (crítico/alto/médio/baixo)
- Top 5 críticos atacados antes de deploy
- Validação visual em mobile real OU DevTools "Toggle device toolbar"
- Ver [MOBILE-FIRST.md](../50-PADROES/MOBILE-FIRST.md)

#### Audit 3: Bug bash UX
- `memoria/10-PLAYBOOKS/bug-bash-ux.md` ATUALIZADO:
  - HTML validity, dead buttons, edge cases
  - **Smoke test write**: clicar salvar 1 vez em CADA CRUD admin, ver toast verde
  - Forms multi-tab: testar com erro em tab não-aberta (deve pular pra tab certa)
  - Delete sem ConfirmDialog = bug
  - Mutation sem `onError` = bug
  - Toast genérico "Dados inválidos" = bug

### Fase 7 — Deploy
- `memoria/60-DEPLOY/railway-passo-a-passo.md` + `vercel-passo-a-passo.md`
- ⚠️ **Vercel free tier: 100 deploys/dia** — não rodar agents em batch sem checar quota

### Fase 8 — Acumulação de aprendizado (~10min, mandatory)
- Atualizar `memoria/70-NICHOS/[nicho].md` com aprendizados específicos
- Adicionar novas lições em `memoria/30-LICOES/` se houver
- Atualizar `projetos/[slug]/JORNADA.md`
- **Sem isso, a máquina não aprende.**

## 🤖 Coordenação de agents

### Quando paralelizar
- ✅ Investigação independente (3 pentesters: backend, frontend, infra)
- ✅ Fix em arquivos disjuntos (Wave 3 do Kore Tech: 3 agents em arquivos diferentes)
- ✅ Audit (QA não fixa, só reporta)
- ❌ Sequential dependent work
- ❌ Small task (< 30 min) — main thread faz mais rápido

### Padrão de coordenação multi-agent
- Brief detalhado: file paths, padrões, exemplos de código, anti-padrões
- Cada agent commita seus arquivos via `git add <files-específicos>` (NUNCA `-A`)
- Push falha → `git pull --rebase origin main` + retry
- Item cross-file (que toca arquivos de 2 agents) → main thread faz DEPOIS

### ⚠️ Vercel quota + Anthropic rate limits
- Vercel free tier 100 deploys/dia: agents em batch podem bater quota — espalhar deploys
- Agents podem bater rate limit Anthropic mid-task: instruir a commitar incrementalmente, main thread retoma se necessário (ver [23-sub-agents-token-limit.md](../30-LICOES/23-sub-agents-token-limit.md))

## 📊 Métrica de sucesso

- **≤ 4h** zero a deployed store (com pesquisa de nicho front-load)
- **≤ 15 mensagens** user↔assistant até deploy público
- **Zero erros mobile** críticos no audit
- **Zero toast genérico** em prod
- **Zero bug silencioso** (delete sem confirm, mutation sem onError)
- **Awwwards-tier visual** — aprovado pelo user no first impression

## 🎯 Princípio fundamental

> "Decida sozinho com base na memória. Pergunte ao cliente **só** o que é específico do nicho/marca dele.
> Mobile-first sempre. Read ≠ Write. Bug 2x = diagnóstico errado.
> Painel admin tier-1 por default. Depth pack visual por default.
> Awwwards, não Lovable."

## Referências
- [00-INICIO.md](../00-INICIO.md) — índice raiz da memória
- [MOBILE-FIRST.md](../50-PADROES/MOBILE-FIRST.md) — regras anti-Lovable
- [UX-UI-QUALIDADE.md](../50-PADROES/UX-UI-QUALIDADE.md) — padrão de qualidade
- [DESIGN-PROFISSIONAL.md](../50-PADROES/DESIGN-PROFISSIONAL.md) — depth pack
- [ERROS-CRITICOS.md](../30-LICOES/ERROS-CRITICOS.md) — top dos críticos
- [VALOR-ENTREGUE.md](../VALOR-ENTREGUE.md) — case Kore Tech
