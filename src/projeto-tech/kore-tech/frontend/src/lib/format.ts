// Formatters BR + helpers de specs hardware.
const BRL = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })
const DATE_SHORT = new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })
const DATE_LONG = new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })

export function formatBRL(value: number): string {
  return BRL.format(value)
}

export function formatDateBR(d: string | Date): string {
  return DATE_SHORT.format(typeof d === 'string' ? new Date(d) : d)
}

export function formatDateLongBR(d: string | Date): string {
  return DATE_LONG.format(typeof d === 'string' ? new Date(d) : d)
}

export function discountPercent(price: number, comparePrice: number | null | undefined): number | null {
  if (!comparePrice || comparePrice <= price) return null
  return Math.round(((comparePrice - price) / comparePrice) * 100)
}

export function pixPrice(value: number, percent = 5): number {
  return value * (1 - percent / 100)
}

/**
 * Parcelamento ate 12x sem juros pra hardware (ticket alto).
 * Se valor < R$ 100 mostra "a vista".
 */
export function installmentLabel(value: number, installments = 12): string {
  if (value < 100) return `${formatBRL(value)} a vista`
  // limita parcelas pra que cada nao seja absurdamente baixa
  const usable = value < 600 ? Math.min(installments, 4) : installments
  const each = value / usable
  return `${usable}x de ${formatBRL(each)} sem juros`
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

// Specs hardware
export function formatWatts(w: number | null | undefined): string {
  if (w == null) return '-'
  return `${w} W`
}

export function formatMHz(mhz: number | null | undefined): string {
  if (mhz == null) return '-'
  if (mhz >= 1000) return `${(mhz / 1000).toFixed(2)} GHz`
  return `${mhz} MHz`
}

export function formatGB(gb: number | null | undefined): string {
  if (gb == null) return '-'
  return `${gb} GB`
}

export function formatFps(fps: number | null | undefined): string {
  if (fps == null) return '-'
  return `${Math.round(fps)} FPS`
}

export function formatMm(mm: number | null | undefined): string {
  if (mm == null) return '-'
  return `${mm} mm`
}

export function formatGramsToKg(g: number | null | undefined): string {
  if (g == null) return '-'
  if (g >= 1000) return `${(g / 1000).toFixed(2)} kg`
  return `${g} g`
}
