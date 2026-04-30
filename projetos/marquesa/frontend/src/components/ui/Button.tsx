import { forwardRef, type ButtonHTMLAttributes } from 'react'
import { cn } from '@/lib/format'

type Variant = 'primary' | 'secondary' | 'ghost' | 'inverse'
type Size = 'md' | 'lg' | 'sm'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
  loading?: boolean
}

const variantClass: Record<Variant, string> = {
  primary:
    'bg-moss text-paper hover:bg-moss-deep border border-moss disabled:opacity-40 disabled:cursor-not-allowed',
  secondary:
    'bg-transparent text-ink border border-ink hover:bg-ink hover:text-paper disabled:opacity-40 disabled:cursor-not-allowed',
  ghost:
    'bg-transparent text-ink border border-transparent hover:underline underline-offset-4 disabled:opacity-40 disabled:cursor-not-allowed',
  inverse:
    'bg-transparent text-paper border border-paper/40 hover:bg-paper hover:text-ink disabled:opacity-40 disabled:cursor-not-allowed',
}

const sizeClass: Record<Size, string> = {
  sm: 'px-4 py-2 text-body-sm',
  md: 'px-6 py-3 text-body-sm',
  lg: 'px-8 py-4 text-body-sm',
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', className, loading, disabled, children, ...rest }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(
          'inline-flex items-center justify-center font-sans font-medium uppercase tracking-[0.04em]',
          'transition-colors duration-fast ease-standard',
          'active:scale-[0.99]',
          variantClass[variant],
          sizeClass[size],
          className,
        )}
        {...rest}
      >
        {loading ? 'Carregando…' : children}
      </button>
    )
  },
)
Button.displayName = 'Button'
