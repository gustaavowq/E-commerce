// =============================================================================
// Kore Tech — Painel admin > Analytics (visão completa)
// Owner: ecommerce-data-analyst (Sprint 1).
//
// Todos os 10 KPIs do brief + auto-alertas. Página densa, deep-dive semanal.
// =============================================================================

'use client'

import { useState } from 'react'
import { useQuery, useMutation } from '@tanstack/react-query'
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Cell,
  PieChart, Pie, Legend,
} from 'recharts'
import {
  CreditCard, PieChart as PieIcon, Layers, Package, Bell, AlertTriangle,
  Wrench, RefreshCw, Filter, Clock, TrendingDown, Receipt,
} from 'lucide-react'
import { adminDashboard, adminAlerts } from '@/services/admin'
import { KpiCard } from '@/components/KpiCard'
import { Skeleton } from '@/components/Skeleton'
import { FunnelChart } from '@/components/FunnelChart'
import { PersonaConversionTable } from '@/components/PersonaConversionTable'
import { EstoqueAlertaTable } from '@/components/EstoqueAlertaTable'
import { WaitlistTopTable } from '@/components/WaitlistTopTable'
import { formatBRL, formatNum } from '@/lib/format'

const PERIODS = [
  { v: 7,  label: '7 dias' },
  { v: 30, label: '30 dias' },
  { v: 90, label: '90 dias' },
]

const PARCEL_COLORS: Record<string, string> = {
  'PIX':         '#00E676',
  '1x cartão':   '#00E5FF',
  '2-3x':        '#29B6F6',
  '4-6x':        '#FFB74D',
  '7-12x':       '#FF5252',
  'Outros':      '#5A6573',
}

const BUILDTYPE_COLORS: Record<string, string> = {
  'pc_pronto':   '#00E5FF',
  'componente':  '#29B6F6',
  'periferico':  '#FFB74D',
  'monitor':     '#00E676',
  'sem_tipo':    '#5A6573',
}

