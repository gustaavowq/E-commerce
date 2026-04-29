import Image from 'next/image'
import { ImageOff } from 'lucide-react'
import { cn } from '@/lib/utils'

type Props = {
  src: string | null | undefined
  alt: string
  /** Texto que aparece se src for vazio (ex.: nome do produto) */
  fallbackLabel?: string
  className?: string
  sizes?: string
  priority?: boolean
  fit?: 'cover' | 'contain'
  zoomOnHover?: boolean
}

/**
 * Image wrapper com fallback inline quando src é vazio.
 * Server-component (sem 'use client') pra renderizar do servidor sem hydration.
 */
export function ProductImage({
  src, alt, fallbackLabel,
  className, sizes, priority, fit = 'cover', zoomOnHover,
}: Props) {
  if (!src) {
    return (
      <div
        className={cn(
          'flex h-full w-full flex-col items-center justify-center gap-2 bg-gradient-to-br from-surface-2 via-primary-50 to-surface-2 px-4 text-center',
          className,
        )}
        role="img"
        aria-label={alt}
      >
        <ImageOff className="h-10 w-10 text-primary-700/40" aria-hidden />
        {fallbackLabel && (
          <p className="line-clamp-3 text-xs font-semibold text-ink-3 sm:text-sm">
            {fallbackLabel}
          </p>
        )}
      </div>
    )
  }

  return (
    <Image
      src={src}
      alt={alt}
      fill
      sizes={sizes}
      priority={priority}
      unoptimized
      className={cn(
        fit === 'contain' ? 'object-contain' : 'object-cover',
        zoomOnHover && 'transition-transform duration-300 group-hover:scale-105',
        className,
      )}
    />
  )
}
