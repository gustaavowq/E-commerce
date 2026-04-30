// Formatadores pt-BR — preço, área, datas. Sempre tabular-num em UI.

export function formatBRL(value: string | number | null | undefined): string {
  if (value == null || value === '') return 'R$ 0'
  const n = typeof value === 'string' ? Number(value) : value
  if (!Number.isFinite(n)) return 'R$ 0'
  return n.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })
}

export function formatBRLDetailed(value: string | number | null | undefined): string {
  if (value == null || value === '') return 'R$ 0,00'
  const n = typeof value === 'string' ? Number(value) : value
  if (!Number.isFinite(n)) return 'R$ 0,00'
  return n.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  })
}

export function formatArea(value: number | null | undefined): string {
  if (value == null || !Number.isFinite(value)) return '—'
  return `${value.toLocaleString('pt-BR', { maximumFractionDigits: 0 })} m²`
}

export function formatPhone(raw: string | null | undefined): string {
  if (!raw) return ''
  const digits = raw.replace(/\D/g, '')
  if (digits.length === 11) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`
  }
  if (digits.length === 10) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`
  }
  return raw
}

export function formatDate(iso: string | Date | null | undefined): string {
  if (!iso) return '—'
  const date = typeof iso === 'string' ? new Date(iso) : iso
  if (Number.isNaN(date.getTime())) return '—'
  return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

export function formatDateTime(iso: string | Date | null | undefined): string {
  if (!iso) return '—'
  const date = typeof iso === 'string' ? new Date(iso) : iso
  if (Number.isNaN(date.getTime())) return '—'
  return date.toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function diasRestantes(iso: string | null | undefined): number {
  if (!iso) return 0
  const expira = new Date(iso).getTime()
  const now = Date.now()
  return Math.max(0, Math.ceil((expira - now) / (1000 * 60 * 60 * 24)))
}

export function tipoLabel(tipo: string): string {
  const map: Record<string, string> = {
    APARTAMENTO: 'Apartamento',
    CASA: 'Casa',
    COBERTURA: 'Cobertura',
    SOBRADO: 'Sobrado',
    TERRENO: 'Terreno',
    COMERCIAL: 'Comercial',
  }
  return map[tipo] ?? tipo
}

export function statusLabel(status: string): string {
  const map: Record<string, string> = {
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
  return map[status] ?? status
}

export function cn(...classes: (string | false | null | undefined)[]): string {
  return classes.filter(Boolean).join(' ')
}
