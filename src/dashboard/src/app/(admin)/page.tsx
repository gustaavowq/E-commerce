'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  DollarSign, ShoppingCart, TrendingUp, AlertTriangle,
  Receipt, XCircle, Filter, Package, Layers,
} from 'lucide-react'
import Link from 'next/link'
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid,
  BarChart, Bar, Cell, PieChart, Pie, Legend,
} from 'recharts'
import { adminDashboard } from '@/services/admin'
import { KpiCard } from '@/components/KpiCard'
import { formatBRL, formatNum, formatDate } from '@/lib/format'

const PERIODS = [
  { v: 7,  label: '7 dias' },
  { v: 30, label: '30 dias' },
  { v: 90, label: '90 dias' },
]

const STATUS_LABEL: Record<string, string> = {
  PENDING_PAYMENT: 'Aguardando pagamento',
  PAID:            'Pago',
  PREPARING:       'Em separação',
  SHIPPED:         'Enviado',
  DELIVERED:       'Entregue',
  CANCELLED:       'Cancelado',
  REFUNDED:        'Reembolsado',
}

const STATUS_COLORS: Record<string, string> = {
  PENDING_PAYMENT: '#F59E0B',
  PAID:            '#16A34A',
  PREPARING:       '#0EA5E9',
  SHIPPED:         '#2E7D32',
  DELIVERED:       '#1B5E20',
  CANCELLED:       '#DC2626',
  REFUNDED:        '#94A3B8',
}

