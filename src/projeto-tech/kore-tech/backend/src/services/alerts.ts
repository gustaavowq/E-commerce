// =============================================================================
// Kore Tech — Auto-alertas operacionais
// Owner: ecommerce-data-analyst (Agente 04).
//
// Roda via endpoint POST /api/admin/alerts/run (dispara manualmente) ou
// agendado por cron diário às 09:00 BRT (12:00 UTC) — ver devops scheduler.
//
// Tipos de alerta (severidade vermelha = ação imediata; amarela = monitorar):
//   - low_stock_critical   → produto popular com stock < 5            (vermelho)
//   - waitlist_stagnant    → waitlist > 20 sem reposição há > 14 dias (amarelo)
//   - ticket_falling       → ticket médio semanal < 85% da semana ant (amarelo)
//   - doa_epidemic         → DOA > 5% em qualquer categoria (14d)     (vermelho)
//   - bto_delayed          → P90 tempo BTO > 7 dias                   (amarelo)
//   - return_above_normal  → devolução > 5% em uma categoria (30d)    (amarelo)
//
// Dispatch: log estruturado + chamada email service (Resend, no-op se ausente).
// NÃO envia email pra cliente final — só pro time ops/admin.
// =============================================================================

import { prisma } from '../lib/prisma.js'

export type AlertSeverity = 'red' | 'yellow'
export type AlertKind =
  | 'low_stock_critical'
  | 'waitlist_stagnant'
  | 'ticket_falling'
  | 'doa_epidemic'
  | 'bto_delayed'
  | 'return_above_normal'

export type Alert = {
  kind: AlertKind
  severity: AlertSeverity
  title: string
  message: string
  context: Record<string, unknown>
  detectedAt: Date
}

// Helper data
function daysAgo(n: number): Date {
  const d = new Date()
  d.setUTCDate(d.getUTCDate() - n)
  d.setUTCHours(0, 0, 0, 0)
  return d
}

// ----------------------------------------------------------------------------
// 1. LOW STOCK CRITICAL — produto top-20 vendas com stock < 5
// ----------------------------------------------------------------------------
async function checkLowStockCritical(): Promise<Alert[]> {
  const top20 = await prisma.$queryRaw<Array<{
    product_id: string; name: string; sold: bigint;
  }>>`
    SELECT
      p.id     AS product_id,
      p.name   AS name,
      SUM(oi.quantity)::bigint AS sold
    FROM order_items oi
    JOIN orders   o ON o.id = oi.order_id
    JOIN products p ON p.id = oi.product_id
    WHERE o.status IN ('PAID','PREPARING','SHIPPED','DELIVERED')
      AND o.created_at >= NOW() - INTERVAL '30 days'
    GROUP BY p.id, p.name
    ORDER BY sold DESC
    LIMIT 20
  `
  if (top20.length === 0) return []

  const ids = top20.map(t => t.product_id)
  const lowStock = await prisma.productVariation.findMany({
    where: {
      productId: { in: ids },
      isActive:  true,
      stock:     { lt: 5 },
    },
    include: {
      product: { select: { id: true, name: true, slug: true, hardwareCategory: true } },
    },
  })

  return lowStock.map<Alert>(v => ({
    kind:     'low_stock_critical',
    severity: 'red',
    title:    `Estoque crítico: ${v.product.name}`,
    message:  `SKU ${v.sku} (${v.size}${v.color ? ' / ' + v.color : ''}) com apenas ${v.stock} ${v.stock === 1 ? 'unidade' : 'unidades'}. Produto está entre os top-20 vendidos no mês.`,
    context: {
      productId:        v.product.id,
      productSlug:      v.product.slug,
      variationId:      v.id,
      sku:              v.sku,
      stock:            v.stock,
      hardwareCategory: v.product.hardwareCategory,
    },
    detectedAt: new Date(),
  }))
}

