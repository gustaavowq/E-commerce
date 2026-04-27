// Formatadores Intl pt-BR. Centralizados pra ser fácil migrar pra date-fns
// ou Intl.RelativeTimeFormat depois sem caçar string solto pelo código.

const BRL = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })
const NUM = new Intl.NumberFormat('pt-BR')
const NUM_COMPACT = new Intl.NumberFormat('pt-BR', { notation: 'compact', maximumFractionDigits: 1 })
const PCT = new Intl.NumberFormat('pt-BR', { style: 'percent', maximumFractionDigits: 1 })
const DATE_SHORT = new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })
const DATE_TIME  = new Intl.DateTimeFormat('pt-BR', {
  day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit',
})

export function formatBRL(n: number): string  { return BRL.format(n) }
export function formatNum(n: number): string  { return NUM.format(n) }
export function formatNumCompact(n: number): string { return NUM_COMPACT.format(n) }
export function formatPct(n: number): string  { return PCT.format(n) }
export function formatDate(d: string | Date): string { return DATE_SHORT.format(typeof d === 'string' ? new Date(d) : d) }
export function formatDateTime(d: string | Date): string { return DATE_TIME.format(typeof d === 'string' ? new Date(d) : d) }

export function relativeTime(d: string | Date): string {
  const now  = Date.now()
  const then = typeof d === 'string' ? new Date(d).getTime() : d.getTime()
  const diffSec = Math.round((now - then) / 1000)
  if (diffSec < 60)        return 'agora mesmo'
  if (diffSec < 3600)      return `${Math.round(diffSec / 60)} min atrás`
  if (diffSec < 86400)     return `${Math.round(diffSec / 3600)} h atrás`
  if (diffSec < 86400 * 7) return `${Math.round(diffSec / 86400)} d atrás`
  return formatDate(d)
}
