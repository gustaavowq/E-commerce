// =============================================================================
// Kore Tech — Painel admin > Detalhe do cliente
// =============================================================================

'use client'

import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { ChevronLeft, MapPin, ShoppingBag, User } from 'lucide-react'
import { adminCustomers } from '@/services/admin'
import { Skeleton } from '@/components/Skeleton'
import { StatusBadge } from '@/components/StatusBadge'
import { formatBRL, formatDate, formatDateTime } from '@/lib/format'

export default function CustomerDetailPage() {
  const params = useParams<{ id: string }>()

  const customerQ = useQuery({
    queryKey: ['admin', 'customers', 'detail', params.id],
    queryFn:  () => adminCustomers.get(params.id),
  })

  const customer = customerQ.data

  if (customerQ.isLoading) {
    return (
      <div className="space-y-5">
        <Skeleton className="h-6 w-40" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-72 w-full" />
      </div>
    )
  }

  if (!customer) {
    return (
      <div className="rounded-lg border border-border bg-surface p-8 text-center text-sm text-text-secondary">
        Cliente não encontrado.
        <div className="mt-4">
          <Link href="/customers" className="text-primary hover:text-primary-hover">Voltar pra lista</Link>
        </div>
      </div>
    )
  }

  const totalSpent = customer.orders
    .filter(o => ['PAID', 'PREPARING', 'SHIPPED', 'DELIVERED'].includes(o.status))
    .reduce((sum, o) => sum + o.total, 0)

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-2 text-sm text-text-secondary">
        <Link href="/customers" className="inline-flex items-center gap-1 hover:text-primary">
          <ChevronLeft className="h-4 w-4" /> Clientes
        </Link>
        <span className="text-text-muted">/</span>
        <span className="text-text truncate">{customer.name}</span>
      </div>

      <header className="rounded-lg border border-border bg-surface p-5 shadow-md">
        <div className="flex items-start gap-4">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-pill bg-primary-soft text-primary">
            <User className="h-5 w-5" />
          </span>
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-bold text-text">{customer.name}</h1>
            <p className="text-sm text-text-secondary">{customer.email}</p>
            {customer.phone && <p className="text-sm text-text-secondary font-mono">{customer.phone}</p>}
            {customer.cpf   && <p className="text-xs text-text-muted font-mono">CPF {customer.cpf}</p>}
          </div>
          <div className="text-right">
            <p className="text-xs uppercase tracking-wide text-text-secondary">Total gasto</p>
            <p className="font-mono text-2xl font-bold text-primary">{formatBRL(totalSpent)}</p>
            <p className="text-xs text-text-muted">{customer.orders.length} pedidos · cadastro {formatDate(customer.createdAt)}</p>
          </div>
        </div>
      </header>

      <div className="grid gap-5 lg:grid-cols-3">
        <section className="lg:col-span-2 rounded-lg border border-border bg-surface shadow-md">
          <header className="flex items-center gap-2 border-b border-border px-5 py-3">
            <ShoppingBag className="h-4 w-4 text-primary" />
            <h2 className="text-sm font-bold text-text">Pedidos</h2>
          </header>
          {customer.orders.length === 0 ? (
            <p className="px-5 py-4 text-sm text-text-secondary">Nenhum pedido ainda.</p>
          ) : (
            <ul className="divide-y divide-border">
              {customer.orders.map(o => (
                <li key={o.id}>
                  <Link
                    href={`/orders/${o.id}`}
                    className="flex items-center justify-between gap-3 px-5 py-3 hover:bg-surface-2"
                  >
                    <div>
                      <p className="font-mono text-sm font-semibold text-text">#{o.orderNumber}</p>
                      <p className="text-xs text-text-muted">{formatDateTime(o.createdAt)}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <StatusBadge kind="order" status={o.status} />
                      <span className="font-mono font-semibold text-text">{formatBRL(o.total)}</span>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>

        <aside className="rounded-lg border border-border bg-surface shadow-md">
          <header className="flex items-center gap-2 border-b border-border px-5 py-3">
            <MapPin className="h-4 w-4 text-primary" />
            <h2 className="text-sm font-bold text-text">Endereços</h2>
          </header>
          {customer.addresses.length === 0 ? (
            <p className="px-5 py-4 text-sm text-text-secondary">Sem endereço cadastrado.</p>
          ) : (
            <ul className="divide-y divide-border">
              {customer.addresses.map(a => (
                <li key={a.id} className="px-5 py-3 text-sm space-y-0.5">
                  {a.label && (
                    <span className="inline-flex rounded-pill bg-primary-soft px-2 py-0.5 text-[10px] font-bold uppercase text-primary">
                      {a.label}{a.isDefault && ' · padrão'}
                    </span>
                  )}
                  <p className="font-semibold text-text">{a.recipient}</p>
                  <p className="text-text-secondary">
                    {a.street}, {a.number}{a.complement && ` - ${a.complement}`}
                  </p>
                  <p className="text-text-secondary">{a.district}</p>
                  <p className="text-text-secondary">{a.city} / {a.state}</p>
                  <p className="text-text-muted font-mono text-xs">CEP {a.zipcode}</p>
                </li>
              ))}
            </ul>
          )}
        </aside>
      </div>
    </div>
  )
}