export default function OverviewPage() {
  const [period, setPeriod] = useState(30)

  const summaryQ  = useQuery({ queryKey: ['admin', 'summary',  period], queryFn: () => adminDashboard.summary(period) })
  const revenueQ  = useQuery({ queryKey: ['admin', 'revenue',  period], queryFn: () => adminDashboard.revenue(period) })
  const statusQ   = useQuery({ queryKey: ['admin', 'orders-by-status', period], queryFn: () => adminDashboard.ordersByStatus(period) })
  const topQ      = useQuery({ queryKey: ['admin', 'top-products', period], queryFn: () => adminDashboard.topProducts(period, 5) })
  const catQ      = useQuery({ queryKey: ['admin', 'revenue-by-category', period], queryFn: () => adminDashboard.revenueByCategory(period) })
  const funnelQ   = useQuery({ queryKey: ['admin', 'funnel',   period], queryFn: () => adminDashboard.funnel(period) })

  const summary = summaryQ.data

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-ink">Visão geral</h1>
          <p className="text-sm text-ink-3">
            Como tá rolando a Miami nos últimos {period} dias.
            {summary && summary.ordersToday > 0 && (
              <> Hoje já saíram <strong className="text-ink">{formatNum(summary.ordersToday)}</strong> pedidos.</>
            )}
          </p>
        </div>
        <div className="inline-flex rounded-md border border-border bg-white p-0.5 text-xs">
          <Filter className="ml-2 mr-1 h-3 w-3 self-center text-ink-3" />
          {PERIODS.map(p => (
            <button
              key={p.v}
              onClick={() => setPeriod(p.v)}
              className={
                'rounded-md px-3 py-1.5 font-semibold transition ' +
                (period === p.v ? 'bg-primary-700 text-white' : 'text-ink-3 hover:text-ink')
              }
            >
              {p.label}
            </button>
          ))}
        </div>
      </header>

      {/* Alertas operacionais — só aparecem se tiver problema */}
      {summary && (summary.alerts.stuckInPreparing > 0 || summary.alerts.lowStock > 0 || summary.alerts.highCancellation) && (
        <section className="space-y-2">
          {summary.alerts.stuckInPreparing > 0 && (
            <Alert tone="warning" icon={<Package className="h-4 w-4" />}>
              <strong>{summary.alerts.stuckInPreparing}</strong> {summary.alerts.stuckInPreparing === 1 ? 'pedido parado' : 'pedidos parados'} em separação há mais de 48h.
              <Link href="/orders?status=PREPARING" className="ml-2 underline">Ver pedidos</Link>
            </Alert>
          )}
          {summary.alerts.lowStock > 0 && (
            <Alert tone="warning" icon={<AlertTriangle className="h-4 w-4" />}>
              <strong>{summary.alerts.lowStock}</strong> {summary.alerts.lowStock === 1 ? 'SKU com pouco estoque' : 'SKUs com pouco estoque'} (menos de 5 unidades).
              <Link href="/products" className="ml-2 underline">Ver produtos</Link>
            </Alert>
          )}
          {summary.alerts.highCancellation && (
            <Alert tone="error" icon={<XCircle className="h-4 w-4" />}>
              Taxa de cancelamento <strong>{summary.cancellationRate.value}%</strong> (acima de 10%). Vale investigar pagamento ou checkout.
            </Alert>
          )}
        </section>
      )}

      {/* KPIs principais */}
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          label="Receita"
          value={summary ? formatBRL(summary.revenue.value) : '—'}
          change={summary?.revenue.change}
          icon={<DollarSign className="h-4 w-4" />}
        />
        <KpiCard
          label="Pedidos pagos"
          value={summary ? formatNum(summary.paidOrders.value) : '—'}
          change={summary?.paidOrders.change}
          icon={<ShoppingCart className="h-4 w-4" />}
          tone="success"
        />
        <KpiCard
          label="Ticket médio"
          value={summary ? formatBRL(summary.averageTicket.value) : '—'}
          change={summary?.averageTicket.change}
          icon={<Receipt className="h-4 w-4" />}
        />
        <KpiCard
          label="Taxa de cancelamento"
          value={summary ? `${summary.cancellationRate.value}%` : '—'}
          change={summary?.cancellationRate.change}
          invertChange  /* aumentar cancelamento é RUIM */
          icon={<XCircle className="h-4 w-4" />}
          tone={summary && summary.cancellationRate.value > 10 ? 'error' : 'default'}
        />
      </section>

      {/* KPIs secundários: conversão + abandono */}
      <section className="grid gap-4 sm:grid-cols-3">
        <KpiCard
          label="Taxa de conversão"
          value={summary?.conversionRate != null ? `${summary.conversionRate}%` : '—'}
          hint={summary ? `${summary.cartsInPeriod} carrinhos no período` : undefined}
          icon={<TrendingUp className="h-4 w-4" />}
          tone="success"
        />
        <KpiCard
          label="Abandono de carrinho"
          value={summary?.abandonmentRate != null ? `${summary.abandonmentRate}%` : '—'}
          hint="Carrinhos com item que NÃO viraram pedido"
          icon={<ShoppingCart className="h-4 w-4" />}
          tone={summary && (summary.abandonmentRate ?? 0) > 70 ? 'warning' : 'default'}
        />
        <KpiCard
          label="SKUs com pouco estoque"
          value={summary ? formatNum(summary.lowStockSkus) : '—'}
          hint={summary ? `de ${summary.activeProducts} produtos ativos` : undefined}
          icon={<AlertTriangle className="h-4 w-4" />}
          tone={summary && summary.lowStockSkus > 0 ? 'warning' : 'default'}
        />
      </section>

      {/* Gráficos: receita diária + funil */}
      <section className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2 rounded-lg border border-border bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-ink">Receita diária</h2>
              <p className="text-xs text-ink-3">Soma dos pedidos pagos por dia</p>
            </div>
          </div>
          <div className="h-72">
            {revenueQ.isLoading ? <Skeleton /> : revenueQ.data && revenueQ.data.some(d => d.total > 0) ? (
              <ResponsiveContainer>
                <LineChart data={revenueQ.data} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                  <XAxis dataKey="date" tickFormatter={d => d.slice(5)} fontSize={11} stroke="#94A3B8" />
                  <YAxis tickFormatter={v => v >= 1000 ? `R$${(v / 1000).toFixed(0)}k` : `R$${v}`} fontSize={11} stroke="#94A3B8" />
                  <Tooltip
                    formatter={(v: number, name: string) =>
                      name === 'total' ? [formatBRL(v), 'Receita'] : [v, 'Pedidos']}
                    labelFormatter={l => formatDate(l)}
                  />
                  <Line type="monotone" dataKey="total" stroke="#1B5E20" strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 5 }} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <EmptyChart label="Nenhum pedido pago no período" />
            )}
          </div>
        </div>

        {/* Funil */}
        <div className="rounded-lg border border-border bg-white p-5 shadow-sm">
          <h2 className="text-sm font-bold text-ink flex items-center gap-2"><Layers className="h-4 w-4 text-primary-700" /> Funil de conversão</h2>
          <p className="text-xs text-ink-3">Onde os clientes saem</p>
          <div className="mt-4 space-y-3">
            {funnelQ.isLoading ? (
              <Skeleton />
            ) : funnelQ.data && funnelQ.data.length > 0 ? (
              funnelQ.data.map((stage, i) => {
                const widthPct = funnelQ.data![0].value > 0
                  ? (stage.value / funnelQ.data![0].value) * 100
                  : 0
                return (
                  <div key={i}>
                    <div className="flex items-baseline justify-between text-xs">
                      <span className="font-medium text-ink-2">{stage.stage}</span>
                      <span className="font-mono text-ink">{formatNum(stage.value)} <span className="text-ink-4">({stage.rate}%)</span></span>
                    </div>
                    <div className="mt-1 h-2 overflow-hidden rounded-full bg-surface-2">
                      <div className="h-full rounded-full bg-primary-700 transition-all" style={{ width: `${Math.max(2, widthPct)}%` }} />
                    </div>
                  </div>
                )
              })
            ) : (
              <p className="text-sm text-ink-3">Sem dados de funil ainda.</p>
            )}
          </div>
        </div>
      </section>

      {/* Pedidos por status (donut) + receita por categoria (bar) */}
      <section className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-lg border border-border bg-white p-5 shadow-sm">
          <h2 className="text-sm font-bold text-ink">Pedidos por status</h2>
          <p className="text-xs text-ink-3">Distribuição no período</p>
          <div className="h-64">
            {statusQ.isLoading ? <Skeleton /> : statusQ.data && statusQ.data.length > 0 ? (
              <ResponsiveContainer>
                <PieChart>
                  <Pie
                    data={statusQ.data.map(d => ({ ...d, label: STATUS_LABEL[d.status] ?? d.status }))}
                    dataKey="count"
                    nameKey="label"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={2}
                  >
                    {statusQ.data.map((entry, i) => (
                      <Cell key={i} fill={STATUS_COLORS[entry.status] ?? '#94A3B8'} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <EmptyChart label="Nenhum pedido no período" />
            )}
          </div>
        </div>

        <div className="rounded-lg border border-border bg-white p-5 shadow-sm">
          <h2 className="text-sm font-bold text-ink">Receita por categoria</h2>
          <p className="text-xs text-ink-3">Qual categoria está vendendo mais</p>
          <div className="h-64">
            {catQ.isLoading ? <Skeleton /> : catQ.data && catQ.data.length > 0 ? (
              <ResponsiveContainer>
                <BarChart data={catQ.data} layout="vertical" margin={{ left: 10, right: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                  <XAxis type="number" tickFormatter={v => v >= 1000 ? `R$${(v / 1000).toFixed(0)}k` : `R$${v}`} fontSize={11} stroke="#94A3B8" />
                  <YAxis type="category" dataKey="category" width={120} fontSize={11} stroke="#94A3B8" />
                  <Tooltip formatter={(v: number) => [formatBRL(v), 'Receita']} />
                  <Bar dataKey="revenue" fill="#1B5E20" radius={[0, 6, 6, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <EmptyChart label="Sem vendas por categoria ainda" />
            )}
          </div>
        </div>
      </section>

      {/* Top produtos */}
      <section className="rounded-lg border border-border bg-white p-5 shadow-sm">
        <h2 className="text-sm font-bold text-ink">Top 5 produtos vendidos</h2>
        <p className="text-xs text-ink-3">Por quantidade de unidades no período</p>
        <div className="mt-4">
          {topQ.isLoading ? (
            <Skeleton />
          ) : topQ.data && topQ.data.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-border">
                <thead className="bg-surface-2 text-left text-[11px] font-semibold uppercase tracking-wider text-ink-3">
                  <tr>
                    <th className="px-4 py-2">#</th>
                    <th className="px-4 py-2">Produto</th>
                    <th className="px-4 py-2">Marca</th>
                    <th className="px-4 py-2">Categoria</th>
                    <th className="px-4 py-2 text-right">Vendidos</th>
                    <th className="px-4 py-2 text-right">Receita</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border bg-white">
                  {topQ.data.map((row, i) => (
                    <tr key={row.product?.id ?? i} className="hover:bg-surface-2/50">
                      <td className="table-cell-base font-mono text-ink-3">#{i + 1}</td>
                      <td className="table-cell-base">
                        {row.product ? (
                          <Link href={`/products/${row.product.id}`} className="font-medium text-ink hover:text-primary-700">
                            {row.product.name}
                          </Link>
                        ) : <span className="text-ink-4">—</span>}
                      </td>
                      <td className="table-cell-base text-ink-2">{row.product?.brand?.name ?? '—'}</td>
                      <td className="table-cell-base text-ink-2">{row.product?.category?.name ?? '—'}</td>
                      <td className="table-cell-base text-right font-mono text-ink-2">{formatNum(row.quantity)}</td>
                      <td className="table-cell-base text-right font-mono font-semibold text-ink">{formatBRL(row.revenue)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <EmptyChart label="Sem vendas no período" />
          )}
        </div>
      </section>
    </div>
  )
}

function Skeleton() {
  return <div className="h-full w-full animate-pulse rounded-md bg-surface-2" />
}
function EmptyChart({ label }: { label: string }) {
  return <div className="flex h-full items-center justify-center text-sm text-ink-4">{label}</div>
}
function Alert({ tone, icon, children }: { tone: 'warning' | 'error'; icon: React.ReactNode; children: React.ReactNode }) {
  const cls = tone === 'error'
    ? 'border-error/30 bg-error/5 text-error'
    : 'border-warning/30 bg-warning/5 text-warning'
  return (
    <div className={`flex items-center gap-2 rounded-lg border px-4 py-2.5 text-sm ${cls}`}>
      <span className="shrink-0">{icon}</span>
      <p className="text-ink-2"><span className={tone === 'error' ? 'text-error' : 'text-warning'}>{children}</span></p>
    </div>
  )
}