// ----------------------------------------------------------------------------
// 2. WAITLIST STAGNANT — waitlist > 20 sem reposição (= sem stock entrar) > 14d
// ----------------------------------------------------------------------------
async function checkWaitlistStagnant(): Promise<Alert[]> {
  const rows = await prisma.$queryRaw<Array<{
    product_id: string; name: string; slug: string;
    waiting_count: bigint; first_subscription_at: Date; days_waiting: number;
    current_stock: bigint;
  }>>`
    SELECT
      p.id, p.name, p.slug,
      COUNT(ws.id)::bigint                                       AS waiting_count,
      MIN(ws.created_at)                                         AS first_subscription_at,
      EXTRACT(EPOCH FROM (NOW() - MIN(ws.created_at))) / 86400   AS days_waiting,
      COALESCE(SUM(pv.stock), 0)::bigint                         AS current_stock
    FROM waitlist_subscriptions ws
    JOIN products p ON p.id = ws.product_id
    LEFT JOIN product_variations pv ON pv.product_id = p.id AND pv.is_active = true
    WHERE ws.notified_at IS NULL
    GROUP BY p.id, p.name, p.slug
    HAVING COUNT(ws.id) > 20
       AND COALESCE(SUM(pv.stock), 0) = 0
       AND EXTRACT(EPOCH FROM (NOW() - MIN(ws.created_at))) / 86400 > 14
    ORDER BY waiting_count DESC
  `

  return rows.map<Alert>(r => ({
    kind:     'waitlist_stagnant',
    severity: 'yellow',
    title:    `Lista de espera estagnada: ${r.name}`,
    message:  `${Number(r.waiting_count)} pessoas esperando há ${Math.round(Number(r.days_waiting))} dias. Estoque atual: 0. Vale priorizar reposição ou comunicar ETA.`,
    context: {
      productId:        r.product_id,
      productSlug:      r.slug,
      waitingCount:     Number(r.waiting_count),
      daysWaiting:      Number(r.days_waiting),
    },
    detectedAt: new Date(),
  }))
}

// ----------------------------------------------------------------------------
// 3. TICKET FALLING — ticket médio semana atual < 85% da semana anterior
// ----------------------------------------------------------------------------
async function checkTicketFalling(): Promise<Alert[]> {
  const sinceThis = daysAgo(7)
  const sincePrev = daysAgo(14)

  const [thisWeek, prevWeek] = await Promise.all([
    prisma.order.aggregate({
      where: { status: { in: ['PAID', 'PREPARING', 'SHIPPED', 'DELIVERED'] }, createdAt: { gte: sinceThis } },
      _sum: { total: true },
      _count: true,
    }),
    prisma.order.aggregate({
      where: { status: { in: ['PAID', 'PREPARING', 'SHIPPED', 'DELIVERED'] }, createdAt: { gte: sincePrev, lt: sinceThis } },
      _sum: { total: true },
      _count: true,
    }),
  ])

  const ticketThis = thisWeek._count > 0 ? Number(thisWeek._sum.total ?? 0) / thisWeek._count : 0
  const ticketPrev = prevWeek._count > 0 ? Number(prevWeek._sum.total ?? 0) / prevWeek._count : 0

  if (ticketPrev === 0) return []  // Sem base de comparação
  if (thisWeek._count < 5) return []  // Poucos pedidos = ruído estatístico

  const ratio = ticketThis / ticketPrev
  if (ratio >= 0.85) return []

  const dropPct = +((1 - ratio) * 100).toFixed(1)

  return [{
    kind:     'ticket_falling',
    severity: 'yellow',
    title:    `Ticket médio caiu ${dropPct}% essa semana`,
    message:  `Ticket atual: R$ ${ticketThis.toFixed(2)} (vs R$ ${ticketPrev.toFixed(2)} na semana anterior). Pode ser mix de produtos, cupom agressivo, ou queda de PCs montados.`,
    context: {
      ticketThisWeek:  ticketThis,
      ticketPrevWeek:  ticketPrev,
      dropPct,
      ordersThisWeek:  thisWeek._count,
      ordersPrevWeek:  prevWeek._count,
    },
    detectedAt: new Date(),
  }]
}

