# Kore Tech — KPIs do painel admin

> Owner: ecommerce-data-analyst (Sprint 1, 2026-04-26)
> Stack: Prisma 5 + PostgreSQL 16 + Express + Recharts no painel.
> Princípio: receita = `Order.total` em status `PAID|PREPARING|SHIPPED|DELIVERED`.
> Nunca inclui `PENDING_PAYMENT`, `CANCELLED`, `REFUNDED`. Nunca usa `subtotal` como receita.
> Quase tudo cacheable em 60s no painel — admin precisa de dado fresco mas não precisa de tempo real.

---

## 0. Convenções comuns

| Item | Decisão |
|---|---|
| **Período padrão** | Últimos 30 dias UTC, comparado com 30 anteriores |
| **Status "pago"** | `PAID`, `PREPARING`, `SHIPPED`, `DELIVERED` (lista explícita, sempre) |
| **Receita produto** | `Order.total - Order.shippingCost` (evita inflar com frete) |
| **Receita bruta** | `Order.total` (inclui frete — usa em ticket médio comparável com benchmark de mercado) |
| **Margem padrão** | `costPrice` no Product (campo a adicionar). Se ausente: usa 30% como fallback marcado em vermelho no painel |
| **Datas** | Sempre UTC. `DATE_TRUNC('day', created_at AT TIME ZONE 'UTC')` |
| **Divisão por zero** | Sempre `if (denom === 0) return null` ou `0` explícito |
| **Cache** | Header `Cache-Control: private, max-age=60` em endpoints pesados (groupBy + raw SQL) |

---

## 1. Ticket médio por categoria

**Por que importa:** Hardware tem range R$ 50 → R$ 25k. Ticket médio agregado é inútil. Segmentar por `componente` vs `pc_pronto` vs `periferico` vs `monitor` mostra mix real.

**Definição:**
> Receita média por pedido em cada `Product.buildType`.
> Numerador = soma de `OrderItem.subtotal` de produtos do tipo X.
> Denominador = pedidos distintos que tenham PELO MENOS 1 item daquele tipo.
> Pedidos mistos (PC + periférico) contam em AMBOS — escolha consciente, mostra interesse cruzado.

**Fórmula SQL:**
```sql
SELECT
  p.build_type,
  SUM(oi.subtotal)::float8                       AS revenue,
  COUNT(DISTINCT oi.order_id)::bigint            AS orders_with_type,
  (SUM(oi.subtotal) / NULLIF(COUNT(DISTINCT oi.order_id), 0))::float8 AS avg_ticket
FROM order_items oi
JOIN orders   o ON o.id = oi.order_id
JOIN products p ON p.id = oi.product_id
WHERE o.status IN ('PAID','PREPARING','SHIPPED','DELIVERED')
  AND o.created_at >= NOW() - INTERVAL '30 days'
GROUP BY p.build_type
ORDER BY revenue DESC;
```

**Atualização:** sob demanda + cache 60s.
**Threshold de alerta:** ticket de uma categoria caindo > 15% semana sobre semana → flag.
**Owner:** Data Analyst define, Backend valida quando schema final.

---

## 2. Funil do builder (5 etapas)

**Por que importa:** O builder é o diferencial competitivo. Saber onde o cliente desiste é crítico — talvez compatibility check assusta, talvez sugestão de upgrade da fonte espanta, talvez é o preço total que aparece no fim.

**Etapas:**
1. **Started** — clicou em "Montar PC" (evento `builder.started`)
2. **Added first part** — adicionou primeira peça, geralmente CPU (evento `builder.part_added` count = 1)
3. **Added 3+ parts** — passou da metade (CPU + mobo + RAM, mínimo de build viável) (evento `builder.part_added` count >= 3)
4. **Completed build** — todas peças obrigatórias marcadas + zero erros de compatibilidade (evento `builder.completed`)
5. **Checkout started** — clicou em "Comprar este build" (evento `builder.checkout_started`)

**Eventos pra rastrear:** Backend cria tabela `BuilderEvent` (id, sessionId, userId nullable, eventType, payload JSON, createdAt). Growth registra eventos no front. Data Analyst consome aqui.

