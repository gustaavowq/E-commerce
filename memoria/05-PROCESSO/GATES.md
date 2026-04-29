# 🚦 Gates — critérios objetivos de saída de cada fase

> Sem ✅ em TODOS os itens, fase não fecha. Pular gate é débito técnico.
> Comentar `// DEBT: gate X.Y skipped — reason` no commit. Sweep antes do gate 8.

Este doc é a régua. Tech-lead consulta antes de avançar pra próxima fase. Skill que terminou seu bloco de trabalho **valida o gate e reporta** explicitamente no relatório.

Versão 1.0 — 2026-04-29.

## Índice

- [Gate 0 — Pesquisa nicho](#gate-0--pesquisa-nicho)
- [Gate 0.5 — Proposta validada](#gate-05--proposta-validada)
- [Gate 1 — Setup](#gate-1--setup)
- [Gate 2 — Design](#gate-2--design)
- [Gate 3 — Backend](#gate-3--backend)
- [Gate 4 — Frontend](#gate-4--frontend)
- [Gate 5 — Painel admin](#gate-5--painel-admin)
- [Gate 6 — Audits 3 vetores](#gate-6--audits-3-vetores)
- [Gate 7 — Deploy](#gate-7--deploy)
- [Gate 8 — Aprendizado](#gate-8--aprendizado)

---

## Gate 0 — Pesquisa nicho

**Output:** `projetos/[slug]/PESQUISA-NICHO.md`

- [ ] **5 concorrentes BR** mapeados (nome + URL + ticket médio + diferencial)
- [ ] **3 concorrentes EUA** mapeados (idem)
- [ ] **3 concorrentes Europa** mapeados (idem)
- [ ] **Ticket médio do nicho** (mínimo, médio, máximo)
- [ ] **3 KPIs niche-specific** (além de receita/AOV genéricos)
- [ ] **3 referências visuais** com link real (Unsplash/Pexels/site concorrente)
- [ ] **Variações típicas de produto** (tamanho, cor, sabor — depende do nicho)
- [ ] **Jargão do nicho** (termos que o cliente final usa)
- [ ] **Regulatórios** (Anvisa, etc se aplicável)
- [ ] **Integrações comuns** (calculadora de frete, e-NF, etc)

**Falhou?** Pesquisa rasa = proposta rasa. Tech-lead refaz a pesquisa antes de avançar.

---

## Gate 0.5 — Proposta validada

**Output:** mensagem ao user com plano + 5 pedidos finais.

- [ ] **User respondeu "sim"** ou equivalente
- [ ] **Nome da marca** confirmado
- [ ] **Logo** (SVG ou aceite mockup) recebido ou autorizado a gerar
- [ ] **Cores** confirmadas ou autorizadas a derivar do nicho
- [ ] **Contas** disponíveis (Railway, Vercel, MercadoPago, Cloudinary, GitHub) — checa [[../reference_credenciais_kore_tech|credenciais framework]]
- [ ] **Domínio** confirmado (ou autorizado fallback subdomínio Vercel)

**Falhou?** Não avança sem confirmação explícita. Não inventar marca.

---

## Gate 1 — Setup

**Output:** repo dedicado com estrutura padrão.

- [ ] **Repo dedicado** criado em `gustaavowq/[Slug]-tech` (NÃO monorepo subpath — lição 19)
- [ ] **Estrutura no root**: `backend/`, `frontend/`, `dashboard/`, `infra/`
- [ ] **`.env.example`** em cada subpasta com variáveis canônicas
- [ ] **README.md do projeto** com comando de bootstrap (docker compose up)
- [ ] **`docker-compose.yml`** dev rodando local (postgres + backend + nginx)
- [ ] **`.gitignore`** completo (node_modules, .env, dist, .next)
- [ ] **First commit** verde

**Falhou?** Estrutura quebrada = monkey-patch eterno. Refaz.

---

## Gate 2 — Design

**Output:** `projetos/[slug]/BRAND-BRIEF.md` + `projetos/[slug]/MOOD-BOARD.md` + tokens prontos.

- [ ] **Tokens Tier 1 (primitives)** definidos — escala completa de gray/brand/red/green/yellow (`tokens/primitives.ts`)
- [ ] **Tokens Tier 2 (semantic)** mapeados — `surface`, `surface-elevated`, `text-primary`, `text-muted`, `border`, `accent`, `danger`, `success` (Tailwind extend)
- [ ] **Tokens Tier 3 (component)** definidos — `--btn-primary-bg`, `--card-shadow`, `--hero-vignette` (CSS vars)
- [ ] **Tipografia** especificada — display + sans + mono, escala mobile-first com `break-words`
- [ ] **Mood-board** com **6+ refs reais** (links Unsplash/Pexels/sites — não mockup IA)
- [ ] **Refs cobrem 3 mercados:** 2+ BR, 2+ EUA, 2+ Europa
- [ ] **Depth pack cinematic** specs documentadas — aurora drift, light beam, grain, vignette, active underline
- [ ] **Brand voice** com 5 do/don't (link [[../50-PADROES/UX-UI-QUALIDADE]])
- [ ] **Don'ts visuais** explícitos (sem hero quadrado raso, sem USP icons grid genérico, sem `transition-all`)
- [ ] **Aprovação explícita do user** — recebeu mockup/preview, respondeu "aprovado"

**Falhou?** Codar UI sem aprovação = retrabalho garantido. Espera o "aprovado".

Detalhes em [[FASE-2-DESIGN]].

---

## Gate 3 — Backend

**Output:** API REST completa + auth + seed + MP Pix sandbox.

### Schema + endpoints
- [ ] **Schema Prisma** com modelos canônicos (`User`, `Product`, `Order`, `Address`, `RefreshToken`, `PasswordResetToken`, etc)
- [ ] **Smoke test shape** — `curl /api/products` retornou shape esperado, paste em comentário acima do type frontend (lição 20)
- [ ] **Endpoints REST** `/api/*` cobrem CRUD produtos, pedidos, auth, admin
- [ ] **Validators Zod** com `.strict()` em TODOS schemas de mutação

### Auth
- [ ] **`/auth/register`** testado via curl (criação CUSTOMER, role forçado, password forte)
- [ ] **`/auth/login`** testado via curl (cookie httpOnly setado)
- [ ] **`/auth/refresh`** testado via curl (rotation com reuse detection)
- [ ] **`/auth/logout`** testado via curl (cookies limpos, refresh revogado)
- [ ] **`/auth/me`** testado via curl (retorna user atual)
- [ ] **`/auth/forgot-password` + `/reset-password`** testados (link gerado, NÃO retornado na response)
- [ ] **JWT_SECRET real** (`openssl rand -base64 48`) — sem placeholder (lição 1)

### Error handling
- [ ] **`error-handler.ts`** envia `formErrors` em `details._form` (defesa em profundidade saga 26)
- [ ] **`describeApiError` no frontend** consome `_form` E `fieldErrors`

### Seed + integrations
- [ ] **Seed idempotente** — re-run `npm run db:seed` não duplica produtos, atualiza imagem/variations se diverge (padrão `seed-imagens-upsert`)
- [ ] **Seed completo** — min 12 produtos com foto real + preço + desconto + specs + estoque (lição demo-first)
- [ ] **MercadoPago Pix** testado em sandbox: env name `MERCADOPAGO_ACCESS_TOKEN` + token PRODUCTION válido + chave Pix cadastrada na conta (lição 15)
- [ ] **MP webhook** endpoint `/api/webhooks/mercadopago` configurado e respondendo

**Falhou?** Cada item ausente = bug futuro. Não avança pra frontend sem shape validado.

Detalhes em [[FASE-3-BACKEND]] e [[../50-PADROES/auth-pattern-completo]].

---

## Gate 4 — Frontend

**Output:** loja Next.js completa, mobile-first, login redirect inteligente.

### Auth flow
- [ ] **`LoginForm`** lê `searchParams.get('redirect')` e redireciona após autenticar
- [ ] **Helper `redirectAfterLogin(user)`** funciona pra email/senha **E** Google OAuth
- [ ] **ADMIN sem `?redirect=`** vai pra `NEXT_PUBLIC_DASHBOARD_URL` (painel)
- [ ] **3 fluxos testados em prod:**
  - PDP "Comprar agora" guest → cart adicionado → login → checkout direto
  - `/account` direto sem login → redirect → login → volta pra `/account`
  - `/checkout` sem login → redirect → login → volta pra `/checkout`
- [ ] **Logout** sem `window.location.reload()` — usa `router.refresh()` ou state reset

### Tipos
- [ ] **`XxxWritePayload`** separado de `XxxDetail`/`XxxResponse` em todo CRUD
- [ ] **NÃO tem `Partial<XxxDetail>`** em PATCH em lugar nenhum (saga 26)

### Mobile-first
- [ ] **27-pt mobile audit** rodado por QA agent — **ZERO crítico**, alto/médio atacados
- [ ] **Hero** escala `text-[2.5rem] sm:text-6xl lg:text-7xl xl:text-[5.5rem]` com `break-words`
- [ ] **Inputs** com `text-base` mínimo (16px — desliga auto-zoom iOS)
- [ ] **Touch targets ≥ 44×44px** em todos botões/ícones
- [ ] **Filtros mobile** em bottom-sheet com botão sticky-top — NÃO empilhados verticais
- [ ] **Sticky bar bottom** em CTA crítico (Comprar, Salvar montagem, Criar pedido) com `pb-28` no `<main>`

### Animação
- [ ] **`prefers-reduced-motion`** testado em todas animações
- [ ] **Sem `scroll-behavior: smooth`** global em html/body (lição 27)
- [ ] **Sem cursor glow** seguindo viewport
- [ ] **`pointer:fine` check** antes de Tilt3D/glare
- [ ] **Componente 3D (R3F)** disable em `<lg`

### Erros
- [ ] **`describeApiError(err)`** em TODA mutation com `onError` — toast genérico = bug
- [ ] **Banner de erro topo + auto-jump** pra tab certa em forms multi-tab

### Cart + state
- [ ] **Zustand persist + flag `hydrated`** em cart, wishlist, builder (lição 14)
- [ ] **Guest constrói carrinho inteiro** sem precisar logar; login só no `/checkout`

### Visual self-check
- [ ] **DevTools 3 viewports** (375 / 768 / 1440) abertos, scrolled, screenshot dos críticos

**Falhou?** Frontend que falha gate 4 = experiência ruim. Sem deploy.

Detalhes em [[FASE-4-FRONTEND]].

---

## Gate 5 — Painel admin

**Output:** dashboard tier-1 completo (link [[../50-PADROES/painel-admin-tier-1]]).

- [ ] **Sidebar Linear-style** com active underline `layoutId`
- [ ] **DateRangePicker** 5 presets + shortcuts
- [ ] **KpiCards** com sparkline + AnimatedNumber + period comparison
- [ ] **SmartInsights** (4 cards auto-gerados)
- [ ] **RevenueChart** com period overlay
- [ ] **DataTable v2** sortable + onRowClick (slide-over Stripe-style 480px com sync `?selected=ID`)
- [ ] **Cmd+K palette**
- [ ] **Skeleton shimmer** em loading states
- [ ] **Page transitions** suaves
- [ ] **HourlyHeatmap 7×24**
- [ ] **CohortRetentionChart** D30/60/90
- [ ] **FilterChips stackable** em todas listas
- [ ] **MobileFiltersSheet** reusable
- [ ] **EmptyState** com tone variants + admin-copy library
- [ ] **Sonner toast**
- [ ] **Smoke write em CADA CRUD** — clicar salvar, ver toast verde, recarregar, confirmar persistência

**Falhou?** Sem smoke write em cada CRUD admin = bug invisível em prod. Refaz.

---

## Gate 6 — Audits 3 vetores

**Output:** 3 relatórios verdes em `projetos/[slug]/messages/`.

### Audit 1: Security (pentest OWASP)
- [ ] **3 pentesters paralelos despachados** (backend, frontend, infra)
- [ ] **Auth/IDOR/XSS/CSRF/injection** validados
- [ ] **JWT_SECRET, CORS_ORIGIN, env vars** não placeholders
- [ ] **Rate limit** em `/auth/*` (login, register, forgot)
- [ ] **CSP** com `connect-src` correto (Railway, Vercel, MP)
- [ ] **HSTS** habilitado em prod
- [ ] **0 críticos, 0 altos** — médios documentados em `30-LICOES/`

### Audit 2: Mobile 27-pt
- [ ] **QA agent rodou** audit estático em viewport 375px
- [ ] **Reportou** todos bugs por severidade (crítico/alto/médio/baixo)
- [ ] **Top 5 críticos atacados** antes de deploy
- [ ] **Validação visual em mobile real** OU DevTools "Toggle device toolbar"

### Audit 3: Bug-bash UX
- [ ] **HTML validity** sem warnings
- [ ] **Dead buttons** mapeados e fixados
- [ ] **Edge cases** testados (cart vazio, sem produtos, sem pedidos)
- [ ] **Smoke test write** em CADA CRUD admin (já no gate 5, valida de novo aqui em prod-like)
- [ ] **Forms multi-tab** com erro em tab não-aberta → pula pra tab certa
- [ ] **Delete sem ConfirmDialog** = bug
- [ ] **Mutation sem `onError`** = bug

**Falhou?** Deploy bloqueado. Refaz audit ou ataca bugs.

Detalhes em [[FASE-6-AUDITS]].

---

## Gate 7 — Deploy

**Output:** URL pública respondendo + smoke E2E em prod.

- [ ] **Backend Railway** deploy verde (Postgres + API)
- [ ] **Frontend Vercel** deploy verde
- [ ] **Painel Vercel** deploy verde
- [ ] **`/api/health`** retorna 200 em prod
- [ ] **Loja URL pública** responde 200
- [ ] **Painel URL pública** responde 200
- [ ] **Vercel quota** ≥ 20 deploys restantes (não bater limit em produção)
- [ ] **Smoke E2E em prod:**
  - Cadastro com email novo → recebe cookie httpOnly
  - Login com user criado → redirect funciona
  - Adicionar produto ao carrinho → persiste após F5
  - Checkout com Pix → QR code gerado + valor correto
  - Webhook MP → pedido marca como pago (testar com MP simulator)
- [ ] **Domínio custom** (se cliente forneceu) — DNS apontando + SSL emitido
- [ ] **CSP em prod** funcional (sem console error)
- [ ] **HTTPS** com HSTS

**Falhou?** Não anuncia "no ar" sem todos checks. Live broken = pior que dev.

---

## Gate 8 — Aprendizado

**Output:** memória atualizada + JORNADA do projeto.

- [ ] **Lições novas** adicionadas em `30-LICOES/[N]-[slug].md` se houver bugs novos
- [ ] **`30-LICOES/INDEX.md`** atualizado
- [ ] **Nicho** atualizado em `70-NICHOS/[nicho].md` com aprendizados específicos
- [ ] **`70-NICHOS/INDEX.md`** atualizado
- [ ] **`projetos/[slug]/JORNADA.md`** criada com timeline + bugs + inovações + métricas
- [ ] **`VALOR-ENTREGUE.md`** atualizado com novo case
- [ ] **`MEMORY.md`** auto-memória pessoal atualizada se aplicável (perfil, feedback novo)
- [ ] **Débito técnico** sweep — todos `// DEBT: gate X.Y skipped` resolvidos OU virados em lição/issue

**Falhou?** Sem aprendizado, máquina não evolui. Próximo projeto repete os mesmos bugs.

---

## 🎯 Resumo: como aplicar

1. **Antes de despachar a próxima skill**, abre este doc, valida o gate da fase atual.
2. **Cada skill termina seu bloco com um relatório** que inclui status do gate (item por item).
3. **Tech-lead consolida**, marca débitos pendentes, decide passar ou refazer.
4. **No commit final do bloco**, gate aprovado entra na mensagem (`feat(fase-N): X — gate N ✅`).
5. **Sweep gate 8** — todos débitos fechados antes de declarar projeto entregue.

Sem essa régua, o framework vira o mesmo Kore Tech: bugs descobertos no audit, retrabalho, cliente impaciente. **Gate é o que separa máquina industrial de oficina de fundo de quintal.**
