# DE: Tech Lead | PARA: TIME (8 worker skills) | Data: 2026-04-26

## Brief: e-commerce **Kore Tech** (Projeto Tech, e-commerce nº 2 do framework)

> ⚠️ **LEIA PRIMEIRO:** [PESQUISA-NICHO.md](../../../projetos/projeto-tech/kore-tech/PESQUISA-NICHO.md) — pesquisa completa BR + EUA + Europa, diferencial competitivo, schema, KPIs, jargão. Tudo que vocês precisam pra trabalhar SEM perguntar mais nada do nicho ao cliente.

---

## Identidade do projeto

| Campo | Valor |
|---|---|
| **Nome marca** | Kore Tech |
| **Slug projeto** | `kore-tech` |
| **Categoria** | `projeto-tech` (pasta-mãe — nova convenção) |
| **Localização docs** | `projetos/projeto-tech/kore-tech/` |
| **Localização código** | `src/projeto-tech/kore-tech/{backend,frontend,dashboard,infra}/` |
| **Nicho** | Hardware / PC gamer / componentes / monitores / periféricos |
| **Modelo** | E-commerce **PRÓPRIO** (single-vendor, estoque próprio). **NÃO é marketplace** — não tem multi-seller. |
| **Cliente** | Demo fictícia funcional (sem cliente real). Use placeholders pra WhatsApp/MP/Cloudinary/domínio. |
| **Faixa preço** | R$ 50 (mouse) → R$ 25.000 (RTX 5090) — ticket médio PC montado ~R$ 6.500 |
| **Variações** | 2 modos coexistindo: **componente avulso** (specs técnicas pra builder) + **PC montado** (build completo associado a persona, com FPS estimado) |

## Diferencial competitivo (3 pilares MVP)

1. **PC Builder com checagem de compatibilidade visível** (50+ regras: socket CPU↔mobo, wattagem PSU, GPU↔gabinete, slots RAM, etc) + sugestão automática de upgrade ("essa GPU pede 750W, troca a fonte por +R$ 280").
2. **Catálogo organizado por PERSONA/USO** com FPS estimado em jogos (Valorant 240fps / Fortnite competitivo / Edição 4K / IA local Llama). Cada persona = landing SEO indexável.
3. **Lista de espera com notificação ativa** anti-paper-launch — cliente ativa "me avise" em produto sem estoque, recebe notificação quando entra, reserva 24h.

V2/V3 (depois): garantia de performance ("se não rodar X em Y FPS, devolve"), trade-in upgrade modular, visualizador 3D.

---

## Identidade visual (Tech Lead decidiu — Designer pode refinar mantendo as âncoras)

**Paleta — dark mode + cyan elétrico único:**

| Token | Hex | Uso |
|---|---|---|
| `bg` | `#0A0E14` | Fundo principal (preto-azulado) |
| `surface` | `#141921` | Cards, painéis (1 nível acima) |
| `surface-2` | `#1B2230` | Hover, modal |
| `border` | `#1E2530` | Bordas sutis |
| `border-strong` | `#2A3240` | Bordas de destaque |
| `primary` | `#00E5FF` | Acento cyan elétrico — CTAs, links, ícones ativos, FPS estimado em destaque |
| `primary-hover` | `#00B8D4` | Hover do primary |
| `primary-soft` | `rgba(0,229,255,0.08)` | Background sutil de chips ativos |
| `text` | `#E8EEF5` | Texto principal |
| `text-secondary` | `#8892A0` | Texto secundário |
| `text-muted` | `#5A6573` | Texto desativado, placeholders |
| `success` | `#00E676` | Builder: "✅ socket compatível" |
| `warning` | `#FFB74D` | Builder: "⚠️ fonte insuficiente, sugestão de upgrade" |
| `danger` | `#FF5252` | Builder: "❌ incompatível, não pode comprar" |

**Tipografia:**
- **UI / Display:** `Inter` (Google Fonts) — sans-serif geométrica moderna
- **Specs / Números:** `JetBrains Mono` (Google Fonts) — pra specs técnicas, FPS, watts, MHz, MB/s

**Anti-padrões visuais (NÃO fazer):**
- ❌ RGB explosivo na UI (cafona). RGB nas FOTOS de produto sim, na interface não.
- ❌ Mais de 1 cor de acento. Cyan é o único — não adicionar magenta, verde, etc.
- ❌ Tipografia "gamer" agressiva (Orbitron, Audiowide). Inter passa "tech sério" sem cair no cliché.
- ❌ Animações exageradas (lottie pesado, parallax extremo). Mantém snappy.

