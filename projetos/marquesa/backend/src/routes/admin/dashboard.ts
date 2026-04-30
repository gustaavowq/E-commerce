// KPIs do painel da imobiliária. Stub funcional — Data Analyst pode expandir.
//
// Endpoints:
//   GET /api/admin/dashboard/kpis    → métricas top-line + funil (legado)
//   GET /api/admin/dashboard/summary → consolidado pro painel (funil + topImoveis + kpis + reservasAtivasResumo)
//   GET /api/admin/dashboard/series?metric=reservas&days=30 → série temporal
import { Router } from 'express'
import { z } from 'zod'
import { prisma } from '../../lib/prisma.js'
import { ok } from '../../lib/api-response.js'

export const adminDashboardRouter: Router = Router()

adminDashboardRouter.get('/kpis', async (_req, res, next) => {
  try {
    const now = new Date()
    const ms30d = 30 * 24 * 60 * 60 * 1000
    const since30d = new Date(now.getTime() - ms30d)

    const [
      totalImoveis,
      disponiveis,
      reservados,
      vendidos,
      totalLeads,
      leadsRecent,
      reservasAtivas,
      reservasAprovadas,
      reservasConvertidas,
      reservasAprovadasAgg,
      reservasConvertidasAgg,
    ] = await Promise.all([
      prisma.imovel.count(),
      prisma.imovel.count({ where: { status: 'DISPONIVEL' } }),
      prisma.imovel.count({ where: { status: 'RESERVADO' } }),
      prisma.imovel.count({ where: { status: 'VENDIDO' } }),
      prisma.lead.count(),
      prisma.lead.count({ where: { createdAt: { gte: since30d } } }),
      prisma.reserva.count({ where: { status: 'ATIVA', pagamentoStatus: 'APROVADO' } }),
      prisma.reserva.count({ where: { pagamentoStatus: 'APROVADO' } }),
      prisma.reserva.count({ where: { status: 'CONVERTIDA' } }),
      prisma.reserva.aggregate({
        where: { pagamentoStatus: 'APROVADO' },
        _sum: { valorSinal: true },
      }),
      prisma.reserva.aggregate({
        where: { status: 'CONVERTIDA' },
        _sum: { valorSinal: true },
        _count: { id: true },
      }),
    ])

    // Ticket médio: preço médio dos imóveis VENDIDOS
    const vendidosAgg = await prisma.imovel.aggregate({
      where: { status: 'VENDIDO' },
      _avg:  { preco: true },
    })

    // Conversão: sinais aprovados / leads (30d)
    const conversao30d = leadsRecent > 0
      ? Number(((reservasAprovadas / leadsRecent) * 100).toFixed(1))
      : 0

    // Taxa de fechamento: convertidas / aprovadas
    const fechamento = reservasAprovadas > 0
      ? Number(((reservasConvertidas / reservasAprovadas) * 100).toFixed(1))
      : 0

    return ok(res, {
      imoveis: {
        total:       totalImoveis,
        disponiveis,
        reservados,
        vendidos,
      },
      reservas: {
        ativas:           reservasAtivas,
        aprovadasTotais:  reservasAprovadas,
        convertidas:      reservasConvertidas,
        somaSinaisAprov:  Number(reservasAprovadasAgg._sum.valorSinal ?? 0),
        somaSinaisConv:   Number(reservasConvertidasAgg._sum.valorSinal ?? 0),
      },
      leads: {
        total:    totalLeads,
        last30d:  leadsRecent,
      },
      financeiro: {
        ticketMedioVendidos:  Number(vendidosAgg._avg.preco ?? 0),
        conversaoLeadParaSinalPercent: conversao30d,
        taxaFechamentoPercent: fechamento,
      },
      generatedAt: now.toISOString(),
    })
  } catch (err) {
    next(err)
  }
})

const seriesQuerySchema = z.object({
  metric: z.enum(['leads', 'reservas', 'sinaisAprovados']).default('reservas'),
  days:   z.coerce.number().int().min(7).max(365).default(30),
})

adminDashboardRouter.get('/series', async (req, res, next) => {
  try {
    const q = seriesQuerySchema.parse(req.query)
    const since = new Date(Date.now() - q.days * 24 * 60 * 60 * 1000)

    let rows: { day: string; count: number }[] = []
    if (q.metric === 'leads') {
      const data = await prisma.$queryRaw<Array<{ day: Date; count: bigint }>>`
        SELECT date_trunc('day', "created_at") AS day, COUNT(*)::bigint AS count
        FROM leads
        WHERE "created_at" >= ${since}
        GROUP BY 1 ORDER BY 1
      `
      rows = data.map(d => ({ day: d.day.toISOString().slice(0, 10), count: Number(d.count) }))
    } else if (q.metric === 'reservas') {
      const data = await prisma.$queryRaw<Array<{ day: Date; count: bigint }>>`
        SELECT date_trunc('day', "created_at") AS day, COUNT(*)::bigint AS count
        FROM reservas
        WHERE "created_at" >= ${since}
        GROUP BY 1 ORDER BY 1
      `
      rows = data.map(d => ({ day: d.day.toISOString().slice(0, 10), count: Number(d.count) }))
    } else {
      const data = await prisma.$queryRaw<Array<{ day: Date; count: bigint }>>`
        SELECT date_trunc('day', "paid_at") AS day, COUNT(*)::bigint AS count
        FROM reservas
        WHERE "paid_at" IS NOT NULL AND "paid_at" >= ${since}
          AND "pagamento_status" = 'APROVADO'
        GROUP BY 1 ORDER BY 1
      `
      rows = data.map(d => ({ day: d.day.toISOString().slice(0, 10), count: Number(d.count) }))
    }

    return ok(res, rows, { total: rows.length })
  } catch (err) {
    next(err)
  }
})

