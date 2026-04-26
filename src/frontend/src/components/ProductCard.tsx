import Link from 'next/link'
import { AuthenticityBadge } from './AuthenticityBadge'
import { WishlistHeart } from './WishlistHeart'
import { ProductImage } from './ProductImage'
import { formatBRL, discountPercent, installmentLabel } from '@/lib/format'
import type { ProductListItem } from '@/services/types'
import { cn } from '@/lib/utils'

type Props = {
  product: ProductListItem
  className?: string
  /** Index na grid pra fazer stagger animation (50ms por item, max ~500ms) */
  index?: number
}

export function ProductCard({ product, className, index = 0 }: Props) {
  const discount = discountPercent(product.basePrice, product.comparePrice)
  const outOfStock = product.totalStock === 0
  const delay = Math.min(index, 9) * 50  // capa em 9 pra n ficar grid de 12 esperando 600ms

  return (
    <Link
      href={`/products/${product.slug}`}
      style={{ animationDelay: `${delay}ms` }}
      className={cn(
        'group flex flex-col overflow-hidden rounded-lg bg-white border border-border transition-all duration-300 animate-fade-up',
        'hover:-translate-y-1 hover:shadow-lg hover:border-primary-700/30',
        outOfStock && 'opacity-60',
        className,
      )}
    >
      {/* Imagem com badges flutuantes */}
      <div className="relative aspect-[4/5] overflow-hidden bg-surface-2">
        <ProductImage
          src={product.primaryImage?.url}
          alt={product.primaryImage?.alt ?? product.name}
          fallbackLabel={product.name}
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 280px"
          zoomOnHover
        />

        {/* Topo: brand (esquerda) + heart (direita) */}
        <div className="absolute left-2 right-2 top-2 flex items-start justify-between gap-2">
          <span className="inline-flex items-center rounded-sm bg-white/95 px-2 py-1 text-xs font-bold uppercase text-ink backdrop-blur-sm shadow-sm">
            {product.brand.name}
          </span>
          <div className="z-10">
            <WishlistHeart productId={product.id} size="sm" />
          </div>
        </div>

        {/* Desconto no canto inferior esquerdo */}
        {discount && (
          <span className="absolute bottom-2 left-2 inline-flex items-center rounded-sm bg-accent px-2 py-1 text-xs font-black text-white shadow-md">
            -{discount}%
          </span>
        )}

        {/* Selo original no canto inferior direito (esconde em mobile pra não colidir com o badge de desconto) */}
        <div className="absolute bottom-2 right-2 hidden sm:block">
          <AuthenticityBadge />
        </div>

        {outOfStock && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/60">
            <span className="rounded-md bg-white/90 px-3 py-1.5 text-sm font-bold uppercase text-ink">
              Esgotado
            </span>
          </div>
        )}
      </div>

      {/* Conteúdo */}
      <div className="flex flex-1 flex-col gap-2 p-3 sm:p-4">
        <h3 className="line-clamp-2 text-sm font-semibold text-ink leading-snug sm:text-base">
          {product.name}
        </h3>

        {/* Preço */}
        <div className="flex flex-col">
          {product.comparePrice && (
            <span className="text-xs text-ink-3 line-through">{formatBRL(product.comparePrice)}</span>
          )}
          <span className="text-lg font-bold text-ink sm:text-xl">{formatBRL(product.basePrice)}</span>
          <span className="text-xs text-ink-3">{installmentLabel(product.basePrice)}</span>
        </div>

        {/* Cores disponíveis (swatch circular) */}
        {product.colors.length > 0 && (
          <div className="flex items-center gap-1.5 pt-1">
            {product.colors.slice(0, 5).map((c) => (
              <span
                key={c.color}
                title={c.color}
                className="h-4 w-4 rounded-pill border border-border"
                style={{ backgroundColor: c.hex ?? '#ccc' }}
              />
            ))}
            {product.colors.length > 5 && (
              <span className="text-xs text-ink-3">+{product.colors.length - 5}</span>
            )}
          </div>
        )}
      </div>
    </Link>
  )
}
