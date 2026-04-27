import Link from 'next/link'
import { ProductImage } from './ProductImage'
import { WishlistHeart } from './WishlistHeart'
import { formatBRL, discountPercent, installmentLabel } from '@/lib/format'
import type { ProductListItem } from '@/services/types'
import { cn } from '@/lib/utils'

type Props = {
  product: ProductListItem
  className?: string
  index?: number
}

export function ProductCard({ product, className, index = 0 }: Props) {
  const discount = discountPercent(product.basePrice, product.comparePrice)
  const outOfStock = product.totalStock === 0
  const delay = Math.min(index, 9) * 50
  const isReadyPc = product.buildType === 'pc_pronto'
  const detailHref = isReadyPc ? `/pcs/${product.slug}` : `/produtos/${product.slug}`

  return (
    <Link
      href={detailHref}
      style={{ animationDelay: `${delay}ms` }}
      className={cn(
        'group flex flex-col overflow-hidden rounded-lg border border-border bg-surface transition-all duration-300 animate-fade-up',
        'hover:-translate-y-1 hover:border-primary/40 hover:shadow-glow-soft',
        outOfStock && 'opacity-70',
        className,
      )}
    >
      <div className="relative aspect-[4/5] overflow-hidden bg-bg">
        <ProductImage
          src={product.primaryImage?.url}
          alt={product.primaryImage?.alt ?? product.name}
          fallbackLabel={product.name}
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 280px"
          zoomOnHover
        />

        <div className="absolute left-2 right-2 top-2 flex items-start justify-between gap-2">
          <span className="inline-flex items-center rounded-sm bg-bg/90 px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-text backdrop-blur-sm">
            {product.brand?.name ?? 'Sem marca'}
          </span>
          <div className="z-10">
            <WishlistHeart productId={product.id} size="sm" />
          </div>
        </div>

        {discount && (
          <span className="absolute bottom-2 left-2 inline-flex items-center rounded-sm bg-danger px-2 py-1 text-xs font-black text-white shadow-md">
            -{discount}%
          </span>
        )}

        {isReadyPc && (
          <span className="absolute bottom-2 right-2 inline-flex items-center rounded-sm border border-primary bg-bg/85 px-2 py-1 text-[10px] font-bold text-primary backdrop-blur-sm">
            PC montado
          </span>
        )}

        {outOfStock && (
          <div className="absolute inset-0 flex items-center justify-center bg-bg/70 backdrop-blur-sm">
            <span className="rounded-md border border-warning/60 bg-bg/90 px-3 py-1.5 text-sm font-bold uppercase text-warning">
              Sem estoque
            </span>
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-2 p-3 sm:p-4">
        <h3 className="line-clamp-2 text-sm font-semibold leading-snug text-text sm:text-base">
          {product.name}
        </h3>

        {product.specsHighlights && product.specsHighlights.length > 0 && (
          <p className="font-specs text-[11px] text-text-secondary line-clamp-1">
            {product.specsHighlights.slice(0, 2).join(' · ')}
          </p>
        )}

        {product.benchmarkFps && Object.keys(product.benchmarkFps).length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-1">
            {Object.entries(product.benchmarkFps)
              .slice(0, 2)
              .map(([game, fps]) => (
                <span key={game} className="font-specs text-[11px] text-primary">
                  {game.split('_')[0]} {fps}fps
                </span>
              ))}
          </div>
        )}

        <div className="mt-auto flex flex-col">
          {product.comparePrice && (
            <span className="text-xs text-text-muted line-through">{formatBRL(product.comparePrice)}</span>
          )}
          <span className="text-lg font-bold text-text sm:text-xl">{formatBRL(product.basePrice)}</span>
          <span className="text-xs text-text-secondary">{installmentLabel(product.basePrice)}</span>
        </div>
      </div>
    </Link>
  )
}
