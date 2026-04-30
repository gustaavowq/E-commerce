# DE: frontend | PARA: techlead | 2026-04-29 23:30

## Status

Frontend Marquesa implementado.
- ✅ `npm install` ok (398 pacotes)
- ✅ `npm run typecheck` zero erros
- ✅ `npm run build` ok (19 rotas geradas, build standalone pra Docker prod)

App único Next.js 14 com loja pública + painel admin/analista, role-based routing via middleware + RoleGate client-side.

## Arquivos criados (estrutura macro)

```
projetos/marquesa/frontend/
├── package.json + tsconfig.json + Dockerfile + .dockerignore
├── next.config.mjs           CSP restritivo + standalone output
├── tailwind.config.ts        Tokens via CSS vars (paper/ink/moss)
├── postcss.config.mjs
├── .env.example
├── README.md
└── src/
    ├── app/
    │   ├── layout.tsx        next/font/google (Cormorant + Inter), metadata SEO
    │   ├── globals.css       Tokens replicados (preserva fonte de verdade em design/tokens.css)
    │   ├── providers.tsx     QueryClient + auth hydration via /api/auth/me
    │   ├── not-found.tsx
    │   ├── (loja)/
    │   │   ├── layout.tsx                Header + Footer
    │   │   ├── page.tsx                  Home (hero + destaques + sobre + contato)
    │   │   ├── imoveis/page.tsx          Catálogo + FiltersBar + paginação
    │   │   ├── imoveis/[slug]/
    │   │   │   ├── page.tsx              PDP (galeria + ficha + mapa + similares)
    │   │   │   ├── ImovelActions.tsx     Botões reservar/lead
    │   │   │   └── ViewTracker.tsx       POST /:slug/view 1x/sessionStorage
    │   │   ├── sobre/page.tsx
    │   │   ├── contato/page.tsx
    │   │   └── policies/{reserva,privacidade}/page.tsx
    │   ├── auth/
    │   │   ├── layout.tsx
    │   │   ├── login/{page,LoginForm}.tsx        Respeita ?redirect= + role
    │   │   ├── register/{page,RegisterForm}.tsx
    │   │   └── forgot-password/page.tsx
    │   └── painel/
    │       ├── layout.tsx                Sidebar + RoleGate
    │       ├── RoleGate.tsx              Bloqueia USER no client
    │       ├── page.tsx                  Dashboard 9 KPIs + funil
    │       ├── imoveis/page.tsx          Tabela + busca + filtro status
    │       ├── imoveis/novo/page.tsx
    │       ├── imoveis/[id]/page.tsx     Edit + soft-delete
    │       ├── reservas/page.tsx         Cancelar/extender/converter
    │       ├── clientes/page.tsx         Read-only
    │       ├── leads/page.tsx            Read-only
    │       └── settings/page.tsx
    ├── components/
    │   ├── ui/        Button, Input/Textarea, Select, Modal, StatusBadge
    │   ├── loja/      Header, Footer, Hero, ImovelCard, ImovelGrid, FiltersBar,
    │   │              PdpGallery, PdpMap, LeadForm, ReservaCheckout
    │   ├── painel/    PainelSidebar, KpiCard, FunnelChart, ImovelTable, ImovelForm
    │   └── effects/   ScrollReveal (IntersectionObserver run-once)
    ├── lib/           api.ts, format.ts, microcopy.ts, queryClient.ts
    ├── stores/        authStore.ts (Zustand)
    ├── hooks/         useAuth, useImoveis, useReserva
    ├── types/         api.ts (User, ImovelListItem, ImovelDetail, ImovelWritePayload, Reserva, Lead, KPIs)
    └── middleware.ts  Gate /painel/* + redirect logado em /auth/*
```

## Decisões UX que tomei

1. **App único, role-based no client + middleware híbrido.** Middleware Next só verifica presença do cookie `access_token` (cheap). RoleGate.tsx valida o role real via `GET /api/auth/me` no boot. Ordem de redirect:
   - `/painel/*` sem cookie → `/auth/login?redirect=/painel/...`
   - `/painel/*` com cookie + role USER → `/`
   - `/auth/login` logado → `?redirect=` se houver, senão home