**Fórmula (Prisma):**
```ts
const events = await prisma.builderEvent.groupBy({
  by: ['eventType'],
  where: { createdAt: { gte: since } },
  _count: { sessionId: true },  // distinct seria melhor mas Prisma não suporta — usa raw
})
// Ou raw pra DISTINCT por sessionId:
await prisma.$queryRaw`
  SELECT
    event_type,
    COUNT(DISTINCT session_id)::bigint AS sessions
  FROM builder_events
  WHERE created_at >= ${since}
    AND event_type IN ('started','part_added_first','part_added_3plus','completed','checkout_started')
  GROUP BY event_type
`
```

**Endpoint:** `GET /api/admin/dashboard/funnel-builder?from&to`
**Retorno:** `[{ stage, count, conversionRate }]` — cada etapa com % vs etapa 1.

**Atualização:** sob demanda + cache 60s.
**Threshold de alerta:** queda de > 20% entre etapas consecutivas vs semana anterior → investigar UX da etapa.
**Owner:** Data Analyst define, Growth implementa eventos no front.

⚠️ **Pendência:** se Backend não tiver criado `BuilderEvent` ainda, endpoint retorna mock determinístico até integração. Marcado `BACKEND_READY`.

---

## 3. Conversão por persona

**Por que importa:** Catálogo organizado por persona é o 2º diferencial. Saber qual persona converte melhor diz onde investir SEO/ads. Hipótese: Valorant (entry, R$ 4-5k) converte mais por volume; IA Llama 70B (R$ 25k+) converte menos por volume mas LTV maior.

**Definição:**
> Para cada persona com pelo menos um build vendido no período:
> - Visitas à landing `/builds/[persona-slug]` (evento `view_persona`)
> - Pedidos confirmados que incluíram pelo menos 1 produto com `Product.persona = X`
> - Conversão = pedidos / visitas × 100

**Fórmula SQL:**
```sql
WITH persona_orders AS (
  SELECT
    p.persona,
    COUNT(DISTINCT o.id)::bigint        AS orders,
    SUM(oi.subtotal)::float8            AS revenue
  FROM order_items oi
  JOIN orders   o ON o.id = oi.order_id
  JOIN products p ON p.id = oi.product_id
  WHERE o.status IN ('PAID','PREPARING','SHIPPED','DELIVERED')
    AND o.created_at >= NOW() - INTERVAL '30 days'
    AND p.persona IS NOT NULL
  GROUP BY p.persona
),
persona_visits AS (
  SELECT
    payload->>'personaSlug'             AS persona,
    COUNT(DISTINCT session_id)::bigint  AS visits
  FROM builder_events
  WHERE event_type = 'view_persona'
    AND created_at >= NOW() - INTERVAL '30 days'
  GROUP BY payload->>'personaSlug'
)
SELECT
  pe.slug, pe.name,
  COALESCE(pv.visits, 0) AS visits,
  COALESCE(po.orders, 0) AS orders,
  COALESCE(po.revenue, 0) AS revenue,
  CASE WHEN COALESCE(pv.visits, 0) > 0
    THEN (COALESCE(po.orders, 0)::float8 / pv.visits * 100)
    ELSE NULL
  END AS conversion_rate
FROM personas pe
LEFT JOIN persona_orders po ON po.persona = pe.slug
LEFT JOIN persona_visits pv ON pv.persona = pe.slug
ORDER BY revenue DESC NULLS LAST;
```

**Endpoint:** `GET /api/admin/dashboard/conversao-persona`
**Atualização:** sob demanda + cache 60s.
**Threshold:** persona com conversão < 0.5% e mais de 100 visitas → landing pode estar mal otimizada (mensagem pra Growth).
**Owner:** Data Analyst define, Growth implementa eventos `view_persona`.

---

## 4. Taxa de parcelamento (Pix vs 3x vs 6x vs 12x)

**Por que importa:** Pix dá 5-10% off mas não come margem de juros do parcelamento. Saber quanto da receita vai parcelado em 12x mostra o estrago real na margem (juros do MercadoPago em 12x ≈ 18-22%).

**Definição:**
> Para `OrderPayment` aprovados (`status = APPROVED`):
> - Group by `installments` (1 = à vista cartão; ou `method = PIX`).
> - Distribuição: contagem + valor + % do total.

