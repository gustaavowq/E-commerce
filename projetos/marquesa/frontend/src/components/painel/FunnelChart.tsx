import { cn } from '@/lib/format'

interface FunnelChartProps {
  etapas: Array<{ label: string; valor: number; convNext: number | null }>
  gargalo?: string | null
}

// SVG simples — barras horizontais proporcionais ao máximo, com taxa de conv
export function FunnelChart({ etapas, gargalo }: FunnelChartProps) {
  const max = Math.max(...etapas.map((e) => e.valor), 1)
  return (
    <div className="border border-bone bg-paper p-8">
      <div className="flex items-baseline justify-between mb-6">
        <h3 className="text-eyebrow uppercase tracking-[0.16em] text-ash">Funil de conversão</h3>
        {gargalo && (
          <span className="text-caption text-ash">
            Gargalo: <span className="text-ink">{gargalo}</span>
          </span>
        )}
      </div>
      <ul className="flex flex-col gap-4">
        {etapas.map((etapa, idx) => {
          const w = (etapa.valor / max) * 100
          const isGargalo = gargalo === etapa.label
          return (
            <li key={etapa.label} className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between text-body-sm">
                <span className="text-ink">{etapa.label}</span>
                <span className="tnum text-ash">
                  {etapa.valor.toLocaleString('pt-BR')}
                  {etapa.convNext !== null && idx < etapas.length - 1 && (
                    <span className="ml-3 text-ash-soft">
                      → {(etapa.convNext * 100).toFixed(1)}%
                    </span>
                  )}
                </span>
              </div>
              <div className="h-3 bg-bone-soft">
                <div
                  className={cn('h-full transition-all duration-base', isGargalo ? 'bg-red-500' : 'bg-moss')}
                  style={{ width: `${Math.max(w, 2)}%` }}
                  aria-label={`${etapa.valor} ${etapa.label}`}
                />
              </div>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
