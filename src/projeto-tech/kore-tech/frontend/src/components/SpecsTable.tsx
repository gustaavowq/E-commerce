import { cn } from '@/lib/utils'

type SpecsRow = { label: string; value: string | number | null | undefined; highlight?: boolean }

type Props = {
  rows: SpecsRow[]
  title?: string
  className?: string
  compact?: boolean
}

/**
 * Ficha tecnica estruturada (PDP de componente / PC montado).
 * Numeros / unidades em JetBrains Mono pra destaque visual.
 */
export function SpecsTable({ rows, title, className, compact }: Props) {
  return (
    <div className={cn('overflow-hidden rounded-lg border border-border bg-surface', className)}>
      {title && (
        <div className="border-b border-border bg-surface-2 px-4 py-2.5">
          <h3 className="text-xs font-bold uppercase tracking-wide text-text">{title}</h3>
        </div>
      )}
      <dl className="divide-y divide-border">
        {rows.map((r, i) => (
          <div
            key={`${r.label}-${i}`}
            className={cn(
              'grid grid-cols-[140px_1fr] gap-4 px-4',
              compact ? 'py-2' : 'py-3',
              r.highlight && 'bg-primary-soft/30',
            )}
          >
            <dt className="text-xs uppercase tracking-wide text-text-secondary sm:text-sm">{r.label}</dt>
            <dd
              className={cn(
                'font-specs text-text break-words sm:text-sm',
                r.highlight && 'text-primary font-bold',
              )}
            >
              {r.value ?? '-'}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  )
}
