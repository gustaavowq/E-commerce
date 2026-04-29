'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ArrowLeft, Truck, CheckCircle2, RotateCcw, Save } from 'lucide-react'
import { adminOrders } from '@/services/admin'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { StatusBadge } from '@/components/StatusBadge'
import { formatBRL, formatDateTime } from '@/lib/format'
import { ApiError } from '@/lib/api-error'
import type { OrderStatus } from '@/services/types'

export default function OrderDetailPage({ params }: { params: { id: string } }) {
  const qc = useQueryClient()
  const q = useQuery({
    queryKey: ['admin', 'order', params.id],
    queryFn:  () => adminOrders.get(params.id),
  })
  const order = q.data

  const [tracking, setTracking] = useState('')
  const [error, setError] = useState<string | null>(null)

  const update = useMutation({
    mutationFn: (body: { status?: OrderStatus; trackingCode?: string | null }) =>
      adminOrders.update(params.id, body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'order', params.id] })
      qc.invalidateQueries({ queryKey: ['admin', 'orders'] })
      setError(null)
    },
    onError: (err) => setError(ApiError.is(err) ? err.message : 'Erro'),
  })

  if (q.isLoading) return <p className="text-sm text-ink-3">Carregando pedido…</p>
  if (!order)      return <p className="text-sm text-error">Pedido não encontrado.</p>

  return (
    <div className="space-y-6">
      <Link href="/orders" className="inline-flex items-center gap-1 text-sm text-ink-3 hover:text-ink">
        <ArrowLeft className="h-4 w-4" /> Voltar
      </Link>

      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-ink-3">Pedido</p>
          <h1 className="font-mono text-2xl font-bold text-ink">{order.orderNumber}</h1>
          <p className="text-sm text-ink-3">Criado {formatDateTime(order.createdAt)}</p>
        </div>
        <div className="flex flex-col items-end gap-1">
          <StatusBadge kind="order"   status={order.status} />
          <StatusBadge kind="payment" status={order.payments[0]?.status ?? null} />
        </div>
      </header>

      {error && (
        <div className="rounded-md border border-error/30 bg-error/5 px-3 py-2 text-sm text-error">{error}</div>
      )}

      {/* Ações de status */}
      <section className="rounded-lg border border-border bg-white p-5 shadow-sm">
        <h2 className="text-sm font-bold text-ink">Atualizar pedido</h2>

        {order.status === 'PENDING_PAYMENT' ? (
          <p className="mt-2 text-sm text-ink-3">Aguardando confirmação do pagamento. Após confirmar, o status muda automaticamente.</p>
        ) : (
          <div className="mt-4 flex flex-wrap gap-2">
            {(['PREPARING', 'SHIPPED', 'DELIVERED'] as OrderStatus[]).map(s => (
              <Button
                key={s}
                size="sm"
                variant={order.status === s ? 'primary' : 'secondary'}
                disabled={order.status === s || update.isPending}
                loading={update.isPending && update.variables?.status === s}
                onClick={() => update.mutate({ status: s })}
                leftIcon={
                  s === 'SHIPPED'   ? <Truck className="h-4 w-4" /> :
                  s === 'DELIVERED' ? <CheckCircle2 className="h-4 w-4" /> :
                  <RotateCcw className="h-4 w-4" />
                }
              >
                Marcar como {s === 'PREPARING' ? 'em separação' : s === 'SHIPPED' ? 'enviado' : 'entregue'}
              </Button>
            ))}
          </div>
        )}

        <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:items-end">
          <div className="flex-1">
            <label className="block text-xs font-medium text-ink-2">Código de rastreio</label>
            <Input
              placeholder={order.trackingCode ?? 'Ex: AA123456789BR'}
              value={tracking}
              onChange={e => setTracking(e.target.value)}
              className="mt-1"
            />
          </div>
          <Button
            size="md"
            variant="secondary"
            disabled={!tracking || update.isPending}
            onClick={() => update.mutate({ trackingCode: tracking })}
            leftIcon={<Save className="h-4 w-4" />}
          >
            Salvar
          </Button>
        </div>
        {order.trackingCode && (
          <p className="mt-2 text-xs text-ink-3">Atual: <span className="font-mono">{order.trackingCode}</span></p>
        )}
      </section>

      {/* Cliente + Endereço */}
      <div className="grid gap-4 lg:grid-cols-2">
        <section className="rounded-lg border border-border bg-white p-5 shadow-sm">
          <h2 className="text-sm font-bold text-ink">Cliente</h2>
          <div className="mt-3 space-y-1 text-sm">
            <p className="font-medium text-ink">{order.customer.name}</p>
            <p className="text-ink-2">{order.customer.email}</p>
            {order.customer.phone && <p className="text-ink-2">{order.customer.phone}</p>}
            {order.customer.cpf   && <p className="text-ink-3">CPF: {order.customer.cpf}</p>}
            <p className="pt-2">
              <Link href={`/customers/${order.customer.id}`} className="text-xs text-primary-700 hover:underline">
                Ver perfil completo →
              </Link>
            </p>
          </div>
        </section>

        <section className="rounded-lg border border-border bg-white p-5 shadow-sm">
          <h2 className="text-sm font-bold text-ink">Endereço de entrega</h2>
          <div className="mt-3 text-sm text-ink-2">
            <p className="font-medium text-ink">{order.address.recipient}</p>
            <p>{order.address.street}, {order.address.number}{order.address.complement ? ` — ${order.address.complement}` : ''}</p>
            <p>{order.address.district} · {order.address.city}/{order.address.state}</p>
            <p className="font-mono">{order.address.zipcode}</p>
            {order.address.phone && <p>Tel: {order.address.phone}</p>}
          </div>
        </section>
      </div>

      {/* Itens */}
      <section className="rounded-lg border border-border bg-white shadow-sm">
        <h2 className="border-b border-border px-5 py-3 text-sm font-bold text-ink">Itens ({order.items.length})</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-border">
            <thead className="bg-surface-2 text-left text-[11px] font-semibold uppercase tracking-wider text-ink-3">
              <tr>
                <th className="px-4 py-2">Produto</th>
                <th className="px-4 py-2">Variação</th>
                <th className="px-4 py-2 text-right">Qtd</th>
                <th className="px-4 py-2 text-right">Preço unit</th>
                <th className="px-4 py-2 text-right">Subtotal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {order.items.map(it => (
                <tr key={it.id}>
                  <td className="table-cell-base font-medium text-ink">{it.productName}</td>
                  <td className="table-cell-base text-ink-2">{it.variationLabel}</td>
                  <td className="table-cell-base text-right font-mono">{it.quantity}</td>
                  <td className="table-cell-base text-right font-mono text-ink-2">{formatBRL(it.unitPrice)}</td>
                  <td className="table-cell-base text-right font-mono font-semibold text-ink">{formatBRL(it.subtotal)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-surface-2/50 text-sm">
              <tr><td colSpan={4} className="px-4 py-2 text-right text-ink-3">Subtotal</td><td className="px-4 py-2 text-right font-mono">{formatBRL(order.subtotal)}</td></tr>
              <tr><td colSpan={4} className="px-4 py-2 text-right text-ink-3">Frete</td><td className="px-4 py-2 text-right font-mono">{formatBRL(order.shippingCost)}</td></tr>
              {order.discount > 0 && (
                <tr><td colSpan={4} className="px-4 py-2 text-right text-success">Desconto</td><td className="px-4 py-2 text-right font-mono text-success">− {formatBRL(order.discount)}</td></tr>
              )}
              <tr className="bg-primary-50 text-base"><td colSpan={4} className="px-4 py-3 text-right font-bold text-ink">Total</td><td className="px-4 py-3 text-right font-mono font-bold text-ink">{formatBRL(order.total)}</td></tr>
            </tfoot>
          </table>
        </div>
      </section>

      {/* Pagamentos */}
      <section className="rounded-lg border border-border bg-white p-5 shadow-sm">
        <h2 className="text-sm font-bold text-ink">Pagamentos</h2>
        <ul className="mt-3 space-y-3">
          {order.payments.map(p => (
            <li key={p.id} className="rounded-md bg-surface-2 p-3 text-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-ink">{p.method} · {formatBRL(p.amount)}</p>
                  <p className="text-xs text-ink-3">Criado {formatDateTime(p.createdAt)}</p>
                  {p.gatewayId && <p className="font-mono text-[11px] text-ink-4">Gateway ID: {p.gatewayId}</p>}
                </div>
                <StatusBadge kind="payment" status={p.status} />
              </div>
              {p.approvedAt && <p className="mt-2 text-xs text-success">Aprovado {formatDateTime(p.approvedAt)}</p>}
              {p.rejectedAt && <p className="mt-2 text-xs text-error">Rejeitado {formatDateTime(p.rejectedAt)}</p>}
            </li>
          ))}
        </ul>
      </section>

      {order.notes && (
        <section className="rounded-lg border border-warning/30 bg-warning/5 p-5 text-sm text-ink-2">
          <p className="font-semibold text-ink">Observação do cliente</p>
          <p className="mt-1 whitespace-pre-line">{order.notes}</p>
        </section>
      )}
    </div>
  )
}
