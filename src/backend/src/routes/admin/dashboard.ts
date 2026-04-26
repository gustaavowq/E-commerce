// Endpoints do painel KPI. Validação Data Analyst (Agente 04):
//   - "Receita" = pedidos pós-pagamento (PAID, PREPARING, SHIPPED, DELIVERED).
//     Pedido cancelado NÃO conta. PENDING_PAYMENT NÃO conta (ainda não pagou).
//   - Períodos sempre em UTC, comparados com período imediatamente anterior
//     pra mostrar tendência (+/- %).
//   - "Sessão" não rastreamos ainda, então usamos CARRINHO COM ITEM como proxy
//     de intenção de compra (denominador da taxa de conversão).
//   - "Pedido" = orders.createdAt (não payments) pra dar visão de fluxo.
import { Router } from 'express'
import { prisma } from '../../lib/prisma.js'
import { ok } from '../../lib/api-response.js'

export const adminDashboardRouter: Router = Router()

// Status que contam como "receita realizada" (já pagou)
const PAID_STATUSES = ['PAID', 'PREPARING', 'SHIPPED', 'DELIVERED'] as const

// Helper: data N dias atrás (00:00 UTC)
function daysAgo(n: number): Date {
  const d = new Date()
  d.setUTCDate(d.getUTCDate() - n)
  d.setUTCHours(0, 0, 0, 0)
  return d
}

// Calcula variação percentual segura (lida com divisão por zero)
function pctChange(current: number, previous: number): number | null {
  if (previous === 0) return current === 0 ? 0 : null  // null = "sem base de comparação"
  return +(((current - previous) / previous) * 100).toFixed(1)
}

// GET /api/admin/dashboard/summary — KPIs do topo + comparativo período anterior
adminDashboardRouter.get('/summary', async (req, res, next) => {
  try {
    const period = Math.max(1, Number(req.query.period ?? 30))
    const since      = daysAgo(period)
    const sincePrev  = daysAgo(period * 2)
    const sinceToday = daysAgo(0)

    const [
      revenueNow, revenuePrev,
      ordersNow,  ordersPrev,
      ordersToday,
      cancelledNow, cancelledPrev,
      activeProducts, lowStockCount,
      cartsWithItemsNow,
      stuckPreparing,
    ] = await Promise.all([
      // Receita atual (só pedidos pós-pagamento)
      prisma.order.aggregate({
        where: { status: { in: [...PAID_STATUSES] }, createdAt: { gte: since } },
        _sum: { total: true }, _count: true,
      }),
      // Receita período anterior (mesmo tamanho, deslocado)
      prisma.order.aggregate({
        where: { status: { in: [...PAID_STATUSES] }, createdAt: { gte: sincePrev, lt: since } },
        _sum: { total: true }, _count: true,
      }),
      prisma.order.count({ where: { createdAt: { gte: since } } }),
      prisma.order.count({ where: { createdAt: { gte: sincePrev, lt: since } } }),
      prisma.order.count({ where: { createdAt: { gte: sinceToday } } }),
      // Cancelamentos pra calcular taxa
      prisma.order.count({ where: { status: 'CANCELLED', createdAt: { gte: since } } }),
      prisma.order.count({ where: { status: 'CANCELLED', createdAt: { gte: sincePrev, lt: since } } }),
      prisma.product.count({ where: { isActive: true } }),
      prisma.productVariation.count({ where: { isActive: true, stock: { lt: 5 } } }),
      // Carrinhos com ao menos 1 item criados no período (proxy de intenção)
      prisma.cart.count({
        where: { createdAt: { gte: since }, items: { some: {} } },
      }),
      // Pedidos parados em PREPARING há +48h (alerta operacional)
      prisma.order.count({
        where: { status: 'PREPARING', updatedAt: { lt: new Date(Date.now() - 48 * 3600_000) } },
      }),
    ])

    const revenue       = Number(revenueNow._sum.total ?? 0)
    const revenuePrior  = Number(revenuePrev._sum.total ?? 0)
    const paidCount     = revenueNow._count
    const paidCountPrev = revenuePrev._count
    const avgTicket     = paidCount > 0 ? revenue / paidCount : 0
    const avgTicketPrev = paidCountPrev > 0 ? revenuePrior / paidCountPrev : 0

    // Taxa de conversão: pedidos / carrinhos com item × 100. Se sem carrinho, null.
    const conversionRate = cartsWithItemsNow > 0
      ? +((paidCount / cartsWithItemsNow) * 100).toFixed(1)
      : null
    const abandonmentRate = cartsWithItemsNow > 0
      ? +(((cartsWithItemsNow - paidCount) / cartsWithItemsNow) * 100).toFixed(1)
      : null
    const cancellationRate = ordersNow > 0
      ? +((cancelledNow / ordersNow) * 100).toFixed(1)
      : 0
    const cancellationRatePrev = ordersPrev > 0
      ? +((cancelledPrev / ordersPrev) * 100).toFixed(1)
      : 0

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
      ordersTotal: {
        value:    ordersNow,
        previous: ordersPrev,
        change:   pctChange(ordersNow, ordersPrev),
      },
      ordersToday,
      conversionRate,           // % de carrinhos que viraram pedido pago
      abandonmentRate,          // % de carrinhos abandonados
      cancellationRate: {
        value:    cancellationRate,
        previous: cancellationRatePrev,
        change:   pctChange(cancellationRate, cancellationRatePrev),
      },
      activeProducts,
      lowStockSkus:    lowStockCount,
      cartsInPeriod:   cartsWithItemsNow,
      // Alertas operacionais
      alerts: {
        stuckInPreparing:    stuckPreparing,        // pedidos parados >48h em separação
        lowStock:            lowStockCount,
        highCancellation:    cancellationRate > 10, // sinaliza problema
      },
    })
  } catch (err) {
    next(err)
  }
})

