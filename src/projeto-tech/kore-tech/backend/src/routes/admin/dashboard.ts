// =============================================================================
// Kore Tech — Dashboard endpoints (KPIs do painel admin)
// Owner: ecommerce-data-analyst (Agente 04). Schema: Backend (Agente 01).
//
// Validação obrigatória (regra do nicho):
//   - "Receita" = Order.total em status PAID|PREPARING|SHIPPED|DELIVERED.
//     Pedido CANCELLED, REFUNDED ou PENDING_PAYMENT NÃO conta.
//   - Usar Order.total (não subtotal). Subtotal perde frete + desconto.
//   - Datas em UTC. DATE_TRUNC('day', created_at).
//   - Divisão por zero sempre tratada — retorna null com label "sem base".
//   - Cache 60s em endpoints pesados (sugerido em comentário; impl no front
//     ou via reverse proxy depois).
//
// KPIs entregues (PESQUISA-NICHO seção 10 + brief Sprint 1):
//   1. overview            — cards do topo (receita, pedidos, ticket, conversão)
//   2. revenue             — série diária pra LineChart 30d
//   3. ticket-medio        — por buildType (componente vs pc_pronto vs periferico)
//   4. funnel-builder      — 5 etapas (depende de BuilderEvent — STUB se ausente)
//   5. conversao-persona   — qual persona vende mais
//   6. parcelamento        — distribuição Pix vs cartão por número de parcelas
//   7. margem              — receita - custo, por categoria (depende costPrice)
//   8. doa                 — Dead on Arrival % por categoria (depende OrderReturn)
//   9. devolucao-7dias     — devolução por arrependimento % (depende OrderReturn)
//   10. estoque-alerta     — produtos com stock < N + velocity
//   11. waitlist-top       — top N produtos com mais subscribers ativos
//   12. tempo-bto          — tempo médio de Build-to-Order (PC montado)
//
// Pendências marcadas como `// TODO BACKEND_READY:` — Tech Lead consolida
// quando schema final do Backend estiver pronto.
// =============================================================================

import { Router } from 'express'
import { Prisma } from '@prisma/client'
import { prisma } from '../../lib/prisma.js'
import { ok } from '../../lib/api-response.js'

export const adminDashboardRouter: Router = Router()

// Status que contam como "receita realizada" (já pagou).
const PAID_STATUSES = ['PAID', 'PREPARING', 'SHIPPED', 'DELIVERED'] as const

// Helper: data N dias atrás (00:00 UTC).
function daysAgo(n: number): Date {
  const d = new Date()
  d.setUTCDate(d.getUTCDate() - n)
  d.setUTCHours(0, 0, 0, 0)
  return d
}

// Helper: variação percentual com guard de divisão por zero.
function pctChange(current: number, previous: number): number | null {
  if (previous === 0) return current === 0 ? 0 : null
  return +(((current - previous) / previous) * 100).toFixed(1)
}

// Helper: parseInt seguro com mín/máx + default.
function intParam(value: unknown, def: number, min = 1, max = 365): number {
  const n = Number(value ?? def)
  if (Number.isNaN(n)) return def
  return Math.min(max, Math.max(min, Math.trunc(n)))
}

