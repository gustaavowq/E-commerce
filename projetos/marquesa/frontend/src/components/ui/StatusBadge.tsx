import { cn } from '@/lib/format'
import type { ImovelStatus, ReservaStatus, PagamentoStatus } from '@/types/api'

type AnyStatus = ImovelStatus | ReservaStatus | PagamentoStatus | string

interface StatusBadgeProps {
  status: AnyStatus
  label?: string
  className?: string
}

const palette: Record<string, string> = {
  // Imóvel
  DISPONIVEL: 'bg-moss-pale text-moss-deep',
  RESERVADO: 'bg-bone text-ash',
  EM_NEGOCIACAO: 'bg-paper-warm text-ink border border-bone',
  VENDIDO: 'bg-ink text-paper',
  INATIVO: 'border border-bone text-ash-soft',
  // Reserva
  ATIVA: 'bg-moss-pale text-moss-deep',
  EXPIRADA: 'bg-bone text-ash',
  CANCELADA: 'border border-bone text-ash-soft',
  CONVERTIDA: 'bg-ink text-paper',
  // Pagamento
  PENDENTE: 'bg-paper-warm text-ink border border-bone',
  APROVADO: 'bg-moss-pale text-moss-deep',
  REJEITADO: 'bg-bone text-ash',
  REEMBOLSADO: 'border border-bone text-ash-soft',
}

const labels: Record<string, string> = {
  DISPONIVEL: 'Disponível',
  RESERVADO: 'Reservado',
  EM_NEGOCIACAO: 'Em negociação',
  VENDIDO: 'Vendido',
  INATIVO: 'Inativo',
  ATIVA: 'Ativa',
  EXPIRADA: 'Expirada',
  CANCELADA: 'Cancelada',
  CONVERTIDA: 'Convertida',
  PENDENTE: 'Pendente',
  APROVADO: 'Aprovado',
  REJEITADO: 'Rejeitado',
  REEMBOLSADO: 'Reembolsado',
}

export function StatusBadge({ status, label, className }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        'inline-block px-[10px] py-1 text-caption uppercase tracking-[0.04em] rounded-md font-medium',
        palette[status] ?? 'border border-bone text-ash',
        className,
      )}
    >
      {label ?? labels[status] ?? status}
    </span>
  )
}
