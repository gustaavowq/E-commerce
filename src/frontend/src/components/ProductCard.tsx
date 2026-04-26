import Link from 'next/link'
import Image from 'next/image'
import { AuthenticityBadge } from './AuthenticityBadge'
import { formatBRL, discountPercent, installmentLabel } from '@/lib/format'
import type { ProductListItem } from '@/services/types'
import { cn } from '@/lib/utils'

type Props = {
  product: ProductListItem
  className?: string
}

export function ProductCard({ product, className }: Props) {
  const discount = discountPercent(product.basePrice, product.comparePrice)
  const outOfStock = product.totalStock === 0
  const fallbackImg = `https://placehold.co/720x900/F0F0F0/9CA3AF?text=${encodeURIComponent(product.name)}`
  const imgSrc = product.primaryImage?.url ?? fallbackImg

  return (
    <Link
      href={`/products/${product.slug}`}
      className={cn(
        'group flex flex-col overflow-hidden rounded-lg bg-white border border-border transition-all duration-200',
        'hover:-translate-y-0.5 hover:shadow-lg',
        outOfStock && 'opacity-60',
        className,
      )}
    >
      {/* Imagem com badges flutuantes */}
      <div className="relative aspect-[4/5] overflow-hidden bg-surface-2">
        <Image
          src={imgSrc}
          alt={product.primaryImage?.alt ?? product.name}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 280px"
          className="object-cover transition-transform duration-300 group-hover:scale-105"
          unoptimized
        />

        {/* Badges no topo */}
        <div className="absolute left-2 right-2 top-2 flex items-start justify-between gap-2">
          <span className="inline-flex items-center rounded-sm bg-white/90 px-2 py-1 text-xs font-bold uppercase text-ink backdrop-blur-sm">
            {product.brand.name}
          </span>
          {discount && (
            <span className="inline-flex items-center rounded-sm bg-accent px-2 py-1 text-xs font-black text-white">
              -{discount}%
            </span>
          )}
        </div>

        {/* Selo original no canto inferior direito */}
        <div className="absolute bottom-2 right-2">
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
