import { ImovelCard } from './ImovelCard'
import type { ImovelListItem } from '@/types/api'

interface ImovelGridProps {
  imoveis: ImovelListItem[]
  emptyMessage?: string
}

// Cards SEMPRE visíveis no SSR — sem ScrollReveal envolvendo. Bug iter5:
// ScrollReveal armava opacity:0 após hydration e esperava ms tratados como
// segundos = imagens "sumindo" e alternando entre paints (60-180s pra revelar).
// Imóveis são CONTEÚDO CRÍTICO, não decoração. Aparecem direto.
export function ImovelGrid({ imoveis, emptyMessage }: ImovelGridProps) {
  if (imoveis.length === 0) {
    return (
      <div className="py-24 text-center">
        <p className="font-display text-heading-lg text-ink mb-4">
          Nenhum imóvel encontrado.
        </p>
        <p className="text-body text-ash">
          {emptyMessage ??
            'Limpe os filtros ou volte mais tarde, a curadoria atualiza com frequência.'}
        </p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
      {imoveis.map((imovel, idx) => (
        <ImovelCard key={imovel.id} imovel={imovel} priority={idx < 3} />
      ))}
    </div>
  )
}

export function ImovelGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="animate-pulse">
          <div className="aspect-card bg-bone" />
          <div className="pt-4 flex flex-col gap-2">
            <div className="h-3 w-1/3 bg-bone" />
            <div className="h-6 w-3/4 bg-bone" />
            <div className="h-4 w-1/2 bg-bone-soft" />
            <div className="h-5 w-1/3 bg-bone" />
          </div>
        </div>
      ))}
    </div>
  )
}
