# Designer → Tech Lead — Design system do painel admin

**De:** ecommerce-designer
**Pra:** Tech Lead (e demais agentes)
**Data:** 2026-04-28
**Escopo:** tokens + utilities + presets de motion (Linear/Vercel-tier)

## O que entreguei

Repo: `C:\Users\gu\AppData\Local\Temp\kore-migration\E-commerce-tech\`

1. **NOVO** `dashboard/src/styles/admin-tokens.css` — utilities CSS premium do painel
2. **ATUALIZADO** `dashboard/tailwind.config.ts` — ease-kore, durações fast/base/slow, novos colors `surface.elevated` + `border.subtle`, keyframes shimmer/slide/fade-up-sm, transitionDelay 100/200/300
3. **NOVO** `dashboard/src/lib/motion-presets.ts` — presets canônicos pra Framer Motion

Frontend agente: importa `admin-tokens.css` no topo do `globals.css` (`@import '../styles/admin-tokens.css';`) e instala `framer-motion` (não está em package.json).

## Linguagem visual do painel

- **Cor principal:** mesmo cyan #00E5FF da loja (`primary.DEFAULT`)
- **Bg:** `#0A0E14` puro
- **Surface elevation:** `surface` < `surface-2` < `surface-3` < `surface.elevated` (glass)
- **Filosofia:** WORKSPACE > hero. Spotlight + grid mais SUTIS que loja (opacity 0.04 e 0.015)

## Hierarquia tipográfica admin

| Token | Class Tailwind | Uso |
|---|---|---|
| Display H1 | `text-3xl font-bold tracking-tight font-display` | Page title (Dashboard, Pedidos, Produtos) |
| H2 seção | `text-2xl font-semibold tracking-tight` | Bloco principal (KPIs, Últimos pedidos) |
| H3 card | `text-base font-semibold` | Título de KpiCard, ListCard |
| Body | `text-sm leading-relaxed text-text` | Conteúdo geral de tabelas/forms |
| Caption | `text-xs text-text-secondary` | Labels, helper text, timestamps |
| Number | `font-mono tabular-nums num-mono` | KPIs, R$, contagens, IDs |

## Componentes-chave (specs visuais)

- **KpiCard:** `card-admin` + padding `p-6`, label `text-xs uppercase tracking-wider text-text-secondary`, número `text-3xl num-mono`, sparkline 40px height, comparison badge `text-xs` com seta lucide. Hover = border primary/40 + shadow-glow-soft + lift 1px.
- **SidebarNav:** width 240px expanded / 64px collapsed, item height 36px, active state = bg `primary/10` + border-left 2px primary + text primary. Transition `duration-fast ease-kore`.
- **DataTable row:** height 52px, hover = `bg-surface-2`, selected = `bg-primary/5 border-l-2 border-primary`. Header sticky com `bg-surface/95 backdrop-blur` + border-bottom strong.
- **EmptyState:** `flex-col items-center py-16`, icon lucide 48px text-muted, title `text-lg font-semibold`, helper `text-sm text-text-secondary max-w-md text-center`, CTA primário (não outline).
- **Toast:** `glass` utility + radius lg + shadow-xl, slide-in-right preset, auto-dismiss 4s, ícone status à esquerda.
- **ConfirmDialog:** `glass` + scaleIn preset + backdrop fade-in. Botão danger destacado, cancelar como ghost.
- **CommandPalette:** modal full-width `max-w-2xl`, `glass` + scaleIn, input height 56px, item height 44px, kbd hints à direita usando `.kbd`.

## Spacing scale recomendada

- Page padding: `px-6 py-8` (md+) / `px-4 py-6` (mobile)
- Gap entre seções: `space-y-8` (use `section-divider-admin` quando precisar marcar quebra)
- Grid de KPIs: `grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4`
- Card interno padding: `p-6` (KPI) / `p-4` (list item) / `p-8` (forms)
- Form field gap: `space-y-5`

## Hover state padrão (usar em TUDO clickable)

```tsx
className="card-admin"  // CSS class já define hover completo
// OU em components custom:
className="border border-border transition-all duration-base ease-kore
           hover:border-primary/40 hover:shadow-glow-soft hover:-translate-y-px"
```

## Motion canônico

- Importar de `@/lib/motion-presets` (`fadeUp`, `scaleIn`, `slideInLeft`, `pageTransition`, `staggerContainer/Item`, `springSnappy`, `springGentle`, `cardHover`, `magneticPress`)
- `pageTransition` no `template.tsx` do App Router
- `springSnappy` em KPI counters (AnimatedNumber) e badge changes
- `springGentle` em sidebar toggle e modal open
- SEMPRE checar `useReducedMotion()` antes de aplicar — usar helper `withoutMotion()` exportado

## Utilities CSS novas (admin-tokens.css)

`canvas-spotlight-admin`, `grid-admin`, `bg-noise-admin`, `section-divider-admin`, `live-dot` (+ `live-dot--cyan`), `kbd` (+ `kbd--lg`), `scrollbar-thin`, `glass`, `shimmer-skeleton`, `card-admin`, `focus-ring-kore`. Todas com `prefers-reduced-motion` honrado.

## Anti-padrões (proibido)

- `animate-pulse` genérico do Tailwind em loading → usar `shimmer-skeleton`
- Cursor glow seguindo viewport, parallax forçado, scroll-jacking
- Aurora ambient ou mesh-gradient pan no painel (workspace, não hero)
- Border 2px nos cards (sempre 1px — admin é denso)
- Animação de hover > 280ms (admin precisa responder rápido)

## O que NÃO fiz

- Não toquei em código de página/componente (escopo respeitado)
- Não criei copy ou strings (copywriter)
- Não defini shape de KPI (data-analyst)
- Não instalei framer-motion (frontend faz no setup)

## Riscos / dúvidas

- `framer-motion` precisa ser adicionado no `package.json` do dashboard — frontend agente, atenção. Sem ele o `motion-presets.ts` falha em build (só importa types, mas TS resolve no node_modules).
- `admin-tokens.css` precisa ser importado no `globals.css` do dashboard. Sugestão de linha (frontend já vai mexer): `@import '../styles/admin-tokens.css';` antes do `@tailwind base`.

## Próximas dependências

- Frontend: pode começar a usar TUDO acima sem esperar. Tokens já prontos.
- Copywriter: quando definir empty state copy, sugerir tom condizente com o brief (sem travessão, profissional curto).
- Data-analyst: ao definir formato de KPI, lembrar que o display usa `num-mono` + AnimatedNumber.

Commit isolado feito conforme orientação. PR não, push direto na main do repo.
