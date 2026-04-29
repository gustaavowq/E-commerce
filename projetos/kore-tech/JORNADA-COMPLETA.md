# 🛤️ Kore Tech — jornada completa

> Timeline + bugs + inovações + métricas + aprendizado por agente.
> Primeiro projeto que validou o framework multi-agente. Lições 11–27.

Versão 1.0 — 2026-04-29 (projeto finalizado).

## Resumo executivo

- **Nicho:** hardware / PC gamer (montagem + componentes)
- **Diferenciais entregues:** PC Builder com FPS estimado, Personas Profile (gamer/criador/executivo), Cmd+K palette, depth pack cinematic, painel admin tier-1
- **Tempo total:** 3 dias (2026-04-26 → 2026-04-29)
- **Commits painel apenas:** 17 (Wave 1 + Wave 2 + Wave 3)
- **Mensagens user↔assistant:** ~30 (próximo deve fazer em ≤ 15 com `[[../../memoria/05-PROCESSO/PROCESSO-MESTRE]]`)
- **Valor entregue:** R$ 38k–70k (ver [[../../memoria/VALOR-ENTREGUE]])
- **Status:** loja + painel ambos live em prod

## Timeline

### 2026-04-26 — Kickoff
- Tech-lead recebe "vamos criar e-commerce de hardware"
- Pesquisa nicho (10 min) — 3 BR (Pichau, Kabum, Terabyte) + 3 EUA (Newegg, Micro Center, MSI) + 3 Europa
- Proposta validada ao user → "sim, vamos"
- Repo dedicado criado: `gustaavowq/Kore-tech`
- Estrutura `backend/`, `frontend/`, `dashboard/`, `infra/` no root

### 2026-04-27 — Backend + Design
- Designer: brand-brief com paleta cool tech + accent neon + Geist font + depth pack cinematic
- Backend: schema Prisma com `HardwareCategory`, `Persona`, `Build`, `BuildItem` extras pro nicho
- Auth flow rodando + seed completo com 15 produtos (CPU, GPU, MB, RAM, SSD, Case, PSU, Cooler) + Cloudinary fotos reais
- MercadoPago Pix testado em sandbox (3 pré-requisitos OK depois de descobrir lição 15)

### 2026-04-28 — Frontend + Painel + Audit + Saga
- Frontend: PC Builder funcional (escolhe componentes, estima FPS por jogo), Personas Profile, login redirect inteligente (eventualmente — depois de bug)
- Painel admin tier-1: Wave 1 (Cmd+K, KpiCards, DataTable), Wave 2 (Smart Insights, period comparison), Wave 3 (HourlyHeatmap, Cohort, FilterChips stackable)
- Mobile audit revelou 27 bugs (lição 27 nasceu daqui)
- **Saga Dados Inválidos** (3h debug) — 4 fixes errados antes de despachar QA pra reproduzir e descobrir 3 falhas em cadeia

### 2026-04-29 — Finalizado
- Lições novas catalogadas: 26 (Dados Inválidos), 27 (scroll-behavior smooth)
- 50-PADROES enriquecido: MOBILE-FIRST, painel-admin-tier-1, validar-visual-antes-de-fechar
- Loja-kore-tech.vercel.app + painel-kore-tech.vercel.app ambos live
- VALOR-ENTREGUE.md atualizado

## Inovações entregues (viraram padrão pro próximo)

1. **PC Builder com FPS estimado** — escolher componentes, calcular FPS médio por jogo (usa lookup table). Pode virar `produto-builder` genérico pra qualquer nicho com configurador (joias, móveis sob medida).
2. **Personas Profile** — quiz de 3 perguntas → recomendação de build (gamer hardcore, criador, executivo). Pode virar `personas-quiz` reusable.
3. **Cmd+K palette no painel** — Linear-style command palette. Padrão ativo em [[../../memoria/50-PADROES/command-palette-cmdk]].
4. **Depth pack cinematic v1** — aurora drift + light beam + grain + active underline. Padrão em [[../../memoria/50-PADROES/DESIGN-PROFISSIONAL]].
5. **Painel tier-1 estabelecido** — pacote mínimo de Sidebar + Cmd+K + KpiCards + Smart Insights + DataTable + Period comparison + HourlyHeatmap + Cohort + FilterChips. Default em [[../../memoria/50-PADROES/painel-admin-tier-1]].
6. **27-pt mobile audit** — checklist anti-Lovable em [[../../memoria/50-PADROES/MOBILE-FIRST]]. Obrigatório no gate 4 do framework.
7. **Defesa em profundidade Dados Inválidos** — 3 camadas (frontend rename + `_form` no backend + `describeApiError` no frontend). Documentado em [[../../memoria/30-LICOES/ERROS-CRITICOS]].

## Bugs principais (com link pra lição)

