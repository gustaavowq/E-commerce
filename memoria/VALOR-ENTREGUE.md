# 💰 VALOR ENTREGUE — Kore Tech case study

> "Loja gamer + painel admin + backend completo, deployados em prod, em 2 dias com time de agents IA. Estimativa de mercado: R$ 38.000 - R$ 70.000."

## 📅 Timeline real

- **2026-04-27** (dia 1, manhã): init repo `gustaavowq/E-commerce-tech` (commit `5b601af`)
- **2026-04-28** (dia 2, fim do dia): 30+ commits, 3 superfícies em prod, audit mobile completo

**Total**: 2 dias úteis com main thread + agents paralelos.

## 🏗️ O que foi construído

### 🛒 Loja (`kore-tech-loja.vercel.app`)

**Stack**:
- Next.js 14 App Router
- Tailwind CSS + framer-motion 11
- Three.js + React Three Fiber (HeroPC3D procedural)
- Zustand (auth, cart, wishlist) + persist + hydrated flag
- TanStack Query
- React-hook-form + Zod
- Cloudinary (imagens)

**Features**:
- Hero cinematográfico com 5 camadas de profundidade (aurora orbs respirando + light beam vertical + grid técnico + grain global + vignette)
- Logo wordmark refinado (Linear/Vercel-tier)
- Header com underline animada via `layoutId` (desliza entre items quando muda rota)
- Search Cmd+K-style com `max-w-3xl` + recents pós-login
- Catálogo `/produtos` com filtros (categoria, tipo, persona, faixa de preço) — sidebar desktop + bottom-sheet mobile
- PDP `/produtos/[slug]` com galeria layoutId + specs collapsible + trust strip
- Builder `/montar` — checagem automática de compatibilidade (socket, fonte, gabinete) + footer compacto mobile
- Lista PCs prontos `/builds` por persona (Valorant 240fps, Fortnite, CS2, etc)
- Cart com QtyStepper + cupom validation
- Checkout completo: endereço + pagamento (Pix com 5% off + Cartão 12x) + mini-bar sticky bottom mobile
- Auth completo: login/register/forgot/reset + Google OAuth + redirect ADMIN→painel
- Account dashboard com pedidos + favoritos + montagens salvas
- Páginas: /sobre, /contato, /policies/[slug], /favoritos
- SEO técnico: sitemap, robots, metadata dinâmica, OG images

### 🛠️ Painel admin (`kore-tech-painel.vercel.app`)

**Stack adicional**:
- TanStack Table v8 (DataTable)
- cmdk (Command palette)
- Sonner (toaster)
- Recharts (charts)

**Features tier-1** (estabelecidas como padrão do framework):
- Sidebar Linear-style (bg-surface-2, nav agrupado em 3 seções, layoutId active)
- DateRangePicker 5 presets + shortcuts (D/7/3/9/Y)
- KpiCards com Sparkline inline 80×24 + AnimatedNumber tween + period comparison
- SmartInsights — 4 cards auto-gerados lendo dados (detecta receita ±10%, conversão drop, AOV cai, etc)
- RevenueChart premium com period overlay (atual sólido + anterior tracejado)
- TopCategoriasBar com bar viz ordenável
- DataTable v2 sortable + onRowClick + Skeleton shimmer + BulkActionBar floating
- Command palette Cmd+K (3 grupos: Páginas / Criar / Ferramentas)
- HourlyHeatmap 7×24 com insight automático de pico
- CohortRetentionChart D30/60/90 com insight de melhor cohort
- OrderDetailSlideOver Stripe-style 480px com sync URL `?selected=ID`
- FilterChips stackable em /products, /orders, /customers
- EmptyState com tone variants + admin-copy library
- Sonner toast em todas mutations
- Page transitions via template.tsx
- Live-dot pulse em status indicators
- 11 telas: Visão geral, Produtos, Pedidos, Analytics, Clientes, Cupons, Lista de espera, Reviews, Personas, PCs montados, Configurações

### ⚙️ Backend (`amused-connection-production-4fcd.up.railway.app`)

**Stack**:
- Node 20 + Express + TypeScript
- Prisma 5 + PostgreSQL 16
- bcrypt + JWT (access + refresh)
- Zod validators
- Sharp (resize de imagens)
- Cloudinary SDK
- MercadoPago SDK

**Endpoints**:
- Auth: `/auth/login`, `/auth/register`, `/auth/refresh`, `/auth/forgot`, `/auth/reset`, `/auth/google`
- Catálogo: `/products`, `/products/:slug`, `/products/search`, `/builds`, `/personas`
- Cart: `/cart`, `/cart/items`, `/cart/coupon`
- Checkout: `/orders`, `/orders/:id`, `/orders/:id/cancel`
- Pagamento: `/payments/mp/preference`, `/webhooks/mercadopago`
- Admin: `/admin/products` (CRUD + bulk), `/admin/orders`, `/admin/customers`, `/admin/coupons`, `/admin/personas`, `/admin/builds`, `/admin/reviews`, `/admin/waitlist`, `/admin/settings`, `/admin/dashboard/*` (10 KPIs + 5 KPIs avançados Wave 2/3)
- Imagens: `/admin/products/:id/images` (upload, reorder, primary, delete)

**Defesa em profundidade** (após saga "Dados Inválidos"):
- error-handler.ts envia `formErrors` em `details._form`
- Schema Zod `.strict()` em todos validators
- Rate limit 10 req/s em endpoints sensíveis
- CORS configurado por env

