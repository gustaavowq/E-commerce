# DE: ecommerce-growth PARA: ecommerce-tech-lead — `track()` plugado em 6 componentes

Data: 2026-04-28
Repo: `kore-migration/E-commerce-tech`
Branch: `main`

## Resumo

`track()` agora está chamado em 6 call sites do painel admin Kore Tech.
Eventos vão pro buffer local (`localStorage` → 100 events) via
`dashboard/src/lib/analytics-events.ts`. Quando integrarmos Posthog/Mixpanel,
trocamos o sink sem mexer aqui.

ZERO PII em todas as props (só IDs, slugs, contagens, tipos de ação).

## Eventos plugados

| # | Arquivo | Linha | Evento | Props |
|---|---|---|---|---|
| 1 | `dashboard/src/components/CommandPalette.tsx` | ~41 (toggle Cmd+K) | `admin_command_palette_opened` | — |
| 2 | `dashboard/src/components/CommandPalette.tsx` | ~196 (`onSelect` do CmdItem) | `admin_command_palette_used` | `{ command: item.id }` |
| 3 | `dashboard/src/components/KpiCard.tsx` | ~117 (motion.button onClick) | `kpi_card_clicked` | `{ label }` |
| 4 | `dashboard/src/components/DateRangePicker.tsx` | ~64 (keyboard shortcut) e ~111 (clique no preset) | `period_changed` | `{ days, label }` |
| 5 | `dashboard/src/components/DataTable.tsx` | ~114 (após `setSort` em `onHeaderClick`) | `table_sort_changed` | `{ columnKey, direction }` |
| 6 | `dashboard/src/app/(admin)/products/page.tsx` | ~370 (`onConfirm` da ConfirmDialog do bulk) | `product_bulk_action` | `{ action, count }` |
| 7 | `dashboard/src/app/(admin)/orders/page.tsx` | ~177 (Select de status) | `order_filter_applied` | `{ status }` |

> Obs: o ponto 4 ficou em DOIS lugares pois o componente aceita atalho de teclado (D/7/3/9/Y) E clique na lista — ambos disparam preset e ambos rastreiam.

## Mudança no contrato de eventos

Adicionei um novo nome na union `AdminEventName` em `dashboard/src/lib/analytics-events.ts`:

```ts
| 'table_sort_changed'
```

Não tinha antes. Como o brief pedia `track('table_sort_changed', {...})` e a union é fechada, adicionei (a alternativa seria abrir a union, o que destrói o type-safety). Os outros 6 eventos já existiam.

## Validação

- `cd dashboard && npx tsc --noEmit` → passou limpo (sem erros).
- TS valida cada `track('nome', props)` contra a união (props são `Record<string, primitive>`, então type-safe).

## Próximos passos sugeridos

1. **QA** valida no DevTools → `localStorage.getItem('kore-admin-events')` mostra eventos sendo gravados.
2. Quando subir Posthog/Mixpanel, swap o sink em `track()` (uma função, não 6 call sites).
3. Faltam ainda: `product_filter_applied` (selects de buildType/category/brand/status/stock em products), `order_status_changed` (no detalhe do pedido), `customer_search`, `customer_detail_opened`, `alert_dismissed`, `alert_snoozed`, `alerts_run_clicked`, `export_csv`. Brief atual cobre só os 6 críticos — resto vem em iteração 2.

— growth
