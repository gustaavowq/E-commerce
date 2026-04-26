// Formatters do Brasil (BRL, datas).
const BRL = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })
const DATE_SHORT = new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })

export function formatBRL(value: number): string {
  return BRL.format(value)
}

export function formatDateBR(d: string | Date): string {
  return DATE_SHORT.format(typeof d === 'string' ? new Date(d) : d)
}

// Calcula desconto percentual entre preço cheio e atual (pra badge "30% OFF")
export function discountPercent(price: number, comparePrice: number | null | undefined): number | null {
  if (!comparePrice || comparePrice <= price) return null
  return Math.round(((comparePrice - price) / comparePrice) * 100)
}

// Pix tem 5% off — vamos mostrar o preço Pix em vários lugares
export function pixPrice(value: number, percent = 5): number {
  return value * (1 - percent / 100)
}

// Parcelamento simples sem juros — 4x sem juros
export function installmentLabel(value: number, installments = 4): string {
  if (value < 100) return `${formatBRL(value)} à vista`
  const each = value / installments
  return `${installments}x de ${formatBRL(each)} sem juros`
}

// Slugify simples (não cobre 100% de edge cases mas serve)
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}
