'use client'

import { useQuery } from '@tanstack/react-query'
import { get } from '@/lib/api'
import { formatBRL } from '@/lib/format'
import { KpiCard } from '@/components/painel/KpiCard'
import { FunnelChart } from '@/components/painel/FunnelChart'
import type { FunnelEtapa, ImovelEngajamento } from '@/types/api'

interface SummaryResponse {
  kpis: {
    visitas: { valor: number; delta: number | null }
    leads: { valor: number; delta: number | null }
    sinaisPagos: { valor: number; delta: number | null }
    ticketMedio: { valor: number; delta: number | null }
    conversaoLead: { valor: number; delta: number | null }
    reservasAtivas: { valor: number; delta: number | null }
    taxaFechamento: { valor: number; delta: number | null }
    receitaPrevista: { valor: number; delta: number | null }
    receitaConfirmada: { valor: number; delta: number | null }
  }
  funil?: {
    etapas: FunnelEtapa[]
    gargalo: string | null
  }
  topImoveis?: ImovelEngajamento[]
}

export default function DashboardPage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['admin-dashboard-summary'],
    queryFn: () =>
      get<SummaryResponse>('/api/admin/dashboard/summary', {
        withAuth: true,
      }).catch(() =>
        // Fallback: tenta KPIs simples
        get<SummaryResponse>('/api/admin/dashboard/kpis', { withAuth: true }),
      ),
    staleTime: 0,
  })

  if (isLoading) {
    return (
      <div>
        <h1 className="font-display text-display-lg text-ink mb-8">Dashboard</h1>
        <p className="text-body text-ash">Carregando KPIs…</p>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div>
        <h1 className="font-display text-display-lg text-ink mb-4">Dashboard</h1>
        <p className="text-body text-ash">
          KPIs ainda não disponíveis. Confira se o backend está respondendo.
        </p>
      </div>
    )
  }

  const k = data.kpis

  return (
    <div className="flex flex-col gap-12">
      <header>
        <p className="text-eyebrow uppercase tracking-[0.16em] text-ash mb-3">Painel</p>
        <h1 className="font-display text-display-lg text-ink">Dashboard</h1>
        <p className="text-body text-ash mt-2">Últimos 30 dias.</p>
      </header>

      {/* Funil completo */}
      {data.funil?.etapas && data.funil.etapas.length > 0 && (
        <FunnelChart etapas={data.funil.etapas} gargalo={data.funil.gargalo} />
      )}

      {/* KPI cards — 9 cards */}
      <section>
        <h2 className="text-eyebrow uppercase tracking-[0.16em] text-ash mb-4">Indicadores</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <KpiCard
            label="Visitas no catálogo"
            value={(k.visitas?.valor ?? 0).toLocaleString('pt-BR')}
            delta={k.visitas?.delta}
          />
          <KpiCard
            label="Leads recebidos"
            value={(k.leads?.valor ?? 0).toLocaleString('pt-BR')}
            delta={k.leads?.delta}
          />
          <KpiCard
            label="Sinais pagos"
            value={(k.sinaisPagos?.valor ?? 0).toLocaleString('pt-BR')}
            delta={k.sinaisPagos?.delta}
          />
          <KpiCard
            label="Ticket médio"
            value={formatBRL(k.ticketMedio?.valor ?? 0)}
            delta={k.ticketMedio?.delta}
          />
          <KpiCard
            label="Conversão lead → reserva"
            value={`${((k.conversaoLead?.valor ?? 0) * 100).toFixed(1)}%`}
            delta={k.conversaoLead?.delta}
          />
          <KpiCard
            label="Reservas ativas"
            value={(k.reservasAtivas?.valor ?? 0).toLocaleString('pt-BR')}
            delta={k.reservasAtivas?.delta}
          />
          <KpiCard
            label="Taxa de fechamento"
            value={`${((k.taxaFechamento?.valor ?? 0) * 100).toFixed(1)}%`}
            delta={k.taxaFechamento?.delta}
          />
          <KpiCard
            label="Receita prevista"
            value={formatBRL(k.receitaPrevista?.valor ?? 0)}
            delta={k.receitaPrevista?.delta}
          />
          <KpiCard
            label="Receita confirmada"
            value={formatBRL(k.receitaConfirmada?.valor ?? 0)}
            delta={k.receitaConfirmada?.delta}
          />
        </div>
      </section>

      {/* Top imóveis */}
      {data.topImoveis && data.topImoveis.length > 0 && (
        <section>
          <h2 className="text-eyebrow uppercase tracking-[0.16em] text-ash mb-4">
            Top imóveis por engajamento
          </h2>
          <div className="border border-bone bg-paper">
            <ul className="divide-y divide-bone">
              {data.topImoveis.map((i) => (
                <li key={i.id} className="flex items-center justify-between p-4 gap-4">
                  <div className="min-w-0 flex-1">
                    <p className="text-ink font-medium truncate">{i.titulo}</p>
                    <p className="text-caption text-ash">{i.bairro}</p>
                  </div>
                  <div className="text-right text-caption text-ash flex-shrink-0">
                    <p className="text-body-sm text-ink tnum">{formatBRL(i.preco)}</p>
                    <p className="tnum">
                      {i.views} views · {i.leads} leads · {i.reservas} reservas
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}
    </div>
  )
}
