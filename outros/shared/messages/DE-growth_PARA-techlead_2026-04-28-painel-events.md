# DE: growth → PARA: techlead — Painel admin: catálogo de events (analytics interno)

**Data:** 2026-04-28
**Repo:** `kore-migration/E-commerce-tech/`
**Status:** entregue (arquivo criado, pronto pra frontend importar)

## O que entreguei

Catálogo tipado de eventos de **product analytics interno** do painel admin em `dashboard/src/lib/analytics-events.ts`. Não confundir com GA4/Pixel da loja — esses eventos rastreiam o que **admins** fazem dentro do painel (não clientes finais).

## Eventos disponíveis (40 no total)

- **Auth** (3): `admin_login_success`, `admin_login_failed`, `admin_logout`
- **Navigation** (3): `admin_page_view`, `admin_command_palette_opened`, `admin_command_palette_used`
- **Dashboard** (5): `kpi_card_clicked`, `period_changed`, `alert_dismissed`, `alert_snoozed`, `alerts_run_clicked`
- **Products** (8): create/edit started/completed, `product_deleted`, `product_bulk_action`, `product_filter_applied`, `product_image_uploaded`
- **Orders** (6): `order_status_changed`, `order_filter_applied`, `order_detail_opened`, `order_invoice_downloaded`, refund started/completed
- **Customers** (2): `customer_detail_opened`, `customer_search`
- **Personas/Builds** (5): `persona_created/edited/deleted`, `build_created/edited`
- **Coupons** (2): `coupon_created`, `coupon_toggled`
- **System** (2): `export_csv`, `settings_changed`

## Como o frontend chama

```ts
import { track } from '@/lib/analytics-events'

track('product_deleted', { productId: 'abc123' })
track('order_status_changed', { orderId: 'ord_99', from: 'PAID', to: 'SHIPPED' })
track('period_changed', { period: '30d' })
```

`AdminEventName` é union fechada — TS bloqueia evento inventado. SSR-safe (no-op fora do browser). Buffer local de 100 eventos em `localStorage` (`kore-admin-events`).

## Onde frontend DEVE chamar (pontos críticos)

1. **Login** — `LoginForm.onSubmit` success/error → `admin_login_success` / `admin_login_failed` (props: `{ method: 'email' | 'google' }`)
2. **Page view** — `app/(admin)/template.tsx` em useEffect de pathname → `admin_page_view` (props: `{ path }`)
3. **Command palette** — abrir (Cmd+K) e selecionar comando → `admin_command_palette_opened/used`
4. **KPI cards** — onClick em cada card do dashboard → `kpi_card_clicked` (props: `{ kpi: 'revenue' | 'orders' | ... }`)
5. **Filtros** — onChange em filtros de produtos/pedidos → `product_filter_applied` / `order_filter_applied` (props: `{ filter, value }`)
6. **Confirms destrutivos** — após confirmação no AlertDialog → `product_deleted`, `persona_deleted`, etc
7. **Status pedido** — após PATCH /api/admin/orders/:id/status → `order_status_changed`
8. **Export** — botão exportar CSV → `export_csv` (props: `{ entity: 'orders' | 'products' }`)

## Privacy

ZERO PII em props. Use só IDs (`productId`, `orderId`, `userId`). Nada de `email`, `cpf`, `name`, `address`. `userId` no envelope é opcional e fica vazio até integração com auth context.

## Roadmap

Quando bater volume real (~100 admin sessions/dia), integrar **Posthog Cloud free tier** (1M events/mês, generoso). Swap pontual: substituir `pushBuffer(ev)` em `track()` por `posthog.capture(ev.name, { ...ev.props, sessionId: ev.sessionId })`. Call sites não mudam — toda API pública (`track`, `getRecentEvents`, `clearEvents`) fica idêntica.

`getRecentEvents()` já permite construir uma página dev `/admin/_debug/events` futuramente pra inspecionar o buffer localmente.

— growth
