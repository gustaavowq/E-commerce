'use client'

// Dashboard rico — KpiCards com sparkline + RevenueChart + FunnelChart + TopImoveisTable
// + DistributionDonut. Layout em grid responsivo. DateRangePicker apenas visual no MVP
// (backend ainda não aceita ?range=...; refetch é cosmético, server retorna sempre 30d).

import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { get } from '@/lib/api'
import { formatBRL } from '@/lib/format'
import { KpiCard } from '@/components/painel/KpiCard'
import { RevenueChart } from '@/components/painel/RevenueChart'
import { FunnelChart } from '@/components/painel/FunnelChart'
import { TopImoveisTable } from '@/components/painel/TopImoveisTable'
import { DistributionDonut } from '@/components/painel/DistributionDonut'
import { DateRangePicker, type RangePreset } from '@/components/painel/DateRangePicker'
import type { DashboardSummary } from '@/types/api'

export default function DashboardPage() {
  const [range, setRange] = useState<RangePreset>('30d')

  const { data, isLoading, error } = useQuery({
    queryKey: ['admin-dashboard-summary', range],
    queryFn: () =>
      get<DashboardSummary>('/api/admin/dashboard/summary', { withAuth: true }),
    staleTime: 0,
  })

  if (isLoading) {
    return (
      <div>
        <DashboardHeader range={range} onRange={setRange} />
        <p className="text-body text-ash mt-12">Carregando indicadores…</p>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div>
        <DashboardHeader range={range} onRange={setRange} />
        <div className="border border-bone bg-paper p-8 mt-12">
          <p className="text-body text-ink mb-2">Indicadores indisponíveis no momento.</p>
          <p className="text-body-sm text-ash">
            Verifique se o backend está respondendo. Em breve aparecem aqui visitas, leads,
            sinais pagos e receita confirmada.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-8">
      <DashboardHeader range={range} onRange={setRange} />
      <DashboardBody data={data} />
    </div>
  )
}

function DashboardHeader({
  range, onRange,
}: { range: RangePreset; onRange: (r: RangePreset) => void }) {
  return (
    <header className="flex items-end justify-between gap-6 flex-wrap">
      <div>
        <p className="text-eyebrow uppercase tracking-[0.16em] text-ash mb-3">Painel</p>
        <h1 className="font-display text-display-lg text-ink">Dashboard</h1>
        <p className="text-body-sm text-ash mt-2">
          Visão consolidada de catálogo, leads, reservas e receita.
        </p>
      </div>
      <DateRangePicker value={range} onChange={onRange} />
    </header>
  )
}

function DashboardBody({ data }: { data: DashboardSummary }) {
  const { kpis, funil, topImoveis, serie30d, distribuicaoTipo } = data

  // Séries pra sparklines (últimos 14 dias) — derivadas de serie30d
  const last14 = useMemo(() => serie30d.slice(-14), [serie30d])
  const sparkLeads    = useMemo(() => last14.map(d => d.leads),    [last14])
  const sparkReservas = useMemo(() => last14.map(d => d.reservas), [last14])
  const sparkReceita  = useMemo(() => last14.map(d => d.receita),  [last14])

  // Sparkline pra "imóveis disponíveis": sem série histórica no backend ainda, fica linha plana.
  // (Quando backend tiver série de status, plugar aqui.)
  const sparkDisponiveis: number[] = []

  // Delta (% últimos 7d vs 7d anteriores) — calculado client-side a partir de serie30d
  const deltaLeads    = computeDelta(serie30d.map(d => d.leads))
  const deltaReservas = computeDelta(serie30d.map(d => d.reservas))
  const deltaReceita  = computeDelta(serie30d.map(d => d.receita))

  // Receita-chart usa série 30d completa
  const receitaSeries = serie30d.map(d => ({ day: d.day, valor: d.receita }))

  return (
    <>
      {/* Linha 1: 4 KPIs principais com sparkline */}
      <section
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
        aria-label="Indicadores principais"
      >
        <KpiCard
          label="Imóveis disponíveis"
          rawValue={kpis.imoveisDisponiveis}
          hint={`de ${kpis.totalImoveis} no catálogo`}
          spark={sparkDisponiveis}
        />
        <KpiCard
          label="Leads recebidos"
          rawValue={lastNSum(serie30d, 30, 'leads')}
          delta={deltaLeads}
          deltaHint="vs 7d anteriores"
          spark={sparkLeads}
        />
        <KpiCard
          label="Reservas pagas"
          rawValue={lastNSum(serie30d, 30, 'reservas')}
          delta={deltaReservas}
          deltaHint="vs 7d anteriores"
          spark={sparkReservas}
        />
        <KpiCard
          label="Receita confirmada"
          value={formatBRL(lastNSum(serie30d, 30, 'receita'))}
          delta={deltaReceita}
          deltaHint="vs 7d anteriores"
          spark={sparkReceita}
        />
      </section>

      {/* Linha 2: Revenue (2/3) + Donut (1/3) */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <RevenueChart
          data={receitaSeries}
          className="lg:col-span-2"
        />
        <DistributionDonut data={distribuicaoTipo} />
      </section>

      {/* Linha 3: Funil (2/3) + TopImoveis (1/3) */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <FunnelChart etapas={funil} className="lg:col-span-2" />
        <TopImoveisTable imoveis={topImoveis} />
      </section>

      {/* Linha 4: KPIs financeiros secundários */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          label="Ticket médio"
          value={formatBRL(kpis.ticketMedio)}
          hint="média dos sinais aprovados"
        />
        <KpiCard
          label="Conversão lead → reserva"
          value={`${(kpis.conversao ?? 0).toFixed(2)}%`}
          hint="leads que viraram sinal"
        />
        <KpiCard
          label="Taxa de fechamento"
          value={`${(kpis.taxaFechamento ?? 0).toFixed(2)}%`}
          hint="reservas que viraram venda"
        />
        <KpiCard
          label="Receita prevista"
          value={formatBRL(kpis.receitaPrevista)}
          hint={`${kpis.reservasAtivasCount} reserva${kpis.reservasAtivasCount === 1 ? '' : 's'} ativa${kpis.reservasAtivasCount === 1 ? '' : 's'}`}
        />
      </section>
    </>
  )
}

// ===== Helpers =====

function lastNSum(
  series: Array<{ leads: number; reservas: number; receita: number }>,
  n: number,
  key: 'leads' | 'reservas' | 'receita',
): number {
  return series.slice(-n).reduce((acc, d) => acc + (d[key] ?? 0), 0)
}

// % de variação dos últimos 7d vs 7d anteriores. null se janela anterior = 0
// (evita Infinity falso) e retorna 0 quando ambas são 0.
function computeDelta(values: number[]): number | null {
  if (values.length < 14) return null
  const cur  = values.slice(-7).reduce((a, b) => a + b, 0)
  const prev = values.slice(-14, -7).reduce((a, b) => a + b, 0)
  if (prev === 0 && cur === 0) return 0
  if (prev === 0) return null
  return ((cur - prev) / prev) * 100
}