// =============================================================================
// 1. GET /api/admin/dashboard/overview
// Cards do topo + comparativo período anterior. Padrão semelhante ao Miami.
// Cache sugerido: 60s.
// =============================================================================
adminDashboardRouter.get('/overview', async (req, res, next) => {
  try {
    const period = intParam(req.query.period, 30)
    const since      = daysAgo(period)
    const sincePrev  = daysAgo(period * 2)
    const sinceToday = daysAgo(0)

    const [
      revenueNow,
      revenuePrev,
      ordersNow,
      ordersPrev,
      ordersToday,
      cartsWithItemsNow,
      cartsWithItemsPrev,
      lowStockCount,
      activeProducts,
    ] = await Promise.all([
      prisma.order.aggregate({
        where: { status: { in: [...PAID_STATUSES] }, createdAt: { gte: since } },
        _sum: { total: true },
        _count: true,
      }),
      prisma.order.aggregate({
        where: { status: { in: [...PAID_STATUSES] }, createdAt: { gte: sincePrev, lt: since } },
        _sum: { total: true },
        _count: true,
      }),
      prisma.order.count({ where: { createdAt: { gte: since } } }),
      prisma.order.count({ where: { createdAt: { gte: sincePrev, lt: since } } }),
      prisma.order.count({ where: { createdAt: { gte: sinceToday } } }),
      prisma.cart.count({
        where: { createdAt: { gte: since }, items: { some: {} } },
      }),
      prisma.cart.count({
        where: { createdAt: { gte: sincePrev, lt: since }, items: { some: {} } },
      }),
      prisma.productVariation.count({
        where: { isActive: true, stock: { lt: 5 } },
      }),
      prisma.product.count({ where: { isActive: true } }),
    ])

    const revenue       = Number(revenueNow._sum.total ?? 0)
    const revenuePrior  = Number(revenuePrev._sum.total ?? 0)
    const paidCount     = revenueNow._count
    const paidCountPrev = revenuePrev._count
    const avgTicket     = paidCount > 0 ? revenue / paidCount : 0
    const avgTicketPrev = paidCountPrev > 0 ? revenuePrior / paidCountPrev : 0

    const conversionRate = cartsWithItemsNow > 0
      ? +((paidCount / cartsWithItemsNow) * 100).toFixed(2)
      : null
    const conversionRatePrev = cartsWithItemsPrev > 0
      ? +((paidCountPrev / cartsWithItemsPrev) * 100).toFixed(2)
      : null
    const conversionChange = conversionRate !== null && conversionRatePrev !== null
      ? pctChange(conversionRate, conversionRatePrev)
      : null

    return ok(res, {
      period,
      revenue: {
        value:    revenue,
        previous: revenuePrior,
        change:   pctChange(revenue, revenuePrior),
      },
      paidOrders: {
        value:    paidCount,
        previous: paidCountPrev,
        change:   pctChange(paidCount, paidCountPrev),
      },
      averageTicket: {
        value:    avgTicket,
        previous: avgTicketPrev,
        change:   pctChange(avgTicket, avgTicketPrev),
      },
      conversionRate: {
        value:    conversionRate,
        previous: conversionRatePrev,
        change:   conversionChange,
      },
      ordersTotal: {
        value:    ordersNow,
        previous: ordersPrev,
        change:   pctChange(ordersNow, ordersPrev),
      },
      ordersToday,
      cartsInPeriod: cartsWithItemsNow,
      lowStockSkus:  lowStockCount,
      activeProducts,
    })
  } catch (err) {
    next(err)
  }
})

// =============================================================================
// GET /api/admin/dashboard/revenue?period=30
// Série diária de receita pra LineChart. Reusa formato do Miami.
// Preenche dias zerados pra gráfico não ter buracos.
// =============================================================================
adminDashboardRouter.get('/revenue', async (req, res, next) => {
  try {
    const period = intParam(req.query.period, 30)
    const since  = daysAgo(period)

    const series = await prisma.$queryRaw<Array<{ day: Date; total: number; orders: bigint }>>`
      SELECT
        DATE_TRUNC('day', created_at)::date AS day,
        COALESCE(SUM(total), 0)::float8     AS total,
        COUNT(*)::bigint                    AS orders
      FROM orders
      WHERE status IN ('PAID','PREPARING','SHIPPED','DELIVERED')
        AND created_at >= ${since}
      GROUP BY day
      ORDER BY day ASC
    `

    // Preenche dias zerados — gráfico fica contínuo
    const byDate = new Map(series.map(s => [s.day.toISOString().slice(0, 10), s]))
    const result: Array<{ date: string; total: number; orders: number }> = []
    for (let i = period - 1; i >= 0; i--) {
      const d = new Date()
      d.setUTCDate(d.getUTCDate() - i)
      d.setUTCHours(0, 0, 0, 0)
      const key = d.toISOString().slice(0, 10)
      const row = byDate.get(key)
      result.push({
        date:   key,
        total:  row ? Number(row.total) : 0,
        orders: row ? Number(row.orders) : 0,
      })
    }
    return ok(res, result)
  } catch (err) {
    next(err)
  }
})