export default function AnalyticsPage() {
  const [period, setPeriod] = useState(30)

  const ticketQ      = useQuery({ queryKey: ['admin','ticket-medio',period], queryFn: () => adminDashboard.ticketMedio(period, 'buildType') })
  const funnelQ      = useQuery({ queryKey: ['admin','funnel-builder',period], queryFn: () => adminDashboard.funnelBuilder() })
  const personasQ    = useQuery({ queryKey: ['admin','conversao-persona',period], queryFn: () => adminDashboard.conversaoPersona(period) })
  const parcelaQ     = useQuery({ queryKey: ['admin','parcelamento',period], queryFn: () => adminDashboard.parcelamento(period) })
  const margemQ      = useQuery({ queryKey: ['admin','margem',period], queryFn: () => adminDashboard.margem(period) })
  const doaQ         = useQuery({ queryKey: ['admin','doa',period], queryFn: () => adminDashboard.doa(period) })
  const devolucaoQ   = useQuery({ queryKey: ['admin','devolucao-7dias',period], queryFn: () => adminDashboard.devolucao(period) })
  const estoqueQ     = useQuery({ queryKey: ['admin','estoque-alerta',5], queryFn: () => adminDashboard.estoqueAlerta(5) })
  const waitlistQ    = useQuery({ queryKey: ['admin','waitlist-top',10], queryFn: () => adminDashboard.waitlistTop(10) })
  const btoQ         = useQuery({ queryKey: ['admin','tempo-bto',period], queryFn: () => adminDashboard.tempoBto(period) })
  const alertsQ      = useQuery({ queryKey: ['admin','alerts'], queryFn: () => adminAlerts.list(), staleTime: 60_000 })

  const runAlerts = useMutation({
    mutationFn: () => adminAlerts.run(),
    onSuccess: () => { void alertsQ.refetch() },
  })

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-text">Analytics</h1>
          <p className="text-sm text-text-secondary">
            Visão completa dos KPIs da Kore Tech. Para o overview rápido,
            volte para a <a href="/" className="text-primary hover:text-primary-hover">visão geral</a>.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => runAlerts.mutate()}
            disabled={runAlerts.isPending}
            className="inline-flex items-center gap-1 rounded-md border border-border bg-surface px-3 py-1.5 text-xs font-semibold text-text hover:border-primary/40 disabled:opacity-50"
            title="Roda check de alertas agora"
          >
            <RefreshCw className={'h-3 w-3 ' + (runAlerts.isPending ? 'animate-spin' : '')} />
            Rodar alertas agora
          </button>
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
        </div>
      </header>

      {/* Alertas detectados na última checagem */}
      {alertsQ.data && alertsQ.data.length > 0 && (
        <section className="space-y-2">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-text-secondary">
            Alertas ativos ({alertsQ.data.length})
          </h2>
          {alertsQ.data.map((alert, i) => (
            <div
              key={i}
              className={
                'flex items-start gap-3 rounded-lg border px-4 py-3 text-sm ' +
                (alert.severity === 'red'
                  ? 'border-danger/40 bg-danger-soft'
                  : 'border-warning/40 bg-warning-soft')
              }
            >
              <span className={'shrink-0 pt-0.5 ' + (alert.severity === 'red' ? 'text-danger' : 'text-warning')}>
                {alert.severity === 'red'
                  ? <AlertTriangle className="h-4 w-4" />
                  : <Bell className="h-4 w-4" />}
              </span>
              <div className="flex-1">
                <p className={'font-semibold ' + (alert.severity === 'red' ? 'text-danger' : 'text-warning')}>{alert.title}</p>
                <p className="text-text-secondary">{alert.message}</p>
              </div>
            </div>
          ))}
        </section>
      )}

      {/* Linha 1: Ticket médio por buildType + Funil do builder */}
      <section className="grid gap-4 lg:grid-cols-2">
        <Card title="Ticket médio por categoria" subtitle="Componente avulso vs PC montado vs periférico" icon={<Receipt />}>
          {ticketQ.isLoading
            ? <Skeleton className="h-64 w-full" />
            : ticketQ.data && ticketQ.data.length > 0
              ? (
                <div className="h-64">
                  <ResponsiveContainer>
                    <BarChart data={ticketQ.data} layout="vertical" margin={{ left: 10, right: 20 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1E2530" />
                      <XAxis
                        type="number"
                        tickFormatter={(v: number) => v >= 1000 ? `R$${(v / 1000).toFixed(0)}k` : `R$${v}`}
                        fontSize={11} stroke="#5A6573"
                      />
                      <YAxis type="category" dataKey="bucket" width={100} fontSize={11} stroke="#5A6573" />
                      <Tooltip
                        contentStyle={{ backgroundColor: '#1B2230', border: '1px solid #2A3240', borderRadius: 8, color: '#E8EEF5' }}
                        formatter={(v: number, name: string) =>
                          name === 'avgTicket' ? [formatBRL(v), 'Ticket médio'] :
                          name === 'revenue'   ? [formatBRL(v), 'Receita'] :
                                                  [formatNum(v), 'Pedidos']
                        }
                      />
                      <Bar dataKey="avgTicket" radius={[0, 6, 6, 0]}>
                        {ticketQ.data.map((row, i) => (
                          <Cell key={i} fill={BUILDTYPE_COLORS[row.bucket] ?? '#00E5FF'} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )
              : <Empty label="Sem vendas no período" />}
        </Card>

        <Card title="Funil do PC Builder" subtitle="Onde o cliente desiste" icon={<Layers />}>
          {funnelQ.isLoading
            ? <Skeleton className="h-64 w-full" />
            : (
              <FunnelChart
                stages={funnelQ.data?.stages ?? []}
                isStub={funnelQ.data?.isStub}
                stubReason={funnelQ.data?.stubReason}
              />
            )}
        </Card>
      </section>

      {/* Linha 2: Conversão por persona (full width) */}
      <section>
        <Card title="Conversão por persona" subtitle="Persona com mais visitas, pedidos e receita" icon={<Layers />}>
          {personasQ.isLoading
            ? <Skeleton className="h-48 w-full" />
            : <PersonaConversionTable rows={personasQ.data} />}
        </Card>
      </section>

      {/* Linha 3: Parcelamento (pie) + Margem por categoria (bar) */}
      <section className="grid gap-4 lg:grid-cols-2">
        <Card title="Distribuição de pagamentos" subtitle="PIX vs cartão por número de parcelas" icon={<CreditCard />}>
          {parcelaQ.isLoading
            ? <Skeleton className="h-64 w-full" />
            : parcelaQ.data && parcelaQ.data.length > 0
              ? (
                <div className="h-64">
                  <ResponsiveContainer>
                    <PieChart>
                      <Pie
                        data={parcelaQ.data}
                        dataKey="amount"
                        nameKey="bucket"
                        innerRadius={50}
                        outerRadius={90}
                        paddingAngle={2}
                      >
                        {parcelaQ.data.map((entry, i) => (
                          <Cell key={i} fill={PARCEL_COLORS[entry.bucket] ?? '#5A6573'} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{ backgroundColor: '#1B2230', border: '1px solid #2A3240', borderRadius: 8, color: '#E8EEF5' }}
                        formatter={(v: number) => [formatBRL(v), 'Valor']}
                      />
                      <Legend wrapperStyle={{ fontSize: 11, color: '#8892A0' }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              )
              : <Empty label="Sem pagamentos no período" />}
        </Card>

        <Card title="Margem por categoria" subtitle="Receita por categoria técnica (custo a configurar)" icon={<PieIcon />}>
          {margemQ.isLoading
            ? <Skeleton className="h-64 w-full" />
            : margemQ.data && margemQ.data.rows.length > 0
              ? (
                <>
                  {margemQ.data.isStub && (
                    <p className="mb-3 rounded-md border border-warning/40 bg-warning-soft px-3 py-2 text-xs text-warning">
                      Margem indisponível — {margemQ.data.stubReason}
                    </p>
                  )}
                  <div className="h-56">
                    <ResponsiveContainer>
                      <BarChart data={margemQ.data.rows} layout="vertical" margin={{ left: 10, right: 20 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#1E2530" />
                        <XAxis
                          type="number"
                          tickFormatter={(v: number) => v >= 1000 ? `R$${(v / 1000).toFixed(0)}k` : `R$${v}`}
                          fontSize={11} stroke="#5A6573"
                        />
                        <YAxis type="category" dataKey="bucket" width={90} fontSize={11} stroke="#5A6573" />
                        <Tooltip
                          contentStyle={{ backgroundColor: '#1B2230', border: '1px solid #2A3240', borderRadius: 8, color: '#E8EEF5' }}
                          formatter={(v: number) => [formatBRL(v), 'Receita']}
                        />
                        <Bar dataKey="revenue" fill="#00E5FF" radius={[0, 6, 6, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </>
              )
              : <Empty label="Sem vendas no período" />}
        </Card>
      </section>

      {/* Linha 4: DOA + Devolução + Tempo BTO */}
      <section className="grid gap-4 lg:grid-cols-3">
        <KpiCard
          label="DOA acionada (30d)"
          value={
            doaQ.data?.rows && doaQ.data.rows.length > 0
              ? <>{doaQ.data.rows[0]?.doaPct.toFixed(1)}%</>
              : '0%'
          }
          hint={
            doaQ.data?.isStub
              ? 'Aguardando OrderReturn no schema'
              : doaQ.data && doaQ.data.rows.length === 0
                ? 'Nenhum DOA no período — bom sinal'
                : `Em ${doaQ.data?.rows[0]?.bucket ?? ''}`
          }
          tone={doaQ.data?.rows && doaQ.data.rows.length > 0 && (doaQ.data.rows[0]?.doaPct ?? 0) > 5 ? 'danger' : 'success'}
          icon={<AlertTriangle className="h-4 w-4" />}
        />
        <KpiCard
          label="Devolução por arrependimento"
          value={
            devolucaoQ.data?.rows && devolucaoQ.data.rows.length > 0
              ? <>{devolucaoQ.data.rows[0]?.returnPct.toFixed(1)}%</>
              : '0%'
          }
          hint={
            devolucaoQ.data?.isStub
              ? 'Aguardando OrderReturn no schema'
              : devolucaoQ.data && devolucaoQ.data.rows.length === 0
                ? 'CDC 7 dias — sem devoluções'
                : `Em ${devolucaoQ.data?.rows[0]?.bucket ?? ''}`
          }
          tone={devolucaoQ.data?.rows && devolucaoQ.data.rows.length > 0 && (devolucaoQ.data.rows[0]?.returnPct ?? 0) > 5 ? 'warning' : 'default'}
          icon={<TrendingDown className="h-4 w-4" />}
          invertChange
        />
        <KpiCard
          label="Tempo médio BTO (P90)"
          value={btoQ.data?.p90Days !== null && btoQ.data?.p90Days !== undefined
            ? <span className="font-mono">{btoQ.data.p90Days.toFixed(1)} d</span>
            : '—'}
          hint={btoQ.data && btoQ.data.totalPcs > 0
            ? `${formatNum(btoQ.data.totalPcs)} PCs · SLA ${btoQ.data.slaTarget}d`
            : 'Sem PCs montados despachados ainda'}
          tone={btoQ.data?.p90Days !== null && btoQ.data?.p90Days !== undefined && btoQ.data.p90Days > 7 ? 'warning' : 'success'}
          icon={<Wrench className="h-4 w-4" />}
        />
      </section>

      {/* Linha 5: Estoque alerta (full width) */}
      <section>
        <Card title="Estoque alerta" subtitle="Variações abaixo de 5 unidades, ordenado por velocity" icon={<Package />}>
          {estoqueQ.isLoading
            ? <Skeleton className="h-48 w-full" />
            : <EstoqueAlertaTable rows={estoqueQ.data?.rows} />}
        </Card>
      </section>

      {/* Linha 6: Waitlist top (full width) */}
      <section>
        <Card title="Lista de espera ativa — top 10" subtitle="Demanda represada — priorize reposição" icon={<Bell />}>
          {waitlistQ.isLoading
            ? <Skeleton className="h-48 w-full" />
            : <WaitlistTopTable rows={waitlistQ.data} />}
        </Card>
      </section>

      {/* Tempo BTO detalhado */}
      {btoQ.data && btoQ.data.totalPcs > 0 && (
        <section>
          <Card title="Tempo de Build-to-Order — distribuição" subtitle="Do pagamento ao despacho. SLA prometido: 7 dias úteis" icon={<Clock />}>
            <div className="grid gap-4 sm:grid-cols-4">
              <BtoStat label="Média"  value={btoQ.data.avgDays} target={7} />
              <BtoStat label="P50"    value={btoQ.data.p50Days} target={7} />
              <BtoStat label="P90"    value={btoQ.data.p90Days} target={7} />
              <BtoStat label="P95"    value={btoQ.data.p95Days} target={10} />
            </div>
          </Card>
        </section>
      )}
    </div>
  )
}

// ----------------------------------------------------------------------------
// Pequenos componentes locais
// ----------------------------------------------------------------------------

function Card({
  title, subtitle, icon, children,
}: {
  title: string
  subtitle?: string
  icon?: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <div className="rounded-lg border border-border bg-surface p-5 shadow-md">
      <div className="mb-3">
        <h2 className="text-sm font-bold text-text flex items-center gap-2">
          {icon && <span className="text-primary [&>svg]:h-4 [&>svg]:w-4">{icon}</span>}
          {title}
        </h2>
        {subtitle && <p className="text-xs text-text-secondary">{subtitle}</p>}
      </div>
      {children}
    </div>
  )
}

function Empty({ label }: { label: string }) {
  return <div className="flex h-full items-center justify-center text-sm text-text-muted">{label}</div>
}

function BtoStat({ label, value, target }: { label: string; value: number | null; target: number }) {
  if (value === null) return (
    <div className="rounded-md border border-border bg-surface-2 p-3">
      <p className="text-xs uppercase tracking-wide text-text-secondary">{label}</p>
      <p className="mt-1 font-mono text-2xl text-text-muted">—</p>
    </div>
  )
  const over = value > target
  return (
    <div className="rounded-md border border-border bg-surface-2 p-3">
      <p className="text-xs uppercase tracking-wide text-text-secondary">{label}</p>
      <p className={'mt-1 font-mono text-2xl ' + (over ? 'text-warning' : 'text-text')}>
        {value.toFixed(1)} d
      </p>
      <p className="text-xs text-text-muted">SLA: {target}d</p>
    </div>
  )
}

