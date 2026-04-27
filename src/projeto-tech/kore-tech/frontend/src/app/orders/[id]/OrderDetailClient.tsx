'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { ArrowLeft, Package, Copy, Check, QrCode, MapPin, Receipt, Clock } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Skeleton } from '@/components/ui/Skeleton'
import { useToast } from '@/components/ui/Toast'
import { getOrder } from '@/services/orders'
import { useAuth } from '@/stores/auth'
import { formatBRL, formatDateLongBR } from '@/lib/format'
import type { OrderStatus, PaymentStatus } from '@/services/types'

const ORDER_STATUS_LABEL: Record<OrderStatus, string> = {
  PENDING_PAYMENT: 'Aguardando pagamento',
  PAID: 'Pagamento confirmado',
  PREPARING: 'Em preparacao',
  SHIPPED: 'Enviado',
  DELIVERED: 'Entregue',
  CANCELLED: 'Cancelado',
  REFUNDED: 'Reembolsado',
}

const PAYMENT_STATUS_LABEL: Record<PaymentStatus, string> = {
  PENDING: 'Pendente',
  APPROVED: 'Aprovado',
  REJECTED: 'Rejeitado',
  REFUNDED: 'Reembolsado',
  CANCELLED: 'Cancelado',
  EXPIRED: 'Expirado',
}

