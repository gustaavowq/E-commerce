// Gera número humano de pedido: "MS-20260425-0001".
// Sequência diária — usa COUNT do dia + 1, com retry em caso de colisão.
import { prisma } from './prisma.js'

function todayPrefix(d = new Date()): string {
  const y = d.getUTCFullYear()
  const m = String(d.getUTCMonth() + 1).padStart(2, '0')
  const day = String(d.getUTCDate()).padStart(2, '0')
  return `MS-${y}${m}${day}`
}

export async function nextOrderNumber(): Promise<string> {
  const prefix = todayPrefix()
  const start = new Date()
  start.setUTCHours(0, 0, 0, 0)
  const end = new Date(start)
  end.setUTCDate(end.getUTCDate() + 1)

  const count = await prisma.order.count({
    where: { createdAt: { gte: start, lt: end } },
  })
  return `${prefix}-${String(count + 1).padStart(4, '0')}`
}
