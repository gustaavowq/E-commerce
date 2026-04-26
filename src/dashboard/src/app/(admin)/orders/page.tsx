'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useQuery } from '@tanstack/react-query'
import { Search, ChevronLeft, ChevronRight, ShoppingBag, Download } from 'lucide-react'
import { adminOrders } from '@/services/admin'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { StatusBadge } from '@/components/StatusBadge'
import { TableSkeleton, EmptyState } from '@/components/Skeleton'
import { formatBRL, formatDateTime } from '@/lib/format'
import type { OrderStatus } from '@/services/types'

const STATUS_FILTERS: Array<{ v: OrderStatus | 'ALL'; label: string }> = [
  { v: 'ALL',             label: 'Todos' },
  { v: 'PENDING_PAYMENT', label: 'Aguardando' },
  { v: 'PAID',            label: 'Pagos' },
  { v: 'PREPARING',       label: 'Em separação' },
  { v: 'SHIPPED',         label: 'Enviados' },
  { v: 'DELIVERED',       label: 'Entregues' },
  { v: 'CANCELLED',       label: 'Cancelados' },
]

export default function OrdersListPage() {
  const [statusFilter, setStatusFilter] = useState<OrderStatus | 'ALL'>('ALL')
  const [search, setSearch] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [page, setPage] = useState(1)
  const limit = 25

  const q = useQuery({
    queryKey: ['admin', 'orders', { statusFilter, search, page }],
    queryFn:  () => adminOrders.list({
      page, limit,
      status: statusFilter === 'ALL' ? undefined : statusFilter,
      search: search || undefined,
    }),
  })

  const totalPages = q.data?.meta?.totalPages ?? 1
  const total      = q.data?.meta?.total ?? 0

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-ink">Pedidos</h1>
          <p className="text-sm text-ink-3">{total} pedidos no total</p>
        </div>
        <a
          href={`http://api.miami.test/admin/orders/export.csv${statusFilter !== 'ALL' ? `?status=${statusFilter}` : ''}`.replace('http://api.miami.test', process.env.NEXT_PUBLIC_API_URL || 'http://api.miami.test')}
          target="_blank" rel="noopener noreferrer"
          className="inline-flex h-10 items-center gap-2 rounded-md border border-border-strong bg-white px-4 text-sm font-semibold text-ink-2 hover:bg-surface-2 transition"
        >
          <Download className="h-4 w-4" /> Exportar CSV
        </a>
      </header>

      {/* Filtros */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <form
          onSubmit={(e) => { e.preventDefault(); setSearch(searchInput); setPage(1) }}
          className="relative flex-1"
        >
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-4" />
          <Input
            placeholder="Buscar por número, email ou nome…"
            value={searchInput}
            onChange={e => setSearchInput(e.target.value)}
            className="pl-9"
          />
        </form>
      </div>

      <div className="-mx-2 flex flex-wrap gap-1.5 overflow-x-auto px-2 sm:mx-0 sm:px-0">
        {STATUS_FILTERS.map(f => (
          <button
            key={f.v}
            onClick={() => { setStatusFilter(f.v); setPage(1) }}
            className={
              'rounded-full border px-3 py-1 text-xs font-semibold transition ' +
              (statusFilter === f.v
                ? 'border-primary-700 bg-primary-700 text-white'
                : 'border-border bg-white text-ink-2 hover:border-ink-3')
            }
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Tabela */}
      {q.isLoading ? (
        <TableSkeleton rows={6} cols={6} />
      ) : q.data && q.data.data.length > 0 ? (
        <div className="overflow-x-auto rounded-lg border border-border bg-white shadow-sm">
          <table className="min-w-[768px] w-full divide-y divide-border">
            <thead className="bg-surface-2 text-left text-[11px] font-semibold uppercase tracking-wider text-ink-3">
              <tr>
                <th className="px-4 py-2">Pedido</th>
                <th className="px-4 py-2">Cliente</th>
                <th className="px-4 py-2">Status</th>
                <th className="px-4 py-2">Pagamento</th>
                <th className="px-4 py-2 text-right">Total</th>
                <th className="px-4 py-2">Data</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {q.data.data.map(o => (
                <tr key={o.id} className="cursor-pointer transition hover:bg-primary-50/40">
                  <td className="table-cell-base">
                    <Link href={`/orders/${o.id}`} className="font-mono font-semibold text-primary-700 hover:underline">
                      {o.orderNumber}
                    </Link>
                    <p className="text-xs text-ink-3">{o.itemCount} {o.itemCount === 1 ? 'item' : 'itens'}</p>
                  </td>
                  <td className="table-cell-base">
                    <p className="font-medium text-ink">{o.customer.name}</p>
                    <p className="text-xs text-ink-3">{o.customer.email}</p>
                  </td>
                  <td className="table-cell-base"><StatusBadge kind="order" status={o.status} /></td>
                  <td className="table-cell-base">
                    <StatusBadge kind="payment" status={o.paymentStatus} />
                    {o.paymentMethod && <span className="ml-1 text-[10px] text-ink-4">{o.paymentMethod}</span>}
                  </td>
                  <td className="table-cell-base text-right font-mono font-semibold text-ink">{formatBRL(o.total)}</td>
                  <td className="table-cell-base text-xs text-ink-3">{formatDateTime(o.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <EmptyState
          icon={<ShoppingBag className="h-6 w-6" />}
          title={search || statusFilter !== 'ALL' ? 'Nada bate com esse filtro' : 'Sem pedidos por aqui ainda'}
          description={search || statusFilter !== 'ALL'
            ? 'Limpa os filtros ou tenta uma busca diferente.'
            : 'Quando o primeiro cliente comprar, ele aparece aqui.'}
        />
      )}

      {/* Paginação */}
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
