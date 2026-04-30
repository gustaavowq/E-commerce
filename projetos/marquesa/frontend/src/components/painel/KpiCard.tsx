// KpiCard — sparkline + count-up + delta vs período anterior.
// Visual flat editorial (sem sombra), accent moss, tnum nos números.

import { cn } from '@/lib/format'
import { Sparkline } from './Sparkline'
import { AnimatedNumber } from './AnimatedNumber'

interface KpiCardProps {
  label: string
  value?: string | number         // string permite formatBRL pré-formatado
  rawValue?: number               // se passar, usa AnimatedNumber + format()
  format?: (n: number) => string  // formatador pra rawValue (default toLocaleString pt-BR)
  delta?: number | null           // % vs período anterior (positivo bom)
  deltaHint?: string              // "vs últimos 30d" — default
  spark?: number[]                // série pra sparkline; vazio = linha tracejada
  hint?: string
  className?: string
}

export function KpiCard({
  label,
  value,
  rawValue,
  format,
  delta,
  deltaHint = 'vs período anterior',
  spark,
  hint,
  className,
}: KpiCardProps) {
  return (
    <div
      className={cn(
        'border border-bone bg-paper p-6 flex flex-col gap-3 transition-colors duration-fast',
        'hover:border-ash-soft',
        className,
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <span className="text-eyebrow uppercase tracking-[0.16em] text-ash">{label}</span>
        {spark && spark.length > 0 && (
          <Sparkline data={spark} width={64} height={20} />
        )}
      </div>

      <span className="font-display text-display-md text-ink tnum leading-none">
        {rawValue != null ? (
          <AnimatedNumber
            value={rawValue}
            format={format ?? ((n) => n.toLocaleString('pt-BR'))}
          />
        ) : (
          value
        )}
      </span>

      <div className="flex items-center gap-2 text-caption min-h-[1rem]">
        {delta != null && Number.isFinite(delta) && (
          <span
            className={cn(
              'inline-flex items-center gap-1 tnum',
              delta > 0 ? 'text-moss-deep' : delta < 0 ? 'text-red-700' : 'text-ash',
            )}
          >
            <ArrowGlyph delta={delta} />
            {Math.abs(delta).toFixed(1)}%
          </span>
        )}
        {delta != null && Number.isFinite(delta) && (
          <span className="text-ash-soft">{deltaHint}</span>
        )}
        {hint && delta == null && <span className="text-ash">{hint}</span>}
      </div>
    </div>
  )
}

function ArrowGlyph({ delta }: { delta: number }) {
  if (delta > 0) {
    return (
      <svg width="10" height="10" viewBox="0 0 10 10" aria-hidden="true">
        <path d="M5 1 L9 7 L1 7 Z" fill="currentColor" />
      </svg>
    )
  }
  if (delta < 0) {
    return (
      <svg width="10" height="10" viewBox="0 0 10 10" aria-hidden="true">
        <path d="M5 9 L1 3 L9 3 Z" fill="currentColor" />
      </svg>
    )
  }
  return (
    <svg width="10" height="10" viewBox="0 0 10 10" aria-hidden="true">
      <line x1="1" y1="5" x2="9" y2="5" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  )
}
