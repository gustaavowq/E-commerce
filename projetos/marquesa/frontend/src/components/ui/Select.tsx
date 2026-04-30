import { forwardRef, type SelectHTMLAttributes } from 'react'
import { cn } from '@/lib/format'

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  hint?: string
  error?: string
  options: { value: string; label: string }[]
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, hint, error, options, className, id, ...rest }, ref) => {
    const selectId = id || rest.name
    return (
      <div className="flex flex-col gap-2 w-full">
        {label && (
          <label
            htmlFor={selectId}
            className="text-eyebrow uppercase tracking-[0.16em] text-ash font-medium"
          >
            {label}
          </label>
        )}
        <select
          ref={ref}
          id={selectId}
          className={cn(
            'w-full bg-paper border border-bone px-4 py-3 text-body text-ink',
            'focus:border-ash-soft focus:outline-none focus:ring-2 focus:ring-moss focus:ring-offset-2 focus:ring-offset-paper',
            'transition-colors duration-fast',
            error && 'border-red-500',
            className,
          )}
          {...rest}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        {hint && !error && <span className="text-caption text-ash">{hint}</span>}
        {error && <span className="text-caption text-red-600">{error}</span>}
      </div>
    )
  },
)
Select.displayName = 'Select'
