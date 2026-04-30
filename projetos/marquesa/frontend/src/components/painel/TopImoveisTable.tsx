'use client'

// TopImoveisTable — top 5 imóveis ordenáveis por views/leads/reservas/score.
// Thumbnail 48×48 + título truncate + bairro + métrica destacada à direita.
// Click na linha leva pra /painel/imoveis/[id].

import Link from 'next/link'
import Image from 'next/image'
import { useMemo, useState } from 'react'
import { formatBRL, cn } from '@/lib/format'
import type { ImovelEngajamento } from '@/types/api'

type SortKey = 'score' | 'viewCount' | 'leads' | 'reservas'

interface TopImoveisTableProps {
  imoveis: ImovelEngajamento[]
  className?: string
}

const SORT_OPTIONS: Array<{ key: SortKey; label: string }> = [
  { key: 'score',     label: 'Engajamento' },
  { key: 'viewCount', label: 'Visitas' },
  { key: 'leads',     label: 'Leads' },
  { key: 'reservas',  label: 'Reservas' },
]

export function TopImoveisTable({ imoveis, className }: TopImoveisTableProps) {
  const [sortBy, setSortBy] = useState<SortKey>('score')

  const sorted = useMemo(
    () => [...imoveis].sort((a, b) => (b[sortBy] ?? 0) - (a[sortBy] ?? 0)).slice(0, 5),
    [imoveis, sortBy],
  )

  return (
    <div className={cn('border border-bone bg-paper p-8 flex flex-col gap-6', className)}>
      <header className="flex items-baseline justify-between gap-4 flex-wrap">
        <div>
          <p className="text-eyebrow uppercase tracking-[0.16em] text-ash">Top 5</p>
          <h3 className="font-display text-heading-lg text-ink mt-1">Imóveis com maior tração</h3>
        </div>

        <div className="flex items-center gap-1 border border-bone">
          {SORT_OPTIONS.map((opt) => (
            <button
              key={opt.key}
              onClick={() => setSortBy(opt.key)}
              className={cn(
                'px-3 py-1.5 text-caption uppercase tracking-[0.04em] transition-colors duration-fast',
                sortBy === opt.key
                  ? 'bg-ink text-paper'
                  : 'bg-paper text-ash hover:text-ink',
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </header>

      {sorted.length === 0 ? (
        <div className="border border-dashed border-bone py-12 px-6 text-center">
          <p className="text-body-sm text-ash">
            Nenhum imóvel com tração ainda. Os dados aparecem quando começarem as visitas.
          </p>
        </div>
      ) : (
        <ul className="divide-y divide-bone -mx-2">
          {sorted.map((imovel, idx) => {
            const metric =
              sortBy === 'score'     ? imovel.score :
              sortBy === 'viewCount' ? imovel.viewCount :
              sortBy === 'leads'     ? imovel.leads :
                                       imovel.reservas
            const metricLabel =
              sortBy === 'score'     ? 'pts' :
              sortBy === 'viewCount' ? 'visitas' :
              sortBy === 'leads'     ? 'leads' :
                                       'reservas'

            const foto = imovel.fotos?.[0]
            return (
              <li key={imovel.id}>
                <Link
                  href={`/painel/imoveis/${imovel.id}`}
                  className="flex items-center gap-4 px-2 py-3 hover:bg-paper-warm transition-colors duration-fast group"
                >
                  <span className="text-ash-soft tnum text-caption w-5 flex-shrink-0">
                    {String(idx + 1).padStart(2, '0')}
                  </span>

                  <div className="relative w-12 h-12 bg-bone-soft flex-shrink-0 overflow-hidden">
                    {foto ? (
                      <Image
                        src={foto}
                        alt={imovel.titulo}
                        width={48}
                        height={48}
                        className="w-full h-full object-cover"
                        unoptimized
                      />
                    ) : (
                      <span className="absolute inset-0 flex items-center justify-center text-ash-soft text-caption">
                        —
                      </span>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-body-sm text-ink truncate group-hover:text-moss-deep transition-colors duration-fast">
                      {imovel.titulo}
                    </p>
                    <p className="text-caption text-ash truncate">
                      {imovel.bairro}
                      {imovel.preco > 0 && (
                        <>
                          <span className="text-ash-soft mx-1.5">·</span>
                          <span className="tnum">{formatBRL(imovel.preco)}</span>
                        </>
                      )}
                    </p>
                  </div>

                  <div className="text-right flex-shrink-0">
                    <p className="text-body-sm text-ink tnum font-medium">
                      {(metric ?? 0).toLocaleString('pt-BR')}
                    </p>
                    <p className="text-caption text-ash">{metricLabel}</p>
                  </div>
                </Link>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
