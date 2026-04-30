import { forwardRef, type InputHTMLAttributes, type TextareaHTMLAttributes } from 'react'
import { cn } from '@/lib/format'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  hint?: string
  error?: string
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, hint, error, className, id, ...rest }, ref) => {
    const inputId = id || rest.name
    return (
      <div className="flex flex-col gap-2 w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="text-eyebrow uppercase tracking-[0.16em] text-ash font-medium"
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={cn(
            'w-full bg-paper border border-bone px-4 py-3 text-body text-ink',
            'placeholder:text-ash-soft',
            'focus:border-ash-soft focus:outline-none focus:ring-2 focus:ring-moss focus:ring-offset-2 focus:ring-offset-paper',
            'transition-colors duration-fast',
            error && 'border-red-500',
            className,
          )}
          {...rest}
        />
        {hint && !error && <span className="text-caption text-ash">{hint}</span>}
        {error && <span className="text-caption text-red-600">{error}</span>}
      </div>
    )
  },
)
Input.displayName = 'Input'

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  hint?: string
  error?: string
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, hint, error, className, id, ...rest }, ref) => {
    const inputId = id || rest.name
    return (
      <div className="flex flex-col gap-2 w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="text-eyebrow uppercase tracking-[0.16em] text-ash font-medium"
          >
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={inputId}
          rows={4}
          className={cn(
            'w-full bg-paper border border-bone px-4 py-3 text-body text-ink resize-vertical',
            'placeholder:text-ash-soft',
            'focus:border-ash-soft focus:outline-none focus:ring-2 focus:ring-moss focus:ring-offset-2 focus:ring-offset-paper',
            'transition-colors duration-fast',
            error && 'border-red-500',
            className,
          )}
          {...rest}
        />
        {hint && !error && <span className="text-caption text-ash">{hint}</span>}
        {error && <span className="text-caption text-red-600">{error}</span>}
      </div>
    )
  },
)
Textarea.displayName = 'Textarea'
