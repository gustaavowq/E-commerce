import { forwardRef, type SelectHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

type Props = SelectHTMLAttributes<HTMLSelectElement> & { error?: string }

export const Select = forwardRef<HTMLSelectElement, Props>(function Select(
  { className, error, children, ...rest }, ref,
) {
  return (
    <div className="w-full">
      <select
        ref={ref}
        {...rest}
        className={cn(
          'w-full rounded-md border bg-surface px-3 py-2 text-sm text-text transition-colors',
          'focus:outline-none focus:ring-2 focus:ring-primary/30',
          error
            ? 'border-danger focus:border-danger'
            : 'border-border focus:border-primary/60',
          className,
        )}
      >
        {children}
      </select>
      {error && <p className="mt-1 text-xs text-danger">{error}</p>}
    </div>
  )
})
