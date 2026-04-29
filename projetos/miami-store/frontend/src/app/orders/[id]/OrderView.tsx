'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Copy, Check, Clock, CheckCircle2, XCircle, Loader2, MessageCircle, Truck, ShieldCheck, Package } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { useAuth } from '@/stores/auth'
import { getOrder, cancelOrder } from '@/services/orders'
import { formatBRL, formatDateBR } from '@/lib/format'
import { ApiError } from '@/lib/api-error'
import type { Order, OrderStatus, PaymentStatus } from '@/services/types'

const POLL_MS = 8000

export function OrderView({ id }: { id: string }) {
  const router = useRouter()
  const user   = useAuth(s => s.user)
  const hyd    = useAuth(s => s.hydrated)

  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [cancelling, setCancelling] = useState(false)

  useEffect(() => {
    if (hyd && !user) router.replace(`/auth/login?next=/orders/${id}`)
  }, [hyd, user, router, id])

  useEffect(() => {
    if (!user) return
    let cancelled = false
    let timer: ReturnType<typeof setTimeout> | null = null

    const tick = async () => {
      try {
        const data = await getOrder(id)
        if (cancelled) return
        setOrder(data)
        setError(null)
        // Polling enquanto pagamento pendente
        if (data.payment?.status === 'PENDING' && data.status === 'PENDING_PAYMENT') {
          timer = setTimeout(tick, POLL_MS)
        }
      } catch (err) {
        if (cancelled) return
        setError(ApiError.is(err) ? err.message : 'Erro ao carregar pedido')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    tick()
    return () => { cancelled = true; if (timer) clearTimeout(timer) }
  }, [id, user])

  async function copyPix() {
    if (!order?.payment?.pixCopyPaste) return
    await navigator.clipboard.writeText(order.payment.pixCopyPaste)
    setCopied(true)
    setTimeout(() => setCopied(false), 2200)
  }

  async function onCancel() {
    if (!confirm('Cancelar este pedido? O estoque volta pra loja.')) return
    setCancelling(true)
    try {
      const updated = await cancelOrder(id)
      setOrder(updated)
    } catch (err) {
      setError(ApiError.is(err) ? err.message : 'Erro ao cancelar')
    } finally {
      setCancelling(false)
    }
  }

  if (!hyd || loading) {
    return <div className="py-12 text-center text-ink-3">Carregando pedido…</div>
  }
  if (!user) return null
  if (error || !order) {
    return (
      <div className="rounded-lg border border-border bg-white p-8 text-center">
        <p className="text-ink-2">{error ?? 'Pedido não encontrado'}</p>
        <Link href="/" className="mt-4 inline-block text-primary-700 hover:underline">Voltar pra loja</Link>
      </div>
    )
  }

  const isPending = order.status === 'PENDING_PAYMENT' && order.payment?.status === 'PENDING'
  const isFailed = order.status === 'CANCELLED' || order.payment?.status === 'REJECTED' || order.payment?.status === 'EXPIRED'

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
      <div className="space-y-4">
        <header>
          <p className="text-xs uppercase tracking-wider text-ink-3">Pedido</p>
          <h1 className="font-display text-2xl text-ink sm:text-3xl">{order.orderNumber}</h1>
          <p className="mt-1 text-sm text-ink-3">Feito em {formatDateBR(order.createdAt)}</p>
        </header>

        <StatusBanner status={order.status} paymentStatus={order.payment?.status ?? null} />

        {/* Pix */}
        {isPending && order.payment?.pixQrCode && (
          <section className="rounded-lg border border-primary-700 bg-primary-50 p-4 sm:p-6">
            <h2 className="font-display text-xl text-ink">Paga via Pix</h2>
            <p className="mt-1 text-sm text-ink-2">Abre o app do seu banco, escolhe Pix → Pagar com QR Code, e aponta a câmera. Ou copia e cola o código abaixo.</p>

            <div className="mt-4 flex flex-col items-center gap-4 sm:flex-row sm:items-start">
              <div className="rounded-lg border border-border bg-white p-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={order.payment.pixQrCode.startsWith('data:') ? order.payment.pixQrCode : `data:image/png;base64,${order.payment.pixQrCode}`}
                  alt="QR Code Pix"
                  className="h-48 w-48 object-contain"
                />
              </div>
              <div className="flex-1 space-y-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-ink-3">Valor</p>
                  <p className="font-display text-2xl text-ink">{formatBRL(order.payment.amount)}</p>
                </div>
                {order.payment.pixCopyPaste && (
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-ink-3">Pix Copia e Cola</p>
                    <div className="mt-1 break-all rounded-md border border-border bg-white px-3 py-2 text-xs font-mono text-ink-2">
                      {order.payment.pixCopyPaste}
                    </div>
                    <Button size="sm" variant="secondary" onClick={copyPix} className="mt-2" leftIcon={copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}>
                      {copied ? 'Copiado' : 'Copiar código'}
                    </Button>
                  </div>
                )}
                {order.payment.pixExpiresAt && (
                  <p className="inline-flex items-center gap-1 text-xs text-ink-3">
                    <Clock className="h-3 w-3" /> Expira em {formatDateBR(order.payment.pixExpiresAt)} ({new Date(order.payment.pixExpiresAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })})
                  </p>
                )}
              </div>
            </div>

            <p className="mt-4 inline-flex items-center gap-1 text-xs text-ink-3">
              <Loader2 className="h-3 w-3 animate-spin" /> Aguardando confirmação… A página atualiza sozinha quando cair.
            </p>
          </section>
        )}

        {/* Itens */}
        <section className="rounded-lg border border-border bg-white p-4 sm:p-6">
          <h2 className="text-base font-bold text-ink">Itens do pedido</h2>
          <ul className="mt-3 divide-y divide-border">
            {order.items.map(it => (
              <li key={it.id} className="flex items-start justify-between gap-3 py-3 text-sm">
                <div>
                  <p className="font-medium text-ink">{it.productName}</p>
                  <p className="text-xs text-ink-3">{it.variationLabel} · {it.quantity}x · {formatBRL(it.unitPrice)} cada</p>
                </div>
                <p className="font-semibold text-ink">{formatBRL(it.subtotal)}</p>
              </li>
            ))}
          </ul>
        </section>

        {/* Endereço */}
        <section className="rounded-lg border border-border bg-white p-4 sm:p-6">
          <h2 className="text-base font-bold text-ink">Endereço de entrega</h2>
          <div className="mt-2 text-sm text-ink-2">
            <p className="font-medium">{order.address.recipient}</p>
            <p>{order.address.street}, {order.address.number}{order.address.complement ? ` — ${order.address.complement}` : ''}</p>
            <p>{order.address.district} · {order.address.city}/{order.address.state} · {order.address.zipcode}</p>
          </div>
        </section>

        {isPending && (
          <Button variant="ghost" onClick={onCancel} loading={cancelling} className="text-ink-3">
            Cancelar pedido
          </Button>
        )}

        {isFailed && (
          <Link href="/products" className="inline-block text-primary-700 hover:underline">
            Voltar pra loja
          </Link>
        )}
      </div>

      {/* Resumo lateral */}
      <aside className="lg:sticky lg:top-20 lg:self-start space-y-3">
        <div className="rounded-lg border border-border bg-white p-4 sm:p-6">
          <h2 className="text-base font-bold text-ink">Resumo</h2>
          <dl className="mt-3 space-y-2 text-sm">
            <div className="flex justify-between"><dt className="text-ink-3">Subtotal</dt><dd>{formatBRL(order.subtotal)}</dd></div>
            <div className="flex justify-between"><dt className="text-ink-3 inline-flex items-center gap-1"><Truck className="h-3.5 w-3.5" /> Frete</dt><dd>{formatBRL(order.shippingCost)}</dd></div>
            {order.discount > 0 && (
              <div className="flex justify-between text-success"><dt>Desconto</dt><dd>− {formatBRL(order.discount)}</dd></div>
            )}
            <div className="my-2 border-t border-border" />
            <div className="flex justify-between text-base"><dt className="font-bold text-ink">Total</dt><dd className="font-bold text-ink">{formatBRL(order.total)}</dd></div>
          </dl>
        </div>

        <div className="rounded-lg border border-border bg-white p-4 text-sm text-ink-2 space-y-2">
          <p className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-primary-700" /> 100% original</p>
          <p className="flex items-center gap-2"><Package className="h-4 w-4 text-primary-700" /> Embalado com cuidado</p>
          <p className="flex items-center gap-2"><MessageCircle className="h-4 w-4 text-primary-700" /> Dúvida? <a href="https://wa.me/5511999999999" className="text-primary-700 underline">Chama no Zap</a></p>
        </div>
      </aside>
    </div>
  )
}

function StatusBanner({ status, paymentStatus }: { status: OrderStatus; paymentStatus: PaymentStatus | null }) {
  if (status === 'PAID' || paymentStatus === 'APPROVED') {
    return (
      <div className="flex items-center gap-2 rounded-lg border border-success/30 bg-success/5 px-4 py-3 text-success">
        <CheckCircle2 className="h-5 w-5" />
        <p className="text-sm font-semibold">Pagamento confirmado. Tô separando seu pedido.</p>
      </div>
    )
  }
  if (status === 'CANCELLED' || paymentStatus === 'REJECTED' || paymentStatus === 'EXPIRED') {
    return (
      <div className="flex items-center gap-2 rounded-lg border border-error/30 bg-error/5 px-4 py-3 text-error">
        <XCircle className="h-5 w-5" />
        <p className="text-sm font-semibold">Pedido cancelado. Estoque devolvido.</p>
      </div>
    )
  }
  if (status === 'SHIPPED') {
    return (
      <div className="flex items-center gap-2 rounded-lg border border-primary-700/30 bg-primary-50 px-4 py-3 text-primary-700">
        <Truck className="h-5 w-5" />
        <p className="text-sm font-semibold">Pedido enviado.</p>
      </div>
    )
  }
  return null
}
