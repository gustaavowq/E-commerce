# Decisão: Estrutura de pastas

```
projeto/
├── CLAUDE.md                    ← entry point, aponta pra memoria
├── README.md                    ← como rodar local em outro PC
├── DEPLOY.md                    ← Railway + Vercel passo-a-passo
├── .env.example                 ← template, nunca commitar .env real
├── .gitignore                   ← incluir .env, .next, .tsbuildinfo, .claude/, Obsidian/ (binário)
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
├── projetos/                    ← documentação por cliente (Miami Store é o 1º)
│   └── miami-store/
│       ├── README.md
│       ├── COMO-FUNCIONA.md
│       ├── JORNADA.md
│       └── DECISOES-ESPECIFICAS.md
│
├── outros/                      ← shared/messages, docs técnicas, scripts
│   ├── shared/messages/         ← canal de comunicação entre agentes
│   │   └── DE-{agente}_PARA-{agente}_YYYY-MM-DD-{topico}.md
│   ├── docs/                    ← contratos de API, ADRs
│   └── scripts/                 ← setup-hosts.ps1, etc
│
└── src/
    ├── backend/                 ← Express + Prisma
    │   ├── Dockerfile           ← prod multi-stage
    │   ├── Dockerfile.dev       ← dev com hot-reload
    │   ├── railway.json         ← config Railway (builder, healthcheck, startCommand)
    │   ├── package.json         ← tsx EM dependencies (ver 30-LICOES/03)
    │   ├── prisma/
    │   │   ├── schema.prisma
    │   │   ├── seed.ts          ← idempotente (upsert por slug/email)
    │   │   └── migrations/
    │   └── src/
    │       ├── index.ts         ← Express app, helmet, cors, rate limit, body 15mb
    │       ├── config/env.ts    ← Zod schema das envs
    │       ├── lib/
    │       │   ├── prisma.ts
    │       │   ├── api-response.ts  ← ok/created/errors helpers
    │       │   ├── jwt.ts
    │       │   ├── password.ts
    │       │   └── coupon.ts
    │       ├── middleware/auth.ts
    │       ├── routes/
    │       │   ├── auth.ts
    │       │   ├── products.ts
    │       │   ├── cart.ts
    │       │   ├── orders.ts
    │       │   ├── webhooks.ts
    │       │   └── admin/
    │       │       ├── index.ts          ← aplica requireAuth + requireRole('ADMIN')
    │       │       ├── products.ts
    │       │       ├── orders.ts
    │       │       ├── coupons.ts
    │       │       ├── customers.ts
    │       │       ├── reviews.ts
    │       │       ├── settings.ts
    │       │       ├── dashboard.ts
    │       │       └── upload.ts          ← Cloudinary
    │       └── validators/
    │
    ├── frontend/                ← Next.js loja
    │   ├── Dockerfile.dev
    │   ├── next.config.mjs      ← headers CSP + connect-src (railway, vercel, etc)
    │   ├── package.json
    │   └── src/
    │       ├── app/
    │       │   ├── layout.tsx
    │       │   ├── page.tsx                    ← home
    │       │   ├── products/                   ← PLP + PDP
    │       │   ├── cart/                       ← carrinho com frete grátis bar
    │       │   ├── checkout/                   ← cupom + WhatsApp opt-in
    │       │   ├── auth/                       ← login/register/forgot
    │       │   ├── account/                    ← área do cliente
    │       │   ├── orders/                     ← histórico
    │       │   ├── favoritos/                  ← wishlist
    │       │   ├── search/
    │       │   ├── sobre/                      ← institucional
    │       │   ├── contato/                    ← form WhatsApp + mapa
    │       │   ├── policies/[slug]/            ← privacidade, termos, troca, frete
    │       │   ├── sitemap.ts
    │       │   └── robots.ts
    │       ├── components/
    │       │   ├── Header.tsx                  ← Início | Loja ▼ | Sobre | Contato + Painel (admin)
    │       │   ├── Footer.tsx                  ← com PaymentBadges (SVG inline)
    │       │   ├── ProductCard.tsx
    │       │   ├── ProductImage.tsx            ← fallback inline (sem placehold.co)
    │       │   ├── SearchBar.tsx               ← drawer com Ctrl+K
    │       │   ├── PaymentBadges.tsx           ← Pix/Visa/Master/Elo/Amex/Boleto SVG
    │       │   ├── NewsletterPopup.tsx         ← 30s, 5% off, dismiss 7d
    │       │   ├── WishlistHeart.tsx           ← stopPropagation pra não disparar nav
    │       │   └── ProductReviews.tsx
    │       ├── stores/                          ← Zustand (auth, cart, wishlist com persist)
    │       ├── services/                        ← API client wrappers
    │       └── lib/
    │
    ├── dashboard/               ← Next.js painel admin
    │   ├── Dockerfile.dev
    │   ├── next.config.mjs      ← mesma estrutura do frontend
    │   └── src/
    │       ├── app/
    │       │   ├── login/page.tsx
    │       │   └── (admin)/
    │       │       ├── layout.tsx              ← guard client-side + NewOrderToast
    │       │       ├── page.tsx                ← dashboard KPIs
    │       │       ├── orders/
    │       │       ├── products/               ← com filtros + bulk + miniatura
    │       │       │   ├── page.tsx
    │       │       │   ├── new/page.tsx
    │       │       │   └── [id]/page.tsx       ← edição com ImagesManager (Cloudinary upload)
    │       │       ├── customers/
    │       │       ├── coupons/                ← com métricas + duplicar
    │       │       └── settings/
    │       ├── components/
    │       │   ├── Sidebar.tsx                 ← com badge pendentes + Ver loja
    │       │   ├── MobileTopBar.tsx
    │       │   ├── KpiCard.tsx
    │       │   ├── AnimatedNumber.tsx
    │       │   └── StatusBadge.tsx
    │       ├── hooks/
    │       │   └── useNewOrderNotification.ts  ← polling 30s + visibility-aware
    │       ├── stores/auth.ts                  ← Zustand
    │       └── services/admin.ts                ← wrapper /api/admin/*
    │
    └── infra/
        ├── docker-compose.yml   ← postgres + backend + frontend + dashboard + nginx
        └── nginx/conf.d/default.conf  ← subdomain routing + headers de segurança
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
Obsidian/
node_modules/
src/backend/prisma/dev.db
```

Ver [[../30-LICOES/08-prisma-tsbuildinfo-gitignore]] sobre o `*.tsbuildinfo` (não `.tsbuildinfo`).
