import Link from 'next/link'
import Image from 'next/image'
import { formatBRL, formatArea, tipoLabel } from '@/lib/format'
import { StatusBadge } from '@/components/ui/StatusBadge'
import type { ImovelListItem } from '@/types/api'

interface ImovelCardProps {
  imovel: ImovelListItem
  priority?: boolean
}

export function ImovelCard({ imovel, priority }: ImovelCardProps) {
  const foto = imovel.fotos?.[0] ?? 'https://placehold.co/800x600?text=Marquesa'
  const showStatus = imovel.status !== 'DISPONIVEL'

  return (
    <Link
      href={`/imoveis/${imovel.slug}`}
      className="group block w-full focus:outline-none focus-visible:ring-2 focus-visible:ring-moss focus-visible:ring-offset-2 focus-visible:ring-offset-paper"
      aria-label={`${tipoLabel(imovel.tipo)} em ${imovel.bairro} — ${formatBRL(imovel.preco)}`}
    >
      {/* Imagem 4:3 com hover scale na imagem (não no card) */}
      <div className="relative aspect-card overflow-hidden bg-bone">
        <Image
          src={foto}
          alt={`${tipoLabel(imovel.tipo)} de ${formatArea(imovel.area)} em ${imovel.bairro}, ${imovel.cidade}`}
          fill
          sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
          className="object-cover transition-transform duration-base ease-standard group-hover:scale-[1.03]"
          priority={priority}
        />
        {showStatus && (
          <div className="absolute top-4 left-4">
            <StatusBadge status={imovel.status} />
          </div>
        )}
        {imovel.destaque && imovel.status === 'DISPONIVEL' && (
          <div className="absolute top-4 left-4">
            <span className="inline-block px-[10px] py-1 text-caption uppercase tracking-[0.04em] bg-paper text-ink rounded-md font-medium">
              Destaque
            </span>
          </div>
        )}
      </div>

      {/* Conteúdo */}
      <div className="pt-4 flex flex-col gap-1">
        <span className="text-eyebrow uppercase tracking-[0.16em] text-ash">
          {imovel.bairro} · {imovel.cidade}
        </span>
        <h3 className="font-display text-heading-lg text-ink leading-tight mt-1 line-clamp-2">
          {imovel.titulo}
        </h3>
        <p className="text-body-sm text-ash mt-2 tnum">
          {imovel.quartos > 0 && (
            <>
              <span>{imovel.quartos} quartos</span>
              {imovel.suites > 0 && <span> · {imovel.suites} suítes</span>}
            </>
          )}
          {imovel.area > 0 && <span> · {formatArea(imovel.area)}</span>}
          {imovel.vagas > 0 && <span> · {imovel.vagas} vagas</span>}
        </p>
        <p className="font-sans font-medium text-body-lg text-ink mt-4 tnum">
          {formatBRL(imovel.preco)}
        </p>
      </div>
    </Link>
  )
}
