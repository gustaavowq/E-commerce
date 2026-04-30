// Job de expiração de reservas. Roda em loop interno (setInterval) toda hora.
//
// Reservas com status=ATIVA + pagamentoStatus=APROVADO + expiraEm < now()
// vão pra status=EXPIRADA, e o imóvel volta pra DISPONIVEL (a menos que admin
// já tenha movido pra EM_NEGOCIACAO/VENDIDO antes).
import { prisma } from '../lib/prisma.js'
import { logger } from '../lib/logger.js'

const ONE_HOUR_MS = 60 * 60 * 1000

let timer: NodeJS.Timeout | null = null

export async function expireReservasOnce(): Promise<{ expired: number; freedImoveis: number }> {
  const now = new Date()

  // 1) Marca reservas como expiradas (em transação por reserva)
  const candidatas = await prisma.reserva.findMany({
    where: {
      status:          'ATIVA',
      pagamentoStatus: 'APROVADO',
      expiraEm:        { lt: now },
    },
    select: { id: true, imovelId: true },
  })

  let expired = 0
  let freedImoveis = 0

  for (const r of candidatas) {
    try {
      await prisma.$transaction(async (tx) => {
        // Marca a reserva como expirada
        const updated = await tx.reserva.update({
          where: {
            id:     r.id,
            status: 'ATIVA',  // optimistic lock — se admin mudou no meio tempo, ignora
          },
          data: {
            status:      'EXPIRADA',
            expiradaEm:  now,
          },
        })
        if (!updated) return

        expired++

        // Libera o imóvel SE ele ainda estiver RESERVADO por essa reserva.
        // Se admin já mudou pra EM_NEGOCIACAO/VENDIDO, não toca.
        const imovel = await tx.imovel.findUnique({ where: { id: r.imovelId }, select: { status: true } })
        if (imovel?.status === 'RESERVADO') {
          await tx.imovel.update({
            where: { id: r.imovelId },
            data:  { status: 'DISPONIVEL' },
          })
          freedImoveis++
        }
      })
    } catch (err) {
      logger.error({ reservaId: r.id, err }, 'reservaExpiry: erro ao expirar reserva')
    }
  }

  if (expired > 0 || freedImoveis > 0) {
    logger.info({ expired, freedImoveis }, 'reservaExpiry tick')
  }

  return { expired, freedImoveis }
}

export function startReservaExpiryJob(): void {
  if (timer) return
  // 1ª execução em 30s (deixa app subir). Depois a cada hora.
  setTimeout(() => { void expireReservasOnce() }, 30_000)
  timer = setInterval(() => { void expireReservasOnce() }, ONE_HOUR_MS)
  // Não bloqueia process exit
  if (typeof timer.unref === 'function') timer.unref()
  logger.info('reservaExpiry job iniciado (intervalo 1h)')
}

export function stopReservaExpiryJob(): void {
  if (timer) {
    clearInterval(timer)
    timer = null
  }
}