**Brand voice (sugestão pro Copywriter validar):**
- Confiante, técnico mas amigável. Não soa robô.
- "Você" (não "vocês"), tom direto.
- Deixa os números falarem. "280 FPS no Valorant" > "performance incrível".
- ❌ Nunca: "tecnologia de ponta", "experiência única", "revolucionário", "gamers de verdade", "next-level".
- ❌ Sem travessão em UI/marketing (regra cross-projeto da memória).

**Slogan provisório:** *"Monte certo. Jogue alto."* (Copywriter pode propor melhor).

---

## Decisões já tomadas — NÃO PERGUNTAR

Tudo isso está em `memoria/20-DECISOES/`:

- **Stack:** Node 20 + Express + TypeScript + Prisma 5 + PostgreSQL 16 (backend) / Next.js 14 App Router + Tailwind + Zustand + TanStack Query (frontend + dashboard) / Docker Compose + Nginx (dev) / Railway + Vercel (prod) / Cloudinary / MercadoPago / Resend
- **Auth:** JWT em cookie httpOnly + refresh token rotation com reuse detection
- **Segurança:** Helmet + CORS + rate limit + body 15mb + Zod validators
- **Estrutura pastas:** ver memoria/20-DECISOES/estrutura-pastas.md (atualizado hoje com convenção pasta-mãe)
- **Lições críticas:** `JWT_SECRET` real (`openssl rand -base64 48`), `tsx` em `dependencies`, CSP `connect-src` lista API host, ler `30-LICOES/INDEX.md` ANTES de subir nada

---

## Tarefas paralelas (Sprint 1)

Cada agente trabalha **só no seu domínio**, em `src/projeto-tech/kore-tech/{seu_dominio}/` ou nos docs em `projetos/projeto-tech/kore-tech/`. **Não toca em domínio alheio.** Ao terminar, reporta em `outros/shared/messages/DE-{seu-nome}_PARA-techlead_2026-04-26-sprint1.md`.

### 01-backend (`src/projeto-tech/kore-tech/backend/`)

- Scaffold completo Express + Prisma + Helmet + CORS + rate limit + Zod (use Miami como referência, NÃO copia importando — recria adaptado)
- `prisma/schema.prisma` com adições de hardware (ver PESQUISA-NICHO.md seção 4.3):
  - `Product` extras: `buildType`, `category`, `persona`, `specs JSON`, `compatibility JSON`, `benchmarkFps JSON`, `weightGrams`, `dimensionsMm JSON`, `warrantyMonths`
  - `PCBuild` model (id, ownerId nullable, name, parts JSON, totalPrice, isPublic, shareSlug, createdAt)
  - `CompatibilityRule` model + seed com regras (socket_match, psu_min_wattage, gpu_fits_case, ram_speed, cooler_height, etc)
  - `Persona` model (slug, name, description, targetGames JSON, targetFps JSON, heroImage)
  - `WaitlistSubscription` (productId, email, userId nullable, notifiedAt nullable)
- Rotas:
  - Padrão: `/auth/*`, `/products`, `/cart`, `/orders`, `/admin/*` (igual Miami)
  - **Novas:** `/api/builder/check-compatibility` (POST array de partes → erros/warnings/sugestões), `/api/builder/recommend-psu` (POST partes → fonte sugerida com modelo/wattagem/preço), `/api/products/by-persona/:slug`, `/api/personas`, `/api/waitlist/subscribe`, `/api/waitlist/notify` (admin), `/api/builds` (CRUD de builds salvos)
- Seed (`prisma/seed.ts`) idempotente — popular:
  - 8 personas (Valorant 240fps, Fortnite competitivo, CS2 high-tier, Edição vídeo 4K, Streaming, IA local Llama 7B/70B, Workstation 3D, Entry gamer)
  - ~30 componentes reais (5 CPUs AM5/LGA1700, 5 GPUs RTX 4060-5080, 5 mobos, 5 RAMs DDR5, 4 PSUs, 4 gabinetes, 2 coolers — cada um com `compatibility` JSON correto)
  - 8 PCs montados (1 por persona) com `benchmarkFps` curado manualmente
  - 5 monitores, 5 periféricos
  - 1 admin user (placeholder password — ler env `SEED_ADMIN_PASSWORD`)

### 02-designer (`projetos/projeto-tech/kore-tech/`)

- Brand-brief 1 página em `BRAND-BRIEF.md`: voz, tom, do/don't (refinar minha sugestão acima), exemplos de copy ON-brand vs OFF-brand
- `tokens.css` ou `tailwind.config.ts` com a paleta acima — pode AJUSTAR tons mas mantém: dark mode + cyan único + Inter/JetBrains
- Mood board (URLs de referência) em `MOOD-BOARD.md` — inspiração NZXT BLD, Maingear, BuildCores, Linear, Vercel
- Specs visuais de componente do builder (estado padrão, hover, selecionado, incompatível) em `BUILDER-VISUAL-SPECS.md`
- Logo: ASCII placeholder OK ("KORE TECH" estilizado em SVG simples) — descreve em `LOGO-SPEC.md` o que um designer humano deveria fazer

