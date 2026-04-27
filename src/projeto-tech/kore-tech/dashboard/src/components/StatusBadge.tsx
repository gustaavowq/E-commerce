import { cn } from '@/lib/utils'
import type { OrderStatus, PaymentStatus, ReviewStatus } from '@/services/types'

const ORDER_STYLES: Record<OrderStatus, { label: string; cls: string }> = {
  PENDING_PAYMENT: { label: 'Aguardando pagamento', cls: 'bg-warning-soft text-warning ring-warning/30' },
  PAID:            { label: 'Pago',                 cls: 'bg-success-soft text-success ring-success/30' },
  PREPARING:       { label: 'Em separação',         cls: 'bg-info-soft    text-info    ring-info/30' },
  SHIPPED:         { label: 'Enviado',              cls: 'bg-primary-soft text-primary ring-primary/30' },
  DELIVERED:       { label: 'Entregue',             cls: 'bg-primary-soft text-primary ring-primary/40' },
  CANCELLED:       { label: 'Cancelado',            cls: 'bg-danger-soft  text-danger  ring-danger/30' },
  REFUNDED:        { label: 'Reembolsado',          cls: 'bg-surface-2    text-text-secondary ring-border-strong' },
}

const PAYMENT_STYLES: Record<PaymentStatus, { label: string; cls: string }> = {
  PENDING:   { label: 'Pendente',    cls: 'bg-warning-soft text-warning ring-warning/30' },
  APPROVED:  { label: 'Aprovado',    cls: 'bg-success-soft text-success ring-success/30' },
  REJECTED:  { label: 'Rejeitado',   cls: 'bg-danger-soft  text-danger  ring-danger/30' },
  REFUNDED:  { label: 'Reembolsado', cls: 'bg-surface-2    text-text-secondary ring-border-strong' },
  CANCELLED: { label: 'Cancelado',   cls: 'bg-danger-soft  text-danger  ring-danger/30' },
  EXPIRED:   { label: 'Expirado',    cls: 'bg-surface-2    text-text-secondary ring-border-strong' },
}

const REVIEW_STYLES: Record<ReviewStatus, { label: string; cls: string }> = {
  PENDING:  { label: 'Pendente',  cls: 'bg-warning-soft text-warning ring-warning/30' },
  APPROVED: { label: 'Aprovado',  cls: 'bg-success-soft text-success ring-success/30' },
  REJECTED: { label: 'Rejeitado', cls: 'bg-danger-soft  text-danger  ring-danger/30' },
}

type Props =
  | { kind: 'order';   status: OrderStatus }
  | { kind: 'payment'; status: PaymentStatus | null }
  | { kind: 'review';  status: ReviewStatus }

export function StatusBadge(props: Props) {
  if (props.kind === 'order') {
    const s = ORDER_STYLES[props.status]
    return <Badge label={s.label} cls={s.cls} />
  }
  if (props.kind === 'review') {
    const s = REVIEW_STYLES[props.status]
    return <Badge label={s.label} cls={s.cls} />
  }
  if (!props.status) return <span className="text-xs text-text-muted">—</span>
  const s = PAYMENT_STYLES[props.status]
  return <Badge label={s.label} cls={s.cls} />
}

function Badge({ label, cls }: { label: string; cls: string }) {
  return (
    <span className={cn('inline-flex items-center rounded-pill px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset', cls)}>
      {label}
    </span>
  )
}
