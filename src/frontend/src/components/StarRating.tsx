'use client'

import { Star } from 'lucide-react'
import { cn } from '@/lib/utils'

type Props = {
  value: number               // 0..5
  size?: 'sm' | 'md' | 'lg'
  interactive?: boolean
  onChange?: (v: number) => void
  className?: string
}

const SIZE: Record<NonNullable<Props['size']>, string> = {
  sm: 'h-3.5 w-3.5',
  md: 'h-5 w-5',
  lg: 'h-7 w-7',
}

export function StarRating({ value, size = 'md', interactive, onChange, className }: Props) {
  return (
    <div className={cn('inline-flex items-center gap-0.5', className)}>
      {[1, 2, 3, 4, 5].map(star => {
        const filled = star <= value
        if (!interactive) {
          return (
            <Star
              key={star}
              className={cn(SIZE[size], filled ? 'fill-warning text-warning' : 'fill-surface-2 text-border')}
            />
          )
        }
        return (
          <button
            key={star}
            type="button"
            onClick={() => onChange?.(star)}
            aria-label={`${star} estrelas`}
            className="rounded-md p-0.5 transition hover:scale-125"
          >
            <Star
              className={cn(
                SIZE[size],
                filled ? 'fill-warning text-warning' : 'fill-transparent text-ink-3 hover:text-warning',
              )}
            />
          </button>
        )
      })}
    </div>
  )
}
