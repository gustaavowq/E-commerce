'use client'

import Link from 'next/link'
import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { apiList } from '@/lib/api'
import { ImovelTable } from '@/components/painel/ImovelTable'
import { Button } from '@/components/ui/Button'
import type { ImovelListItem } from '@/types/api'

export default function PainelImoveisPage() {
  const [status, setStatus] = useState<string>('')
  const [search, setSearch] = useState('')

  const { data, isLoading } = useQuery({
    queryKey: ['admin-imoveis', status, search],
    queryFn: () =>
      apiList<ImovelListItem>('/api/admin/imoveis', {
        withAuth: true,
        query: {
          status: status || undefined,
          search: search || undefined,
          limit: 50,
        },
      }),
    staleTime: 0,
  })

  return (
    <div className="flex flex-col gap-8">
      <header className="flex items-end justify-between gap-4 flex-wrap">
        <div>
          <p className="text-eyebrow uppercase tracking-[0.16em] text-ash mb-3">Painel</p>
          <h1 className="font-display text-display-lg text-ink">Imóveis</h1>
        </div>
        <Link href="/painel/imoveis/novo">
          <Button>Novo imóvel</Button>
        </Link>
      </header>

      <div className="flex items-end gap-4 flex-wrap">
        <label className="flex flex-col gap-2 flex-1 min-w-[200px]">
          <span className="text-eyebrow uppercase tracking-[0.16em] text-ash">Buscar</span>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Título, bairro…"
            className="bg-paper border border-bone px-3 py-2 text-body-sm text-ink focus:outline-none focus:ring-1 focus:ring-moss"
          />
        </label>
        <label className="flex flex-col gap-2 min-w-[180px]">
          <span className="text-eyebrow uppercase tracking-[0.16em] text-ash">Status</span>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="bg-paper border border-bone px-3 py-2 text-body-sm text-ink focus:outline-none focus:ring-1 focus:ring-moss"
          >
            <option value="">Todos</option>
            <option value="DISPONIVEL">Disponível</option>
            <option value="RESERVADO">Reservado</option>
            <option value="EM_NEGOCIACAO">Em negociação</option>
            <option value="VENDIDO">Vendido</option>
            <option value="INATIVO">Inativo</option>
          </select>
        </label>
      </div>

      {isLoading ? (
        <div className="border border-bone bg-paper p-12 text-center text-ash">Carregando…</div>
      ) : (
        <ImovelTable imoveis={data?.data || []} />
      )}
    </div>
  )
}