// ----------------------------------------------------------------------------
// 4. DOA EPIDEMIC — DOA > 5% em qualquer categoria nos últimos 14 dias
//
// TODO BACKEND_READY: depende de OrderReturn model. Stub retorna [] até existir.
// ----------------------------------------------------------------------------
async function checkDoaEpidemic(): Promise<Alert[]> {
  // TODO BACKEND_READY: query similar a /doa endpoint, threshold > 5%.
  return []
}

// ----------------------------------------------------------------------------
// 5. BTO DELAYED — P90 tempo de Build-to-Order > 7 dias
// ----------------------------------------------------------------------------
async function checkBtoDelayed(): Promise<Alert[]> {
  const since = daysAgo(30)

  const rows = await prisma.$queryRaw<Array<{
    p90_days: number | null; total_pcs: bigint;
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
      COUNT(*)::bigint AS total_pcs,
      PERCENTILE_CONT(0.9) WITHIN GROUP (ORDER BY EXTRACT(EPOCH FROM (shipped_at - paid_at)) / 86400)::float8 AS p90_days
    FROM bto_orders
  `

  const r = rows[0]
  if (!r || Number(r.total_pcs) < 5) return []  // Sem amostra suficiente
  if (r.p90_days === null || r.p90_days === undefined) return []
  if (r.p90_days <= 7) return []

  return [{
    kind:     'bto_delayed',
    severity: r.p90_days > 10 ? 'red' : 'yellow',
    title:    `Tempo de montagem (BTO) acima do SLA`,
    message:  `P90 do tempo entre pagamento e despacho está em ${r.p90_days.toFixed(1)} dias (SLA prometido: até 7 dias). ${Number(r.total_pcs)} PCs analisados nos últimos 30 dias.`,
    context: {
      p90Days:      r.p90_days,
      slaTarget:    7,
      sampleSize:   Number(r.total_pcs),
    },
    detectedAt: new Date(),
  }]
}

// ----------------------------------------------------------------------------
// 6. RETURN ABOVE NORMAL — devolução > 5% em uma categoria (30d)
//
// TODO BACKEND_READY: depende de OrderReturn model. Stub retorna [].
// ----------------------------------------------------------------------------
async function checkReturnAboveNormal(): Promise<Alert[]> {
  // TODO BACKEND_READY: similar a /devolucao-7dias, threshold > 5%.
  return []
}

// ----------------------------------------------------------------------------
// Dispatcher
// ----------------------------------------------------------------------------

/** Roda todos os checks em paralelo e devolve a lista plana de alertas. */
export async function runAllAlertChecks(): Promise<Alert[]> {
  const results = await Promise.all([
    checkLowStockCritical(),
    checkWaitlistStagnant(),
    checkTicketFalling(),
    checkDoaEpidemic(),
    checkBtoDelayed(),
    checkReturnAboveNormal(),
  ])
  return results.flat()
}

/**
 * Dispatch dos alertas: log estruturado + (opcional) email pra ops.
 * Email é placeholder — Backend/Devops integra Resend depois.
 */
export async function dispatchAlerts(alerts: Alert[]): Promise<{ logged: number; emailed: number }> {
  let emailed = 0

  for (const alert of alerts) {
    // Log estruturado (vai pro pino do backend)
    console.log(JSON.stringify({
      type: 'alert',
      kind:     alert.kind,
      severity: alert.severity,
      title:    alert.title,
      message:  alert.message,
      context:  alert.context,
      detectedAt: alert.detectedAt.toISOString(),
    }))

    // TODO BACKEND_READY: integrar Resend pra envio real
    // if (env.RESEND_API_KEY && env.OPS_EMAIL) {
    //   await sendEmail({
    //     to: env.OPS_EMAIL,
    //     subject: `[Kore Tech] ${alert.severity === 'red' ? 'CRÍTICO' : 'AVISO'}: ${alert.title}`,
    //     html: renderAlertEmail(alert),
    //   })
    //   emailed++
    // }
  }

  return { logged: alerts.length, emailed }
}