// =============================================================================
// 3. GET /api/admin/dashboard/ticket-medio?groupBy=category
// Ticket médio por buildType ('componente'/'pc_pronto'/'monitor'/'periferico').
// Decisão: pedidos mistos contam em AMBOS os tipos — mostra interesse cruzado.
// Cache sugerido: 60s.
// =============================================================================
adminDashboardRouter.get('/ticket-medio', async (req, res, next) => {
  try {
    const period  = intParam(req.query.period, 30)
    const since   = daysAgo(period)
    const groupBy = String(req.query.groupBy ?? 'buildType')

    // Permite groupBy alternativo (category) mas default é buildType.
    if (groupBy !== 'buildType' && groupBy !== 'hardwareCategory' && groupBy !== 'category') {
      return ok(res, { error: 'groupBy inválido. Use buildType | hardwareCategory | category' })
    }

    if (groupBy === 'buildType') {
      const rows = await prisma.$queryRaw<Array<{
        bucket: string | null; revenue: number; orders_with_type: bigint; avg_ticket: number;
      }>>`
        SELECT
          COALESCE(p.build_type, 'sem_tipo') AS bucket,
          SUM(oi.subtotal)::float8           AS revenue,
          COUNT(DISTINCT oi.order_id)::bigint AS orders_with_type,
          (SUM(oi.subtotal) / NULLIF(COUNT(DISTINCT oi.order_id), 0))::float8 AS avg_ticket
        FROM order_items oi
        JOIN orders   o ON o.id = oi.order_id
        JOIN products p ON p.id = oi.product_id
        WHERE o.status IN ('PAID','PREPARING','SHIPPED','DELIVERED')
          AND o.created_at >= ${since}
        GROUP BY p.build_type
        ORDER BY revenue DESC
      `
      return ok(res, rows.map(r => ({
        bucket:     r.bucket ?? 'sem_tipo',
        revenue:    Number(r.revenue ?? 0),
        orders:     Number(r.orders_with_type ?? 0),
        avgTicket:  Number(r.avg_ticket ?? 0),
      })))
    }

    if (groupBy === 'hardwareCategory') {
      const rows = await prisma.$queryRaw<Array<{
        bucket: string; revenue: number; orders_with_type: bigint; avg_ticket: number;
      }>>`
        SELECT
          p.hardware_category                AS bucket,
          SUM(oi.subtotal)::float8           AS revenue,
          COUNT(DISTINCT oi.order_id)::bigint AS orders_with_type,
          (SUM(oi.subtotal) / NULLIF(COUNT(DISTINCT oi.order_id), 0))::float8 AS avg_ticket
        FROM order_items oi
        JOIN orders   o ON o.id = oi.order_id
        JOIN products p ON p.id = oi.product_id
        WHERE o.status IN ('PAID','PREPARING','SHIPPED','DELIVERED')
          AND o.created_at >= ${since}
        GROUP BY p.hardware_category
        ORDER BY revenue DESC
      `
      return ok(res, rows.map(r => ({
        bucket:     r.bucket,
        revenue:    Number(r.revenue ?? 0),
        orders:     Number(r.orders_with_type ?? 0),
        avgTicket:  Number(r.avg_ticket ?? 0),
      })))
    }

    // groupBy === 'category' (Category model FK)
    const rows = await prisma.$queryRaw<Array<{
      bucket: string; revenue: number; orders_with_type: bigint; avg_ticket: number;
    }>>`
      SELECT
        c.name                              AS bucket,
        SUM(oi.subtotal)::float8            AS revenue,
        COUNT(DISTINCT oi.order_id)::bigint AS orders_with_type,
        (SUM(oi.subtotal) / NULLIF(COUNT(DISTINCT oi.order_id), 0))::float8 AS avg_ticket
      FROM order_items oi
      JOIN orders     o ON o.id = oi.order_id
      JOIN products   p ON p.id = oi.product_id
      JOIN categories c ON c.id = p.category_id
      WHERE o.status IN ('PAID','PREPARING','SHIPPED','DELIVERED')
        AND o.created_at >= ${since}
      GROUP BY c.name
      ORDER BY revenue DESC
    `
    return ok(res, rows.map(r => ({
      bucket:     r.bucket,
      revenue:    Number(r.revenue ?? 0),
      orders:     Number(r.orders_with_type ?? 0),
      avgTicket:  Number(r.avg_ticket ?? 0),
    })))
  } catch (err) {
    next(err)
  }
})

