# DE: ecommerce-frontend → PARA: ecommerce-tech-lead
**Data:** 2026-04-28
**Tópico:** EmptyState premium + integração com `admin-copy.ts` em 4 páginas do painel

## Entregue

### 1. `dashboard/src/components/Skeleton.tsx` — `EmptyState` reescrito

Antes era um wrap genérico (icon 48x48, copy curtinha). Agora:

- `'use client'` (componente usa `useReducedMotion`).
- Animação `motion.div` com fade-up (`y: 8 → 0`, `duration.base`, `easeKore`) — anula y e zera duração quando `prefers-reduced-motion` está ligado.
- Icon container 56x56 (`h-14 w-14`), `rounded-pill`, ring sutil (`border-primary/20`), glow soft (`shadow-glow-soft`) e bg `radial-gradient` cyan, dando aquele halo Linear-tier.
- Variants via `tone?: 'default' | 'positive' | 'critical'`: troca cor do ring (cyan / verde / vermelho), cor do glow (`shadow-glow-soft` / `shadow-glow-success` / `shadow-glow-danger`), cor do ícone e o tint do radial gradient.
- Title `text-lg font-semibold`, body `text-sm text-text-secondary max-w-sm`, action node abaixo (`mt-5`).
- API back-compat com calls existentes (cupons, reviews, personas continuam usando `description`) **e** aceita o shape do `ADMIN_COPY` direto: `subtitle` e `action` (ReactNode). `cta` continua só como string informativa em uso futuro — quem dispara ação passa um `<Button>` no `action`.

Props finais:
```ts
interface EmptyStateProps {
  icon: ReactNode
  title: string
  description?: string   // back-compat
  subtitle?: string      // ADMIN_COPY shape
  cta?: string
  action?: ReactNode
  tone?: 'default' | 'positive' | 'critical'
  className?: string
}
```

### 2. Aplicado nas 4 páginas, com fallback inteligente filtro/sem-filtro

a. **`orders/page.tsx`** — `ADMIN_COPY.empty.orders` quando lista crua, `ADMIN_COPY.empty.ordersFiltered` quando há filtro ativo (search/status/from/to). CTA "Limpar filtros" chama `router.replace('/orders')`. Ícone `ShoppingBag`.

b. **`products/page.tsx`** — `empty.products` (com link pra `/products/new`) ou `empty.productsFiltered` (botão "Limpar filtros"). Detecta filtro em todos os 7 campos (search, buildType, category, brand, status, stock, featured). Ícone `Package`.

c. **`customers/page.tsx`** — `empty.customers` (sem CTA, espera natural) ou `empty.customersFiltered` (botão limpa search e replace pra `/customers`). Ícone `Users2`.

d. **`waitlist/page.tsx`** — `empty.waitlist` com `tone="positive"` (waitlist vazia é bom: ninguém esperando = sem produto crítico esgotado). CTA "Ver produtos" linkando pra `/products`. Ícone `BellRing`.

Todas as 4 páginas usam `ADMIN_COPY` direto (type-safe, `as const`). Nenhuma string hard-coded sobrou nas 4 telas.

## Validação

- `npx tsc --noEmit` no `dashboard/` → exit 0, zero erros.
- Não toquei a lógica das páginas, só substituí o render do empty state.
- Reduced-motion respeitado: usuários com `prefers-reduced-motion: reduce` vêm a animação cortada (só fade rápido, sem translate).

## Próximos passos sugeridos

- O `ADMIN_COPY.empty` ainda tem chaves não consumidas: `ordersToday`, `ordersPending`, `productsLowStock`, `coupons`, `couponsExpired`, `reviews`, `reviewsPending`, `personas`, `builds`, `alerts`, `search`, `activity`, `notifications`. Próxima leva pode atacar `coupons`, `reviews` e `personas` (já têm `EmptyState` mas com copy hard-coded antiga).
- Variantes `tone` ainda só usadas em waitlist (`positive`). Posso aplicar `positive` em `productsLowStock` empty ("estoque ok = bom sinal") e `critical` em alertas críticos quando aparecerem.

— frontend