2. **Login form respeita `?redirect=` exatamente** (lição `feedback_login_redirect_padrao.md`). Sem param, ADMIN/ANALYST → `/painel`, USER → `/`.
3. **ScrollReveal estilo Cisco** — uso intensivo na home, PDP e páginas institucionais. IntersectionObserver, threshold 0.15, run-once, fade + translateY 32px → 0, 700ms easing standard. `prefers-reduced-motion` → reveal direto.
4. **Hover só na imagem do card** (`group-hover:scale-[1.03]`), não no card todo (lição `feedback_qualidade_visual_gustavo.md`).
5. **Galeria PDP** com thumbnails laterais desktop e strip horizontal mobile. Lightbox abre no click da foto principal, ESC + setas teclam.
6. **ReservaCheckout** redireciona pra MP via `mpInitPoint` (window.location). Se o user não está logado, manda pra `/auth/login?redirect=/imoveis/[slug]` ANTES de criar reserva — evita reserva órfã.
7. **Tipos write/read separados:** `ImovelDetail` (read) ≠ `ImovelWritePayload` (write) com optional onde faz sentido (lição `feedback_tipos_write_read_separados.md`).
8. **Cookie sem domain hardcoded:** o backend já faz a coisa certa, mas confirmei no fluxo (credentials: 'include' no fetch). Multi-PC garantido (lição Kore Tech).
9. **CSP restritivo em next.config.mjs** já libera Cloudinary, Unsplash, Google Maps embed, Google Fonts.
10. **microcopy.json** importado tipado via `src/lib/microcopy.ts`. Strings centralizadas; copywriter altera o JSON e o app reflete.

## Endpoints consumidos

Público (loja):
- `GET /api/imoveis` (filtros tipo/bairro/preco/quartos/destaque/sort/page/limit)
- `GET /api/imoveis/:slug`
- `POST /api/imoveis/:slug/view` (analytics não-bloqueante)
- `POST /api/leads`

Auth:
- `POST /api/auth/login | register | logout | forgot-password`
- `GET /api/auth/me`

Cliente logado:
- `POST /api/reservas` → usa `mpInitPoint` pra redirect MP

Admin (ADMIN/ANALYST):
- `GET/POST/PATCH/DELETE /api/admin/imoveis[/:id]`
- `GET /api/admin/reservas` + `PATCH /api/admin/reservas/:id` (action: cancelar/extender/converter)
- `GET /api/admin/clientes`
- `GET /api/admin/leads` (com fallback `/api/leads` caso o backend não exponha admin/leads)
- `GET /api/admin/dashboard/summary` (com fallback `/api/admin/dashboard/kpis`)

## ⚠️ Atenção / pendências

1. **Painel/leads:** backend mensagem cita `/api/admin/clientes/...` mas não fala explicitamente de `/api/admin/leads`. Coloquei fallback pra `/api/leads`. **Backend, confirma se há endpoint admin de leads** — se não tiver, eu já trato graciosamente.
2. **Dashboard:** chama `/api/admin/dashboard/summary` (bundle ideal). Backend message lista `/api/admin/dashboard/kpis|series` — coloquei fallback pra `kpis`. Se o shape divergir do que defini em `types/api.ts > DashboardKpis`, ajusta lá ou me avisa.
3. **Funnel + topImoveis no dashboard:** opcional na resposta da API (renderiza só se vier preenchido). Se backend ainda não tem, dashboard mostra só os 9 KPIs sem quebrar.
4. **Páginas institucionais:** `/sobre` e policies estão como JSX hardcoded (cópia fiel dos .md). Mais barato manter que rodar pipeline MDX. Se Copywriter atualizar, vale rodar diff.
5. **Imagens externas:** `next.config.mjs` libera `images.unsplash.com` + `res.cloudinary.com` + `placehold.co`. Se backend usar outro CDN, adicionar lá.
6. **Fontes:** Cormorant Garamond + Inter via `next/font/google` (free, build inclui). Quando licenciar Canela/Söhne, troca-se as CSS vars `--font-display`/`--font-sans`. Sem mudança no código.
7. **Páginas que precisam de Suspense (useSearchParams):** já wrappei `LoginForm` e `RegisterForm` em Suspense + marquei `/imoveis` como `dynamic = 'force-dynamic'`. Build limpou.
8. **Smoke test pendente:** sem backend rodando agora não pude testar fluxo real (login → catálogo → PDP → reserva). Cliente-side errors detectáveis com browser real apenas quando backend estiver up.

## Validação local

- `npm install` → 398 pacotes ok
- `npm run typecheck` → 0 erros
- `npm run build` → 19 rotas, standalone bundle ok
- `npm run dev` → sobe em :3000, todas as rotas resolvem
- DevTools sem warning de CSP no esqueleto (testado em pages estáticas; com backend/imagens reais rodar Smoke Browser)

## Próximos passos sugeridos

1. **DevOps:** subir docker-compose com `gustavo-marquesa-{api,web,db}`. Web mapeia `127.0.0.1:8210`.
2. **QA:** smoke E2E completo — login (USER + ADMIN), catálogo com filtros, PDP, lead form, reserva (até MP redirect), painel CRUD imóvel, dashboard.
3. **Copywriter:** se ajustar microcopy.json, frontend reflete sem rebuild de schema (string-only).
4. **Backend:** confirmar shape do `/api/admin/dashboard/summary`. Se não existir, criar; o frontend já tem fallback decente pra evitar dashboard quebrado.

Build: ✅ OK
Typecheck: ✅ OK
Smoke browser real: ⚠️ pendente (precisa backend + DB rodando)
