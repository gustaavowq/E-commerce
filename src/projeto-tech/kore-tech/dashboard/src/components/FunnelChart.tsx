// Funil do builder — barras horizontais com largura proporcional à etapa 1.
// Cyan elétrico cruzando dark surface = alto contraste, bem dentro da identidade.
import { formatNum } from '@/lib/format'
import type { FunnelBuilderStage } from '@/services/types'

type Props = {
  stages:      FunnelBuilderStage[]
  isStub?:     boolean
  stubReason?: string
}

export function FunnelChart({ stages, isStub, stubReason }: Props) {
  const top = stages[0]?.count ?? 0

  return (
    <div className="space-y-3">
      {isStub && (
        <p className="rounded-md border border-warning/40 bg-warning-soft px-3 py-2 text-xs text-warning">
          Dados aproximados (stub) — {stubReason ?? 'evento real ainda não chegou.'}
        </p>
      )}
      {stages.map((stage) => {
        const widthPct = top > 0 ? (stage.count / top) * 100 : 0
        return (
          <div key={stage.order}>
            <div className="flex items-baseline justify-between text-xs">
              <span className="font-medium text-text">
                <span className="font-mono text-text-secondary">{stage.order}.</span> {stage.stage}
              </span>
              <span className="font-mono text-text">
                {formatNum(stage.count)}{' '}
                <span className="text-text-muted">({stage.conversionRate.toFixed(1)}%)</span>
              </span>
            </div>
            <div className="mt-1 h-2 overflow-hidden rounded-pill bg-surface-2">
              <div
                className="h-full rounded-pill bg-primary transition-all"
                style={{ width: `${Math.max(2, widthPct)}%` }}
              />
            </div>
          </div>
        )
      })}
      {stages.length === 0 && (
        <p className="text-sm text-text-secondary">Sem dados de funil ainda.</p>
      )}
    </div>
  )
}