### 03-frontend (`src/projeto-tech/kore-tech/frontend/`)

- Scaffold Next.js 14 App Router + Tailwind + Zustand + TanStack Query + react-hook-form + zod
- Páginas:
  - `/` — Home com hero ("Monte certo. Jogue alto."), 4 personas em destaque, 3 builds prontos por persona, componentes em destaque, USPs (parcelamento 12x / lista de espera / builder)
  - `/produtos` — PLP com filtros (categoria, marca, faixa preço, persona)
  - `/produtos/[slug]` — PDP de **componente** (specs técnicas estruturadas, compatibilidade hint, parcelamento, cross-sell)
  - `/pcs/[slug]` — PDP de **PC montado** (galeria, lista de peças, FPS estimado em jogos com cards visuais, parcelamento destacado, cross-sell periféricos)
  - `/builds/[persona-slug]` — Landing de persona (SEO killer): hero específico do uso, 3 builds prontos, "monte o seu" CTA pro builder
  - `/montar` — **PC Builder** completo: sidebar com categorias, conteúdo central com lista filtrada (só compatíveis), barra inferior com wattagem somada + PSU sugerida + total + warnings/erros, botão "salvar" e "comprar"
  - `/cart`, `/checkout`, `/auth/*`, `/account`, `/orders`, `/favoritos`, `/search`, `/sobre`, `/contato`, `/policies/[slug]` (padrão)
- Componentes-chave novos (além dos padrão):
  - `BuilderCategoryPicker.tsx`
  - `BuilderCompatibilityBar.tsx` (mostra success/warning/danger em tempo real)
  - `BuilderPSURecommendation.tsx`
  - `PCBuildCard.tsx` (com FPS por jogo)
  - `FPSBadge.tsx` (jogo + FPS em JetBrains Mono)
  - `WaitlistButton.tsx` (substitui "comprar" quando sem estoque)
  - `PersonaHero.tsx`
  - `SpecsTable.tsx` (ficha técnica estruturada)
- CSP no `next.config.mjs`: `connect-src` lista localhost + railway + vercel
- Header: Início | Loja ▼ | Builder | Builds prontos ▼ | Sobre | Contato + ícone painel admin
- Footer: PaymentBadges, redes, política, contato

### 04-data-analyst (`src/projeto-tech/kore-tech/backend/src/routes/admin/dashboard.ts` + dashboards no painel)

- KPIs prioritários no painel (ver PESQUISA-NICHO.md seção 10):
  - Ticket médio por categoria (componente vs PC montado vs periférico)
  - **Funil do builder** (starts → adds peças → finalizou montagem → checkout) — gráfico de funil
  - **Conversão por persona** (qual persona vende mais)
  - Taxa de parcelamento (% Pix vs 3x vs 6x vs 12x)
  - Margem por categoria
  - DOA acionada (%)
  - Devolução por arrependimento (%)
  - Estoque alerta — produtos abaixo de N unidades
  - Lista de espera ativa por produto (top 10)
  - Tempo médio de montagem (BTO) — só PC montado
- Endpoints `/api/admin/dashboard/{ticket-medio,funnel-builder,conversao-persona,parcelamento,margem,doa,estoque-alerta,waitlist-top}`
- Auto-alertas (cron diário ou evento): estoque baixo, lista de espera alta sem reposição há > 14 dias, ticket caindo semana sobre semana

### 05-devops (`src/projeto-tech/kore-tech/infra/` + raiz `src/projeto-tech/kore-tech/`)

- `docker-compose.yml` em `src/projeto-tech/kore-tech/infra/` — postgres + backend + frontend + dashboard + nginx (independente do Miami; portas diferentes pra rodar em paralelo: 5433 postgres, 4001 backend, 3001 frontend, 3002 dashboard, 8081 nginx)
- `nginx/conf.d/default.conf` — subdomain routing: `loja.kore.test`, `admin.kore.test`, `api.kore.test`
- `.env.example` em `src/projeto-tech/kore-tech/` com TODAS as envs necessárias (placeholder seguro)
- `JWT_SECRET` placeholder com aviso "TROCAR ANTES DE DEPLOY: openssl rand -base64 48"
- README em `src/projeto-tech/kore-tech/README.md` — como rodar local
- Configs Railway (`railway.json` no backend) + Vercel (`vercel.json` no frontend e dashboard) — placeholder dos hosts
- **NÃO subir pra Railway/Vercel** — é demo fictícia, infra fica pronta mas sem deploy real

