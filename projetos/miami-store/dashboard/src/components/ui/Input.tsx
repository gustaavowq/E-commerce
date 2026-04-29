import { forwardRef, type InputHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

type Props = InputHTMLAttributes<HTMLInputElement> & { error?: string }

export const Input = forwardRef<HTMLInputElement, Props>(function Input(
  { className, error, ...rest }, ref,
) {
  return (
    <div className="w-full">
      <input
        ref={ref}
        {...rest}
        className={cn(
          'w-full rounded-md border bg-white px-3 py-2 text-sm transition',
          'focus:outline-none focus:ring-2 focus:ring-primary-700/20',
          error
            ? 'border-error focus:border-error'
            : 'border-border focus:border-primary-700',
          className,
        )}
      />
      {error && <p className="mt-1 text-xs text-error">{error}</p>}
    </div>
  )
})