⚠️ **Schema dependency:** `OrderPayment` precisa do campo `installments Int?` (1 = à vista). Pix conta sempre como `installments = 1` ou identificado pelo `method = PIX`.

**Fórmula:**
```sql
SELECT
  CASE
    WHEN op.method = 'PIX'             THEN 'PIX'
    WHEN op.installments = 1           THEN '1x cartão'
    WHEN op.installments BETWEEN 2 AND 3 THEN '2-3x'
    WHEN op.installments BETWEEN 4 AND 6 THEN '4-6x'
    WHEN op.installments BETWEEN 7 AND 12 THEN '7-12x'
    ELSE 'Outros'
  END AS bucket,
  COUNT(*)::bigint                     AS payments,
  SUM(op.amount)::float8               AS amount,
  (SUM(op.amount) * 100.0 / SUM(SUM(op.amount)) OVER ())::float8 AS pct_of_total
FROM order_payments op
JOIN orders o ON o.id = op.order_id
WHERE op.status = 'APPROVED'
  AND o.created_at >= NOW() - INTERVAL '30 days'
GROUP BY bucket
ORDER BY amount DESC;
```

**Endpoint:** `GET /api/admin/dashboard/parcelamento`
**Atualização:** sob demanda + cache 60s.
**Threshold:** % em 7-12x acima de 60% → vale apertar incentivo Pix (cupom PIXFIRST, banner).
**Owner:** Data Analyst define. Backend precisa adicionar `installments` em `OrderPayment`.

---

## 5. Margem por categoria

**Por que importa:** Periférico/cooler têm margem 25-40%. GPU/CPU têm margem 5-12% (revendendo). Painel mostra onde realmente ganha dinheiro vs onde só roda volume.

**Definição:**
> Para cada categoria (`Product.category`):
> - Receita = soma `OrderItem.subtotal`
> - Custo = soma `OrderItem.quantity * Product.costPrice`
> - Margem absoluta = receita - custo
> - Margem % = (receita - custo) / receita * 100

⚠️ **Schema dependency:** `Product.costPrice Decimal?` precisa existir. Se ausente, painel mostra "—" e nota "informe custo no produto pra calcular margem".

**Fórmula:**
```sql
SELECT
  p.category,
  SUM(oi.subtotal)::float8                              AS revenue,
  SUM(oi.quantity * COALESCE(p.cost_price, 0))::float8  AS cost,
  (SUM(oi.subtotal) - SUM(oi.quantity * COALESCE(p.cost_price, 0)))::float8 AS margin_abs,
  CASE WHEN SUM(oi.subtotal) > 0
    THEN ((SUM(oi.subtotal) - SUM(oi.quantity * COALESCE(p.cost_price, 0))) / SUM(oi.subtotal) * 100)
    ELSE NULL
  END AS margin_pct,
  COUNT(*) FILTER (WHERE p.cost_price IS NULL)::bigint AS missing_cost_count
FROM order_items oi
JOIN orders   o ON o.id = oi.order_id
JOIN products p ON p.id = oi.product_id
WHERE o.status IN ('PAID','PREPARING','SHIPPED','DELIVERED')
  AND o.created_at >= NOW() - INTERVAL '30 days'
GROUP BY p.category
ORDER BY margin_abs DESC;
```

**Endpoint:** `GET /api/admin/dashboard/margem?groupBy=category`
**Atualização:** sob demanda + cache 60s.
**Threshold:** margem < 5% em qualquer categoria → revisar custo/preço.
**Owner:** Data Analyst define. Backend precisa de `Product.costPrice`.

---

## 6. DOA acionada (%)

**Por que importa:** "Dead on Arrival" = produto chega defeituoso nos primeiros 7-14 dias. Se taxa > 5% em uma categoria, o lote do fornecedor tá ruim. Detectar cedo evita devolução em massa daqui a 30 dias.

**Definição:**
> Para últimos 30 dias:
> - DOA = pedidos com `OrderReturn.reason = 'DOA'` E `createdAt - Order.deliveredAt <= 14 dias`
> - Por categoria: contagem DOA / contagem total entregue × 100