### 06-qa (`projetos/projeto-tech/kore-tech/qa/`)

- Roteiro de smoke E2E completo em `SMOKE-E2E.md`: registro → login → busca → adiciona ao carrinho → checkout → pagamento simulado → ver pedido no painel admin
- Roteiro do builder em `BUILDER-E2E.md`: começa montagem → escolhe CPU → mobos filtram só compatíveis → adiciona RAM → adiciona GPU + warning de fonte → aceita sugestão de PSU → adiciona case + cooler → finaliza → vai pro checkout
- Pentest checklist em `PENTEST-CHECKLIST.md` — IDOR (cart/order/admin), XSS, CSRF, rate limit, JWT placeholder check, CORS check, CSP check
- Bug bash UX em `BUGBASH-UX.md` — verificar todos os links da home, validar HTML, mobile overlap em PDP, Builder em mobile (acessível? gestos OK?)
- **Não testa execução agora** — só documenta. Quando tudo pronto e backend rodando, eu (Tech Lead) chamo QA pra rodar.

### 07-copywriter (`projetos/projeto-tech/kore-tech/copy/`)

- `BRAND-VOICE.md` — refinar minha sugestão acima (Designer pode contribuir)
- `GLOSSARIO.md` — pegar jargão da PESQUISA-NICHO seção 5, expandir com explicação amigável (cliente novato precisa entender)
- `COPY-UI.md` — todas as strings da loja (CTAs, headers, empty states, errors). NÃO usa: "tecnologia de ponta", "revolucionário", "next-level". USA: números, comparação, benefício direto.
- `COPY-PERSONAS.md` — pra cada uma das 8 personas: nome, headline (hero da landing), subheadline, 3 bullets de benefício, copy do CTA primário
- `COPY-PRODUTOS-EXEMPLO.md` — descrição modelo pra 3 SKUs (1 componente, 1 PC montado, 1 periférico) que o Backend usa de molde no seed
- `COPY-EMAILS.md` — boas-vindas, confirmação de pedido, "GPU disponível na lista de espera", DOA suporte (4 emails iniciais)
- `COPY-INSTITUCIONAL.md` — sobre nós, contato, garantia, troca, privacidade, termos (templates adaptáveis)

### 08-growth (`projetos/projeto-tech/kore-tech/growth/`)

- `SEO-PLAN.md` — sitemap automatizado (incluir landing pages de persona), robots, metadata por tipo de página, JSON-LD `Product` + `Offer` + `BreadcrumbList`, OG image template
- `KEYWORDS.md` — listar 30+ keywords (PESQUISA-NICHO seção 8 + expandir), associar à URL/landing correspondente
- `LANDING-PERSONAS-SEO.md` — pra cada uma das 8 personas, definir: H1, H2, meta title, meta description, JSON-LD específico
- `CUPONS.md` — definir 5 cupons MVP (BEMVINDO5, PIXFIRST, BUILDER10, COMBO15, FRETE15) — regra, percentual, validade, limite por usuário, condições
- `ANALYTICS.md` — eventos GA4 (`view_persona`, `start_builder`, `add_part_builder`, `complete_build`, `checkout_started`, `purchase`, `waitlist_subscribed`) + Meta Pixel mapeado
- `NEWSLETTER.md` — popup 30s com 5% off (BEMVINDO5), captura no footer, fluxo Resend (welcome + carrinho abandonado)
- `RETENTION.md` — fluxo "GPU disponível" (lista de espera) + email pós-compra D+30 ("hora de upgradar acessórios?") + email D+180 ("hora de upgrade modular?")

---

## Coordenação

- Cada agente termina seu Sprint 1 com **uma única mensagem** em `outros/shared/messages/DE-{seu-nome}_PARA-techlead_2026-04-26-sprint1.md` — o que entregou, o que ficou pendente, o que precisa de outro agente.
- **Não interrompo enquanto trabalham.** Vou consolidar quando tiverem reportado.
- **Não toca em domínio alheio.** Se descobrir que precisa, abre mensagem `PARA-{outro-agente}` e segue com o que dá.
- **Antes de qualquer commit:** typecheck zero. Não commitar `node_modules`, `.next`, `.tsbuildinfo`, `.env` real.
- **Lembrar do Miami:** está em `src/backend`, `src/frontend`, `src/dashboard`, `src/infra` — **NÃO MEXE**. Trabalha SÓ em `src/projeto-tech/kore-tech/{seu_dominio}/`.

## Sequência

Sprint 1 (~2h) — todos paralelo agora. Sprint 2 será integração + bug bash. Sprint 3 será security audit. Não rodamos deploy real (demo fictícia).

**Bom trabalho. Reportem quando terminarem.**

— Tech Lead, 2026-04-26
