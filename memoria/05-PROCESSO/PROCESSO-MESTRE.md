# 🛠️ Processo-mestre — criação industrial de e-commerce

> "Decida sozinho com base na memória. Pergunte ao cliente só o que é específico do nicho/marca dele.
> Mobile-first sempre. Read ≠ Write. Bug 2x = diagnóstico errado.
> Painel admin tier-1 por default. Depth pack visual por default.
> Awwwards, não Lovable."

Este é o documento que **abre todo projeto novo**. Tech-lead lê primeiro, despacha as 8 skills, valida o gate de saída antes de avançar. Sem gate aprovado, fase não fecha.

Versão 1.0 — 2026-04-29 (após Kore Tech finalizado).

## 📚 Leitura obrigatória antes de qualquer kickoff

Na ordem:

1. Este doc — visão das 8 fases + responsáveis + gates
2. [[GATES]] — critérios objetivos de saída de cada fase
3. [[../50-PADROES/MOBILE-FIRST]] — 27 pontos anti-Lovable
4. [[../50-PADROES/UX-UI-QUALIDADE]] — bar Apple/Linear
5. [[../50-PADROES/DESIGN-PROFISSIONAL]] — depth pack cinematic
6. [[../30-LICOES/ERROS-CRITICOS]] — saga Dados Inválidos + top dos críticos
7. [[../VALOR-ENTREGUE]] — case Kore Tech (R$ 38k–70k em 3 dias)

## 🎯 Princípios não-negociáveis

7 regras. Antes de qualquer linha de código, ler em voz alta.

1. **Mobile-first obrigatório.** Cada componente nasce em 375px → 768px → 1440px. NÃO desenhar desktop e adaptar mobile.
2. **Gate objetivo entre fases.** Sem ✅ em todos os itens do gate, fase não fecha. Pular gate = comentar `// DEBT: gate X.Y skipped — reason` no commit + fechar débito antes do gate 8.
3. **Write ≠ Read.** Sempre criar tipos `XxxWritePayload` separados de `XxxDetail`/`XxxResponse`. `Partial<XxxDetail>` em PATCH = bug certo (ver [[../30-LICOES/26-dados-invalidos-silencioso]]).
4. **Depth pack cinematic por default.** Aurora drift + light beam + grain + active underline + vignette. Hero quadrado raso 60vh = recusa.
5. **Zero toast genérico.** Sempre `describeApiError(err)` com lista de campos. "Dados inválidos" sem detalhe = bug do frontend.
6. **Validar visual antes de fechar fix de UI.** Bug de overflow/truncate/animação/posicionamento exige olho em devtools/preview antes do "tá pronto" (ver [[../50-PADROES/validar-visual-antes-de-fechar]]).
7. **Bug que volta 2x = diagnóstico errado.** Despachar QA agent pra reproduzir antes de mais bandagem (ver regra de ouro em [[../30-LICOES/ERROS-CRITICOS]]).

## 🎬 Tabela mestre das 8 fases

