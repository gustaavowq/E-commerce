# 📜 HISTÓRICO — Kore Tech (2026-04-26 → 2026-04-29)

> **Status**: ⛔ PROJETO COMPLETAMENTE APAGADO em 2026-04-29 a pedido de Gustavo.
> **Por quê esse doc existe**: a `JORNADA-COMPLETA.md` que vivia em
> `projetos/kore-tech/` foi deletada junto com o resto. Esse arquivo aqui
> reconstitui o **processo cronológico** pra próxima sessão entender o que rolou,
> sem confundir com o estado atual (que é: nada existe mais).
>
> **Aprendizado preservado**: lições 11-27 em [[30-LICOES]], padrões em
> [[50-PADROES]], processo em [[05-PROCESSO]]. Esse doc aqui só amarra a
> linha do tempo. Pra ver o **valor técnico entregue**, ler [[VALOR-ENTREGUE]].

---

## 1. Visão de uma frase

Loja gamer + painel admin + backend, 9 agents IA orquestrados pelo Tech Lead, 4 dias úteis (26-29/04/2026), >40 commits, 3 superfícies em prod, 1 saga de bug crítico, 1 redesign painel-tier-1, 1 mobile audit (não executado), 1 morte súbita.

## 2. Status final dos artefatos (snapshot 2026-04-29)

