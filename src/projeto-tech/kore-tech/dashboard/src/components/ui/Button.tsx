import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react'
import { cn } from '@/lib/utils'

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline-primary'
type Size    = 'sm' | 'md' | 'lg'

const variantStyles: Record<Variant, string> = {
  primary:         'bg-primary text-text-on-primary hover:bg-primary-hover',
  'outline-primary': 'border border-primary/40 bg-transparent text-primary hover:bg-primary-soft',
  secondary:       'bg-surface-2 border border-border-strong text-text hover:bg-surface-3',
  ghost:           'bg-transparent text-text-secondary hover:bg-surface-2 hover:text-text',
  danger:          'bg-danger text-white hover:bg-danger/90',
}
const sizeStyles: Record<Size, string> = {
  sm: 'h-8  px-3 text-xs',
  md: 'h-10 px-4 text-sm',
  lg: 'h-11 px-5 text-base',
}

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?:   Variant
  size?:      Size
  loading?:   boolean
  fullWidth?: boolean
  leftIcon?:  ReactNode
  rightIcon?: ReactNode
}

export const Button = forwardRef<HTMLButtonElement, Props>(function Button(
  { variant = 'primary', size = 'md', loading, fullWidth, leftIcon, rightIcon, className, children, disabled, type = 'button', ...rest },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type}
      disabled={disabled || loading}
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-md font-semibold transition-colors duration-fast',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-bg',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        variantStyles[variant], sizeStyles[size],
        fullWidth && 'w-full',
        className,
      )}
      {...rest}
    >
      {loading
        ? <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
        : <>{leftIcon}{children}{rightIcon}</>}
    </button>
  )
})
