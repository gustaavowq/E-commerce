// FunnelChart — barras horizontais Linear-style com gradient + % conversão entre etapas.
// Aceita shape do backend: [{ etapa: string, count: number }]
// Detecta gargalo automaticamente (maior queda entre etapas com volume > 0).

import { cn } from '@/lib/format'

interface FunnelEtapa {
  etapa: string
  count: number
}

interface FunnelChartProps {
  etapas: FunnelEtapa[]
  className?: string
}

export function FunnelChart({ etapas, className }: FunnelChartProps) {
  const max = Math.max(...etapas.map(e => e.count), 1)

  // Detectar gargalo: maior queda relativa entre etapa N e N+1
  let gargaloIdx = -1
  let maiorQueda = 0
  for (let i = 0; i < etapas.length - 1; i++) {
    const cur  = etapas[i].count
    const next = etapas[i + 1].count
    if (cur > 0) {
      const queda = (cur - next) / cur
      if (queda > maiorQueda && queda > 0.5) {
        maiorQueda = queda
        gargaloIdx = i
      }
    }
  }

  const totalEntrada = etapas[0]?.count ?? 0
  const totalSaida   = etapas[etapas.length - 1]?.count ?? 0
  const conversaoTotal = totalEntrada > 0
    ? (totalSaida / totalEntrada) * 100
    : 0

  return (
    <div className={cn('border border-bone bg-paper p-8 flex flex-col gap-6', className)}>
      <header className="flex items-baseline justify-between gap-4 flex-wrap">
        <div>
          <p className="text-eyebrow uppercase tracking-[0.16em] text-ash">Conversão</p>
          <h3 className="font-display text-heading-lg text-ink mt-1">Funil de vendas</h3>
        </div>
        <p className="text-body-sm text-ash">
          Conversão total{' '}
          <span className="text-ink tnum font-medium">
            {conversaoTotal.toFixed(2)}%
          </span>
        </p>
      </header>

      <ul className="flex flex-col gap-5">
        {etapas.map((etapa, idx) => {
          const w        = (etapa.count / max) * 100
          const next     = etapas[idx + 1]
          const convNext = etapa.count > 0 && next
            ? (next.count / etapa.count) * 100
            : null
          const isGargalo = idx === gargaloIdx

          return (
            <li key={etapa.etapa} className="flex flex-col gap-1.5">
              <div className="flex items-baseline justify-between text-body-sm gap-3">
                <div className="flex items-baseline gap-2 min-w-0">
                  <span className="text-ash-soft tnum text-caption">
                    {String(idx + 1).padStart(2, '0')}
                  </span>
                  <span className="text-ink truncate">{etapa.etapa}</span>
                  {isGargalo && (
                    <span className="text-caption text-red-700 uppercase tracking-[0.08em]">
                      gargalo
                    </span>
                  )}
                </div>
                <span className="tnum text-ink font-medium flex-shrink-0">
                  {etapa.count.toLocaleString('pt-BR')}
                </span>
              </div>
              <div className="h-2.5 bg-bone-soft overflow-hidden">
                <div
                  className={cn(
                    'h-full transition-[width] duration-base ease-standard',
                    isGargalo
                      ? 'bg-gradient-to-r from-red-300 to-red-500'
                      : 'bg-gradient-to-r from-moss-pale to-moss',
                  )}
                  style={{ width: `${Math.max(w, 2)}%` }}
                  aria-label={`${etapa.count} ${etapa.etapa}`}
                />
              </div>
              {convNext !== null && idx < etapas.length - 1 && (
                <div className="flex items-center justify-end pt-0.5">
                  <span className="text-caption text-ash tnum">
                    {convNext.toFixed(1)}% segue para {next.etapa.toLowerCase()}
                  </span>
                </div>
              )}
            </li>
          )
        })}
      </ul>
    </div>
  )
}
