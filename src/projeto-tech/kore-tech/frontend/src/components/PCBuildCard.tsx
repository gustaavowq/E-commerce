import Link from 'next/link'
import { ProductImage } from './ProductImage'
import { FPSBadge } from './FPSBadge'
import { formatBRL, installmentLabel } from '@/lib/format'
import type { ProductListItem } from '@/services/types'
import { cn } from '@/lib/utils'
import { ArrowRight } from 'lucide-react'

type Props = {
  product: ProductListItem
  className?: string
  featuredGames?: string[] // chaves a destacar do benchmarkFps. Default: 2 primeiras.
}

/**
 * Card especifico de PC montado. Mostra FPS estimado em destaque (diferencial Kore Tech).
 */
export function PCBuildCard({ product, className, featuredGames }: Props) {
  const benchmarks = product.benchmarkFps ?? {}
  const games = featuredGames
    ? featuredGames.filter((g) => benchmarks[g] != null)
    : Object.keys(benchmarks).slice(0, 3)

  return (
    <Link
      href={`/pcs/${product.slug}`}
      className={cn(
        'group flex flex-col overflow-hidden rounded-lg border border-border bg-surface transition-all duration-300 animate-fade-up',
        'hover:-translate-y-1 hover:border-primary/60 hover:shadow-glow-soft',
        className,
      )}
    >
      <div className="relative aspect-video overflow-hidden bg-bg">
        <ProductImage
          src={product.primaryImage?.url}
          alt={product.primaryImage?.alt ?? product.name}
          fallbackLabel={product.name}
          sizes="(max-width: 640px) 100vw, 50vw"
          zoomOnHover
        />
        <div className="absolute left-3 top-3">
          <span className="inline-flex items-center rounded-sm border border-primary bg-bg/85 px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-primary backdrop-blur-sm">
            PC montado
          </span>
        </div>
        {product.persona && (
          <div className="absolute right-3 top-3">
            <span className="inline-flex items-center rounded-sm bg-bg/85 px-2 py-1 text-[10px] font-bold uppercase text-text-secondary backdrop-blur-sm">
              {product.persona.replace(/_/g, ' ')}
            </span>
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-3 p-4">
        <h3 className="line-clamp-2 text-base font-bold text-text sm:text-lg">{product.name}</h3>
        {product.specsHighlights && product.specsHighlights.length > 0 && (
          <p className="font-specs text-xs text-text-secondary line-clamp-2">
            {product.specsHighlights.join(' · ')}
          </p>
        )}

        {games.length > 0 && (
          <div className="grid grid-cols-3 gap-1.5">
            {games.map((g) => (
              <FPSBadge key={g} game={g.split('_')[0]} fps={benchmarks[g]} size="sm" />
            ))}
          </div>
        )}

        <div className="mt-auto flex items-end justify-between gap-3 pt-2">
          <div>
            <p className="text-xl font-bold text-text">{formatBRL(product.basePrice)}</p>
            <p className="text-xs text-text-secondary">{installmentLabel(product.basePrice)}</p>
          </div>
          <span className="inline-flex items-center gap-1 text-xs font-semibold text-primary opacity-0 transition-all group-hover:translate-x-1 group-hover:opacity-100">
            Ver build <ArrowRight className="h-3 w-3" />
          </span>
        </div>
      </div>
    </Link>
  )
}
