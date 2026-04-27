import { forwardRef, type InputHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label?: string
  hint?: string
  error?: string
  leftIcon?: React.ReactNode
  rightSlot?: React.ReactNode
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, hint, error, leftIcon, rightSlot, className, id, ...rest },
  ref,
) {
  const inputId = id ?? rest.name
  const describedBy = error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={inputId} className="text-sm font-medium text-text">
          {label}
        </label>
      )}
      <div className={cn('relative flex items-center')}>
        {leftIcon && (
          <span className="pointer-events-none absolute left-3 flex items-center text-text-muted">
            {leftIcon}
          </span>
        )}
        <input
          ref={ref}
          id={inputId}
          aria-describedby={describedBy}
          aria-invalid={!!error}
          className={cn(
            'h-11 w-full rounded-md border bg-surface px-4 text-base text-text placeholder:text-text-muted',
            'transition-colors duration-200',
            'focus:outline-none focus-visible:outline-none',
            error
              ? 'border-danger focus:border-danger focus:shadow-[0_0_0_3px_rgba(255,82,82,0.18)]'
              : 'border-border focus:border-primary focus:shadow-[0_0_0_3px_rgba(0,229,255,0.20)]',
            'disabled:cursor-not-allowed disabled:opacity-60',
            leftIcon && 'pl-10',
            rightSlot && 'pr-10',
            className,
          )}
          {...rest}
        />
        {rightSlot && (
          <span className="absolute right-2 flex items-center">{rightSlot}</span>
        )}
      </div>
      {error ? (
        <p id={`${inputId}-error`} className="text-xs text-danger" role="alert">
          {error}
        </p>
      ) : hint ? (
        <p id={`${inputId}-hint`} className="text-xs text-text-muted">
          {hint}
        </p>
      ) : null}
    </div>
  )
})
