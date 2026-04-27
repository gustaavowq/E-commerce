// Gera número humano de pedido: "KT-20260426-0001".
// Sequência diária — usa COUNT do dia + 1.
import { prisma } from './prisma.js'

function todayPrefix(d = new Date()): string {
  const y = d.getUTCFullYear()
  const m = String(d.getUTCMonth() + 1).padStart(2, '0')
  const day = String(d.getUTCDate()).padStart(2, '0')
  return `KT-${y}${m}${day}`
}

export async function nextOrderNumber(): Promise<string> {
  const start = new Date()
  start.setUTCHours(0, 0, 0, 0)
  const end = new Date(start)
  end.setUTCDate(end.getUTCDate() + 1)

  const count = await prisma.order.count({
    where: { createdAt: { gte: start, lt: end } },
  })
  return `${todayPrefix()}-${String(count + 1).padStart(4, '0')}`
}
