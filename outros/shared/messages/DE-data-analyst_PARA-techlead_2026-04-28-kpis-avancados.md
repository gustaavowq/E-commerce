# DE: data-analyst | PARA: techlead | 2026-04-28

## 5 KPIs avançados pro painel ficar tier-1 (cohort, RPV, repeat, hourly, cancel)

> Painel hoje cobre o básico (receita, pedidos, AOV, conversão, top categorias, funil, persona). Pra alcançar padrão Stripe / Shopify 2026 faltam 5 KPIs. Entrega aqui é só **types canônicos + service stubs com fallback isStub**. Backend implementa endpoints depois — service compila e roda hoje, retornando isStub=true até endpoint existir.

Arquivo único tocado: `dashboard/src/services/admin-kpis-v2.ts`. Zero UI, zero backend.

---

## 1. Cohort retention

**Fórmula** — Cohort = mês do primeiro pedido pago do cliente. `returnedAt.dN` = `COUNT(DISTINCT user)` que fez ≥1 pedido pago em `[primeiroPedido + 1d, primeiroPedido + Nd]` ÷ `cohort.signups` × 100. Janelas: 30, 60, 90 dias.

**Visualização** — matriz heatmap. Eixo Y = `cohortMonth` (mais recente em cima), eixo X = `d30 / d60 / d90`. Célula = % retorno (0–100), com gradiente verde claro → escuro. Padrão Mixpanel / Amplitude.

**Onde colocar** — aba dedicada `/dashboard/retention` (não cabe na home, é exploratório). Link na sidebar do painel sob "Análises".

**Schema backend** — não precisa migration, só agregação SQL custosa. Cache 1h.

## 2. RPV (Revenue Per Visitor)

**Fórmula** — `revenue / visitors` por dia. Visitors = sessões únicas. KPI rei do Shopify 2026 porque sintetiza tráfego + conversão + ticket numa métrica só.

**Visualização** — line chart com eixo duplo. Linha 1 = receita (R$), linha 2 = visitors (qty), barra/area secundária = RPV em destaque. 30 pontos default.

**Onde colocar** — home, linha 2 (logo abaixo dos 4 KpiCards). Substitui ou acompanha o gráfico atual `/admin/dashboard/revenue`.

**Schema backend** — precisa fonte de visitors. Opções:
1. **GA4 Data API** — pega session count via service account (preferido, zero schema novo).
2. **Tabela própria** `SessionPageview(id, sessionId, pageType, createdAt)` — mais trabalho, mas dado nosso. Schema sugerido se Growth ainda não tiver tracking GA configurado.

Sem fonte de visitors, retornar `isStub=true` e visitors=0 em todos os pontos.

## 3. Repeat customer rate

**Fórmula** — `repeatRatePercent = fromRepeatCustomers / totalOrders * 100`. Pedido é "repeat" se o customer já tinha ≥1 pedido pago anterior ao `created_at` desse pedido.

**Visualização** — donut chart (new vs repeat) + número grande do percentual ao centro. Card lateral lista top 5 clientes recorrentes (link pra `/customers/[id]`).

**Onde colocar** — home, linha 3 ao lado de `Top categorias`. Sinaliza saúde de retenção.

**Schema backend** — não precisa migration. Query agregada com window function (count anterior por customer).

## 4. Hourly heatmap (7 × 24)

**Fórmula** — pra cada `(dayOfWeek, hour)` em UTC, `COUNT(Order)` e `SUM(Order.total)` em `PAID|PREPARING|SHIPPED|DELIVERED`. Backend retorna SEMPRE 168 células (mesmo zeradas).

**Visualização** — grid 7×24. Linhas = Dom..Sab, colunas = 0..23h. Célula = pedidos (cor = intensidade, hover = receita do bucket). Pico em destaque com label "pico: Sex 21h — 14 pedidos".

**Onde colocar** — aba `/dashboard/operacao` junto com tempo de BTO e estoque. Foco operacional: quando reforçar atendimento, quando empurrar campanha de Pix.

**Schema backend** — não precisa migration. Frontend converte UTC → TZ da loja (settings.timezone).

## 5. Cancelamento ratio

**Fórmula** — `ratioPercent = totalCancelled / (totalPaid + totalCancelled) * 100`. `totalPaid` cobre os 4 status de pago confirmado. Período padrão 30d.

**Visualização** — KpiCard número grande + sparkline 14d + linha "principal motivo: pagamento recusado (42%)" abaixo (só se backend trackar motivo).

**Onde colocar** — home, linha 1 como **5º KpiCard** (vira `KpiOverview` extendido) — ou dedicada na aba `/dashboard/operacao`. Recomendo home: cancel é prioridade pra dono.

**Schema backend** — pra `topCancelReason` precisa migration. Duas opções:
1. **Campo simples** — `Order.cancelReason text NULL` (preencher quando admin cancela com motivo no painel).
2. **Tabela auditoria** — `OrderCancelLog(id, orderId, reason, cancelledByUserId, cancelledAt)`. Recomendo essa, prepara pra "histórico de cancelamentos do pedido X" e pra `cancel by AdminUser vs auto-cancel webhook`.

Sem migration, `topCancelReason` retorna `undefined` e UI esconde a linha.

---

## 6. Service contracts adicionados

Em `admin-kpis-v2.ts`, seção 11.5:

| Type | Service function | Endpoint sugerido |
|------|------------------|-------------------|
| `CohortRow` | `getCohortRetention(range)` | `GET /admin/dashboard/cohort-retention` |
| `RpvPoint` | `getRpv(range)` | `GET /admin/dashboard/rpv` |
| `RepeatCustomerStats` | `getRepeatCustomerStats(range)` | `GET /admin/dashboard/repeat-customers` |
| `HourlyHeatmap` | `getHourlyHeatmap(range)` | `GET /admin/dashboard/hourly-heatmap` |
| `CancelRatio` | `getCancelRatio(range)` | `GET /admin/dashboard/cancel-ratio` |

Todas seguem padrão do arquivo: usam `get<T>` do `lib/api`, query via `rangeToQuery(range)`, resposta envelopada em `KpiPayload<T>` com `wrap()`. Cada uma tem `try/catch` que devolve fallback vazio com `isStub=true` enquanto backend não responde — UI já pode renderizar skeleton + tooltip de stub sem quebrar.

Helper novo `labelForRange(range)` pra string humana do período (usado no `CancelRatio.period` em fallback).

## 7. Validação

- `npx tsc --noEmit -p dashboard/tsconfig.json` → 0 erros.
- Service compila e roda mesmo com endpoint inexistente (catch + fallback).
- Convenções respeitadas: `MetricDelta`, `KpiPayload`, `KpiPeriod`, `rangeToQuery`, `wrap` reusados.

## 8. Próximo passo sugerido

1. **Backend** implementa os 5 endpoints (priorizar repeat-customers e cancel-ratio — mais simples e mais visíveis).
2. **Backend** cria `OrderCancelLog` (migration) se topo de prioridade.
3. **Frontend** consome em ordem: cancel ratio (KpiCard novo na home) → repeat customer (donut linha 3) → RPV (line chart linha 2) → hourly heatmap (aba operação) → cohort (aba retention).
4. **Growth** decide fonte de visitors do RPV (GA4 vs schema próprio).

— data-analyst
