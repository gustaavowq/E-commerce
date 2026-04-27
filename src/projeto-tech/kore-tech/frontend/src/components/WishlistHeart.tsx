'use client'

import { Heart } from 'lucide-react'
import { useWishlist } from '@/stores/wishlist'
import { cn } from '@/lib/utils'

type Props = {
  productId: string
  size?: 'sm' | 'md'
  className?: string
}

export function WishlistHeart({ productId, size = 'md', className }: Props) {
  const has = useWishlist((s) => s.has(productId))
  const toggle = useWishlist((s) => s.toggle)
  const dim = size === 'sm' ? 'h-8 w-8' : 'h-10 w-10'
  const icon = size === 'sm' ? 'h-4 w-4' : 'h-5 w-5'

  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault()
        e.stopPropagation()
        // Toggle agora e async (chama API + revert em caso de erro). O store ja
        // aplica o estado otimista, entao a UI atualiza imediatamente.
        void toggle(productId)
      }}
      aria-label={has ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
      aria-pressed={has}
      className={cn(
        dim,
        'flex items-center justify-center rounded-pill bg-surface/85 backdrop-blur-sm shadow-md transition-all hover:scale-110',
        className,
      )}
    >
      <Heart className={cn(icon, has ? 'fill-danger stroke-danger' : 'stroke-text-secondary')} />
    </button>
  )
}