// =============================================================================
// 4. GET /api/admin/dashboard/funnel-builder?from&to
// Funil de 5 etapas do PC Builder: started → 1 peça → 3+ peças → completed → checkout
//
// TODO BACKEND_READY: depende da tabela `BuilderEvent` (event_type, session_id,
// created_at, payload). Ainda não no schema. Stub abaixo retorna mock
// determinístico baseado em distinct sessions (carts) pra não quebrar o painel.
// Quando Backend criar BuilderEvent + Growth disparar eventos no front,
// substitui pela query comentada.
// =============================================================================
adminDashboardRouter.get('/funnel-builder', async (req, res, next) => {
  try {
    const from = req.query.from ? new Date(String(req.query.from)) : daysAgo(30)
    const to   = req.query.to   ? new Date(String(req.query.to))   : new Date()

    // TODO BACKEND_READY: query real abaixo (descomente quando schema pronto)
    // const rows = await prisma.$queryRaw<Array<{ event_type: string; sessions: bigint }>>`
    //   SELECT
    //     event_type,
    //     COUNT(DISTINCT session_id)::bigint AS sessions
    //   FROM builder_events
    //   WHERE created_at >= ${from} AND created_at < ${to}
    //     AND event_type IN ('builder_started','part_added_first','part_added_3plus','build_completed','checkout_started')
    //   GROUP BY event_type
    // `
    // const byType = new Map(rows.map(r => [r.event_type, Number(r.sessions)]))

    // FALLBACK STUB: usa Cart com items + PCBuild + orders pra aproximar funil.
    const [carts, cartsWith3, savedBuilds, ordersWithPc] = await Promise.all([
      prisma.cart.count({
        where: { createdAt: { gte: from, lt: to }, items: { some: {} } },
      }),
      // Carts com 3+ items distintos = proxy de "passou da metade do builder"
      prisma.$queryRaw<Array<{ cnt: bigint }>>`
        SELECT COUNT(*)::bigint AS cnt
        FROM (
          SELECT cart_id
          FROM cart_items ci
          JOIN carts c ON c.id = ci.cart_id
          WHERE c.created_at >= ${from} AND c.created_at < ${to}
          GROUP BY cart_id
          HAVING COUNT(DISTINCT product_id) >= 3
        ) sub
      `,
      // PCBuild salvos (proxy de "completou a montagem")
      prisma.pCBuild.count({
        where: { createdAt: { gte: from, lt: to } },
      }),
      // Pedidos com pelo menos 1 produto pc_pronto OU produzido pelo builder
      // (proxy de "checkout do builder").
      prisma.$queryRaw<Array<{ cnt: bigint }>>`
        SELECT COUNT(DISTINCT o.id)::bigint AS cnt
        FROM orders o
        JOIN order_items oi ON oi.order_id = o.id
        JOIN products    p  ON p.id = oi.product_id
        WHERE o.created_at >= ${from} AND o.created_at < ${to}
          AND (p.build_type = 'pc_pronto' OR p.hardware_category IN ('cpu','gpu','mobo','psu','case','cooler'))
      `,
    ])

    const cartsWith3Count   = Number(cartsWith3[0]?.cnt ?? 0)
    const ordersWithPcCount = Number(ordersWithPc[0]?.cnt ?? 0)

    const stages = [
      { stage: 'Iniciou montagem',    count: carts,             order: 1 },
      { stage: 'Adicionou 1ª peça',   count: carts,             order: 2 }, // mesmo proxy — quando BuilderEvent vier, vira distinto
      { stage: 'Adicionou 3+ peças',  count: cartsWith3Count,   order: 3 },
      { stage: 'Salvou montagem',     count: savedBuilds,       order: 4 },
      { stage: 'Iniciou checkout',    count: ordersWithPcCount, order: 5 },
    ]

    const top = stages[0]?.count ?? 0
    const result = stages.map(s => ({
      stage: s.stage,
      order: s.order,
      count: s.count,
      conversionRate: top > 0 ? +((s.count / top) * 100).toFixed(1) : 0,
    }))

    return ok(res, {
      from: from.toISOString(),
      to:   to.toISOString(),
      stages: result,
      // Sinaliza que o dado é proxy enquanto BuilderEvent não existe
      isStub: true,
      stubReason: 'BuilderEvent ainda não no schema — usando proxies (Cart/PCBuild). Ver TODO BACKEND_READY no código.',
    })
  } catch (err) {
    next(err)
  }
})

