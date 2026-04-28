# BRIEF — Redesign completo do painel admin Kore Tech

**De:** Tech Lead
**Pra:** Todos os 8 agentes
**Data:** 2026-04-28
**Cliente:** Gustavo (proprietário do framework)
**Modo:** Carta-branca, --dangerously-skip-permissions

## Contexto

Acabamos de redesignar a loja (kore-tech-loja.vercel.app) elevando ao
padrão Apple/Linear/Vercel:
- Canvas profissional (spotlight + grid-fine + bg-noise + section dividers)
- Cena 3D procedural Three.js no hero
- Tilt3D + Framer Motion (layoutId, AnimatedNumber, MagneticButton)
- Stats row + brand bar Linear-style
- ProductGallery com layoutId + SpecsTable collapsible
- SearchBar redesign Algolia-tier (autocomplete live, recent, popular)
- Builder com Number tween + tab rail + pulse on update

Agora **redesign integral do painel admin** (kore-tech-painel.vercel.app)
com a mesma qualidade. Cliente disse: "tem que me impressionar em
qualidade animacao resultado boniteza ui ux tudo".

## Repo de trabalho

`C:\Users\gu\AppData\Local\Temp\kore-migration\E-commerce-tech\`

Estrutura plana: `backend/`, `frontend/`, `dashboard/`, `infra/`.
Cada agente toca APENAS sua área. **Zero conflito de arquivos.**

## Princípios não-negociáveis

1. **Zero loop ambient sem propósito** — sem aurora flutuante, scroll-jacking, parallax forçado, cursor glow following viewport
2. **Animações respondem a ação** (mount, hover, click, state change, scroll-in-view) ou tem semântica de status (live-dot, loading)
3. **prefers-reduced-motion respeitado em tudo** (`useReducedMotion()` ou CSS media query)
4. **Validar visual antes de declarar fechado** (`memoria/50-PADROES/validar-visual-antes-de-fechar.md`)
5. **Cada agente faz commit incremental** com prefixo do role: `feat(painel-frontend): ...`
6. **Reportar em `outros/shared/messages/DE-{role}_PARA-techlead_2026-04-28-painel-{topico}.md`**

## Stack do painel (não muda)

- Next.js 14.2.x App Router + React 18
- Tailwind 3.4 (extends preset do projeto)
- Zustand (auth state já existente)
- TanStack Query 5
- react-hook-form + zod
- Framer Motion (instalar se não tiver)
- Recharts (já instalado, manter)
- lucide-react

## Estrutura existente do painel

`dashboard/src/app/`:
- `(admin)/` — rotas admin
- `login/` — auth
- `layout.tsx`, `globals.css`, `providers.tsx`, `error.tsx`, `not-found.tsx`

(o agente Frontend faz mapa completo via Explore se precisar)

## Divisão de responsabilidades (zero overlap)

### 🎨 ecommerce-designer
**Toca:** `dashboard/src/styles/admin-tokens.css` (NOVO), `dashboard/tailwind.config.ts` (extends)
**Não toca:** código de página/componente
**Entrega:** design system do painel — tokens canônicos (cores admin-tier, ease-kore, durações, shadows premium, kbd hints, sidebar widths). Plus brief em mensagem.

### 📊 ecommerce-data-analyst
**Toca:** `dashboard/src/services/admin-kpis.ts` (NOVO — só types/contracts), `outros/shared/messages/DE-data-analyst_*`
**Não toca:** routes do backend (delega pro backend), UI (delega pro frontend)
**Entrega:** specs dos KPIs (revenue today/week/month + comparison, orders count, AOV, conversion, top products, low stock, repeat customer rate). Define payloads esperados em TypeScript types.

### ✍️ ecommerce-copywriter
**Toca:** `dashboard/src/lib/admin-copy.ts` (NOVO)
**Não toca:** componentes (frontend importa)
**Entrega:** library de microcopy — empty states ("Sem pedidos hoje. Volta amanhã pra ver os primeiros."), confirm dialogs ("Deletar produto X? Não tem volta."), success/error toasts, section headers. Voice: profissional curto, sem travessão, sem tom IA.

### 🔧 ecommerce-backend
**Toca:** `backend/src/routes/admin-kpis.ts` (NOVO), `backend/src/server.ts` (mount route)
**Não toca:** dashboard, frontend
**Entrega:** endpoints REST pros KPIs definidos pelo data-analyst. Conforme types do `admin-kpis.ts`. JWT admin-only middleware. Cache 60s onde fizer sentido.

### 💻 ecommerce-frontend ⭐ (worker principal)
**Toca:** `dashboard/src/app/(admin)/**`, `dashboard/src/components/**` (exceto admin-copy.ts e admin-kpis.ts)
**Não toca:** backend, design tokens raw (importa), copy library raw (importa)
**Entrega:** painel completo redesignado:
- Layout master (sidebar collapsible Linear-style + topbar)
- Page transitions (template.tsx fade)
- Dashboard home com KPI cards (AnimatedNumber + sparkline + comparison)
- DataTable v2 (sticky header + sort + filter inline + bulk actions + row hover)
- Forms com validação live + error inline
- Empty states usando admin-copy
- Loading skeletons que não são pulse genérico
- Toasts elegantes (Sonner ou react-hot-toast)
- Command palette Cmd+K
- Dark theme coerente com a loja
- Tilt3D nos cards onde fizer sentido
- LayoutId animations em tabs/filtros
- prefers-reduced-motion em tudo

### 📈 ecommerce-growth
**Toca:** `dashboard/src/lib/analytics-events.ts` (NOVO)
**Não toca:** UI raw (frontend importa eventos)
**Entrega:** catálogo de events admin (admin_login, kpi_card_clicked, product_edit_started, order_status_changed, etc) + helper `track(event, props)`.

### 🚀 ecommerce-devops (round 2 — depois de R1 commitado)
**Toca:** `dashboard/.vercel/`, `vercel.json`, env vars
**Entrega:** confirma deploy do painel após push, smoke test URL pública.

### ✅ ecommerce-qa (round 3 — depois do deploy)
**Entrega:** smoke E2E + bug bash do painel novo. Aprovação ou lista de fixes.

## Padrões pra reusar (já provados na loja)

- **`canvas-spotlight`**, **`grid-fine`**, **`bg-noise`**, **`section-divider`** (CSS classes)
- **`AnimatedNumber`** (count-up tween) — `frontend/src/components/motion/AnimatedNumber.tsx`
- **`Tilt3D`** — `frontend/src/components/motion/Tilt3D.tsx`
- **ease-kore** = `cubic-bezier(0.32, 0.72, 0, 1)`
- **Spring padrão**: `{ stiffness: 380, damping: 40 }`

Pode COPIAR esses arquivos pro `dashboard/src/...` e reusar — admin merece o mesmo carinho.

## Definição de pronto

- [ ] TS limpo em backend e dashboard
- [ ] Build Vercel verde
- [ ] Smoke E2E aprovado pelo QA
- [ ] Reduced motion respeitado
- [ ] Mobile responsivo (320px+) sem overlap
- [ ] Memória atualizada com aprendizados

## Ordem temporal

1. **Round 1 (em paralelo, ~30min):** designer + data-analyst + copywriter + backend + frontend + growth
2. **Round 2 (~5min):** devops faz deploy
3. **Round 3 (~10min):** qa valida

Tech-lead consolida + reporta status pro user a cada round.

## Comunicação

Cada agente termina com **UMA mensagem** em `outros/shared/messages/DE-{role}_PARA-techlead_2026-04-28-painel-{topico}.md` resumindo:
- O que fez (paths)
- O que NÃO conseguiu fazer e por quê
- Riscos/dúvidas
- Próximas dependências

**Não pingar a cada arquivo. Uma mensagem no final.**

🚀 **GO**
