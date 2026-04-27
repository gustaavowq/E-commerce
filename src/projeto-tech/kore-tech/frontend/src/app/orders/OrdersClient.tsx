'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { Package, ArrowRight, Receipt } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Skeleton } from '@/components/ui/Skeleton'
import { listMyOrders } from '@/services/orders'
import { useAuth } from '@/stores/auth'
import { formatBRL, formatDateBR } from '@/lib/format'
import type { OrderStatus, PaymentStatus } from '@/services/types'

const STATUS_LABEL: Record<OrderStatus, string> = {
  PENDING_PAYMENT: 'Aguardando pagamento',
  PAID: 'Pagamento confirmado',
  PREPARING: 'Em preparacao',
  SHIPPED: 'Enviado',
  DELIVERED: 'Entregue',
  CANCELLED: 'Cancelado',
  REFUNDED: 'Reembolsado',
}

const STATUS_TONE: Record<OrderStatus, string> = {
  PENDING_PAYMENT: 'border-warning/40 bg-warning/5 text-warning',
  PAID: 'border-success/40 bg-success/5 text-success',
  PREPARING: 'border-primary/40 bg-primary-soft text-primary',
  SHIPPED: 'border-primary/40 bg-primary-soft text-primary',
  DELIVERED: 'border-success/40 bg-success/5 text-success',
  CANCELLED: 'border-danger/40 bg-danger/5 text-danger',
  REFUNDED: 'border-danger/40 bg-danger/5 text-danger',
}

export function OrdersClient() {
  const router = useRouter()
  const user = useAuth((s) => s.user)
  const hydrated = useAuth((s) => s.hydrated)

  useEffect(() => {
    if (hydrated && !user) router.replace(`/auth/login?redirect=${encodeURIComponent('/orders')}`)
  }, [hydrated, user, router])

  const { data, isLoading, isError } = useQuery({
    queryKey: ['orders', 'mine'],
    queryFn: listMyOrders,
    enabled: !!user,
  })

  const orders = data?.data ?? []

  return (
    <main className="container-app py-8 sm:py-12">
      <header className="mb-6">
        <p className="font-specs text-xs font-bold uppercase tracking-widest text-primary">Pedidos</p>
        <h1 className="mt-1 font-display text-2xl font-bold text-text sm:text-3xl">Meus pedidos</h1>
        <p className="mt-1 text-sm text-text-secondary">Acompanhe pagamento, separacao e envio.</p>
      </header>

      {isLoading && (
        <ul className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <li key={i} className="rounded-lg border border-border bg-surface p-5">
              <Skeleton className="h-6 w-1/3" />
              <Skeleton className="mt-3 h-4 w-1/2" />
              <Skeleton className="mt-2 h-4 w-1/4" />
            </li>
          ))}
        </ul>
      )}

      {isError && (
        <div className="rounded-lg border border-danger/40 bg-danger/5 p-6 text-sm text-danger">
          Nao deu pra carregar seus pedidos. Recarregue a pagina ou tente em alguns segundos.
        </div>
      )}

      {!isLoading && !isError && orders.length === 0 && (
        <div className="rounded-lg border border-dashed border-border bg-surface/40 p-10 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-pill bg-primary-soft">
            <Receipt className="h-7 w-7 text-primary" />
          </div>
          <p className="mt-3 text-sm text-text-secondary">Voce ainda nao tem pedidos.</p>
          <Link href="/builds" className="mt-4 inline-block">
            <Button variant="outline">Ver builds prontos</Button>
          </Link>
        </div>
      )}

      {!isLoading && orders.length > 0 && (
        <ul className="space-y-3">
          {orders.map((o) => (
            <li key={o.id}>
              <Link
                href={`/orders/${o.id}`}
                className="group block rounded-lg border border-border bg-surface p-5 transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <Package className="h-4 w-4 text-primary" />
                      <span className="font-specs text-sm font-bold text-text">#{o.orderNumber}</span>
                      <span
                        className={`inline-flex rounded-pill border px-2 py-0.5 text-[11px] font-medium ${STATUS_TONE[o.status]}`}
                      >
                        {STATUS_LABEL[o.status]}
                      </span>
                    </div>
                    <p className="mt-2 text-sm text-text-secondary line-clamp-2">{o.itemPreview.join(' · ')}</p>
                    <p className="mt-1 text-xs text-text-muted">Em {formatDateBR(o.createdAt)}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-specs text-lg font-bold text-text">{formatBRL(o.total)}</p>
                    <span className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-primary">
                      Detalhes <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-1" />
                    </span>
                  </div>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  )
}

export type { OrderStatus, PaymentStatus }
