'use client'

import Link from 'next/link'
import { useQuery } from '@tanstack/react-query'
import { ArrowLeft, Mail, Phone, MapPin } from 'lucide-react'
import { adminCustomers } from '@/services/admin'
import { StatusBadge } from '@/components/StatusBadge'
import { formatBRL, formatDateTime, relativeTime } from '@/lib/format'

export default function CustomerDetailPage({ params }: { params: { id: string } }) {
  const q = useQuery({ queryKey: ['admin', 'customer', params.id], queryFn: () => adminCustomers.get(params.id) })

  if (q.isLoading) return <p className="text-sm text-ink-3">Carregando…</p>
  if (!q.data)     return <p className="text-sm text-error">Cliente não encontrado.</p>

  const c = q.data
  const totalSpent = c.orders
    .filter(o => o.paymentStatus === 'APPROVED' || o.status === 'PAID' || o.status === 'PREPARING' || o.status === 'SHIPPED' || o.status === 'DELIVERED')
    .reduce((acc, o) => acc + o.total, 0)

  return (
    <div className="space-y-6">
      <Link href="/customers" className="inline-flex items-center gap-1 text-sm text-ink-3 hover:text-ink">
        <ArrowLeft className="h-4 w-4" /> Voltar
      </Link>

      <header className="rounded-lg border border-border bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-ink">{c.name}</h1>
            <div className="mt-2 flex flex-wrap gap-3 text-sm text-ink-2">
              <span className="inline-flex items-center gap-1"><Mail className="h-4 w-4 text-ink-3" /> {c.email}</span>
              {c.phone && <span className="inline-flex items-center gap-1"><Phone className="h-4 w-4 text-ink-3" /> {c.phone}</span>}
              {c.cpf && <span className="text-ink-3">CPF: {c.cpf}</span>}
            </div>
            <p className="mt-1 text-xs text-ink-4">Cliente desde {relativeTime(c.createdAt)}</p>
          </div>
          <div className="text-right">
            <p className="text-xs uppercase tracking-wider text-ink-3">Total comprado</p>
            <p className="font-mono text-2xl font-bold text-ink">{formatBRL(totalSpent)}</p>
            <p className="text-xs text-ink-3">{c.orders.length} pedidos</p>
          </div>
        </div>
      </header>

      {/* Endereços */}
      {c.addresses.length > 0 && (
        <section className="rounded-lg border border-border bg-white p-5 shadow-sm">
          <h2 className="mb-3 text-sm font-bold text-ink flex items-center gap-2"><MapPin className="h-4 w-4 text-primary-700" /> Endereços ({c.addresses.length})</h2>
          <ul className="grid gap-3 sm:grid-cols-2">
            {c.addresses.map(a => (
              <li key={a.id} className="rounded-md border border-border bg-surface-alt p-3 text-sm">
                <p className="font-semibold text-ink">{a.label ?? 'Endereço'} {a.isDefault && <span className="ml-2 rounded-sm bg-primary-700 px-1.5 py-0.5 text-[9px] font-bold uppercase text-white">Padrão</span>}</p>
                <p className="text-ink-2">{a.recipient}</p>
                <p className="text-ink-3">{a.street}, {a.number}{a.complement ? ` — ${a.complement}` : ''}</p>
                <p className="text-ink-3">{a.district} · {a.city}/{a.state} · {a.zipcode}</p>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Pedidos */}
      <section className="rounded-lg border border-border bg-white shadow-sm">
        <h2 className="border-b border-border px-5 py-3 text-sm font-bold text-ink">Pedidos ({c.orders.length})</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-border">
            <thead className="bg-surface-2 text-left text-[11px] font-semibold uppercase tracking-wider text-ink-3">
              <tr>
                <th className="px-4 py-2">Pedido</th>
                <th className="px-4 py-2">Status</th>
                <th className="px-4 py-2">Pagamento</th>
                <th className="px-4 py-2 text-right">Total</th>
                <th className="px-4 py-2">Data</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {c.orders.length === 0 ? (
                <tr><td colSpan={5} className="table-cell-base text-center text-ink-3">Nenhum pedido.</td></tr>
              ) : c.orders.map(o => (
                <tr key={o.id} className="hover:bg-surface-2/50">
                  <td className="table-cell-base">
                    <Link href={`/orders/${o.id}`} className="font-mono font-semibold text-primary-700 hover:underline">
                      {o.orderNumber}
                    </Link>
                  </td>
                  <td className="table-cell-base"><StatusBadge kind="order"   status={o.status} /></td>
                  <td className="table-cell-base"><StatusBadge kind="payment" status={o.paymentStatus} /></td>
                  <td className="table-cell-base text-right font-mono font-semibold">{formatBRL(o.total)}</td>
                  <td className="table-cell-base text-xs text-ink-3">{formatDateTime(o.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}