// =============================================================================
// 5. GET /api/admin/dashboard/conversao-persona
// Conversão por persona — visitas vs pedidos vs receita.
//
// TODO BACKEND_READY: depende de BuilderEvent.event_type='view_persona' pra
// contar visitas. Sem ele, usa fallback "visitas = NULL" e mostra só
// pedidos/receita por persona. Quando Growth instrumentar evento + Backend
// criar tabela, conversionRate fica preenchido.
// =============================================================================
adminDashboardRouter.get('/conversao-persona', async (req, res, next) => {
  try {
    const period = intParam(req.query.period, 30)
    const since  = daysAgo(period)

    const personas = await prisma.persona.findMany({
      where: { isActive: true },
      select: {
        slug: true, name: true, iconEmoji: true, heroImage: true,
        sortOrder: true,
      },
      orderBy: { sortOrder: 'asc' },
    })

    const personaStats = await prisma.$queryRaw<Array<{
      persona_slug: string; orders: bigint; revenue: number;
    }>>`
      SELECT
        p.persona_slug                      AS persona_slug,
        COUNT(DISTINCT o.id)::bigint        AS orders,
        SUM(oi.subtotal)::float8            AS revenue
      FROM order_items oi
      JOIN orders   o ON o.id = oi.order_id
      JOIN products p ON p.id = oi.product_id
      WHERE o.status IN ('PAID','PREPARING','SHIPPED','DELIVERED')
        AND o.created_at >= ${since}
        AND p.persona_slug IS NOT NULL
      GROUP BY p.persona_slug
    `
    const statsBy = new Map(personaStats.map(s => [s.persona_slug, s]))

    // TODO BACKEND_READY: visitas via BuilderEvent.
    // const visits = await prisma.$queryRaw<Array<{ persona: string; visits: bigint }>>`
    //   SELECT payload->>'personaSlug' AS persona, COUNT(DISTINCT session_id)::bigint AS visits
    //   FROM builder_events
    //   WHERE event_type = 'view_persona' AND created_at >= ${since}
    //   GROUP BY payload->>'personaSlug'
    // `
    // const visitsBy = new Map(visits.map(v => [v.persona, Number(v.visits)]))

    const result = personas.map(p => {
      const s = statsBy.get(p.slug)
      const orders  = s ? Number(s.orders) : 0
      const revenue = s ? Number(s.revenue) : 0
      const visits  = null  // TODO BACKEND_READY: substituir por visitsBy.get(p.slug) ?? 0
      const conversionRate = visits !== null && (visits as number) > 0
        ? +((orders / (visits as number)) * 100).toFixed(2)
        : null
      return {
        slug: p.slug,
        name: p.name,
        iconEmoji: p.iconEmoji,
        heroImage: p.heroImage,
        visits,
        orders,
        revenue,
        conversionRate,
      }
    })

    // Ordena por receita desc (persona mais rentável primeiro)
    result.sort((a, b) => b.revenue - a.revenue)

    return ok(res, result)
  } catch (err) {
    next(err)
  }
})

// =============================================================================
// 6. GET /api/admin/dashboard/parcelamento
// Distribuição de pagamentos: PIX vs cartão (1x, 2-3x, 4-6x, 7-12x).
// Schema já tem Payment.installments — pode rodar query real direto.
// =============================================================================
adminDashboardRouter.get('/parcelamento', async (req, res, next) => {
  try {
    const period = intParam(req.query.period, 30)
    const since  = daysAgo(period)

    const rows = await prisma.$queryRaw<Array<{
      bucket: string; payments: bigint; amount: number; pct_of_total: number;
    }>>`
      WITH approved AS (
        SELECT
          CASE
            WHEN py.method = 'PIX'                    THEN 'PIX'
            WHEN py.installments = 1                  THEN '1x cartão'
            WHEN py.installments BETWEEN 2 AND 3      THEN '2-3x'
            WHEN py.installments BETWEEN 4 AND 6      THEN '4-6x'
            WHEN py.installments BETWEEN 7 AND 12     THEN '7-12x'
            ELSE 'Outros'
          END                AS bucket,
          py.amount          AS amount
        FROM payments py
        JOIN orders   o ON o.id = py.order_id
        WHERE py.status = 'APPROVED'
          AND o.created_at >= ${since}
      )
      SELECT
        bucket,
        COUNT(*)::bigint                                              AS payments,
        SUM(amount)::float8                                           AS amount,
        (SUM(amount) * 100.0 / NULLIF(SUM(SUM(amount)) OVER (), 0))::float8 AS pct_of_total
      FROM approved
      GROUP BY bucket
      ORDER BY amount DESC NULLS LAST
    `

    return ok(res, rows.map(r => ({
      bucket:     r.bucket,
      payments:   Number(r.payments ?? 0),
      amount:     Number(r.amount ?? 0),
      pctOfTotal: Number(r.pct_of_total ?? 0),
    })))
  } catch (err) {
    next(err)
  }
})

