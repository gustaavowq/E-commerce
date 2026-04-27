'use client'

import { Check, Plus } from 'lucide-react'
import { ProductImage } from '../ProductImage'
import { Button } from '../ui/Button'
import { formatBRL } from '@/lib/format'
import { cn } from '@/lib/utils'
import type { ProductListItem } from '@/services/types'

type Props = {
  product: ProductListItem
  selected?: boolean
  incompatible?: boolean
  incompatibilityReason?: string
  onPick: (p: ProductListItem) => void
}

/**
 * Card especifico do builder. Mostra spec curto + estado (selecionado / incompativel).
 */
export function BuilderProductCard({ product, selected, incompatible, incompatibilityReason, onPick }: Props) {
  return (
    <div
      className={cn(
        'flex flex-col gap-3 rounded-lg border bg-surface p-3 transition-all',
        selected ? 'border-primary shadow-glow-soft' : 'border-border',
        incompatible && 'opacity-60',
      )}
    >
      <div className="flex gap-3">
        <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-md bg-bg">
          <ProductImage
            src={product.primaryImage?.url}
            alt={product.primaryImage?.alt ?? product.name}
            fallbackLabel={product.name}
            sizes="80px"
          />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-bold uppercase tracking-wide text-text-secondary">
            {product.brand?.name}
          </p>
          <h4 className="line-clamp-2 text-sm font-semibold text-text">{product.name}</h4>
          {product.specsHighlights && product.specsHighlights.length > 0 && (
            <p className="font-specs text-[11px] text-text-secondary line-clamp-1">
              {product.specsHighlights.join(' · ')}
            </p>
          )}
        </div>
      </div>

      <div className="flex items-end justify-between gap-3">
        <div>
          <p className="text-base font-bold text-text">{formatBRL(product.basePrice)}</p>
          <p className="text-[11px] text-text-secondary">{product.totalStock > 0 ? `${product.totalStock} em estoque` : 'Sem estoque'}</p>
        </div>
        <Button
          type="button"
          onClick={() => onPick(product)}
          disabled={incompatible || product.totalStock === 0}
          variant={selected ? 'success' : incompatible ? 'secondary' : 'primary'}
          size="sm"
          aria-label={selected ? `Remover ${product.name} do build` : `Adicionar ${product.name} ao build`}
        >
          {selected ? <><Check className="h-4 w-4" /> Selecionado</> : <><Plus className="h-4 w-4" /> Adicionar</>}
        </Button>
      </div>

      {incompatible && incompatibilityReason && (
        <p className="rounded-md border border-warning/40 bg-warning/5 px-2 py-1.5 text-[11px] text-warning">
          {incompatibilityReason}
        </p>
      )}
    </div>
  )
}
