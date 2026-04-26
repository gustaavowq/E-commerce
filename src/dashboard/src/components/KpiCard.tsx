import type { ReactNode } from 'react'
import { ArrowUp, ArrowDown, Minus } from 'lucide-react'
import { cn } from '@/lib/utils'

type Props = {
  label: string
  value: ReactNode
  hint?: string
  icon?: ReactNode
  tone?: 'default' | 'success' | 'warning' | 'error'
  // Variação % vs período anterior. Sinal: + = melhor (verde), - = pior (vermelho).
  // Pra métricas onde "menos é melhor" (cancelamentos), passa invertChange=true.
  change?: number | null
  invertChange?: boolean
}

const TONE: Record<NonNullable<Props['tone']>, string> = {
  default: 'bg-primary-700 text-white',
  success: 'bg-success     text-white',
  warning: 'bg-warning     text-white',
  error:   'bg-error       text-white',
}

export function KpiCard({ label, value, hint, icon, tone = 'default', change, invertChange }: Props) {
  return (
    <div className="rounded-lg border border-border bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between">
        <p className="text-xs font-semibold uppercase tracking-wider text-ink-3">{label}</p>
        {icon && (
          <span className={cn('flex h-9 w-9 items-center justify-center rounded-md', TONE[tone])}>
            {icon}
          </span>
        )}
      </div>
      <p className="mt-2 text-2xl font-bold text-ink">{value}</p>
      <ChangeBadge change={change} invertChange={invertChange} hint={hint} />
    </div>
  )
}

function ChangeBadge({ change, invertChange, hint }: { change?: number | null; invertChange?: boolean; hint?: string }) {
  if (change === undefined) {
    return hint ? <p className="mt-1 text-xs text-ink-3">{hint}</p> : null
  }
  if (change === null) {
    return <p className="mt-1 text-xs text-ink-4">Sem base de comparação</p>
  }

  const goodWhenPositive = !invertChange
  const isGood = change === 0 ? null : goodWhenPositive ? change > 0 : change < 0
  const Icon  = change > 0 ? ArrowUp : change < 0 ? ArrowDown : Minus
  const color = isGood === null ? 'text-ink-3'
              : isGood          ? 'text-success'
                                : 'text-error'

  return (
    <p className={cn('mt-1 inline-flex items-center gap-1 text-xs font-semibold', color)}>
      <Icon className="h-3 w-3" />
      {change > 0 ? '+' : ''}{change}%
      <span className="font-normal text-ink-4">vs período anterior</span>
    </p>
  )
}