| Artefato | Estado | Quando |
|---|---|---|
| Repo `gustaavowq/E-commerce-tech` (GitHub) | ✅ removido (via `gh` CLI após install + auth device flow) | 2026-04-29 |
| Vercel `kore-tech-loja` | removido | 2026-04-29 |
| Vercel `kore-tech-painel` | removido | 2026-04-29 |
| Railway `surprising-luck` (backend + Postgres) | soft-delete, hard em 2026-05-01 | 2026-04-29 |
| Local `C:\...\Temp\kore-migration\E-commerce-tech\` | removido | 2026-04-29 |
| `projetos/kore-tech/` (10 docs do projeto) | removido | 2026-04-29 |
| 14 mensagens `outros/shared/messages/DE-*-kore-tech.md` | removidas | 2026-04-29 |
| `outros/scripts/setup-kore-tech.ps1` | removido | 2026-04-29 |
| Memória `memoria/` (38 arquivos) | **INTACTA** ✅ | — |

## 3. Linha do tempo do processo

### 3.1 — Dia 1 (2026-04-26): kickoff + Sprint 1

- Init repo `gustaavowq/E-commerce-tech` (commit `5b601af`).
- Tech Lead despachou 8 skills em paralelo (designer, backend, frontend, data-analyst, devops, qa, copywriter, growth).
- Brief do Kore Tech: nicho **gamer / PCs montados**, persona-driven (Valorant 240fps, Fortnite, CS2, etc), foco em compatibility-check automático (socket, fonte, gabinete).
- Sprint 1 fechado fim do dia: schema Prisma, endpoints CRUD, brand-brief (paleta dark + neon), seed de 30+ componentes + 8 personas.
- Commit chave: `269354e` "framework de agentes como Claude Code skills + reorg + kickoff completo".

### 3.2 — Dia 2 (2026-04-27): Sprint 2 + bugs de boot + redesign hero

- 7 fixes de gaps de backend (`a32897b`).
- Frontend Sprint 2 (`63ab486`).
- 3 bugs bloqueadores QA fechados (`73b880a`).
- Bug **CSS Tailwind preset** no Vercel build (`9db5c47`, `cded997`) — preset.ts inline porque eslint quebrou a build, `tailwind preset inline + infra + project files`.
- Build marker no seed pra invalidar cache de layer Docker (`73ecbdf`).
- Auto-deploy Vercel + rootDirectory fixado (`3227d2d`).
- **Decisão arquitetural crítica**: Kore Tech sai do monorepo `ecommerce-agents/` e vira repo dedicado (`gustaavowq/E-commerce-tech`). Commit `1438925`. Lição salva: [[30-LICOES/19-repo-dedicado-por-projeto]].
- Redesign hero cinematográfico com scroll reveals (`6624748`), depois evoluído pro depth pack 5-camadas em [[50-PADROES/depth-pack-cinematic]].
- Seed upsert real pra refletir trocas em re-runs (`81c2bbd`). Lição: [[50-PADROES/seed-imagens-upsert]].

### 3.3 — Dia 3 (2026-04-28): redesign painel + saga "Dados Inválidos" + Wave 2/3

#### 3.3.1 — Wave 2 painel (Sonner + tracking + EmptyState + 5 KPIs avançados)

5 endpoints novos (cohort, RPV, repeat customer, hourly heatmap, cancel rate) com cache de 60s. Aprendizados em [[30-LICOES/24-redesign-visual-sozinho-nao-impressiona]].

#### 3.3.2 — Saga "Dados Inválidos" — bug crítico de 3 camadas

Edição de produto no painel quebrou silenciosamente. **3 falhas em cadeia**:
1. Frontend mandando shape errado (usando `Partial<Detail>` em vez de `WritePayload`).
2. Backend Zod com `.strict()` rejeitando campos extras sem sinalizar quais.
3. Middleware error-handler descartando `formErrors` antes de chegar na response.

**Custou ~3h de fixes errados** antes de Gustavo explodir ("MANO NÃO RESOLVE, CHAME TODOS OS AGENTS"). Saiu daí o feedback **"despachar QA pra reproduzir antes de empilhar fixes em main thread"**.

Lições derivadas:
- [[30-LICOES/26-dados-invalidos-silencioso|26 — Dados Inválidos silencioso]]
- `feedback_diagnosticar_antes_de_fixar.md` (auto-memory)
- `feedback_tipos_write_read_separados.md` (auto-memory)

Resolvido em commit `5b78ca3` (no repo `E-commerce-tech`, hoje deletado). Defesa em profundidade implementada: error-handler envia `formErrors` em `details._form`, schemas Zod auditados, frontend separa `WritePayload` de `Detail`.

#### 3.3.3 — Wave 3 painel (4 componentes Stripe-tier)

- HourlyHeatmap 7×24 com insight automático.
- CohortRetentionChart D30/60/90.
- OrderDetailSlideOver Stripe-style 480px com sync URL.
- FilterChips reusable em /products /orders /customers.

Padrão consolidado em [[50-PADROES/painel-admin-tier-1]].

#### 3.3.4 — Loja: fixes finais cinematográficos

- Header underline animada via `layoutId="header-nav-active"` (commit `c8878d6`).
- Depth pack: aurora orbs + light beam + vignette + grain global (`fad575b`).
- Search bar `max-w-3xl + text-lg/xl + ícone lupa h-6` (`cccc8d5`).

Padrões salvos:
- [[50-PADROES/depth-pack-cinematic]]
- [[50-PADROES/header-loja-active-underline]]

#### 3.3.5 — Lição amarga: scroll-behavior smooth

Em CSS global tinha `html { scroll-behavior: smooth }`. Em mouse de roda comum (não touchpad), interpolação JS por tic detonava UX. Commit `0ef475f` removeu. Lição: [[30-LICOES/27-scroll-behavior-smooth-mata-mouse-roda]].

#### 3.3.6 — Seed fake pra demo realista

Commit `9809757` (no repo deletado): 35 fake users, 150 pedidos com viés ter/qua 18-22h pra heatmap fazer sentido, 30 reviews em produtos comprados, 12 waitlist. Idempotente. Padrão: [[50-PADROES/seed-imagens-upsert]].

### 3.4 — Dia 4 (2026-04-29): consolidação framework + DELETE

- 5 commits de docs do framework (blocos 1-5): orquestrador 05-PROCESSO + GATES + FASE-2/3/4/6 + DASHBOARD-TEMPLATE + auth-pattern + design-tokens-tier (Brad Frost) + JORNADA-COMPLETA.
- O Kore Tech serviu como **fonte primária** dessa consolidação — quase tudo no `05-PROCESSO/` e `50-PADROES/` saiu de coisa testada nele.
- Próximo passo declarado por Gustavo na noite anterior: **"atualização mobile fodástica"**. **Não chegou a ser executado.**
- Pedido de delete: *"pode apagar o projeto kore tech COMPLETO apague tudo arquivos readme vercell github railway"*.
- Confirmação: *"sem perder o aprendizado pelo amor de deus todas licoes sao importantetisssimas voce nao apagar nada da memoria somente todos os arquivos do e commerce a memoria intacta"*.
- Execução: Vercel ✅, Railway ✅ (soft), Local ✅, GitHub pendente user (sem `gh` CLI).

## 4. Por que apagamos

Não foi falha técnica — projeto estava em prod, login funcionando, demo seedado, painel tier-1 entregue. Foi **decisão soberana do dono** (Gustavo). Razão não declarada explicitamente, mas observação da sessão: ele já cobrou várias vezes "qualidade visual Apple/Linear" + frustração com repetição de bugs (dados inválidos saga, scroll-behavior tarde demais). Possivelmente: queria virar a página e seguir pra próximo cliente do framework, ou reset emocional. Não importa o motivo — **a regra**: quando o dono pede delete completo, executa, mas confirma escopo (memória vs projeto) antes de apertar o botão. Foi o que fiz, mantive a memória intacta.

## 5. O que ficou de aprendizado pra sempre

### 5.1 — Lições Kore Tech (em [[30-LICOES]])

| # | Lição | Onde |
|---|---|---|
| 11 | Backend Prisma com `include` retorna OBJETO, não string | [[30-LICOES/11-backend-relations-objeto]] |
| 14 | Zustand persist é assíncrono — flag `hydrated` obrigatória | [[30-LICOES/14-zustand-persist-race]] |
| 15 | MercadoPago Pix tem 3 pré-requisitos | [[30-LICOES/15-mercadopago-pix-pre-requisitos]] |
| 16 | Vercel rootDirectory em monorepo | [[30-LICOES/16-vercel-rootdir-monorepo]] |
| 17 | Railway source rootDir | [[30-LICOES/17-railway-source-rootdir]] |
| 19 | Repo dedicado por projeto > monorepo subpath | [[30-LICOES/19-repo-dedicado-por-projeto]] |
| 20 | Validar shape do backend ANTES de tipar | [[30-LICOES/20-validar-shape-backend]] |
| 21 | Truncate precisa de block (não inline) | [[30-LICOES/21-truncate-precisa-block]] |
| 22 | CSS @layer com @import — ordem importa | [[30-LICOES/22-css-layer-com-import]] |
| 23 | Sub-agents têm token limit | [[30-LICOES/23-sub-agents-token-limit]] |
| 24 | Redesign visual sozinho não impressiona | [[30-LICOES/24-redesign-visual-sozinho-nao-impressiona]] |
| 25 | Vercel free tier: 100 deploys/dia | [[30-LICOES/25-vercel-deploy-quota]] |
| 26 | Dados inválidos silencioso (saga 3 camadas) | [[30-LICOES/26-dados-invalidos-silencioso]] |
| 27 | scroll-behavior smooth global mata mouse de roda | [[30-LICOES/27-scroll-behavior-smooth-mata-mouse-roda]] |

### 5.2 — Padrões Kore Tech (em [[50-PADROES]])

- [[50-PADROES/painel-admin-tier-1]] — checklist de painel admin tier-1 (15 features) — **canonical pro framework**
- [[50-PADROES/depth-pack-cinematic]] — pacote de 5 camadas de profundidade (aurora + light beam + grid + grain + vignette)
- [[50-PADROES/header-loja-active-underline]] — anti-padrão peso vs padrão underline animada via `layoutId`
- [[50-PADROES/auth-pattern-completo]] — auth backend+frontend consolidado (refresh rotation, reuse detection, redirect param)
- [[50-PADROES/design-tokens-tier-template]] — Brad Frost atomic + 3 tiers
- [[50-PADROES/smart-insights-pattern]] — 4 cards auto-gerados lendo dados
- [[50-PADROES/command-palette-cmdk]] — Cmd+K com 3 grupos
- [[50-PADROES/zustand-persist-pattern]] — flag hydrated obrigatória
- [[50-PADROES/motion-policies]] — animação responde a ação, sem invasivas
- [[50-PADROES/seed-imagens-upsert]] — upsert real, não `if (!existing)`
- [[50-PADROES/validar-visual-antes-de-fechar]] — bug visual exige olho em devtools
- [[50-PADROES/MOBILE-FIRST]] — 27 pontos de audit
- [[50-PADROES/UX-UI-QUALIDADE]] — bar Apple/Linear, anti-Lovable
- [[50-PADROES/DESIGN-PROFISSIONAL]] — depth pack cinematográfico

### 5.3 — Processo industrial (em [[05-PROCESSO]])

Todo o `05-PROCESSO/` foi consolidado **a partir** do Kore Tech:
- [[05-PROCESSO/PROCESSO-MESTRE]] — orquestrador 8 fases
- [[05-PROCESSO/GATES]] — critérios objetivos de saída
- [[05-PROCESSO/FASE-2-DESIGN]], [[05-PROCESSO/FASE-3-BACKEND]], [[05-PROCESSO/FASE-4-FRONTEND]], [[05-PROCESSO/FASE-6-AUDITS]]
- [[05-PROCESSO/DASHBOARD-TEMPLATE]] — copia pra `projetos/[slug]/STATUS.md` no kickoff

## 6. O que NÃO foi feito (declarado pendente, ficou pendente)

- **Atualização mobile fodástica**: hero 7xl cortado, ProductCard grid mobile, OrderDetailSlideOver 480px estoura tela <768px, Cohort/HourlyHeatmap 7×24 precisa scroll horizontal mobile, aurora drift pode pesar low-end. Mapa estava em `project_kore_tech_finalizado_2026_04_28.md` (auto-memory). Não foi executado porque Gustavo decidiu apagar antes.
- Smoke test full E2E pós-deploy. Wave 3 saiu, mas validation full não foi formalizada.
- Senha admin (`casa967440`) não bateu no QA da última noite — ficou anotado pra confirmar com Gustavo, ficou sem confirmar.

## 7. Métricas de produtividade observadas

- 4 dias úteis, ~40 commits, 3 superfícies em prod (loja, painel, backend).
- Wave 1 painel: 9 commits em ~4h.
- Wave 2 painel: 6 commits em ~3h.
- Wave 3 painel: 4 commits em ~2h (paralelo via tech-lead).
- Saga "Dados Inválidos": **5 fixes em ~3h** — custou caro, lição salva.
- Mobile audit + 8 fixes top críticos: ~3h em paralelo.
- Sustentabilidade: 26 commits em 1 sessão de ~12h.

Pra próximo projeto, [[VALOR-ENTREGUE]] amarra estimativa de mercado: R$ 38k–70k em 6–10 semanas com time de agência tradicional. Aqui foi 4 dias com agents IA.

## 8. Anotação emocional (importante pro próximo Tech Lead)

Gustavo é product owner com bar **Apple/Linear** (não Shopify). Durante a saga "Dados Inválidos" ele explodiu — e estava certo. O custo emocional dos 3h em main thread sem despachar QA foi ALTO. Ao mesmo tempo, ele comemorou explicitamente: "perfeito resolveu o cabeçalho", "sem palavras pelo quanto vc é foda", "perfeito ta legal agora".

Conta corrente emocional precisa estar positiva pros bugs futuros não detonarem a relação. Ver `feedback_tom_comemorar_vitorias.md` (auto-memory).

## 9. Por que o framework continua valendo apesar do projeto ter morrido

Kore Tech foi o **veículo** do aprendizado, não o destino. Tudo que vale ficou em [[30-LICOES]], [[50-PADROES]], [[05-PROCESSO]] e [[VALOR-ENTREGUE]]. Próximo projeto do framework herda isso por padrão.

A regra: **a memória é o ativo, o projeto é o passageiro.**