export function OrderDetailClient({ id }: { id: string }) {
  const router = useRouter()
  const toast = useToast()
  const user = useAuth((s) => s.user)
  const hydrated = useAuth((s) => s.hydrated)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (hydrated && !user) router.replace(`/auth/login?redirect=${encodeURIComponent(`/orders/${id}`)}`)
  }, [hydrated, user, router, id])

  const {
    data: order,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['order', id],
    queryFn: () => getOrder(id),
    enabled: !!user,
    refetchInterval: (q) => {
      const data = q.state.data
      // Repolling enquanto pagamento Pix nao confirma
      if (data?.payment?.method === 'PIX' && data?.payment?.status === 'PENDING') return 10_000
      return false
    },
  })

  function copyPix(text: string) {
    if (!navigator.clipboard) return
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true)
      toast.push({ variant: 'success', message: 'Codigo Pix copiado.' })
      setTimeout(() => setCopied(false), 2000)
    })
  }

  if (isLoading) {
    return (
      <main className="container-app py-8 sm:py-12">
        <Skeleton className="h-8 w-1/3" />
        <Skeleton className="mt-3 h-64 w-full" />
      </main>
    )
  }

  if (isError || !order) {
    return (
      <main className="container-app py-12">
        <div className="rounded-lg border border-danger/40 bg-danger/5 p-6 text-sm text-danger">
          Nao foi possivel carregar este pedido.
        </div>
        <Link href="/orders" className="mt-4 inline-flex items-center gap-1 text-sm text-primary hover:underline">
          <ArrowLeft className="h-4 w-4" /> Voltar pra meus pedidos
        </Link>
      </main>
    )
  }

  const isPixPending = order.payment?.method === 'PIX' && order.payment.status === 'PENDING'

  return (
    <main className="container-app py-8 sm:py-12">
      <Link href="/orders" className="inline-flex items-center gap-1 text-xs text-text-secondary hover:text-primary">
        <ArrowLeft className="h-3.5 w-3.5" /> Meus pedidos
      </Link>

      <header className="mt-3 flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="font-specs text-xs font-bold uppercase tracking-widest text-primary">Pedido</p>
          <h1 className="mt-1 font-display text-2xl font-bold text-text sm:text-3xl">
            #{order.orderNumber}
          </h1>
          <p className="mt-1 text-xs text-text-muted">
            <Clock className="mr-1 inline h-3 w-3" /> Criado em {formatDateLongBR(order.createdAt)}
          </p>
        </div>
        <span className="rounded-pill border border-primary/40 bg-primary-soft px-3 py-1 text-xs font-semibold text-primary">
          {ORDER_STATUS_LABEL[order.status]}
        </span>
      </header>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="space-y-6">
          {isPixPending && order.payment?.pixCopyPaste && (
            <section className="rounded-lg border border-primary/40 bg-primary-soft p-5">
              <div className="flex items-center gap-2">
                <QrCode className="h-5 w-5 text-primary" />
                <h2 className="text-sm font-bold uppercase tracking-wide text-primary">Pague com Pix</h2>
              </div>
              <p className="mt-2 text-sm text-text-secondary">
                Confirma em ate 1 minuto. Voce nao precisa fazer mais nada.
              </p>

              {order.payment.pixQrCode && (
                <div className="mt-4 flex flex-col items-center gap-3 sm:flex-row sm:items-start">
                  <div className="flex items-center justify-center rounded-lg border border-border bg-bg p-4">
                    <img
                      src={
                        order.payment.pixQrCode.startsWith('data:')
                          ? order.payment.pixQrCode
                          : `data:image/png;base64,${order.payment.pixQrCode}`
                      }
                      alt="QR Code Pix"
                      className="h-48 w-48"
                    />
                  </div>
                  <div className="flex-1 text-sm">
                    <p className="font-semibold text-text">Ou cole o codigo no seu banco:</p>
                    <textarea
                      readOnly
                      rows={3}
                      value={order.payment.pixCopyPaste}
                      className="mt-2 w-full break-all rounded-md border border-border bg-bg px-3 py-2 font-mono text-xs text-text"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => copyPix(order.payment!.pixCopyPaste!)}
                      className="mt-3 w-full"
                    >
                      {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                      {copied ? 'Codigo copiado' : 'Copiar codigo Pix'}
                    </Button>
                    {order.payment.pixExpiresAt && (
                      <p className="mt-2 text-xs text-text-muted">
                        Expira em {formatDateLongBR(order.payment.pixExpiresAt)}.
                      </p>
                    )}
                  </div>
                </div>
              )}
            </section>
          )}

          <section className="rounded-lg border border-border bg-surface p-5">
            <header className="mb-3 flex items-center gap-2">
              <Package className="h-4 w-4 text-primary" />
              <h2 className="text-sm font-bold uppercase tracking-wide text-text">Itens ({order.items.length})</h2>
            </header>
            <ul className="space-y-3">
              {order.items.map((it) => (
                <li
                  key={it.id}
                  className="flex items-start justify-between gap-3 border-b border-border pb-3 last:border-0 last:pb-0"
                >
                  <div className="text-sm">
                    <p className="font-semibold text-text">{it.productName}</p>
                    {it.variationLabel && it.variationLabel !== 'Padrao' && (
                      <p className="text-xs text-text-secondary">Versao: {it.variationLabel}</p>
                    )}
                    <p className="mt-1 font-specs text-xs text-text-muted">
                      {it.quantity}x {formatBRL(it.unitPrice)}
                    </p>
                  </div>
                  <span className="font-specs text-sm font-bold text-text">{formatBRL(it.subtotal)}</span>
                </li>
              ))}
            </ul>
          </section>

          <section className="rounded-lg border border-border bg-surface p-5">
            <header className="mb-3 flex items-center gap-2">
              <MapPin className="h-4 w-4 text-primary" />
              <h2 className="text-sm font-bold uppercase tracking-wide text-text">Entrega</h2>
            </header>
            <p className="text-sm text-text">{order.address.recipient}</p>
            <p className="text-sm text-text-secondary">
              {order.address.street}, {order.address.number}
              {order.address.complement ? ` ${order.address.complement}` : ''}
            </p>
            <p className="text-sm text-text-secondary">
              {order.address.district} · {order.address.city}/{order.address.state}
            </p>
            <p className="text-xs text-text-muted">CEP {order.address.zipcode}</p>
            {order.notes && (
              <div className="mt-3 rounded-md border border-border bg-bg/40 p-3">
                <p className="text-xs font-semibold uppercase text-text-secondary">Observacao</p>
                <p className="mt-1 text-sm text-text">{order.notes}</p>
              </div>
            )}
          </section>
        </div>

        <aside className="lg:sticky lg:top-20 lg:self-start">
          <div className="rounded-lg border border-border bg-surface p-5">
            <header className="mb-3 flex items-center gap-2">
              <Receipt className="h-4 w-4 text-primary" />
              <h2 className="text-sm font-bold uppercase tracking-wide text-text">Resumo</h2>
            </header>
            <div className="space-y-1.5 text-sm text-text-secondary">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-specs text-text">{formatBRL(order.subtotal)}</span>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between text-success">
                  <span>{order.coupon?.code ?? 'Desconto'}</span>
                  <span className="font-specs">-{formatBRL(order.discount)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Frete</span>
                <span className="font-specs text-text">
                  {order.shippingCost === 0 ? 'Gratis' : formatBRL(order.shippingCost)}
                </span>
              </div>
              <div className="my-2 border-t border-border" />
              <div className="flex justify-between text-base">
                <span className="font-semibold text-text">Total</span>
                <span className="font-specs text-lg font-bold text-text">{formatBRL(order.total)}</span>
              </div>
            </div>

            {order.payment && (
              <div className="mt-4 rounded-md border border-border bg-bg/40 p-3 text-xs">
                <p className="font-semibold uppercase tracking-wide text-text-secondary">Pagamento</p>
                <p className="mt-1 text-text">
                  {order.payment.method === 'PIX'
                    ? 'Pix'
                    : order.payment.method === 'CREDIT_CARD'
                      ? 'Cartao de credito'
                      : 'Boleto'}
                </p>
                <p className="text-text-muted">{PAYMENT_STATUS_LABEL[order.payment.status]}</p>
              </div>
            )}
          </div>

          <Link href="/contato" className="mt-3 block text-center text-xs text-text-secondary hover:text-primary">
            Precisa de ajuda com este pedido?
          </Link>
        </aside>
      </div>
    </main>
  )
}
