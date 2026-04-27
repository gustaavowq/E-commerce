import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn('animate-pulse rounded-md bg-surface-2', className)} />
}

export function TableSkeleton({ rows = 5, cols = 6 }: { rows?: number; cols?: number }) {
  return (
    <div className="overflow-hidden rounded-lg border border-border bg-surface shadow-md">
      <div className="border-b border-border bg-surface-2 px-4 py-3">
        <div className="grid gap-3" style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
          {Array.from({ length: cols }).map((_, i) => (
            <Skeleton key={i} className="h-3" />
          ))}
        </div>
      </div>
      <div className="divide-y divide-border">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="px-4 py-3">
            <div className="grid gap-3" style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
              {Array.from({ length: cols }).map((_, j) => (
                <Skeleton key={j} className={cn('h-4', j === 0 && 'w-3/4')} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export function EmptyState({
  icon, title, description, action,
}: {
  icon:        ReactNode
  title:       string
  description: string
  action?:     ReactNode
}) {
  return (
    <div className="rounded-lg border border-border bg-surface p-12 text-center animate-fade-up">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-pill bg-surface-2 text-text-secondary">
        {icon}
      </div>
      <h3 className="mt-4 text-base font-semibold text-text">{title}</h3>
      <p className="mt-1 text-sm text-text-secondary">{description}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  )
}
