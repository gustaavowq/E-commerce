import { cn } from '@/lib/utils'
import type { OrderStatus, PaymentStatus } from '@/services/types'

const ORDER_STYLES: Record<OrderStatus, { label: string; cls: string }> = {
  PENDING_PAYMENT: { label: 'Aguardando pagamento', cls: 'bg-warning/10 text-warning ring-warning/30' },
  PAID:            { label: 'Pago',                 cls: 'bg-success/10 text-success ring-success/30' },
  PREPARING:       { label: 'Em separação',         cls: 'bg-info/10    text-info    ring-info/30' },
  SHIPPED:         { label: 'Enviado',              cls: 'bg-primary-50 text-primary-700 ring-primary-700/30' },
  DELIVERED:       { label: 'Entregue',             cls: 'bg-primary-50 text-primary-900 ring-primary-700/40' },
  CANCELLED:       { label: 'Cancelado',            cls: 'bg-error/10   text-error   ring-error/30' },
  REFUNDED:        { label: 'Reembolsado',          cls: 'bg-ink-3/10   text-ink-3   ring-ink-3/30' },
}

const PAYMENT_STYLES: Record<PaymentStatus, { label: string; cls: string }> = {
  PENDING:   { label: 'Pendente',    cls: 'bg-warning/10 text-warning ring-warning/30' },
  APPROVED:  { label: 'Aprovado',    cls: 'bg-success/10 text-success ring-success/30' },
  REJECTED:  { label: 'Rejeitado',   cls: 'bg-error/10   text-error   ring-error/30' },
  REFUNDED:  { label: 'Reembolsado', cls: 'bg-ink-3/10   text-ink-3   ring-ink-3/30' },
  CANCELLED: { label: 'Cancelado',   cls: 'bg-error/10   text-error   ring-error/30' },
  EXPIRED:   { label: 'Expirado',    cls: 'bg-ink-3/10   text-ink-3   ring-ink-3/30' },
}

type Props =
  | { kind: 'order';   status: OrderStatus }
  | { kind: 'payment'; status: PaymentStatus | null }

export function StatusBadge(props: Props) {
  if (props.kind === 'order') {
    const s = ORDER_STYLES[props.status]
    return <Badge label={s.label} cls={s.cls} />
  }
  if (!props.status) return <span className="text-xs text-ink-4">—</span>
  const s = PAYMENT_STYLES[props.status]
  return <Badge label={s.label} cls={s.cls} />
}

function Badge({ label, cls }: { label: string; cls: string }) {
  return (
    <span className={cn('inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset', cls)}>
      {label}
    </span>
  )
}