// =============================================================================
// 7. GET /api/admin/dashboard/margem?groupBy=category
// Margem (receita - custo) por categoria.
//
// TODO BACKEND_READY: depende de Product.costPrice (campo Decimal? a adicionar).
// Sem ele, retorna receita + missing_cost_count e marca margin como null.
// Painel exibe "—" e nota "informe custo no produto pra calcular margem".
// =============================================================================
adminDashboardRouter.get('/margem', async (req, res, next) => {
  try {
    const period  = intParam(req.query.period, 30)
    const since   = daysAgo(period)
    const groupBy = String(req.query.groupBy ?? 'hardwareCategory')

    // TODO BACKEND_READY: quando Product.costPrice existir, query real abaixo.
    // const rows = await prisma.$queryRaw<...>`
    //   SELECT
    //     p.hardware_category                                       AS bucket,
    //     SUM(oi.subtotal)::float8                                  AS revenue,
    //     SUM(oi.quantity * COALESCE(p.cost_price, 0))::float8      AS cost,
    //     (SUM(oi.subtotal) - SUM(oi.quantity * COALESCE(p.cost_price, 0)))::float8 AS margin_abs,
    //     CASE WHEN SUM(oi.subtotal) > 0
    //       THEN ((SUM(oi.subtotal) - SUM(oi.quantity * COALESCE(p.cost_price, 0))) / SUM(oi.subtotal) * 100)
    //       ELSE NULL
    //     END                                                       AS margin_pct,
    //     COUNT(*) FILTER (WHERE p.cost_price IS NULL)::bigint      AS missing_cost_count
    //   FROM order_items oi
    //   JOIN orders   o ON o.id = oi.order_id
    //   JOIN products p ON p.id = oi.product_id
    //   WHERE o.status IN ('PAID','PREPARING','SHIPPED','DELIVERED')
    //     AND o.created_at >= ${since}
    //   GROUP BY p.hardware_category
    //   ORDER BY margin_abs DESC NULLS LAST
    // `

    // FALLBACK: só receita (sem custo).
    const rows = await prisma.$queryRaw<Array<{
      bucket: string; revenue: number; items_sold: bigint;
    }>>`
      SELECT
        p.hardware_category                AS bucket,
        SUM(oi.subtotal)::float8           AS revenue,
        SUM(oi.quantity)::bigint           AS items_sold
      FROM order_items oi
      JOIN orders   o ON o.id = oi.order_id
      JOIN products p ON p.id = oi.product_id
      WHERE o.status IN ('PAID','PREPARING','SHIPPED','DELIVERED')
        AND o.created_at >= ${since}
      GROUP BY p.hardware_category
      ORDER BY revenue DESC
    `

    return ok(res, {
      groupBy,
      rows: rows.map(r => ({
        bucket:    r.bucket,
        revenue:   Number(r.revenue ?? 0),
        itemsSold: Number(r.items_sold ?? 0),
        cost:      null,            // TODO BACKEND_READY
        marginAbs: null,            // TODO BACKEND_READY
        marginPct: null,            // TODO BACKEND_READY
        missingCost: true,          // TODO BACKEND_READY: false quando costPrice existir
      })),
      isStub: true,
      stubReason: 'Product.costPrice ainda não no schema — sem custo, margem fica null. Adicionar campo Decimal? em Product.',
    })
  } catch (err) {
    next(err)
  }
})

// =============================================================================
// 8. GET /api/admin/dashboard/doa
// % de pedidos com Dead on Arrival (defeito chegando) por categoria.
//
// TODO BACKEND_READY: depende de model `OrderReturn` (orderId, reason ENUM,
// requestedAt, status). Não existe ainda. Stub retorna [] + nota explicativa.
// =============================================================================
adminDashboardRouter.get('/doa', async (req, res, next) => {
  try {
    const period = intParam(req.query.period, 30)
    // const since = daysAgo(period)  // TODO BACKEND_READY: usar quando query real

    // TODO BACKEND_READY: query real depende de OrderReturn model.
    // const rows = await prisma.$queryRaw`
    //   WITH delivered AS (
    //     SELECT p.hardware_category, COUNT(DISTINCT o.id) AS delivered_count
    //     FROM orders o
    //     JOIN order_items oi ON oi.order_id = o.id
    //     JOIN products    p  ON p.id = oi.product_id
    //     WHERE o.status = 'DELIVERED' AND o.delivered_at >= ${since}
    //     GROUP BY p.hardware_category
    //   ),
    //   doa AS (
    //     SELECT p.hardware_category, COUNT(DISTINCT r.order_id) AS doa_count
    //     FROM order_returns r
    //     JOIN orders o      ON o.id = r.order_id
    //     JOIN order_items oi ON oi.order_id = o.id
    //     JOIN products    p  ON p.id = oi.product_id
    //     WHERE r.reason = 'DOA' AND r.requested_at >= ${since}
    //     GROUP BY p.hardware_category
    //   )
    //   SELECT
    //     d.hardware_category                          AS bucket,
    //     d.delivered_count                            AS delivered,
    //     COALESCE(doa.doa_count, 0)                   AS doa_count,
    //     CASE WHEN d.delivered_count > 0
    //       THEN (COALESCE(doa.doa_count, 0)::float8 / d.delivered_count * 100)
    //       ELSE 0
    //     END                                          AS doa_pct
    //   FROM delivered d
    //   LEFT JOIN doa ON doa.hardware_category = d.hardware_category
    //   ORDER BY doa_pct DESC
    // `

    return ok(res, {
      period,
      rows: [],
      isStub: true,
      stubReason: 'OrderReturn model ainda não criado. Adicionar (orderId, reason ENUM, requestedAt, status) — ver KPIS.md seção 6.',
    })
  } catch (err) {
    next(err)
  }
})

