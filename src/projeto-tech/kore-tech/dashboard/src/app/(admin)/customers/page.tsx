// =============================================================================
// Kore Tech — Painel admin > Clientes (lista)
// =============================================================================

'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { Search, Users2 } from 'lucide-react'
import { adminCustomers } from '@/services/admin'
import type { AdminCustomerListItem } from '@/services/types'
import { Input } from '@/components/ui/Input'
import { DataTable, type DataTableColumn } from '@/components/DataTable'
import { Pagination } from '@/components/Pagination'
import { EmptyState } from '@/components/Skeleton'
import { useDebounce } from '@/hooks/useDebounce'
import { formatBRL, formatDate } from '@/lib/format'

export default function CustomersListPage() {
  const router       = useRouter()
  const searchParams = useSearchParams()

  const filters = useMemo(() => ({
    page:   Number(searchParams.get('page')   ?? '1'),
    limit:  Number(searchParams.get('limit')  ?? '20'),
    search: searchParams.get('search')        ?? '',
  }), [searchParams])

  const [searchInput, setSearchInput] = useState(filters.search)
  const debouncedSearch = useDebounce(searchInput, 350)

  useEffect(() => {
    if (debouncedSearch === filters.search) return
    const next = new URLSearchParams(searchParams.toString())
    if (debouncedSearch) next.set('search', debouncedSearch)
    else                 next.delete('search')
    next.delete('page')
    router.replace(`/customers?${next.toString()}`)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch])

  const customersQ = useQuery({
    queryKey: ['admin', 'customers', 'list', filters],
    queryFn:  () => adminCustomers.list({
      page:   filters.page,
      limit:  filters.limit,
      search: filters.search || undefined,
    }),
  })

  const rows = customersQ.data?.data ?? []
  const meta = customersQ.data?.meta

  const columns: DataTableColumn<AdminCustomerListItem>[] = [
    {
      key: 'name',
      header: 'Cliente',
      render: row => (
        <div className="min-w-0">
          <p className="truncate font-semibold text-text">{row.name}</p>
          <p className="truncate text-xs text-text-secondary">{row.email}</p>
        </div>
      ),
    },
    {
      key: 'phone',
      header: 'Telefone',
      hideOnMobile: true,
      render: row => <span className="font-mono text-xs text-text-secondary">{row.phone ?? '—'}</span>,
    },
    {
      key: 'verified',
      header: 'Email',
      align: 'center',
      hideOnMobile: true,
      render: row => row.emailVerifiedAt
        ? <span className="inline-flex rounded-pill bg-success-soft px-2 py-0.5 text-[10px] font-bold uppercase text-success">Verificado</span>
        : <span className="inline-flex rounded-pill bg-warning-soft px-2 py-0.5 text-[10px] font-bold uppercase text-warning">Não verificado</span>,
    },
    {
      key: 'orders',
      header: 'Pedidos',
      align: 'right',
      render: row => <span className="font-mono text-sm text-text">{row.orderCount}</span>,
    },
    {
      key: 'total',
      header: 'Total gasto',
      align: 'right',
      render: row => <span className="font-mono text-sm text-text">{formatBRL(row.totalSpent)}</span>,
    },
    {
      key: 'created',
      header: 'Cadastro',
      align: 'right',
      hideOnMobile: true,
      render: row => <span className="text-xs text-text-muted">{formatDate(row.createdAt)}</span>,
    },
  ]

  return (
    <div className="space-y-5">
      <header>
        <h1 className="text-2xl font-bold text-text">Clientes</h1>
        <p className="text-sm text-text-secondary">Lista de clientes registrados, com volume de pedidos e gasto total.</p>
      </header>

      <section className="rounded-lg border border-border bg-surface p-4 shadow-md">
        <div className="relative max-w-md">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
          <Input
            value={searchInput}
            onChange={e => setSearchInput(e.target.value)}
            placeholder="Buscar por nome, email ou CPF…"
            className="pl-9"
            aria-label="Buscar clientes"
          />
        </div>
      </section>

      {!customersQ.isLoading && rows.length === 0 ? (
        <EmptyState
          icon={<Users2 className="h-5 w-5" />}
          title="Nenhum cliente"
          description={filters.search ? 'Nenhum cliente bate com a busca.' : 'Quando alguém criar conta na loja, aparece aqui.'}
        />
      ) : (
        <>
          <DataTable
            loading={customersQ.isLoading}
            columns={columns}
            rows={rows}
            rowKey={r => r.id}
            rowHref={r => `/customers/${r.id}`}
          />
          {meta && meta.totalPages && meta.page && (
            <Pagination
              page={meta.page}
              totalPages={meta.totalPages}
              total={meta.total}
              onChange={p => {
                const next = new URLSearchParams(searchParams.toString())
                next.set('page', String(p))
                router.replace(`/customers?${next.toString()}`)
              }}
            />
          )}
        </>
      )}
    </div>
  )
}
