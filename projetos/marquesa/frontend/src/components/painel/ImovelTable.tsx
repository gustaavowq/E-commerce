'use client'

import Link from 'next/link'
import Image from 'next/image'
import { formatBRL, formatArea, formatDate, tipoLabel } from '@/lib/format'
import { StatusBadge } from '@/components/ui/StatusBadge'
import type { ImovelListItem } from '@/types/api'

interface ImovelTableProps {
  imoveis: ImovelListItem[]
}

export function ImovelTable({ imoveis }: ImovelTableProps) {
  if (imoveis.length === 0) {
    return (
      <div className="border border-bone bg-paper p-12 text-center">
        <p className="text-body text-ash">Nenhum imóvel encontrado.</p>
      </div>
    )
  }

  return (
    <div className="border border-bone bg-paper overflow-x-auto">
      <table className="w-full text-body-sm">
        <thead className="bg-paper-warm border-b border-bone">
          <tr>
            <Th>Imóvel</Th>
            <Th>Tipo</Th>
            <Th>Bairro</Th>
            <Th className="text-right">Preço</Th>
            <Th className="text-right">Área</Th>
            <Th>Status</Th>
            <Th>Atualizado</Th>
            <Th></Th>
          </tr>
        </thead>
        <tbody>
          {imoveis.map((i) => {
            const foto = i.fotos?.[0] || 'https://placehold.co/120x90'
            return (
              <tr key={i.id} className="border-b border-bone last:border-b-0 hover:bg-paper-warm/50">
                <Td>
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="relative w-16 h-12 bg-bone shrink-0 overflow-hidden">
                      <Image src={foto} alt="" fill sizes="64px" className="object-cover" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-ink truncate font-medium">{i.titulo}</p>
                      <p className="text-caption text-ash truncate">/{i.slug}</p>
                    </div>
                  </div>
                </Td>
                <Td className="text-ash">{tipoLabel(i.tipo)}</Td>
                <Td className="text-ash">
                  {i.bairro}, {i.cidade}
                </Td>
                <Td className="text-right tnum text-ink">{formatBRL(i.preco)}</Td>
                <Td className="text-right tnum text-ash">{formatArea(i.area)}</Td>
                <Td>
                  <StatusBadge status={i.status} />
                </Td>
                <Td className="text-ash tnum">{formatDate(i.createdAt)}</Td>
                <Td className="text-right">
                  <Link
                    href={`/painel/imoveis/${i.id}`}
                    className="text-moss hover:text-moss-deep hover:underline underline-offset-4"
                  >
                    Editar
                  </Link>
                </Td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

function Th({ children, className = '' }: { children?: React.ReactNode; className?: string }) {
  return (
    <th className={`text-left text-eyebrow uppercase tracking-[0.16em] text-ash font-medium px-4 py-3 ${className}`}>
      {children}
    </th>
  )
}

function Td({ children, className = '' }: { children?: React.ReactNode; className?: string }) {
  return <td className={`px-4 py-3 align-middle ${className}`}>{children}</td>
}