⚠️ **Schema dependency:** `OrderReturn` model com (`orderId`, `reason ENUM('DOA', 'BUYER_REGRET', 'WRONG_ITEM', 'DAMAGED_TRANSPORT', 'OTHER')`, `requestedAt`, `status`). Não existe ainda. Stub usa array vazio.

**Fórmula:**
```sql
WITH delivered AS (
  SELECT
    p.category,
    COUNT(DISTINCT o.id) AS delivered_count
  FROM orders o
  JOIN order_items oi ON oi.order_id = o.id
  JOIN products p     ON p.id = oi.product_id
  WHERE o.status = 'DELIVERED'
    AND o.updated_at >= NOW() - INTERVAL '30 days'
  GROUP BY p.category
),
doa AS (
  SELECT
    p.category,
    COUNT(DISTINCT r.order_id) AS doa_count
  FROM order_returns r
  JOIN orders o      ON o.id = r.order_id
  JOIN order_items oi ON oi.order_id = o.id
  JOIN products p     ON p.id = oi.product_id
  WHERE r.reason = 'DOA'
    AND r.requested_at >= NOW() - INTERVAL '30 days'
  GROUP BY p.category
)
SELECT
  d.category,
  d.delivered_count,
  COALESCE(doa.doa_count, 0)               AS doa_count,
  CASE WHEN d.delivered_count > 0
    THEN (COALESCE(doa.doa_count, 0)::float8 / d.delivered_count * 100)
    ELSE 0
  END AS doa_pct
FROM delivered d
LEFT JOIN doa ON doa.category = d.category
ORDER BY doa_pct DESC;
```

**Endpoint:** `GET /api/admin/dashboard/doa`
**Atualização:** sob demanda + cache 60s.
**Threshold:** DOA > 5% em qualquer categoria → alerta vermelho + email pra ops.
**Owner:** Data Analyst define. Backend precisa de `OrderReturn` model.

---

## 7. Devolução por arrependimento (%)

**Por que importa:** CDC art. 49 = 7 dias pra desistir sem motivo. Loja paga frete de volta (custo médio R$ 80-120 em hardware pesado). Se > 5%, foto/descrição pode estar enganosa. Se > 10%, é problema sério.

**Definição:**
> - Devolução = `OrderReturn.reason = 'BUYER_REGRET'` no período (últimos 30 dias)
> - Numerador: contagem devoluções por categoria
> - Denominador: contagem entregues nos 30 dias prévios (cliente devolve até 7 dias depois de receber)

**Fórmula:** mesma de DOA, trocando `reason = 'BUYER_REGRET'` e janela do denominador deslocada 7 dias.

**Endpoint:** `GET /api/admin/dashboard/devolucao-7dias`
**Threshold:** > 5% em uma categoria → revisar PDP (foto/descrição/expectativa).
**Owner:** Data Analyst define. Mesmo `OrderReturn` model.

---

## 8. Estoque alerta (produtos abaixo de N unidades)

**Por que importa:** Hardware 2026 tá volátil — RAM com escassez (demanda IA), GPU paper launch comum. Saber o que vai acabar antes de acabar evita lista de espera longa = cliente foge pro concorrente.

**Definição:**
> Variações com `stock < threshold` (default 5) E `isActive = true`.
> Ordenação: por velocidade de venda (vendas/dia nos últimos 7 dias) decrescente — produto que sai rápido prioriza compra.

**Fórmula:**
```sql
WITH velocity AS (
  SELECT
    pv.id AS variation_id,
    COALESCE(SUM(oi.quantity)::float8 / 7, 0) AS daily_velocity
  FROM product_variations pv
  LEFT JOIN order_items oi ON oi.variation_id = pv.id
  LEFT JOIN orders     o   ON o.id = oi.order_id
    AND o.status IN ('PAID','PREPARING','SHIPPED','DELIVERED')
    AND o.created_at >= NOW() - INTERVAL '7 days'
  GROUP BY pv.id
)
SELECT
  pv.id, pv.sku, pv.stock,
  p.id AS product_id, p.name, p.slug, p.category,
  v.daily_velocity,
  CASE WHEN v.daily_velocity > 0
    THEN (pv.stock / v.daily_velocity)
    ELSE NULL
  END AS days_until_out
FROM product_variations pv
JOIN products p ON p.id = pv.product_id
JOIN velocity v ON v.variation_id = pv.id
WHERE pv.is_active = true
  AND p.is_active = true
  AND pv.stock < ${threshold}
ORDER BY v.daily_velocity DESC, pv.stock ASC;
```

