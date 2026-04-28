# DE: backend → PARA: techlead (2026-04-28)

## Assunto: 5 endpoints novos pros KPIs avançados (cohort/rpv/repeat/hourly/cancel)

Entrega backend pronta. Sem migration nova — tudo derivado do schema atual (Order/User/Cart/Payment).

## Paths novos

Todos sob `/api/admin/dashboard/*` — protegidos por `requireAuth + requireRole('ADMIN')` no router master (`backend/src/routes/admin/index.ts:20`). Cache 60s via `cached()` em todos os 5.

| Path | Query aceita | Resp |
|---|---|---|
| `GET /admin/dashboard/cohort-retention` | `?period=7d\|30d\|90d\|ytd\|custom&from=&to=` (default 90d) | `Array<{cohortMonth, signups, returnedAt:{d30,d60,d90}}>` |
| `GET /admin/dashboard/rpv` | mesmo (default 30d) | `Array<{date, revenue, visitors, rpv}>` |
| `GET /admin/dashboard/repeat-customers` | mesmo (default 30d) | `{period, totalOrders, fromRepeatCustomers, repeatRatePercent, newVsRepeat:{newCount,repeatCount}}` |
| `GET /admin/dashboard/hourly-heatmap` | mesmo (default 30d) | `{period, cells:[168×{dayOfWeek,hour,orders,revenue}], peakDay, peakHour, peakOrders}` |
| `GET /admin/dashboard/cancel-ratio` | mesmo (default 30d) | `{period, totalPaid, totalCancelled, ratioPercent}` |

## Snippets das queries

### cohort-retention
CTE com `paid_orders` no período + `user_first` (MIN(paid_at) por user). Pra cada user pega `EXISTS` em janelas d30/d60/d90 a partir do primeiro pedido. Agrupa server-side por `YYYY-MM` do `user.createdAt`.

```sql
WITH paid_orders AS (
  SELECT o.user_id, o.created_at AS paid_at FROM orders o
  WHERE o.status IN ('PAID','PREPARING','SHIPPED','DELIVERED')
    AND o.created_at >= $since AND o.created_at < $until
), user_first AS (SELECT user_id, MIN(paid_at) AS first_order_at FROM paid_orders GROUP BY user_id)
SELECT u.id, u.created_at, uf.first_order_at,
  EXISTS(...paid_at <= first_order_at + INTERVAL '30 days') AS d30_returned, ...
```

### rpv
2 queries paralelas: receita por dia (mesma do `/revenue`) + visitors proxy (`COUNT(DISTINCT COALESCE(user_id, session_id))` em `carts.created_at`). Faz join em-memory por dia + preenche dias zerados pra UI ter série contínua. `rpv = revenue / visitors`, `null` se 0 visitas (não inventa zero).

### repeat-customers
1 query única: pra cada pedido pago no período, `EXISTS` em pedidos pagos anteriores do mesmo user → flag `is_repeat`. Conta no app server.

### hourly-heatmap
`EXTRACT(DOW)` + `EXTRACT(HOUR)` agrupado. Sempre devolve 168 cells (7×24) — backend preenche zeros pra UI não quebrar grid. `peakDay` em PG-DOW (0=domingo).

### cancel-ratio
`prisma.order.count` × 2 em paralelo (status `[PAID,PREPARING,SHIPPED,DELIVERED]` vs `CANCELLED`). Ratio = cancelled / (paid+cancelled).

## Tempos estimados (Postgres com índices atuais — `orders.createdAt`, `orders.status`)

- cohort-retention 90d: 80-200ms (subqueries EXISTS escalam bem com 1k users; em 50k pode ir a 500ms — quando bater isso, materialized view).
- rpv 30d: 30-60ms (2 GROUP BY simples).
- repeat-customers 30d: 50-150ms (EXISTS por linha).
- hourly-heatmap 30d: 20-40ms (1 GROUP BY pequeno).
- cancel-ratio 30d: 10-20ms (2 counts paralelos).

Tudo bem dentro do orçamento; cache 60s mata burst de painel multi-tab.

## Issues / decisões

- **Visitors fictício real** ainda não existe — usei `Cart.createdAt + DISTINCT(user_id|session_id)` como proxy. Quando GA4 ou tabela `Visit` entrarem, troca a query do `/rpv`. Documentado no comentário.
- **Cohort = mês de `User.createdAt`** (e não mês do primeiro pedido). Combina com pergunta "quem assina e volta a comprar". Se preferir cohort de FIRST_ORDER, troco — só aviso.
- **`PAID_STATUSES`** reutilizado da constante já existente no arquivo (`PAID|PREPARING|SHIPPED|DELIVERED`) — coerente com decisão do data-analyst (`admin-kpis-v2.ts` linhas 8-12).
- **TypeScript**: `tsc --noEmit -p tsconfig.json` passa limpo (exit 0).
- **Auth**: nada novo — middleware `requireAuth + requireRole('ADMIN')` aplicado no router pai vale pros 5.

## Próximo passo

Frontend pode consumir já. Sugiro ao data-analyst alinhar tipo do `cohort-retention` no `admin-kpis-v2.ts` — hoje não tem typing canônico pro response (os outros 4 já têm).

— ecommerce-backend
