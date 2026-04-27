import { forwardRef, type InputHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

type Props = InputHTMLAttributes<HTMLInputElement> & {
  error?: string
  mono?:  boolean
}

export const Input = forwardRef<HTMLInputElement, Props>(function Input(
  { className, error, mono, ...rest }, ref,
) {
  return (
    <div className="w-full">
      <input
        ref={ref}
        {...rest}
        className={cn(
          'w-full rounded-md border bg-surface px-3 py-2 text-sm text-text placeholder:text-text-muted transition-colors',
          'focus:outline-none focus:ring-2 focus:ring-primary/30',
          mono && 'font-mono tabular-nums',
          error
            ? 'border-danger focus:border-danger'
            : 'border-border focus:border-primary/60',
          className,
        )}
      />
      {error && <p className="mt-1 text-xs text-danger">{error}</p>}
    </div>
  )
})