**Endpoint:** `GET /api/admin/dashboard/estoque-alerta?threshold=5`
**Atualização:** sob demanda + cache 60s.
**Threshold:** auto-alerta quando produto popular (top-20 vendas) cai abaixo de 5 unidades.
**Owner:** Data Analyst.

---

## 9. Lista de espera ativa (top 10 por produto)

**Por que importa:** Anti-paper-launch é o 3º diferencial. Quem tá esperando GPU não pode esperar muito — ou converte em outro produto, ou compra no concorrente. Painel mostra onde tem demanda represada pra priorizar reposição.

**Definição:**
> Top N produtos com mais subscriptions ativas (`notifiedAt IS NULL`).

**Fórmula:**
```sql
SELECT
  p.id, p.slug, p.name, p.category,
  COUNT(ws.id)::bigint                          AS waiting_count,
  MAX(ws.created_at)                            AS last_subscription_at,
  MIN(ws.created_at)                            AS first_subscription_at,
  EXTRACT(EPOCH FROM (NOW() - MIN(ws.created_at))) / 86400 AS days_waiting
FROM waitlist_subscriptions ws
JOIN products p ON p.id = ws.product_id
WHERE ws.notified_at IS NULL
GROUP BY p.id, p.slug, p.name, p.category
ORDER BY waiting_count DESC
LIMIT ${limit};
```

**Endpoint:** `GET /api/admin/dashboard/waitlist-top?limit=10`
**Atualização:** sob demanda + cache 60s (lista pode crescer rápido).
**Threshold:** alerta se produto com lista > 20 não foi reposto há > 14 dias.
**Owner:** Data Analyst define. Backend precisa do model `WaitlistSubscription` (já no brief).

---

## 10. Tempo médio de montagem (BTO)

**Por que importa:** PC montado é Build-to-Order. SLA prometido na loja: até 7 dias úteis pra montar e despachar. Se média passa de 5 dias, alerta antes de virar reclamação. Se passa de 7, problema real (operação afogada, falta de peça, técnico falhou).

**Definição:**
> Para pedidos com pelo menos 1 item de `Product.buildType = 'pc_pronto'`:
> - Tempo de montagem = `Order.shippedAt - Order.paidAt` (em horas/dias úteis)
> - Média no período (30 dias)
> - P50 / P90 / P95 pra ver outliers

⚠️ **Schema dependency:** `Order` precisa dos campos `paidAt DateTime?`, `shippedAt DateTime?`. Se ausente, usa proxy `updatedAt` quando `status = SHIPPED`.

**Fórmula:**
```sql
WITH bto_orders AS (
  SELECT DISTINCT o.id, o.created_at, o.shipped_at, o.paid_at
  FROM orders o
  JOIN order_items oi ON oi.order_id = o.id
  JOIN products    p  ON p.id = oi.product_id
  WHERE p.build_type = 'pc_pronto'
    AND o.status IN ('SHIPPED','DELIVERED')
    AND o.shipped_at IS NOT NULL
    AND o.paid_at IS NOT NULL
    AND o.shipped_at >= NOW() - INTERVAL '30 days'
)
SELECT
  COUNT(*)::bigint                                                          AS total_pcs,
  AVG(EXTRACT(EPOCH FROM (shipped_at - paid_at)) / 86400)::float8           AS avg_days,
  PERCENTILE_CONT(0.5)  WITHIN GROUP (ORDER BY EXTRACT(EPOCH FROM (shipped_at - paid_at)) / 86400)::float8 AS p50_days,
  PERCENTILE_CONT(0.9)  WITHIN GROUP (ORDER BY EXTRACT(EPOCH FROM (shipped_at - paid_at)) / 86400)::float8 AS p90_days,
  PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY EXTRACT(EPOCH FROM (shipped_at - paid_at)) / 86400)::float8 AS p95_days
FROM bto_orders;
```

