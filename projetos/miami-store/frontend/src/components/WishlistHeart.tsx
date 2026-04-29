'use client'

import { useState } from 'react'
import { Heart } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useWishlist } from '@/stores/wishlist'
import { useAuth } from '@/stores/auth'
import { addToWishlist, removeFromWishlist } from '@/services/wishlist'

type Props = {
  productId: string
  className?: string
  size?: 'sm' | 'md' | 'lg'
}

const SIZE_CLS: Record<NonNullable<Props['size']>, string> = {
  sm: 'h-8 w-8',
  md: 'h-10 w-10',
  lg: 'h-12 w-12',
}
const ICON_CLS: Record<NonNullable<Props['size']>, string> = {
  sm: 'h-4 w-4',
  md: 'h-5 w-5',
  lg: 'h-6 w-6',
}

export function WishlistHeart({ productId, className, size = 'md' }: Props) {
  const has    = useWishlist(s => s.has(productId))
  const toggle = useWishlist(s => s.toggle)
  const user   = useAuth(s => s.user)
  const [animating, setAnimating] = useState(false)

  function onClick(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    setAnimating(true)
    setTimeout(() => setAnimating(false), 350)
    const added = toggle(productId)
    // Sync com servidor se logado (fire-and-forget)
    if (user) {
      (added ? addToWishlist(productId) : removeFromWishlist(productId)).catch(() => {
        // silent — store local é fonte de verdade pra UI
      })
    }
  }

  return (
    <button
      type="button"
      onClick={onClick}
      onMouseDown={(e) => e.stopPropagation()}
      onTouchStart={(e) => e.stopPropagation()}
      aria-pressed={has}
      aria-label={has ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
      className={cn(
        'flex items-center justify-center rounded-pill bg-white/95 backdrop-blur-sm shadow-md transition-all',
        'hover:bg-white hover:scale-110 active:scale-95',
        SIZE_CLS[size],
        className,
      )}
    >
      <Heart
        className={cn(
          ICON_CLS[size],
          'transition-all',
          has ? 'fill-accent text-accent' : 'text-ink-3',
          animating && 'scale-125',
        )}
      />
    </button>
  )
}
