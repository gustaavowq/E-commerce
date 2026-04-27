// =============================================================================
// Kore Tech — Painel admin > Detalhe do pedido
//
// Mostra cliente, endereço, itens, pagamentos, timeline. Ações:
//   - Marcar como pago (manual)
//   - Adicionar código de rastreio + marcar como enviado
//   - Cancelar (com motivo)
//   - Reembolsar (com valor + motivo)
// =============================================================================

'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import Image from 'next/image'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  ChevronLeft, Truck, CheckCircle2, XCircle, Receipt,
  User, MapPin, Package, CreditCard, Tag, Clock,
} from 'lucide-react'
import { adminOrders } from '@/services/admin'
import type { OrderStatus } from '@/services/types'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { Select } from '@/components/ui/Select'
import { Label } from '@/components/ui/Label'
import { Skeleton } from '@/components/Skeleton'
import { StatusBadge } from '@/components/StatusBadge'
import { ConfirmDialog } from '@/components/ConfirmDialog'
import { useToast } from '@/components/Toast'
import { formatBRL, formatDateTime } from '@/lib/format'

const STATUS_OPTIONS: Array<{ value: OrderStatus; label: string }> = [
  { value: 'PENDING_PAYMENT', label: 'Aguardando pagamento' },
  { value: 'PAID',            label: 'Pago' },
  { value: 'PREPARING',       label: 'Em separação' },
  { value: 'SHIPPED',         label: 'Enviado' },
  { value: 'DELIVERED',       label: 'Entregue' },
  { value: 'CANCELLED',       label: 'Cancelado' },
  { value: 'REFUNDED',        label: 'Reembolsado' },
]