// =============================================================================
// 9. GET /api/admin/dashboard/devolucao-7dias
// % devolução por arrependimento (CDC art. 49) por categoria.
//
// TODO BACKEND_READY: mesma dependência (OrderReturn). Stub vazio.
// =============================================================================
adminDashboardRouter.get('/devolucao-7dias', async (req, res, next) => {
  try {
    const period = intParam(req.query.period, 30)

    // TODO BACKEND_READY: lógica espelha DOA, trocando reason='BUYER_REGRET'.

    return ok(res, {
      period,
      rows: [],
      isStub: true,
      stubReason: 'OrderReturn model ainda não criado. Mesmo bloqueio do endpoint /doa.',
    })
  } catch (err) {
    next(err)
  }
})

// =============================================================================
// 10. GET /api/admin/dashboard/estoque-alerta?threshold=5
// Variações com stock < threshold + ranking por velocity (vendas/dia 7d).
// =============================================================================
adminDashboardRouter.get('/estoque-alerta', async (req, res, next) => {
  try {
    const threshold = intParam(req.query.threshold, 5, 0, 1000)

    const rows = await prisma.$queryRaw<Array<{
      variation_id: string; sku: string; stock: number; size: string; color: string;
      product_id: string; name: string; slug: string; hardware_category: string;
      build_type: string | null;
      daily_velocity: number; days_until_out: number | null;
    }>>`
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
        pv.id                               AS variation_id,
        pv.sku, pv.stock, pv.size, pv.color,
        p.id                                AS product_id,
        p.name, p.slug, p.hardware_category, p.build_type,
        v.daily_velocity                    AS daily_velocity,
        CASE WHEN v.daily_velocity > 0
          THEN (pv.stock / v.daily_velocity)
          ELSE NULL
        END                                 AS days_until_out
      FROM product_variations pv
      JOIN products  p ON p.id = pv.product_id
      JOIN velocity  v ON v.variation_id = pv.id
      WHERE pv.is_active = true
        AND p.is_active = true
        AND pv.stock < ${threshold}
      ORDER BY v.daily_velocity DESC, pv.stock ASC
      LIMIT 100
    `

    return ok(res, {
      threshold,
      rows: rows.map(r => ({
        variationId:     r.variation_id,
        sku:             r.sku,
        stock:           r.stock,
        size:            r.size,
        color:           r.color,
        product: {
          id:                r.product_id,
          name:              r.name,
          slug:              r.slug,
          hardwareCategory:  r.hardware_category,
          buildType:         r.build_type,
        },
        dailyVelocity:    Number(r.daily_velocity ?? 0),
        daysUntilOut:     r.days_until_out !== null ? Number(r.days_until_out) : null,
      })),
    })
  } catch (err) {
    next(err)
  }
})

