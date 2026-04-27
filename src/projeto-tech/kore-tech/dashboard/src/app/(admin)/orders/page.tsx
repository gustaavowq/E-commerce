// =============================================================================
// Kore Tech — Painel admin > Pedidos (lista)
//
// Lista paginada com filtros (status, busca por número/email/cpf, range de
// data). Linha clicável vai pro detalhe.
// =============================================================================

'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { Search, Filter, ShoppingBag } from 'lucide-react'
import { adminOrders } from '@/services/admin'
import type { AdminOrderListItem, OrderStatus } from '@/services/types'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { DataTable, type DataTableColumn } from '@/components/DataTable'
import { Pagination } from '@/components/Pagination'
import { EmptyState } from '@/components/Skeleton'
import { StatusBadge } from '@/components/StatusBadge'
import { useDebounce } from '@/hooks/useDebounce'
import { formatBRL, formatDateTime } from '@/lib/format'

const ORDER_STATUSES: Array<{ value: OrderStatus | ''; label: string }> = [
  { value: '',                label: 'Todos status' },
  { value: 'PENDING_PAYMENT', label: 'Aguardando pagamento' },
  { value: 'PAID',            label: 'Pago' },
  { value: 'PREPARING',       label: 'Em separação' },
  { value: 'SHIPPED',         label: 'Enviado' },
  { value: 'DELIVERED',       label: 'Entregue' },
  { value: 'CANCELLED',       label: 'Cancelado' },
  { value: 'REFUNDED',        label: 'Reembolsado' },
]

export default function OrdersListPage() {
  const router       = useRouter()
  const searchParams = useSearchParams()

  const filters = useMemo(() => ({
    page:   Number(searchParams.get('page')   ?? '1'),
    limit:  Number(searchParams.get('limit')  ?? '20'),
    search: searchParams.get('search')        ?? '',
    status: (searchParams.get('status')       ?? '') as OrderStatus | '',
    from:   searchParams.get('from')          ?? '',
    to:     searchParams.get('to')            ?? '',
  }), [searchParams])

  const [searchInput, setSearchInput] = useState(filters.search)
  const debouncedSearch = useDebounce(searchInput, 350)

  useEffect(() => {
    if (debouncedSearch === filters.search) return
    const next = new URLSearchParams(searchParams.toString())
    if (debouncedSearch) next.set('search', debouncedSearch)
    else                 next.delete('search')
    next.delete('page')
    router.replace(`/orders?${next.toString()}`)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch])

  const ordersQ = useQuery({
    queryKey: ['admin', 'orders', 'list', filters],
    queryFn:  () => adminOrders.list({
      page:   filters.page,
      limit:  filters.limit,
      search: filters.search || undefined,
      status: (filters.status || undefined) as OrderStatus | undefined,
      from:   filters.from   || undefined,
      to:     filters.to     || undefined,
    }),
    refetchInterval: 30_000, // refresca enquanto admin olha — pedidos são prioridade
  })

  function setQuery(patch: Record<string, string | number | null>) {
    const next = new URLSearchParams(searchParams.toString())
    for (const [k, v] of Object.entries(patch)) {
      if (v === null || v === '' || v === undefined) next.delete(k)
      else next.set(k, String(v))
    }
    router.replace(`/orders?${next.toString()}`)
  }

  const rows = ordersQ.data?.data ?? []
  const meta = ordersQ.data?.meta

  const columns: DataTableColumn<AdminOrderListItem>[] = [
    {
      key: 'orderNumber',
      header: 'Pedido',
      render: row => (
        <div>
          <p className="font-mono text-sm font-semibold text-text">#{row.orderNumber}</p>
          <p className="text-xs text-text-muted">{formatDateTime(row.createdAt)}</p>
        </div>
      ),
    },
    {
      key: 'customer',
      header: 'Cliente',
      hideOnMobile: true,
      render: row => (
        <div className="min-w-0">
          <p className="truncate text-sm text-text">{row.customer.name}</p>
          <p className="truncate text-xs text-text-muted">{row.customer.email}</p>
        </div>
      ),
    },
    {
      key: 'items',
      header: 'Itens',
      align: 'center',
      hideOnMobile: true,
      render: row => <span className="font-mono text-sm text-text">{row.itemCount}</span>,
    },
    {
      key: 'payment',
      header: 'Pagamento',
      hideOnMobile: true,
      render: row => (
        <div className="text-xs">
          <p className="text-text-secondary">{row.paymentMethod ?? '—'}</p>
          <StatusBadge kind="payment" status={row.paymentStatus} />
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: row => <StatusBadge kind="order" status={row.status} />,
    },
    {
      key: 'total',
      header: 'Total',
      align: 'right',
      render: row => <span className="font-mono text-sm font-semibold text-text">{formatBRL(row.total)}</span>,
    },
  ]

  return (
    <div className="space-y-5">
      <header>
        <h1 className="text-2xl font-bold text-text">Pedidos</h1>
        <p className="text-sm text-text-secondary">
          Acompanha pedidos pagos, em separação, enviados e entregues. Atualiza a cada 30s.
        </p>
      </header>

      <section className="rounded-lg border border-border bg-surface p-4 shadow-md">
        <div className="grid gap-3 lg:grid-cols-[1.5fr_1fr_1fr_1fr]">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
            <Input
              value={searchInput}
              onChange={e => setSearchInput(e.target.value)}
              placeholder="Buscar por número, email ou CPF…"
              className="pl-9"
              aria-label="Buscar pedidos"
            />
          </div>
          <Select value={filters.status} onChange={e => setQuery({ status: e.target.value || null, page: 1 })} aria-label="Filtrar por status">
            {ORDER_STATUSES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
          </Select>
          <Input type="date" value={filters.from} onChange={e => setQuery({ from: e.target.value || null, page: 1 })} aria-label="Data inicial" />
          <Input type="date" value={filters.to}   onChange={e => setQuery({ to:   e.target.value || null, page: 1 })} aria-label="Data final" />
        </div>
        {(filters.search || filters.status || filters.from || filters.to) && (
          <div className="mt-3 flex items-center gap-2 text-xs text-text-secondary">
            <Filter className="h-3 w-3" />
            <span>Filtros ativos.</span>
            <button
              type="button"
              onClick={() => router.replace('/orders')}
              className="font-semibold text-primary hover:text-primary-hover"
            >
              Limpar tudo
            </button>
          </div>
        )}
      </section>

      {!ordersQ.isLoading && rows.length === 0 ? (
        <EmptyState
          icon={<ShoppingBag className="h-5 w-5" />}
          title="Nenhum pedido por aqui"
          description={filters.search || filters.status ? 'Ajuste os filtros pra ver outros pedidos.' : 'Quando alguém comprar, o pedido aparece aqui.'}
        />
      ) : (
        <>
          <DataTable
            loading={ordersQ.isLoading}
            columns={columns}
            rows={rows}
            rowKey={r => r.id}
            rowHref={r => `/orders/${r.id}`}
          />
          {meta && meta.totalPages && meta.page && (
            <Pagination
              page={meta.page}
              totalPages={meta.totalPages}
              total={meta.total}
              onChange={p => setQuery({ page: p })}
            />
          )}
        </>
      )}
    </div>
  )
}