export default function OrderDetailPage() {
  const params = useParams<{ id: string }>()
  const qc     = useQueryClient()
  const toast  = useToast()

  const [trackingInput, setTrackingInput] = useState('')
  const [statusInput,   setStatusInput]   = useState<OrderStatus | ''>('')
  const [notes,         setNotes]         = useState('')
  const [cancelReason,  setCancelReason]  = useState('')
  const [confirmCancel, setConfirmCancel] = useState(false)

  const orderQ = useQuery({
    queryKey: ['admin', 'orders', 'detail', params.id],
    queryFn:  () => adminOrders.get(params.id),
  })

  const updateStatus = useMutation({
    mutationFn: (next: OrderStatus) => adminOrders.update(params.id, { status: next }),
    onSuccess: () => {
      toast.push({ tone: 'success', title: 'Status atualizado' })
      qc.invalidateQueries({ queryKey: ['admin', 'orders'] })
    },
    onError: (err: unknown) => {
      toast.push({ tone: 'error', title: 'Não foi possível atualizar', body: err instanceof Error ? err.message : '' })
    },
  })

  const markShipped = useMutation({
    mutationFn: () => adminOrders.markShipped(params.id, trackingInput),
    onSuccess: () => {
      toast.push({ tone: 'success', title: 'Pedido marcado como enviado' })
      qc.invalidateQueries({ queryKey: ['admin', 'orders'] })
      setTrackingInput('')
    },
    onError: (err: unknown) => {
      toast.push({ tone: 'error', title: 'Falha ao registrar envio', body: err instanceof Error ? err.message : '' })
    },
  })

  const markPaid = useMutation({
    mutationFn: () => adminOrders.markPaid(params.id),
    onSuccess: () => {
      toast.push({ tone: 'success', title: 'Pedido marcado como pago' })
      qc.invalidateQueries({ queryKey: ['admin', 'orders'] })
    },
    onError: (err: unknown) => {
      toast.push({ tone: 'error', title: 'Não consegui marcar como pago', body: err instanceof Error ? err.message : '' })
    },
  })

  const cancel = useMutation({
    mutationFn: () => adminOrders.cancel(params.id, cancelReason || 'Cancelado pelo admin'),
    onSuccess: () => {
      toast.push({ tone: 'success', title: 'Pedido cancelado' })
      qc.invalidateQueries({ queryKey: ['admin', 'orders'] })
      setConfirmCancel(false)
      setCancelReason('')
    },
    onError: (err: unknown) => {
      toast.push({ tone: 'error', title: 'Não foi possível cancelar', body: err instanceof Error ? err.message : '' })
    },
  })

  const updateNotes = useMutation({
    mutationFn: () => adminOrders.update(params.id, { notes }),
    onSuccess: () => {
      toast.push({ tone: 'success', title: 'Notas salvas' })
      qc.invalidateQueries({ queryKey: ['admin', 'orders'] })
    },
  })

  const order = orderQ.data

  if (orderQ.isLoading) {
    return (
      <div className="space-y-5">
        <Skeleton className="h-6 w-40" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-72 w-full" />
      </div>
    )
  }

  if (!order) {
    return (
      <div className="rounded-lg border border-border bg-surface p-8 text-center text-sm text-text-secondary">
        Pedido não encontrado.
        <div className="mt-4">
          <Link href="/orders" className="text-primary hover:text-primary-hover">Voltar pra lista</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-2 text-sm text-text-secondary">
        <Link href="/orders" className="inline-flex items-center gap-1 hover:text-primary">
          <ChevronLeft className="h-4 w-4" /> Pedidos
        </Link>
        <span className="text-text-muted">/</span>
        <span className="text-text font-mono">#{order.orderNumber}</span>
      </div>

      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-text font-mono">#{order.orderNumber}</h1>
          <p className="text-sm text-text-secondary">
            Aberto em {formatDateTime(order.createdAt)}.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <StatusBadge kind="order" status={order.status} />
        </div>
      </header>

      {/* Ações rápidas */}
      <section className="rounded-lg border border-border bg-surface p-4 shadow-md space-y-3">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-text-secondary">Ações</h2>
        <div className="flex flex-wrap items-end gap-3">
          <div className="min-w-[200px]">
            <Label htmlFor="status">Mudar status</Label>
            <Select
              id="status"
              value={statusInput || order.status}
              onChange={e => setStatusInput(e.target.value as OrderStatus)}
            >
              {STATUS_OPTIONS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
            </Select>
          </div>
          <Button
            variant="primary"
            disabled={!statusInput || statusInput === order.status}
            loading={updateStatus.isPending}
            onClick={() => statusInput && updateStatus.mutate(statusInput)}
          >
            Atualizar status
          </Button>

          {order.status === 'PENDING_PAYMENT' && (
            <Button
              variant="secondary"
              leftIcon={<CheckCircle2 className="h-4 w-4" />}
              loading={markPaid.isPending}
              onClick={() => markPaid.mutate()}
            >
              Marcar como pago
            </Button>
          )}

          {(order.status === 'PAID' || order.status === 'PREPARING') && (
            <Button
              variant="danger"
              leftIcon={<XCircle className="h-4 w-4" />}
              onClick={() => setConfirmCancel(true)}
            >
              Cancelar pedido
            </Button>
          )}
        </div>

        {(order.status === 'PAID' || order.status === 'PREPARING') && (
          <div className="flex items-end gap-3 border-t border-border pt-3">
            <div className="flex-1 max-w-md">
              <Label htmlFor="tracking">Código de rastreio</Label>
              <Input
                id="tracking"
                value={trackingInput || order.trackingCode || ''}
                onChange={e => setTrackingInput(e.target.value)}
                placeholder="ex: BR1234567890BR"
                mono
              />
            </div>
            <Button
              variant="primary"
              leftIcon={<Truck className="h-4 w-4" />}
              disabled={!trackingInput}
              loading={markShipped.isPending}
              onClick={() => markShipped.mutate()}
            >
              Marcar como enviado
            </Button>
          </div>
        )}
      </section>

      <div className="grid gap-5 lg:grid-cols-3">
        {/* Itens + totais */}
        <section className="lg:col-span-2 space-y-4">
          <div className="rounded-lg border border-border bg-surface shadow-md">
            <header className="flex items-center gap-2 border-b border-border px-5 py-3">
              <Package className="h-4 w-4 text-primary" />
              <h2 className="text-sm font-bold text-text">Itens do pedido</h2>
            </header>
            <ul className="divide-y divide-border">
              {order.items.map(item => (
                <li key={item.id} className="flex items-center gap-4 px-5 py-3">
                  <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-md bg-surface-2 ring-1 ring-border">
                    {item.image
                      ? <Image src={item.image} alt={item.productName} fill unoptimized className="object-cover" sizes="48px" />
                      : <Package className="absolute inset-0 m-auto h-4 w-4 text-text-muted" />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-text">{item.productName}</p>
                    {item.variationLabel && (
                      <p className="truncate text-xs text-text-secondary">{item.variationLabel}</p>
                    )}
                    <p className="mt-0.5 text-xs text-text-muted font-mono">
                      {item.quantity} × {formatBRL(item.unitPrice)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-mono text-sm font-semibold text-text">{formatBRL(item.subtotal)}</p>
                  </div>
                </li>
              ))}
            </ul>
            <footer className="border-t border-border px-5 py-3 space-y-1 text-sm">
              <Row label="Subtotal" value={formatBRL(order.subtotal)} />
              <Row label="Frete"    value={formatBRL(order.shippingCost)} />
              {order.discount > 0 && (
                <Row label={
                  <span className="inline-flex items-center gap-1.5">
                    <Tag className="h-3.5 w-3.5 text-success" /> Desconto
                    {order.coupon && <code className="font-mono text-xs text-text-muted">{order.coupon.code}</code>}
                  </span>
                } value={`- ${formatBRL(order.discount)}`} valueClass="text-success" />
              )}
              <Row label="Total" value={formatBRL(order.total)} valueClass="text-base text-text" bold />
            </footer>
          </div>

          {/* Pagamentos */}
          <div className="rounded-lg border border-border bg-surface shadow-md">
            <header className="flex items-center gap-2 border-b border-border px-5 py-3">
              <CreditCard className="h-4 w-4 text-primary" />
              <h2 className="text-sm font-bold text-text">Pagamentos</h2>
            </header>
            {order.payments.length === 0 ? (
              <p className="px-5 py-4 text-sm text-text-secondary">Nenhuma transação ainda.</p>
            ) : (
              <ul className="divide-y divide-border">
                {order.payments.map(p => (
                  <li key={p.id} className="flex items-center justify-between gap-3 px-5 py-3 text-sm">
                    <div>
                      <p className="font-semibold text-text">{p.method}</p>
                      <p className="text-xs text-text-muted font-mono">
                        {p.gatewayId ?? 'sem ID'} · {formatDateTime(p.createdAt)}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <StatusBadge kind="payment" status={p.status} />
                      <span className="font-mono font-semibold text-text">{formatBRL(p.amount)}</span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Notas */}
          <div className="rounded-lg border border-border bg-surface shadow-md p-5 space-y-2">
            <Label htmlFor="notes">Notas internas</Label>
            <Textarea
              id="notes"
              rows={3}
              value={notes || order.notes || ''}
              onChange={e => setNotes(e.target.value)}
              placeholder="Anotações pra equipe — não aparecem pro cliente."
            />
            <div className="flex justify-end">
              <Button size="sm" variant="secondary" loading={updateNotes.isPending} onClick={() => updateNotes.mutate()}>
                Salvar notas
              </Button>
            </div>
          </div>
        </section>

        {/* Cliente + endereço + timeline */}
        <aside className="space-y-4">
          <div className="rounded-lg border border-border bg-surface shadow-md">
            <header className="flex items-center gap-2 border-b border-border px-5 py-3">
              <User className="h-4 w-4 text-primary" />
              <h2 className="text-sm font-bold text-text">Cliente</h2>
            </header>
            <div className="px-5 py-3 space-y-1 text-sm">
              <Link href={`/customers/${order.customer.id}`} className="font-semibold text-text hover:text-primary">
                {order.customer.name}
              </Link>
              <p className="text-text-secondary">{order.customer.email}</p>
              {order.customer.phone && <p className="text-text-secondary font-mono">{order.customer.phone}</p>}
              {order.customer.cpf   && <p className="text-text-muted font-mono text-xs">CPF {order.customer.cpf}</p>}
            </div>
          </div>

          {order.address && (
            <div className="rounded-lg border border-border bg-surface shadow-md">
              <header className="flex items-center gap-2 border-b border-border px-5 py-3">
                <MapPin className="h-4 w-4 text-primary" />
                <h2 className="text-sm font-bold text-text">Endereço de entrega</h2>
              </header>
              <div className="px-5 py-3 space-y-0.5 text-sm">
                <p className="font-semibold text-text">{order.address.recipient}</p>
                <p className="text-text-secondary">
                  {order.address.street}, {order.address.number}
                  {order.address.complement && ` - ${order.address.complement}`}
                </p>
                <p className="text-text-secondary">{order.address.district}</p>
                <p className="text-text-secondary">{order.address.city} / {order.address.state}</p>
                <p className="text-text-muted font-mono text-xs">CEP {order.address.zipcode}</p>
                {order.address.phone && <p className="text-text-muted font-mono text-xs">{order.address.phone}</p>}
              </div>
            </div>
          )}

          {order.timeline && order.timeline.length > 0 && (
            <div className="rounded-lg border border-border bg-surface shadow-md">
              <header className="flex items-center gap-2 border-b border-border px-5 py-3">
                <Clock className="h-4 w-4 text-primary" />
                <h2 className="text-sm font-bold text-text">Linha do tempo</h2>
              </header>
              <ul className="divide-y divide-border">
                {order.timeline.map((ev, i) => (
                  <li key={i} className="px-5 py-3 text-sm">
                    <p className="text-text">{ev.label}</p>
                    <p className="mt-0.5 text-xs text-text-muted">
                      {formatDateTime(ev.at)}{ev.by && ` · ${ev.by}`}
                    </p>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {!order.timeline && (
            <div className="rounded-lg border border-border bg-surface shadow-md px-5 py-4 text-sm">
              <h2 className="text-xs font-semibold uppercase tracking-wide text-text-secondary mb-2 inline-flex items-center gap-2">
                <Receipt className="h-3.5 w-3.5" /> Marcos do pedido
              </h2>
              <ul className="space-y-1 text-xs text-text-secondary">
                <li>Criado em {formatDateTime(order.createdAt)}</li>
                {order.shippedAt   && <li>Enviado em {formatDateTime(order.shippedAt)}</li>}
                {order.deliveredAt && <li>Entregue em {formatDateTime(order.deliveredAt)}</li>}
                {order.cancelledAt && <li className="text-danger">Cancelado em {formatDateTime(order.cancelledAt)}</li>}
              </ul>
            </div>
          )}
        </aside>
      </div>

      {/* Cancelar — modal com motivo */}
      <ConfirmDialog
        open={confirmCancel}
        title={`Cancelar pedido #${order.orderNumber}?`}
        description="O pedido será marcado como cancelado. Se já foi pago, dispare reembolso pelo MercadoPago manualmente."
        destructive
        confirmLabel="Cancelar pedido"
        loading={cancel.isPending}
        onConfirm={() => cancel.mutate()}
        onClose={() => setConfirmCancel(false)}
      />
    </div>
  )
}

function Row({ label, value, valueClass, bold }: { label: React.ReactNode; value: React.ReactNode; valueClass?: string; bold?: boolean }) {
  return (
    <div className={'flex items-center justify-between ' + (bold ? 'font-bold pt-2 border-t border-border mt-2' : '')}>
      <span className="text-text-secondary">{label}</span>
      <span className={'font-mono ' + (valueClass ?? 'text-text')}>{value}</span>
    </div>
  )
}
