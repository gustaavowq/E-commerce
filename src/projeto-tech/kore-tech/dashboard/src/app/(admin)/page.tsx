// =============================================================================
// Kore Tech — Painel admin > Visão geral (overview)
// Owner: ecommerce-data-analyst (Sprint 1).
//
// Cards do topo + revenue 30d + funil do builder + top personas.
// Análise completa em /analytics.
// =============================================================================

'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import Link from 'next/link'
import {
  DollarSign, ShoppingCart, Receipt, TrendingUp, AlertTriangle,
  Layers, Users, Filter, Bell,
} from 'lucide-react'
import { adminDashboard, adminAlerts } from '@/services/admin'
import { KpiCard } from '@/components/KpiCard'
import { AnimatedNumber } from '@/components/AnimatedNumber'
import { Skeleton } from '@/components/Skeleton'
import { FunnelChart } from '@/components/FunnelChart'
import { RevenueChart } from '@/components/RevenueChart'
import { PersonaConversionTable } from '@/components/PersonaConversionTable'
import { formatBRL, formatNum } from '@/lib/format'

const PERIODS = [
  { v: 7,  label: '7 dias' },
  { v: 30, label: '30 dias' },
  { v: 90, label: '90 dias' },
]

export default function OverviewPage() {
  const [period, setPeriod] = useState(30)

  const overviewQ  = useQuery({
    queryKey: ['admin', 'dashboard', 'overview', period],
    queryFn:  () => adminDashboard.overview(period),
  })
  const revenueQ   = useQuery({
    queryKey: ['admin', 'dashboard', 'revenue', period],
    queryFn:  () => adminDashboard.revenue(period),
  })
  const funnelQ    = useQuery({
    queryKey: ['admin', 'dashboard', 'funnel-builder', period],
    queryFn:  () => adminDashboard.funnelBuilder(),
  })
  const personasQ  = useQuery({
    queryKey: ['admin', 'dashboard', 'conversao-persona', period],
    queryFn:  () => adminDashboard.conversaoPersona(period),
  })
  const alertsQ    = useQuery({
    queryKey: ['admin', 'alerts'],
    queryFn:  () => adminAlerts.list(),
    // Cache 60s — alerts é caro mas não precisa ser tempo real.
    staleTime: 60_000,
  })

  const overview = overviewQ.data

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-text">Visão geral</h1>
          <p className="text-sm text-text-secondary">
            Performance da Kore Tech nos últimos {period} dias.
            {overview && overview.ordersToday > 0 && (
              <> Hoje já saíram <strong className="text-text">{formatNum(overview.ordersToday)}</strong> pedidos.</>
            )}
          </p>
        </div>
        <div className="inline-flex rounded-md border border-border bg-surface p-0.5 text-xs">
          <Filter className="ml-2 mr-1 h-3 w-3 self-center text-text-muted" />
          {PERIODS.map(p => (
            <button
              key={p.v}
              onClick={() => setPeriod(p.v)}
              className={
                'rounded-md px-3 py-1.5 font-semibold transition ' +
                (period === p.v ? 'bg-primary text-text-on-primary' : 'text-text-secondary hover:text-text')
              }
            >
              {p.label}
            </button>
          ))}
        </div>
      </header>

      {/* Banner de alertas — só aparece se tiver alguma coisa quente */}
      {alertsQ.data && alertsQ.data.length > 0 && (
        <section className="space-y-2">
          {alertsQ.data.map((alert, i) => (
            <div
              key={i}
              className={
                'flex items-start gap-3 rounded-lg border px-4 py-3 text-sm ' +
                (alert.severity === 'red'
                  ? 'border-danger/40 bg-danger-soft text-danger'
                  : 'border-warning/40 bg-warning-soft text-warning')
              }
            >
              <span className="shrink-0 pt-0.5">
                {alert.severity === 'red'
                  ? <AlertTriangle className="h-4 w-4" />
                  : <Bell className="h-4 w-4" />}
              </span>
              <div className="flex-1">
                <p className="font-semibold">{alert.title}</p>
                <p className="text-text-secondary">{alert.message}</p>
              </div>
            </div>
          ))}
        </section>
      )}

      {/* Cards principais */}
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          label="Receita"
          value={overview ? <AnimatedNumber value={overview.revenue.value} format={formatBRL} /> : '—'}
          change={overview?.revenue.change}
          icon={<DollarSign className="h-4 w-4" />}
        />
        <KpiCard
          label="Pedidos pagos"
          value={overview ? <AnimatedNumber value={overview.paidOrders.value} format={formatNum} /> : '—'}
          change={overview?.paidOrders.change}
          icon={<ShoppingCart className="h-4 w-4" />}
          tone="success"
        />
        <KpiCard
          label="Ticket médio"
          value={overview ? <AnimatedNumber value={overview.averageTicket.value} format={formatBRL} /> : '—'}
          change={overview?.averageTicket.change}
          icon={<Receipt className="h-4 w-4" />}
        />
        <KpiCard
          label="Conversão geral"
          value={overview?.conversionRate.value !== null && overview?.conversionRate.value !== undefined
            ? <><AnimatedNumber value={overview.conversionRate.value} decimals={2} />%</>
            : '—'}
          change={overview?.conversionRate.change}
          hint={overview ? `${formatNum(overview.cartsInPeriod)} carrinhos no período` : undefined}
          icon={<TrendingUp className="h-4 w-4" />}
          tone="success"
        />
      </section>

      {/* Receita diária + funil do builder */}
      <section className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2 rounded-lg border border-border bg-surface p-5 shadow-md">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-text">Receita diária</h2>
              <p className="text-xs text-text-secondary">Soma dos pedidos pagos por dia ({period} dias)</p>
            </div>
          </div>
          {revenueQ.isLoading
            ? <Skeleton className="h-72 w-full" />
            : <RevenueChart data={revenueQ.data} />}
        </div>

        <div className="rounded-lg border border-border bg-surface p-5 shadow-md">
          <h2 className="text-sm font-bold text-text flex items-center gap-2">
            <Layers className="h-4 w-4 text-primary" /> Funil do PC Builder
          </h2>
          <p className="text-xs text-text-secondary">Onde o cliente desiste no fluxo de montagem</p>
          <div className="mt-4">
            {funnelQ.isLoading
              ? <Skeleton className="h-40 w-full" />
              : (
                <FunnelChart
                  stages={funnelQ.data?.stages ?? []}
                  isStub={funnelQ.data?.isStub}
                  stubReason={funnelQ.data?.stubReason}
                />
              )}
          </div>
        </div>
      </section>

      {/* Top personas */}
      <section className="rounded-lg border border-border bg-surface p-5 shadow-md">
        <div className="mb-3 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-text flex items-center gap-2">
              <Users className="h-4 w-4 text-primary" /> Conversão por persona
            </h2>
            <p className="text-xs text-text-secondary">Qual persona vende mais e converte melhor</p>
          </div>
          <Link href="/analytics" className="text-xs font-semibold text-primary hover:text-primary-hover">
            Ver análise completa →
          </Link>
        </div>
        {personasQ.isLoading
          ? <Skeleton className="h-40 w-full" />
          : <PersonaConversionTable rows={personasQ.data} />}
      </section>
    </div>
  )
}
