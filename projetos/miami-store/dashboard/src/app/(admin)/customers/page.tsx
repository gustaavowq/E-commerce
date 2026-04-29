'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useQuery } from '@tanstack/react-query'
import { Search, ChevronLeft, ChevronRight, Users } from 'lucide-react'
import { adminCustomers } from '@/services/admin'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { TableSkeleton, EmptyState } from '@/components/Skeleton'
import { formatBRL, formatDateTime } from '@/lib/format'

export default function CustomersListPage() {
  const [searchInput, setSearchInput] = useState('')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)

  const q = useQuery({
    queryKey: ['admin', 'customers', { search, page }],
    queryFn:  () => adminCustomers.list({ page, limit: 25, search: search || undefined }),
  })
  const totalPages = q.data?.meta?.totalPages ?? 1
  const total      = q.data?.meta?.total ?? 0

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-ink">Clientes</h1>
        <p className="text-sm text-ink-3">{total} clientes cadastrados</p>
      </header>

      <form
        onSubmit={(e) => { e.preventDefault(); setSearch(searchInput); setPage(1) }}
        className="relative max-w-md"
      >
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-4" />
        <Input
          placeholder="Buscar por nome ou email…"
          value={searchInput}
          onChange={e => setSearchInput(e.target.value)}
          className="pl-9"
        />
      </form>

      {q.isLoading ? (
        <TableSkeleton rows={6} cols={6} />
      ) : q.data && q.data.data.length > 0 ? (
        <div className="overflow-x-auto rounded-lg border border-border bg-white shadow-sm">
          <table className="min-w-full divide-y divide-border">
            <thead className="bg-surface-2 text-left text-[11px] font-semibold uppercase tracking-wider text-ink-3">
              <tr>
                <th className="px-4 py-2">Cliente</th>
                <th className="px-4 py-2">Telefone</th>
                <th className="px-4 py-2 text-right">Pedidos</th>
                <th className="px-4 py-2 text-right">Total gasto</th>
                <th className="px-4 py-2">Cadastro</th>
                <th className="px-4 py-2 text-center">Email verificado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {q.data.data.map(c => (
                <tr key={c.id} className="transition hover:bg-primary-50/40">
                  <td className="table-cell-base">
                    <Link href={`/customers/${c.id}`} className="font-medium text-ink hover:text-primary-700">{c.name}</Link>
                    <p className="text-xs text-ink-3">{c.email}</p>
                  </td>
                  <td className="table-cell-base text-ink-2">{c.phone ?? <span className="text-ink-4">—</span>}</td>
                  <td className="table-cell-base text-right font-mono">{c.orderCount}</td>
                  <td className="table-cell-base text-right font-mono font-semibold text-ink">{formatBRL(c.totalSpent)}</td>
                  <td className="table-cell-base text-xs text-ink-3">{formatDateTime(c.createdAt)}</td>
                  <td className="table-cell-base text-center">
                    {c.emailVerifiedAt
                      ? <span className="inline-flex rounded-full bg-success/10 px-2 py-0.5 text-xs font-semibold text-success">Sim</span>
                      : <span className="inline-flex rounded-full bg-ink-3/10 px-2 py-0.5 text-xs font-semibold text-ink-3">Não</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <EmptyState
          icon={<Users className="h-6 w-6" />}
          title={search ? 'Ninguém bate com essa busca' : 'Sem clientes cadastrados'}
          description={search
            ? 'Tenta com email completo ou parte do nome.'
            : 'Quando alguém criar conta na loja, aparece aqui.'}
        />
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-xs text-ink-3">Página {page} de {totalPages}</p>
          <div className="flex gap-1">
            <Button size="sm" variant="secondary" disabled={page === 1} onClick={() => setPage(p => p - 1)} leftIcon={<ChevronLeft className="h-4 w-4" />}>
              Anterior
            </Button>
            <Button size="sm" variant="secondary" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)} rightIcon={<ChevronRight className="h-4 w-4" />}>
              Próxima
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