| # | Fase | Skill responsável | Output principal | Gate | Tempo |
|---|---|---|---|---|---|
| 0 | Pesquisa nicho | tech-lead | `projetos/[slug]/PESQUISA-NICHO.md` | [[GATES#Gate 0]] | 10–25 min |
| 0.5 | Proposta validada | tech-lead | 1 mensagem ao user com plano + 5 pedidos finais | [[GATES#Gate 0.5]] | 5 min |
| 1 | Setup repo | devops | Repo dedicado + estrutura `backend/`, `frontend/`, `dashboard/` | [[GATES#Gate 1]] | 10 min |
| 2 | Design system | designer | `brand-brief.md` com tokens Tier 1/2/3 + mood + voz + aprovação user | [[GATES#Gate 2]] · [[FASE-2-DESIGN]] | 30–45 min |
| 3 | Backend + DB | backend | Schema Prisma + endpoints REST + auth flow + seed + MP Pix | [[GATES#Gate 3]] · [[FASE-3-BACKEND]] | 45–60 min |
| 4 | Frontend mobile-first | frontend | Loja Next.js completa, login redirect, mobile audit ZERO crítico | [[GATES#Gate 4]] · [[FASE-4-FRONTEND]] | 60–90 min |
| 5 | Painel admin tier-1 | frontend + data-analyst | Cmd+K, Smart Insights, DataTable sortable, period comparison, smoke write em CADA CRUD | [[GATES#Gate 5]] | 30–45 min |
| 6 | Audits 3 vetores | qa | Security pentest + 27-pt mobile + bug-bash UX | [[GATES#Gate 6]] · [[FASE-6-AUDITS]] | 30 min |
| 7 | Deploy | devops | URL pública + smoke E2E em prod (cadastro→login→pedido→Pix QR) | [[GATES#Gate 7]] | 20–30 min |
| 8 | Aprendizado | tech-lead | Lições novas em `30-LICOES/` + nicho atualizado + JORNADA do projeto | [[GATES#Gate 8]] | 10 min |

**Total estimado:** ≤ 4h zero a deployed store. ≤ 15 mensagens user↔assistant.

Skills detalhadas em `.claude/skills/ecommerce-*/SKILL.md`. Cada skill conhece seu escopo, suas decisões pré-aprovadas e seu formato de relatório.

## 🤖 Coordenação multi-agent

### Quando paralelizar
- ✅ Investigação independente (3 pentesters: backend, frontend, infra)
- ✅ Fix em arquivos disjuntos (Wave 3 do Kore Tech: 3 agents em arquivos diferentes)
- ✅ Audit (QA reporta, não fixa)
- ❌ Trabalho sequencial dependente
- ❌ Tarefa < 30 min (main thread faz mais rápido)

### Padrão de brief
- File paths exatos
- Padrões a seguir (links pra `50-PADROES/`)
- Anti-padrões a evitar (links pra `30-LICOES/`)
- Snippets de exemplo
- Formato de relatório de saída

### Commits dos agents
- Cada agent commita seus arquivos via `git add <files-específicos>` (NUNCA `-A`)
- Push falha → `git pull --rebase origin main` + retry
- Item cross-file (que toca arquivos de 2 agents) → main thread faz DEPOIS

### ⚠️ Quotas e rate limits
- **Vercel free tier 100 deploys/dia** — agents em batch podem bater quota; espalhar deploys
- **Anthropic rate limits mid-task** — instruir agent a commitar incrementalmente; main thread retoma se necessário (ver [[../30-LICOES/23-sub-agents-token-limit]])

## 🗺️ Mapa cross-link

### Padrões reusáveis (`50-PADROES/`)
- [[../50-PADROES/auth-pattern-completo]] — backend + frontend + Google + redirect inteligente
- [[../50-PADROES/design-tokens-tier-template]] — Tier 1/2/3 ready-to-paste
- [[../50-PADROES/MOBILE-FIRST]] — 27 pontos anti-Lovable
- [[../50-PADROES/DESIGN-PROFISSIONAL]] — depth pack cinematic
- [[../50-PADROES/painel-admin-tier-1]] — checklist completo do painel
- [[../50-PADROES/login-redirect-pattern]] — redirect após login (mantido por compat)
- [[../50-PADROES/auth-flow]] — backend auth (mantido por compat)
- [[../50-PADROES/motion-policies]] — animações sem invasivas
- [[../50-PADROES/validar-visual-antes-de-fechar]] — olho em devtools antes do fix
- [[../50-PADROES/seed-imagens-upsert]] — seed idempotente real
- [[../50-PADROES/zustand-persist-pattern]] — flag `hydrated`
- [[../50-PADROES/header-loja-active-underline]] — `layoutId` motion
- [[../50-PADROES/command-palette-cmdk]] — Cmd+K palette

### Lições críticas (`30-LICOES/`)
- [[../30-LICOES/ERROS-CRITICOS]] — saga Dados Inválidos + regra de ouro
- [[../30-LICOES/01-jwt-secret-placeholder]] — JWT real obrigatório
- [[../30-LICOES/11-backend-relations-objeto]] — include retorna objeto
- [[../30-LICOES/14-zustand-persist-race]] — flag `hydrated`
- [[../30-LICOES/15-mercadopago-pix-pre-requisitos]] — 3 pré-requisitos MP
- [[../30-LICOES/19-repo-dedicado-por-projeto]] — repo dedicado, não monorepo
- [[../30-LICOES/20-validar-shape-backend]] — curl antes de tipar
- [[../30-LICOES/21-truncate-precisa-block]] — `<span>` ignora ellipsis
- [[../30-LICOES/26-dados-invalidos-silencioso]] — saga 3h
- [[../30-LICOES/27-scroll-behavior-smooth-mata-mouse-roda]] — sem smooth global

### Decisões pré-aprovadas (`20-DECISOES/`)
- [[../20-DECISOES/stack]] — Node 20 + Express + Prisma + Postgres + Next.js 14 + Railway + Vercel
- [[../20-DECISOES/auth-pattern]] — JWT cookie httpOnly + refresh + Google
- [[../20-DECISOES/deploy-pattern]] — Railway backend, Vercel front+painel separados
- [[../20-DECISOES/estrutura-pastas]] — root: `backend/`, `frontend/`, `dashboard/`, `infra/`
- [[../20-DECISOES/env-vars-canonicas]] — nomes canônicos, sem invento
- [[../20-DECISOES/seguranca-padrao]] — OWASP + CSP + HSTS

## 📊 Métricas de sucesso

- ≤ 4h zero a deployed store (com pesquisa de nicho front-load)
- ≤ 15 mensagens user↔assistant até deploy público
- Zero erro mobile crítico no audit (27 pontos)
- Zero toast genérico em prod
- Zero bug silencioso (delete sem confirm, mutation sem `onError`)
- Zero recorrência dos 6 anti-padrões dominantes do Kore (sidebar empilhada mobile, scroll-behavior smooth, redirect bugado, Dados Inválidos, truncate em span, hover-only)
- Awwwards-tier visual aprovado pelo user no first impression

## 🔁 Sequência de execução

```
0) Pesquisa nicho
    ↓ Gate 0
0.5) Proposta validada ao user
    ↓ Gate 0.5 (user diz "sim")
1) Setup repo + estrutura
    ↓ Gate 1
2) Design system (designer)
    ↓ Gate 2 (user aprova mockup)
3) Backend + DB (backend)  ←┐
4) Frontend mobile-first    │ paralelo após 2
5) Painel admin            ←┘
    ↓ Gate 3 + Gate 4 + Gate 5
6) Audits 3 vetores (qa)
    ↓ Gate 6
7) Deploy (devops)
    ↓ Gate 7 (URL pública responde + smoke E2E)
8) Aprendizado (tech-lead atualiza memória)
    ↓ Gate 8
PROJETO ENTREGUE
```

## 🚦 Quando parar e perguntar ao user

Apenas em momentos específicos:
- **Pós Fase 0** — proposta validada (1 mensagem)
- **Pós Fase 2** — aprovação visual ("aprovado" antes de codar UI)
- **Pós Fase 7** — entrega ("loja no ar em <url>, aprovação?")

Tudo entre é decisão autônoma com base na memória. Se memória conflita ou é ambígua, perguntar — caso contrário, decidir e seguir.

## Referências
- [[../00-INICIO]] — índice raiz
- [[../10-PLAYBOOKS/NOVO-ECOMMERCE]] — playbook v2.0 (este doc é o orquestrador)
- [[../VALOR-ENTREGUE]] — case Kore Tech
- [[../../projetos/kore-tech/JORNADA-COMPLETA]] — timeline + bugs + inovações Kore