### 🌱 Seed completo
- 8 personas curadas com builds reais
- 30+ componentes (5 CPUs, 5 GPUs, 5 mobos, 5 RAMs, 4 PSUs, 4 cases, 2 coolers)
- 5 monitores + 5 periféricos
- 5 cupons MVP (BEMVINDO5, PIXFIRST, BUILDER10, COMBO15, FRETE15)
- 7 regras de compatibility automatica (socket, RAM, fonte, gabinete)
- **seed-fake.ts** pra demo:
  - 35 fake users distribuídos em 6 meses (cohorts D30/60/90)
  - 150 pedidos com viés ter/qua 18-22h (heatmap mostra pico)
  - 30 reviews só em produtos comprados
  - 12 waitlist em produtos sem estoque
  - Idempotente

## 💵 Estimativa de mercado

Pra construir o equivalente do zero, sem framework:

| Surface | Tempo agência | Custo |
|---|---|---|
| Loja Next.js + 11 telas + animações | 80-120h | R$ 12.000 - R$ 24.000 |
| Painel admin tier-1 (11 telas, 30+ componentes) | 100-150h | R$ 15.000 - R$ 30.000 |
| Backend Express + Prisma + 50+ endpoints | 60-90h | R$ 9.000 - R$ 14.000 |
| Auth + payment + email + deploy | 20-30h | R$ 3.000 - R$ 5.000 |
| Design system + brand-brief | 20-30h | R$ 3.000 - R$ 6.000 |
| QA + bug bash + audit security/mobile | 20-30h | R$ 2.500 - R$ 4.000 |
| **TOTAL realista** | **300-450h** | **R$ 44.500 - R$ 83.000** |

**Estimativa conservadora: R$ 38.000 - R$ 70.000.**

Tempo equivalente em agência: **6-10 semanas com time de 2-3 devs + 1 designer + 1 PM**.

## 🤖 Time de agents IA usado

Desde init:
- `ecommerce-tech-lead` — orquestrador (kickoff, dispatch waves)
- `ecommerce-designer` — paleta, brand-brief, mood
- `ecommerce-backend` — schema, endpoints, auth, MP, seed
- `ecommerce-frontend` — componentes loja + painel
- `ecommerce-data-analyst` — KPIs, dashboard endpoints, alertas
- `ecommerce-devops` — Railway, Vercel, Cloudinary, env vars
- `ecommerce-qa` — pentest, bug bash, smoke E2E
- `ecommerce-copywriter` — descrições, microcopy, emails
- `ecommerce-growth` — SEO, GA4, cupons, newsletter

Total **9 skills** orquestrados pelo Tech Lead (eu) com despachos paralelos quando arquivos disjuntos.

## 🎯 Aprendizados acumulados

### Pra próximo projeto (já documentados)

| Lição | Arquivo |
|---|---|
| Mobile-first com 27 pontos de audit | [MOBILE-FIRST.md](50-PADROES/MOBILE-FIRST.md) |
| UX/UI qualidade anti-Lovable | [UX-UI-QUALIDADE.md](50-PADROES/UX-UI-QUALIDADE.md) |
| Design depth pack cinematográfico | [DESIGN-PROFISSIONAL.md](50-PADROES/DESIGN-PROFISSIONAL.md) |
| Erros críticos top + saga Dados Inválidos | [ERROS-CRITICOS.md](30-LICOES/ERROS-CRITICOS.md) |
| Tipos write/read separados em CRUD | [26-dados-invalidos-silencioso.md](30-LICOES/26-dados-invalidos-silencioso.md) |
| Painel admin tier-1 (15 features) | [painel-admin-tier-1.md](50-PADROES/painel-admin-tier-1.md) |
| Header active underline | [header-loja-active-underline.md](50-PADROES/header-loja-active-underline.md) |
| Coordenação multi-agent | [NOVO-ECOMMERCE.md](10-PLAYBOOKS/NOVO-ECOMMERCE.md) |

### Métricas pra usar como referência

- Wave 1 painel: 9 commits em ~4h
- Wave 2 painel: 6 commits em ~3h
- Wave 3 painel: 4 commits em ~2h (paralelo via tech-lead)
- Saga "Dados Inválidos": 5 fixes em ~3h (custou caro, lição salva)
- Mobile audit + 8 fixes top críticos: ~3h em paralelo

**Sustentabilidade**: 26 commits em 1 sessão de ~12h (incluindo investigação, paralelos, retrabalho).

## 🚀 Próximos níveis possíveis

1. **Licenciar o framework pra agências** (#3 do reference_valor_kore_tech.md — leverage máximo)
2. **Multi-tenant SaaS** — 1 framework, N lojas, dashboard central
3. **AI shopping assistant** — chatbot + recomendação por persona + builder LLM-driven
4. **Mobile app nativo** (React Native + reuso de 80% do backend)
5. **Marketplace de PCs montados** com sellers terceiros

## Referências
- [00-INICIO.md](00-INICIO.md) — índice
- [reference_valor_kore_tech](https://github.com/anthropic-internal/...) — análise de 7 cenários (R$ 35k até R$ 50M)
- [projetos/miami-store/COMO-FUNCIONA.md](../projetos/miami-store/COMO-FUNCIONA.md) — projeto referência educativa