// =============================================================================
// 11. GET /api/admin/dashboard/waitlist-top?limit=10
// Top N produtos com mais subscribers ativos (notifiedAt IS NULL).
// =============================================================================
adminDashboardRouter.get('/waitlist-top', async (req, res, next) => {
  try {
    const limit = intParam(req.query.limit, 10, 1, 50)

    const rows = await prisma.$queryRaw<Array<{
      product_id: string; slug: string; name: string; hardware_category: string;
      build_type: string | null;
      waiting_count: bigint;
      first_subscription_at: Date;
      last_subscription_at: Date;
      days_waiting: number;
    }>>`
      SELECT
        p.id                                                       AS product_id,
        p.slug, p.name, p.hardware_category, p.build_type,
        COUNT(ws.id)::bigint                                       AS waiting_count,
        MIN(ws.created_at)                                         AS first_subscription_at,
        MAX(ws.created_at)                                         AS last_subscription_at,
        EXTRACT(EPOCH FROM (NOW() - MIN(ws.created_at))) / 86400   AS days_waiting
      FROM waitlist_subscriptions ws
      JOIN products p ON p.id = ws.product_id
      WHERE ws.notified_at IS NULL
      GROUP BY p.id, p.slug, p.name, p.hardware_category, p.build_type
      ORDER BY waiting_count DESC, days_waiting DESC
      LIMIT ${limit}
    `

    return ok(res, rows.map(r => ({
      product: {
        id:                r.product_id,
        slug:              r.slug,
        name:              r.name,
        hardwareCategory:  r.hardware_category,
        buildType:         r.build_type,
      },
      waitingCount:        Number(r.waiting_count ?? 0),
      firstSubscriptionAt: r.first_subscription_at,
      lastSubscriptionAt:  r.last_subscription_at,
      daysWaiting:         Number(r.days_waiting ?? 0),
    })))
  } catch (err) {
    next(err)
  }
})

// =============================================================================
// 12. GET /api/admin/dashboard/tempo-bto
// Tempo médio de Build-to-Order: do pagamento (Payment.approvedAt) ao
// despacho (Order.shippedAt). Só pra pedidos com pelo menos 1 produto pc_pronto.
//
// TODO BACKEND_READY: schema atual NÃO tem Order.paidAt — usa Payment.approvedAt
// via JOIN. Funciona mas é um JOIN a mais. Se Backend adicionar Order.paidAt
// (sincronizado via webhook MP), simplifica e fica mais rápido.
// =============================================================================
adminDashboardRouter.get('/tempo-bto', async (req, res, next) => {
  try {
    const period = intParam(req.query.period, 30)
    const since  = daysAgo(period)

    const rows = await prisma.$queryRaw<Array<{
      total_pcs: bigint; avg_days: number | null; p50_days: number | null;
      p90_days: number | null; p95_days: number | null;
    }>>`
      WITH bto_orders AS (
        SELECT DISTINCT
          o.id,
          o.shipped_at,
          MIN(py.approved_at) AS paid_at
        FROM orders o
        JOIN order_items oi ON oi.order_id = o.id
        JOIN products    p  ON p.id = oi.product_id
        JOIN payments    py ON py.order_id = o.id
        WHERE p.build_type = 'pc_pronto'
          AND o.status IN ('SHIPPED','DELIVERED')
          AND o.shipped_at IS NOT NULL
          AND py.approved_at IS NOT NULL
          AND o.shipped_at >= ${since}
        GROUP BY o.id, o.shipped_at
      )
      SELECT
        COUNT(*)::bigint                                                                                  AS total_pcs,
        AVG(EXTRACT(EPOCH FROM (shipped_at - paid_at)) / 86400)::float8                                   AS avg_days,
        PERCENTILE_CONT(0.5)  WITHIN GROUP (ORDER BY EXTRACT(EPOCH FROM (shipped_at - paid_at)) / 86400)::float8  AS p50_days,
        PERCENTILE_CONT(0.9)  WITHIN GROUP (ORDER BY EXTRACT(EPOCH FROM (shipped_at - paid_at)) / 86400)::float8  AS p90_days,
        PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY EXTRACT(EPOCH FROM (shipped_at - paid_at)) / 86400)::float8  AS p95_days
      FROM bto_orders
    `

    const r = rows[0]
    return ok(res, {
      period,
      totalPcs:  Number(r?.total_pcs ?? 0),
      avgDays:   r?.avg_days  !== undefined && r?.avg_days  !== null ? Number(r.avg_days)  : null,
      p50Days:   r?.p50_days  !== undefined && r?.p50_days  !== null ? Number(r.p50_days)  : null,
      p90Days:   r?.p90_days  !== undefined && r?.p90_days  !== null ? Number(r.p90_days)  : null,
      p95Days:   r?.p95_days  !== undefined && r?.p95_days  !== null ? Number(r.p95_days)  : null,
      slaTarget: 7,  // SLA prometido na loja: até 7 dias úteis
    })
  } catch (err) {
    next(err)
  }
})

// =============================================================================
// Bloco extra: silencia warning de TS pra Prisma import-only quando build query
// raw — Prisma.sql template já é importado pelo `$queryRaw`.
// =============================================================================
const _prismaTypeUsed: typeof Prisma | undefined = undefined
void _prismaTypeUsed
