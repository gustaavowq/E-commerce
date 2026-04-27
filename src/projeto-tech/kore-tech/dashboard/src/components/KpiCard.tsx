import type { ReactNode } from 'react'
import { ArrowUp, ArrowDown, Minus } from 'lucide-react'
import { cn } from '@/lib/utils'

// CONTRATO — NÃO MUDAR sem coordenar com Data Analyst.
// Se Data Analyst tiver versão diferente, nós alinhamos. Quem chegar primeiro
// no repo fica com essa interface.
export type KpiCardProps = {
  label:        string
  value:        ReactNode
  hint?:        string
  icon?:        ReactNode
  tone?:        'default' | 'success' | 'warning' | 'danger' | 'info'
  // Variação % vs período anterior. Sinal: + = melhor (verde), - = pior (vermelho).
  // Pra métricas onde "menos é melhor" (cancelamento, abandono), passa invertChange=true.
  change?:      number | null
  invertChange?: boolean
}

const TONE_BG: Record<NonNullable<KpiCardProps['tone']>, string> = {
  default: 'bg-primary text-text-on-primary',
  success: 'bg-success text-text-on-primary',
  warning: 'bg-warning text-text-on-primary',
  danger:  'bg-danger  text-white',
  info:    'bg-info    text-white',
}

export function KpiCard({ label, value, hint, icon, tone = 'default', change, invertChange }: KpiCardProps) {
  return (
    <div className={cn(
      'group rounded-lg border border-border bg-surface p-5 shadow-md transition-all duration-base',
      'hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-lg animate-fade-up',
    )}>
      <div className="flex items-start justify-between">
        <p className="text-xs font-semibold uppercase tracking-wide text-text-secondary">{label}</p>
        {icon && (
          <span className={cn('flex h-9 w-9 items-center justify-center rounded-md transition-transform group-hover:scale-110', TONE_BG[tone])}>
            {icon}
          </span>
        )}
      </div>
      <p className="mt-2 text-2xl font-bold text-text font-mono tabular-nums">{value}</p>
      <ChangeBadge change={change} invertChange={invertChange} hint={hint} />
    </div>
  )
}

function ChangeBadge({ change, invertChange, hint }: { change?: number | null; invertChange?: boolean; hint?: string }) {
  if (change === undefined) {
    return hint ? <p className="mt-1 text-xs text-text-secondary">{hint}</p> : null
  }
  if (change === null) {
    return <p className="mt-1 text-xs text-text-muted">Sem base de comparação</p>
  }

  const goodWhenPositive = !invertChange
  const isGood = change === 0 ? null : goodWhenPositive ? change > 0 : change < 0
  const Icon  = change > 0 ? ArrowUp : change < 0 ? ArrowDown : Minus
  const color = isGood === null ? 'text-text-secondary'
              : isGood          ? 'text-success'
                                : 'text-danger'

  return (
    <p className={cn('mt-1 inline-flex items-center gap-1 text-xs font-semibold', color)}>
      <Icon className="h-3 w-3" />
      {change > 0 ? '+' : ''}{change}%
      <span className="font-normal text-text-muted">vs período anterior</span>
    </p>
  )
}
