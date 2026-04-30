# Marquesa — Frontend

App único Next.js 14 da Marquesa com **loja pública + painel admin/analista** sob a mesma URL,
role-based routing.

## Stack

- Next.js 14 (App Router) + TypeScript
- Tailwind CSS + design tokens (CSS vars em `src/app/globals.css`)
- Zustand (auth state)
- TanStack Query (fetch + cache)
- react-hook-form + zod (forms)
- next/font/google: Cormorant Garamond + Inter

## Rotas

```
/                                  Home
/imoveis                           Catálogo + filtros
/imoveis/[slug]                    PDP + galeria + mapa + sinal
/sobre                             Sobre Marquesa
/contato
/policies/reserva                  Política de reserva (arras)
/policies/privacidade              LGPD

/auth/login                        Universal — redirect por role
/auth/register
/auth/forgot-password

/painel                            Dashboard (ADMIN/ANALYST)
/painel/imoveis                    CRUD + filtros + busca
/painel/imoveis/novo
/painel/imoveis/[id]               Editar (PATCH) ou soft-delete
/painel/reservas                   Gestão (cancelar/extender/converter)
/painel/clientes                   Read-only
/painel/leads                      Read-only
/painel/settings                   Conta + info da loja
```

## Auth flow

- Cookie `access_token` httpOnly do backend é a fonte de verdade.
- `src/middleware.ts` protege `/painel/*` (precisa de cookie) e redireciona usuários logados em `/auth/*`.
- Validação real do role acontece em `RoleGate.tsx` no client (chama `GET /api/auth/me`).
- Login respeita `?redirect=` query param (lição `feedback_login_redirect_padrao.md`).

## Endpoints consumidos

Público:
- `GET /api/imoveis` (filtros tipo/bairro/preco/quartos/destaque/sort/page/limit)
- `GET /api/imoveis/:slug`
- `POST /api/imoveis/:slug/view` (analytics, não-bloqueante)
- `POST /api/leads`

Auth:
- `POST /api/auth/login | register | logout | forgot-password`
- `GET /api/auth/me`

Cliente:
- `POST /api/reservas`
- `GET /api/reservas/me`

Admin (ADMIN/ANALYST):
- `GET/POST/PATCH/DELETE /api/admin/imoveis[/:id]`
- `GET /api/admin/reservas`
- `PATCH /api/admin/reservas/:id` (action: cancelar/extender/converter)
- `GET /api/admin/clientes`
- `GET /api/admin/leads` (fallback `/api/leads` se não existir)
- `GET /api/admin/dashboard/summary` (fallback `/api/admin/dashboard/kpis`)

## Setup

```bash
npm install
cp .env.example .env
# Ajusta NEXT_PUBLIC_API_URL pro backend rodando
npm run dev   # http://localhost:3000
```

Backend Marquesa precisa estar rodando em `:8211` (default) para tudo funcionar.

## Build

```bash
npm run typecheck
npm run build
npm run start
```

## Animação (regra absoluta)

- ScrollReveal HOC (`src/components/effects/ScrollReveal.tsx`): IntersectionObserver,
  threshold 0.15, rootMargin `-10%`, fade-in + translateY 32px → 0, easing standard,
  700ms, **run-once**.
- Hover de card: `transition-transform duration-base ease-standard`, escala apenas
  a imagem `group-hover:scale-[1.03]`, NÃO o card todo.
- Hover de botão: 200ms fade.
- `prefers-reduced-motion: reduce` → desabilita reveal e transições > 200ms.

❌ NUNCA `scroll-behavior: smooth` em html/body
❌ NUNCA cursor glow / parallax global / scroll jacking

## CSP

`next.config.mjs` injeta CSP restritivo em todas as rotas. Permite Cloudinary, Unsplash,
Google Maps embed, Google Fonts, MercadoPago endpoints.

## Multi-PC (lição Kore Tech)

- Cookie sem `domain` hardcoded (default = host atual).
- `secure: true` automático em prod.
- Auth funciona em browsers anônimos.
- Smoke checklist: Chrome desktop, Firefox desktop, Chrome mobile, viewport 320–1920px.
