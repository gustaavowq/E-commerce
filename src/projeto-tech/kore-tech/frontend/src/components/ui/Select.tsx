import { forwardRef, type SelectHTMLAttributes } from 'react'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'

type SelectProps = SelectHTMLAttributes<HTMLSelectElement> & {
  label?: string
  hint?: string
  error?: string
  children: React.ReactNode
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
  { label, hint, error, className, children, id, ...rest },
  ref,
) {
  const selectId = id ?? rest.name
  const describedBy = error ? `${selectId}-error` : hint ? `${selectId}-hint` : undefined

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={selectId} className="text-sm font-medium text-text">
          {label}
        </label>
      )}
      <div className="relative">
        <select
          ref={ref}
          id={selectId}
          aria-describedby={describedBy}
          aria-invalid={!!error}
          className={cn(
            'h-11 w-full appearance-none rounded-md border bg-surface px-4 pr-10 text-base text-text',
            'transition-colors duration-200',
            'focus:outline-none focus-visible:outline-none',
            error
              ? 'border-danger focus:border-danger focus:shadow-[0_0_0_3px_rgba(255,82,82,0.18)]'
              : 'border-border focus:border-primary focus:shadow-[0_0_0_3px_rgba(0,229,255,0.20)]',
            'disabled:cursor-not-allowed disabled:opacity-60',
            className,
          )}
          {...rest}
        >
          {children}
        </select>
        <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-text-muted">
          <ChevronDown className="h-4 w-4" />
        </span>
      </div>
      {error ? (
        <p id={`${selectId}-error`} className="text-xs text-danger" role="alert">
          {error}
        </p>
      ) : hint ? (
        <p id={`${selectId}-hint`} className="text-xs text-text-muted">
          {hint}
        </p>
      ) : null}
    </div>
  )
})
