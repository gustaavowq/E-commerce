import { cn } from '@/lib/utils'

type Props = {
  className?: string
}

/**
 * Skeleton loading. Tira spinner quando da pra usar (regra UX da skill).
 * Animacao shimmer suave (≤ 1.4s, dentro do limite snappy).
 */
export function Skeleton({ className }: Props) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        'block animate-pulse-soft rounded-md bg-gradient-to-r from-surface via-surface-2 to-surface bg-[length:200%_100%]',
        className,
      )}
    />
  )
}