**Endpoint:** `GET /api/admin/dashboard/tempo-bto`
**Atualização:** sob demanda + cache 60s.
**Threshold:** P90 > 7 dias → operação atrasada, alerta amarelo. P95 > 10 dias → vermelho.
**Owner:** Data Analyst define. Backend precisa de `paidAt` + `shippedAt` em `Order`.

---

## Auto-alertas (cron diário ou disparo manual)

Endpoint `POST /api/admin/alerts/run` dispara checagem de todos abaixo. Em prod: cron diário às 09:00 BRT (12:00 UTC). Em dev: chama manualmente.

| Alerta | Trigger | Severidade | Destinatário |
|---|---|---|---|
| **Estoque baixo crítico** | Produto top-20 vendas com `stock < 5` | Vermelho | Email ops + log |
| **Lista de espera estagnada** | Produto com waitlist > 20 sem reposição há > 14 dias | Amarelo | Email ops + log |
| **Ticket caindo** | Ticket médio semana atual < 85% da semana anterior | Amarelo | Email growth + log |
| **DOA epidêmico** | DOA > 5% em qualquer categoria nos últimos 14 dias | Vermelho | Email ops + email comprador (lote suspeito) |
| **BTO atrasado** | P90 tempo de montagem > 7 dias | Amarelo | Email ops + log |
| **Devolução acima do normal** | Devolução > 5% em uma categoria nos últimos 30 dias | Amarelo | Email ops + log |

**Dispatch:** `services/alerts.ts` log + chamada `services/email.ts` (placeholder Resend, no-op se não configurado). NÃO envia email pra cliente final — só ops/admin.

---

## Endpoint overview (cards do topo)

`GET /api/admin/dashboard/overview` consolida 4 cards principais:

| Card | Métrica | Comparação |
|---|---|---|
| **Receita 30d** | `SUM(Order.total)` em PAID+ | vs 30d anteriores |
| **Pedidos pagos 30d** | `COUNT(*)` em PAID+ | vs 30d anteriores |
| **Ticket médio** | Receita / Pedidos | vs 30d anteriores |
| **Conversão geral** | Pedidos pagos / Carrinhos com item | vs 30d anteriores |

Receita diária pra LineChart de 30 pontos: `/api/admin/dashboard/revenue?period=30` (mesmo formato do Miami, reusado).

---

## Ranking de prioridade no painel (overview vs analytics)

**Página `/` (overview):**
1. Cards: Receita / Pedidos / Ticket médio / Conversão
2. Gráfico: receita diária 30d
3. Funil do builder (5 etapas)
4. Top personas convertendo

**Página `/analytics` (visão completa):**
- Tudo acima + ticket médio por categoria + parcelamento + margem + DOA + devolução + estoque alerta + waitlist top + tempo BTO

**Por que separar:** dono da loja abre overview todo dia. `/analytics` é semanal/quinzenal, deep-dive.

---

## Pendências / dependências do Backend

Marcadas no código com `// TODO BACKEND_READY:`. Resumo:

| Pendência | Onde | Impacto se ausente |
|---|---|---|
| `BuilderEvent` model | Funil builder | Mock determinístico até integrar |
| `Product.buildType` | Ticket médio, BTO | Schema do brief já prevê — Backend só precisa criar |
| `Product.persona` | Conversão por persona | Schema do brief já prevê |
| `Product.category` (string vs FK) | Várias | Brief usa string `'cpu'`, `'gpu'` — não FK pra `Category` |
| `Product.costPrice` | Margem | Adicionar campo Decimal? — fallback exibe "—" |
| `OrderPayment.installments` | Parcelamento | Adicionar campo Int? — fallback agrupa só por `method` |
| `OrderReturn` model | DOA, devolução | Criar model — fallback retorna `[]` |
| `Order.paidAt` + `Order.shippedAt` | Tempo BTO | Adicionar campos — fallback usa `updatedAt` quando status muda |
| `WaitlistSubscription` | Waitlist top | Schema do brief já prevê |
| `Persona` model | Conversão por persona | Schema do brief já prevê |

Ao Backend completar, remover stubs do `dashboard.ts` (busca por `BACKEND_READY`).