| # | Lição | Impacto | Como descobriu |
|---|---|---|---|
| 11 | [[../../memoria/30-LICOES/11-backend-relations-objeto]] | "Não foi possível carregar essa página" em qualquer card | JSX `{product.category}` crashou ao receber objeto |
| 14 | [[../../memoria/30-LICOES/14-zustand-persist-race]] | Redirect bugado pro login mesmo logado | Hard refresh em página protegida → state não hidratado → router.replace pro login |
| 15 | [[../../memoria/30-LICOES/15-mercadopago-pix-pre-requisitos]] | Pix QR não gerava | 3 erros empilhados: env name `MP_TOKEN`, token TEST, sem chave Pix |
| 19 | [[../../memoria/30-LICOES/19-repo-dedicado-por-projeto]] | Vercel/Railway não auto-deployavam de subpath | Tentou monorepo, virou repo dedicado |
| 20 | [[../../memoria/30-LICOES/20-validar-shape-backend]] | Type errado no frontend, runtime crash | Inferiu shape sem curl |
| 21 | [[../../memoria/30-LICOES/21-truncate-precisa-block]] | Nome de produto longo vazava card | `<span class="truncate">` ignora silenciosamente |
| 23 | [[../../memoria/30-LICOES/23-sub-agents-token-limit]] | Sub-agent bateu rate limit mid-task | Wave 3 — instruir commit incremental |
| 26 | [[../../memoria/30-LICOES/26-dados-invalidos-silencioso]] | "Dados inválidos" sem detalhe — 3h debug | 4 fixes errados, QA reproduziu Zod local pra achar `unrecognized_keys` em `formErrors` |
| 27 | [[../../memoria/30-LICOES/27-scroll-behavior-smooth-mata-mouse-roda]] | Scroll travado em mouse de roda comum | `scroll-behavior: smooth` em html/body interpolava cada tic |

## Aprendizado por agente

Cada skill levou pra próxima iteração:

- **tech-lead:** front-load de pesquisa de nicho corta 30 min de perguntas. Despachar QA pra reproduzir bugs ANTES de mais bandagem (regra de ouro saga 26).
- **designer:** depth pack cinematic é o novo bar Apple/Linear. Hero quadrado raso = recusa.
- **backend:** `.strict()` Zod + `_form` no error-handler = obrigatório. Seed precisa ser idempotente real (upsert + delete-recreate em relations).
- **frontend:** mobile-first é não-negociável. Bottom-sheet em vez de sidebar empilhada. Tipos Write ≠ Read. `describeApiError` em toda mutation. Sem `scroll-behavior: smooth` global.
- **data-analyst:** painel tier-1 com Smart Insights + period comparison + HourlyHeatmap + Cohort virou padrão. Polish puro não impressiona — precisa funcionalidade.
- **devops:** repo dedicado por projeto trivial deploy. Vercel quota 100/dia precisa monitor.
- **qa:** QA REPORTA, NÃO FIXA. 27-pt mobile audit é obrigatório. Smoke write em CADA CRUD admin (clicar salvar, ver toast verde, recarregar, confirmar persistência).
- **copywriter:** glossário do nicho (FPS, latência, GPU, ray tracing) acelerou decisão. Tom comemorativo nas vitórias do user.
- **growth:** SEO técnico (sitemap + robots + JSON-LD + OG) + GA4 + Pixel ativos desde dia 1.

## Métricas

- **Tempo total:** 3 dias (Miami foi 5 dias com refactor; Kore foi mais features em menos tempo)
- **Mensagens user↔assistant:** ~30 (Miami: ~50)
- **Commits totais:** 60+ (loja+painel+backend)
- **Bugs em prod descobertos pelo cliente:** 0 (todos pegos no audit)
- **Bugs em audit que viraram lição:** 17 (lições 11-27)
- **Padrões novos em `50-PADROES/`:** 8
- **Pacote painel:** Wave 1 (3 features) + Wave 2 (5 features) + Wave 3 (4 features) = 12 features tier-1

## Status de produção

- **Loja:** `https://loja-kore-tech.vercel.app` ✅
- **Painel:** `https://painel-kore-tech.vercel.app` ✅
- **Backend:** Railway ✅
- **DB:** Railway PostgreSQL ✅
- **MP Pix:** sandbox ✅ (production aguarda chave Pix do cliente)
- **GA4 + Pixel:** instalados ✅
- **CSP + HSTS:** ativos ✅

## Próximo passo (se Kore voltar)

- Responsividade mobile fodástica (próxima iteração planejada)
- MP Pix em produção real (depende cliente cadastrar chave Pix)
- Coupons sazonais (BLACKHARDWARE, FRETE10TECH)
- A/B test no PC Builder vs PDP direto (qual converte mais?)

## Cross-links
- [[../../memoria/00-INICIO]] — índice raiz
- [[../../memoria/05-PROCESSO/PROCESSO-MESTRE]] — orquestrador (NOVO pós-Kore)
- [[../../memoria/VALOR-ENTREGUE]] — análise de valor framework
- [[../../memoria/30-LICOES/ERROS-CRITICOS]] — saga Dados Inválidos completa
- [[PESQUISA-NICHO]] — pesquisa de nicho do projeto
- [[BRAND-BRIEF]] — brand-brief Kore
