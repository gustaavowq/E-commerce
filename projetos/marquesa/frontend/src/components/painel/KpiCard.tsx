import { cn } from '@/lib/format'

interface KpiCardProps {
  label: string
  value: string | number
  delta?: number | null
  hint?: string
  className?: string
}

export function KpiCard({ label, value, delta, hint, className }: KpiCardProps) {
  return (
    <div className={cn('border border-bone bg-paper p-6 flex flex-col gap-3', className)}>
      <span className="text-eyebrow uppercase tracking-[0.16em] text-ash">{label}</span>
      <span className="font-display text-display-md text-ink tnum">{value}</span>
      <div className="flex items-center gap-3 text-caption">
        {delta != null && (
          <span
            className={cn(
              'inline-flex items-center gap-1 tnum',
              delta > 0 ? 'text-moss-deep' : delta < 0 ? 'text-red-700' : 'text-ash',
            )}
          >
            {delta > 0 ? '▲' : delta < 0 ? '▼' : '—'}
            {Math.abs(delta).toFixed(1)}%
          </span>
        )}
        {hint && <span className="text-ash">{hint}</span>}
      </div>
    </div>
  )
}
