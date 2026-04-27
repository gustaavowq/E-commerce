'use client'

import Link from 'next/link'
import { Plug, Zap } from 'lucide-react'
import { useBuilder } from '@/stores/builder'
import { Button } from '../ui/Button'
import { formatBRL } from '@/lib/format'
import { cn } from '@/lib/utils'

type Props = {
  recommendation?: {
    productId: string
    productSlug: string
    productName: string
    price: number
    wattage: number
    certification: string | null
    imageUrl: string | null
  } | null
  onPick?: () => void
  className?: string
}

/**
 * Sugere fonte automaticamente baseada na soma de wattagem das pecas.
 * Backend retorna a fonte + wattagem recomendada (com margem ~25%).
 */
export function BuilderPSURecommendation({ recommendation, onPick, className }: Props) {
  const totalWattage = useBuilder((s) => s.totalWattage)
  const recommendedW = useBuilder((s) => s.recommendedPsuW)
  const psuPicked = useBuilder((s) => s.selections.psu)

  if (totalWattage === 0) return null

  if (psuPicked) {
    const enough = recommendedW > 0 && (psuPicked.consumptionW ?? 0) >= recommendedW
    return (
      <div
        className={cn(
          'flex items-center gap-2 rounded-md border px-3 py-2 text-xs',
          enough ? 'border-success/40 bg-success/5 text-success' : 'border-border bg-surface text-text-secondary',
          className,
        )}
      >
        <Plug className="h-4 w-4" />
        <span className="flex-1 truncate">
          Fonte selecionada: <span className="font-semibold text-text">{psuPicked.productName}</span>
        </span>
        <span className="font-specs">{recommendedW > 0 ? `pede ~${recommendedW}W` : ''}</span>
      </div>
    )
  }

  if (!recommendation) {
    return (
      <div className={cn('rounded-md border border-warning/40 bg-warning/5 p-3 text-xs text-warning', className)}>
        Voce ainda nao escolheu fonte. Adicione uma compativel com pelo menos {recommendedW || Math.ceil(totalWattage * 1.25)} W.
      </div>
    )
  }

  return (
    <div className={cn('rounded-md border border-primary/40 bg-primary-soft p-3', className)}>
      <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-primary">
        <Zap className="h-3.5 w-3.5" /> Fonte sugerida pra esse build
      </p>
      <div className="mt-2 flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-text">{recommendation.productName}</p>
          <p className="font-specs text-xs text-text-secondary">
            {recommendation.wattage}W{recommendation.certification ? ` · ${recommendation.certification}` : ''} ·{' '}
            <span className="text-text">{formatBRL(recommendation.price)}</span>
          </p>
        </div>
        {onPick && (
          <Button onClick={onPick} variant="primary" size="sm">
            Adicionar
          </Button>
        )}
        {!onPick && (
          <Link href={`/produtos/${recommendation.productSlug}`} className="text-xs font-semibold text-primary hover:underline">
            Ver fonte
          </Link>
        )}
      </div>
    </div>
  )
}