// GET /api/admin/dashboard/revenue?period=30 — série diária de receita
// Inclui dias zerados pra gráfico não ter "buracos" entre datas.
adminDashboardRouter.get('/revenue', async (req, res, next) => {
  try {
    const period = Math.max(1, Number(req.query.period ?? 30))
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

    // Preenche dias zerados pro gráfico ficar contínuo
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

// GET /api/admin/dashboard/top-products?limit=10&period=30
// Filtrado por período + só pedidos pós-pagamento (não conta carrinho/pendente).
adminDashboardRouter.get('/top-products', async (req, res, next) => {
  try {
    const limit  = Math.min(50, Math.max(1, Number(req.query.limit  ?? 10)))
    const period = Math.max(1, Number(req.query.period ?? 30))
    const since  = daysAgo(period)

    const rows = await prisma.$queryRaw<Array<{
      product_id: string; quantity: bigint; revenue: number;
    }>>`
      SELECT
        oi.product_id,
        SUM(oi.quantity)::bigint  AS quantity,
        SUM(oi.subtotal)::float8  AS revenue
      FROM order_items oi
      JOIN orders o ON o.id = oi.order_id
      WHERE o.status IN ('PAID','PREPARING','SHIPPED','DELIVERED')
        AND o.created_at >= ${since}
      GROUP BY oi.product_id
      ORDER BY quantity DESC
      LIMIT ${limit}
    `

    const products = await prisma.product.findMany({
      where: { id: { in: rows.map(r => r.product_id) } },
      select: {
        id: true, slug: true, name: true,
        brand:    { select: { name: true } },
        category: { select: { name: true } },
      },
    })
    const byId = new Map(products.map(p => [p.id, p]))

    return ok(res, rows.map(r => ({
      product:  byId.get(r.product_id) ?? null,
      quantity: Number(r.quantity),
      revenue:  Number(r.revenue),
    })))
  } catch (err) { next(err) }
})

// GET /api/admin/dashboard/orders-by-status?period=30
// Só pedidos do período (não desde sempre — dado sem período não serve).
adminDashboardRouter.get('/orders-by-status', async (req, res, next) => {
  try {
    const period = Math.max(1, Number(req.query.period ?? 30))
    const since  = daysAgo(period)

    const grouped = await prisma.order.groupBy({
      by:     ['status'],
      where:  { createdAt: { gte: since } },
      _count: true,
    })
    return ok(res, grouped.map(g => ({ status: g.status, count: g._count })))
  } catch (err) { next(err) }
})

// GET /api/admin/dashboard/revenue-by-category?period=30
// Quanto cada categoria fatura — ajuda decidir mix de produto.
adminDashboardRouter.get('/revenue-by-category', async (req, res, next) => {
  try {
    const period = Math.max(1, Number(req.query.period ?? 30))
    const since  = daysAgo(period)

    const rows = await prisma.$queryRaw<Array<{
      category_name: string; quantity: bigint; revenue: number;
    }>>`
      SELECT
        c.name                    AS category_name,
        SUM(oi.quantity)::bigint  AS quantity,
        SUM(oi.subtotal)::float8  AS revenue
      FROM order_items oi
      JOIN orders o     ON o.id          = oi.order_id
      JOIN products p   ON p.id          = oi.product_id
      JOIN categories c ON c.id          = p.category_id
      WHERE o.status IN ('PAID','PREPARING','SHIPPED','DELIVERED')
        AND o.created_at >= ${since}
      GROUP BY c.name
      ORDER BY revenue DESC
    `
    return ok(res, rows.map(r => ({
      category: r.category_name,
      quantity: Number(r.quantity),
      revenue:  Number(r.revenue),
    })))
  } catch (err) { next(err) }
})

// GET /api/admin/dashboard/funnel?period=30
// Funil: visitantes (carts criados sem item) → carts c/ item → pedidos criados →
// pagos. Mostra onde tá vazando.
adminDashboardRouter.get('/funnel', async (req, res, next) => {
  try {
    const period = Math.max(1, Number(req.query.period ?? 30))
    const since  = daysAgo(period)

    const [carts, cartsWithItems, ordersCreated, ordersPaid] = await Promise.all([
      prisma.cart.count({ where: { createdAt: { gte: since } } }),
      prisma.cart.count({ where: { createdAt: { gte: since }, items: { some: {} } } }),
      prisma.order.count({ where: { createdAt: { gte: since } } }),
      prisma.order.count({
        where: {
          createdAt: { gte: since },
          status: { in: [...PAID_STATUSES] },
        },
      }),
    ])

    return ok(res, [
      { stage: 'Visitas (carrinhos)',  value: carts,           rate: 100 },
      { stage: 'Adicionou ao carrinho', value: cartsWithItems,
        rate: carts > 0 ? +((cartsWithItems / carts) * 100).toFixed(1) : 0 },
      { stage: 'Iniciou checkout',      value: ordersCreated,
        rate: carts > 0 ? +((ordersCreated  / carts) * 100).toFixed(1) : 0 },
      { stage: 'Pagamento confirmado',  value: ordersPaid,
        rate: carts > 0 ? +((ordersPaid     / carts) * 100).toFixed(1) : 0 },
    ])
  } catch (err) { next(err) }
})