// =====================================================================
// GET /api/admin/dashboard/summary — consolidado
// Retorna { funil, topImoveis, kpis, reservasAtivasResumo }
// =====================================================================
adminDashboardRouter.get('/summary', async (_req, res, next) => {
  try {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)

    // Funil simplificado (4 etapas — etapas offline tipo "visita ao imóvel" ficam V2)
    const [totalViewsAgg, totalLeads, reservasPagas, reservasConvertidas] = await Promise.all([
      prisma.imovel.aggregate({ _sum: { viewCount: true } }),
      prisma.lead.count(),
      prisma.reserva.count({ where: { pagamentoStatus: 'APROVADO' } }),
      prisma.reserva.count({ where: { status: 'CONVERTIDA' } }),
    ])
    const totalViews = totalViewsAgg._sum.viewCount ?? 0

    const funil = [
      { etapa: 'Visitas catálogo', count: totalViews },
      { etapa: 'Leads',            count: totalLeads },
      { etapa: 'Sinais pagos',     count: reservasPagas },
      { etapa: 'Vendidos',         count: reservasConvertidas },
    ]

    // Top 5 por engagement score (viewCount + leads*5 + reservas*20)
    const topImoveisRaw = await prisma.$queryRaw<Array<{
      id: string; slug: string; titulo: string; bairro: string;
      view_count: number; score: number
    }>>`
      SELECT i.id, i.slug, i.titulo, i.bairro, i."view_count",
        (i."view_count" + COALESCE(l.leads * 5, 0) + COALESCE(r.reservas * 20, 0))::int as score
      FROM imoveis i
      LEFT JOIN (
        SELECT "imovel_id", COUNT(*)::int as leads
        FROM leads GROUP BY "imovel_id"
      ) l ON l."imovel_id" = i.id
      LEFT JOIN (
        SELECT "imovel_id", COUNT(*)::int as reservas
        FROM reservas GROUP BY "imovel_id"
      ) r ON r."imovel_id" = i.id
      WHERE i.status <> 'INATIVO'
      ORDER BY score DESC NULLS LAST
      LIMIT 5
    `
    const topImoveis = topImoveisRaw.map(t => ({
      id:        t.id,
      slug:      t.slug,
      titulo:    t.titulo,
      bairro:    t.bairro,
      viewCount: Number(t.view_count ?? 0),
      score:     Number(t.score ?? 0),
    }))

    // Ticket médio (preço cheio dos sinais aprovados últimos 30d)
    const ticketMedioAgg = await prisma.reserva.aggregate({
      where: { pagamentoStatus: 'APROVADO', paidAt: { gte: thirtyDaysAgo } },
      _avg:  { precoSnapshot: true },
    })

    // Reservas ATIVAS aprovadas — sinais ativos + receita prevista (preço cheio)
    const reservasAtivasAgg = await prisma.reserva.aggregate({
      where: { status: 'ATIVA', pagamentoStatus: 'APROVADO' },
      _count: true,
      _sum:   { valorSinal: true, precoSnapshot: true },
    })

    const [totalImoveis, imoveisDisponiveis, imoveisVendidos] = await Promise.all([
      prisma.imovel.count(),
      prisma.imovel.count({ where: { status: 'DISPONIVEL' } }),
      prisma.imovel.count({ where: { status: 'VENDIDO' } }),
    ])

    const conversao = totalLeads > 0
      ? Number(((reservasPagas / totalLeads) * 100).toFixed(2))
      : 0
    const taxaFechamento = reservasPagas > 0
      ? Number(((reservasConvertidas / reservasPagas) * 100).toFixed(2))
      : 0

    const kpis = {
      ticketMedio:           Number(ticketMedioAgg._avg.precoSnapshot ?? 0),
      conversao,                                 // %
      taxaFechamento,                            // %
      receitaPrevista:       Number(reservasAtivasAgg._sum.precoSnapshot ?? 0),
      receitaSinaisAtivos:   Number(reservasAtivasAgg._sum.valorSinal   ?? 0),
      reservasAtivasCount:   reservasAtivasAgg._count,
      totalImoveis,
      imoveisDisponiveis,
      imoveisVendidos,
    }

    const reservasAtivasResumo = {
      count:           reservasAtivasAgg._count,
      somaSinais:      Number(reservasAtivasAgg._sum.valorSinal   ?? 0),
      somaPrecoCheio:  Number(reservasAtivasAgg._sum.precoSnapshot ?? 0),
    }

    return ok(res, { funil, topImoveis, kpis, reservasAtivasResumo })
  } catch (err) {
    next(err)
  }
})
