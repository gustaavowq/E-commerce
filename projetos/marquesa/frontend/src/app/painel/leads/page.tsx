'use client'

import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { apiList } from '@/lib/api'
import { formatDate, formatPhone } from '@/lib/format'
import type { Lead } from '@/types/api'

export default function PainelLeadsPage() {
  const [search, setSearch] = useState('')

  const { data, isLoading } = useQuery({
    queryKey: ['admin-leads', search],
    queryFn: () =>
      apiList<Lead>('/api/admin/leads', {
        withAuth: true,
        query: { search: search || undefined, limit: 50 },
      }).catch(() =>
        // Backend pode não ter endpoint /api/admin/leads ainda
        apiList<Lead>('/api/leads', { withAuth: true }),
      ),
    staleTime: 0,
  })

  return (
    <div className="flex flex-col gap-8">
      <header>
        <p className="text-eyebrow uppercase tracking-[0.16em] text-ash mb-3">Painel</p>
        <h1 className="font-display text-display-lg text-ink">Leads</h1>
      </header>

      <input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Buscar por nome ou email…"
        className="bg-paper border border-bone px-3 py-2 text-body-sm text-ink max-w-md focus:outline-none focus:ring-1 focus:ring-moss"
      />

      <div className="border border-bone bg-paper overflow-x-auto">
        {isLoading ? (
          <p className="p-12 text-center text-ash">Carregando…</p>
        ) : data?.data.length === 0 ? (
          <p className="p-12 text-center text-ash">Nenhum lead recebido.</p>
        ) : (
          <table className="w-full text-body-sm">
            <thead className="bg-paper-warm border-b border-bone">
              <tr>
                <Th>Nome</Th>
                <Th>Contato</Th>
                <Th>Imóvel</Th>
                <Th>Mensagem</Th>
                <Th>Recebido</Th>
              </tr>
            </thead>
            <tbody>
              {(data?.data || []).map((l) => (
                <tr key={l.id} className="border-b border-bone last:border-b-0 hover:bg-paper-warm/50">
                  <Td className="text-ink">{l.nome}</Td>
                  <Td>
                    <p className="text-ash">{l.email}</p>
                    {l.telefone && <p className="text-caption text-ash tnum">{formatPhone(l.telefone)}</p>}
                  </Td>
                  <Td className="text-ash">{l.imovel?.titulo ?? '—'}</Td>
                  <Td className="text-ash max-w-xs truncate">{l.mensagem || '—'}</Td>
                  <Td className="text-ash tnum">{formatDate(l.createdAt)}</Td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}

function Th({ children }: { children?: React.ReactNode }) {
  return (
    <th className="text-left text-eyebrow uppercase tracking-[0.16em] text-ash font-medium px-4 py-3">
      {children}
    </th>
  )
}
function Td({ children, className = '' }: { children?: React.ReactNode; className?: string }) {
  return <td className={`px-4 py-3 align-top ${className}`}>{children}</td>
}
