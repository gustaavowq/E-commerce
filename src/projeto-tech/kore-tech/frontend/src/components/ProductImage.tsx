import Image from 'next/image'
import { Cpu } from 'lucide-react'
import { cn } from '@/lib/utils'

type Props = {
  src: string | null | undefined
  alt: string
  fallbackLabel?: string
  className?: string
  sizes?: string
  priority?: boolean
  fit?: 'cover' | 'contain'
  zoomOnHover?: boolean
}

/**
 * Imagem com fallback inline (gradient + icone). NUNCA usar placehold.co.
 * Server component (sem 'use client') pra renderizar do servidor.
 */
export function ProductImage({
  src,
  alt,
  fallbackLabel,
  className,
  sizes,
  priority,
  fit = 'cover',
  zoomOnHover,
}: Props) {
  if (!src) {
    return (
      <div
        role="img"
        aria-label={alt}
        className={cn(
          'flex h-full w-full flex-col items-center justify-center gap-2 px-4 text-center',
          'bg-gradient-to-br from-surface via-surface-2 to-surface',
          className,
        )}
      >
        <Cpu className="h-10 w-10 text-primary/50" aria-hidden />
        {fallbackLabel && (
          <p className="line-clamp-3 text-xs font-semibold text-text-secondary sm:text-sm">
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
