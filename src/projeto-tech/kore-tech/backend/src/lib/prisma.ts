// Singleton do PrismaClient — em dev (com tsx watch), evita criar múltiplas
// instâncias quando o arquivo é recarregado (cada nova conexão consome um
// slot do pool do Postgres).
import { PrismaClient } from '@prisma/client'

declare global {
  // eslint-disable-next-line no-var
  var __prisma: PrismaClient | undefined
}

export const prisma =
  global.__prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
  })

if (process.env.NODE_ENV !== 'production') {
  global.__prisma = prisma
}
