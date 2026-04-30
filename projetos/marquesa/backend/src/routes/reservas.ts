// Rotas de reserva (cliente autenticado).
// Fluxo:
//   1) Cliente POST /api/reservas { imovelId } → cria Reserva PENDENTE + Preference MP
//   2) Cliente abre initPoint, paga via MP
//   3) Webhook MP confirma → Reserva ATIVA, Imóvel RESERVADO, expiraEm = paidAt + RESERVA_DURACAO_DIAS
import { Router } from 'express'
import { prisma } from '../lib/prisma.js'
import { ok, created, errors } from '../lib/api-response.js'
import { requireAuth } from '../middlewares/auth.js'
import { createReservaSchema } from '../validators/reserva.js'
import { createReservaPreference } from '../services/mercadoPago.js'
import { env } from '../config/env.js'
import { logger } from '../lib/logger.js'

export const reservasRouter: Router = Router()

// Calcula valor do sinal — usa precoSinal do imóvel ou % default do env
function calcSinal(preco: number, precoSinal: number | null | undefined): number {
  if (precoSinal && precoSinal > 0) return Number(precoSinal)
  const pct = env.SINAL_DEFAULT_PERCENT / 100
  return Number((preco * pct).toFixed(2))
}

// =====================================================================
// POST /api/reservas — cliente cria intenção de reserva (gera preference MP)
// =====================================================================
reservasRouter.post('/', requireAuth, async (req, res, next) => {
  try {
    const userId = req.user!.id
    const { imovelId } = createReservaSchema.parse(req.body)

    const imovel = await prisma.imovel.findUnique({
      where: { id: imovelId },
      select: { id: true, titulo: true, status: true, preco: true, precoSinal: true },
    })
    if (!imovel) throw errors.notFound('Imóvel não encontrado')

    // Imóvel precisa estar disponível pra novas reservas
    if (imovel.status !== 'DISPONIVEL') {
      throw errors.conflict('Imóvel não está disponível pra reserva no momento')
    }

    // Não pode haver outra reserva ATIVA pro mesmo imóvel (pagamento aprovado vigente)
    const ativa = await prisma.reserva.findFirst({
      where: { imovelId, status: 'ATIVA' },
    })
    if (ativa) throw errors.conflict('Já existe uma reserva ativa pra esse imóvel')

    // Cliente: bloqueia múltiplas pendências do MESMO cliente pro MESMO imóvel
    // (evita criar várias preferences órfãs). Reusa a última PENDENTE se existir.
    const pendente = await prisma.reserva.findFirst({
      where: { imovelId, userId, pagamentoStatus: 'PENDENTE', status: { not: 'CANCELADA' } },
      orderBy: { createdAt: 'desc' },
    })

    const valorSinal = calcSinal(Number(imovel.preco), imovel.precoSinal as unknown as number | null)
    // Snapshot do preço cheio do imóvel pra DOM/relatórios manterem coerência
    // mesmo se o admin reprecificar o imóvel depois (KPI do Data-Analyst).
    const precoSnapshot = Number(imovel.preco)
    // expiraEm provisório (será sobrescrito após confirmação do pagamento).
    // Setamos +30min só pra permitir o cliente fechar o checkout MP.
    const expiraEmProvisorio = new Date(Date.now() + 30 * 60_000)

    let reserva = pendente
    if (!reserva) {
      // Cria reserva + bump de lastInteractionAt em transação atômica.
      reserva = await prisma.$transaction(async (tx) => {
        const novaReserva = await tx.reserva.create({
          data: {
            imovelId,
            userId,
            status:          'ATIVA',  // ATIVA aqui significa "intent ativa"; será confirmada após pagamento
            pagamentoStatus: 'PENDENTE',
            valorSinal,
            precoSnapshot,
            expiraEm:        expiraEmProvisorio,
          },
        })
        await tx.imovel.update({
          where: { id: imovelId },
          data:  { lastInteractionAt: novaReserva.createdAt },
        })
        return novaReserva
      })
    }

    // Cria preference no MP
    const user = await prisma.user.findUnique({
      where:  { id: userId },
      select: { email: true, name: true, phone: true },
    })
    if (!user) throw errors.unauthorized()

    const pref = await createReservaPreference({
      reservaId:    reserva.id,
      imovelTitulo: imovel.titulo,
      valor:        valorSinal,
      payerEmail:   user.email,
      payerName:    user.name,
      payerPhone:   user.phone ?? undefined,
    })

    const updated = await prisma.reserva.update({
      where: { id: reserva.id },
      data:  {
        mpPreferenceId: pref.preferenceId,
        mpInitPoint:    pref.initPoint,
      },
      select: {
        id: true, valorSinal: true, status: true, pagamentoStatus: true,
        mpPreferenceId: true, mpInitPoint: true, expiraEm: true,
        imovel: { select: { id: true, slug: true, titulo: true } },
      },
    })

    logger.info({ reservaId: reserva.id, sandbox: pref.sandbox }, 'reserva intent criada')

    return created(res, { reserva: updated, sandbox: pref.sandbox })
  } catch (err) {
    next(err)
  }
})

// =====================================================================
// GET /api/reservas/me — lista reservas do user logado
// =====================================================================
reservasRouter.get('/me', requireAuth, async (req, res, next) => {
  try {
    const userId = req.user!.id
    const reservas = await prisma.reserva.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true, status: true, pagamentoStatus: true,
        valorSinal: true, paidAt: true, expiraEm: true,
        mpInitPoint: true, createdAt: true,
        imovel: {
          select: {
            id: true, slug: true, titulo: true, preco: true, fotos: true,
            cidade: true, bairro: true, status: true,
          },
        },
      },
    })
    return ok(res, reservas)
  } catch (err) {
    next(err)
  }
})

// =====================================================================
// GET /api/reservas/:id — detalhe de reserva (cliente dono ou admin)
// =====================================================================
reservasRouter.get('/:id', requireAuth, async (req, res, next) => {
  try {
    const id = String(req.params.id ?? '')
    const reserva = await prisma.reserva.findUnique({
      where: { id },
      include: {
        imovel: {
          select: {
            id: true, slug: true, titulo: true, fotos: true,
            preco: true, cidade: true, bairro: true, status: true,
          },
        },
        user: { select: { id: true, name: true, email: true } },
      },
    })
    if (!reserva) throw errors.notFound('Reserva não encontrada')

    const isOwner = reserva.userId === req.user!.id
    const isStaff = req.user!.role === 'ADMIN' || req.user!.role === 'ANALYST'
    if (!isOwner && !isStaff) throw errors.forbidden()

    return ok(res, reserva)
  } catch (err) {
    next(err)
  }
})

// =====================================================================
// POST /api/reservas/:id/mock-aprovar — simula aprovação (só sem token MP real)
// Permite demo do fluxo completo sem cobrança real. Bloqueado quando token MP
// PRODUCTION está setado. Cliente dono da reserva.
// =====================================================================
reservasRouter.post('/:id/mock-aprovar', requireAuth, async (req, res, next) => {
  try {
    const token = env.MERCADOPAGO_ACCESS_TOKEN
    const tokenReal = !!token && !/x{4,}/i.test(token)
    if (tokenReal) throw errors.forbidden('Mock indisponível com token MP real configurado')

    const id = String(req.params.id ?? '')
    const reserva = await prisma.reserva.findUnique({ where: { id } })
    if (!reserva) throw errors.notFound('Reserva não encontrada')
    if (reserva.userId !== req.user!.id) throw errors.forbidden()
    if (reserva.pagamentoStatus === 'APROVADO') {
      return ok(res, { reservaId: id, status: 'APROVADO', mock: true })
    }

    const expiraEm = new Date(Date.now() + env.RESERVA_DURACAO_DIAS * 86400_000)

    await prisma.$transaction(async (tx) => {
      await tx.reserva.update({
        where: { id },
        data: {
          pagamentoStatus: 'APROVADO',
          status:          'ATIVA',
          paidAt:          new Date(),
          expiraEm,
        },
      })
      await tx.imovel.update({
        where: { id: reserva.imovelId },
        data:  { status: 'RESERVADO' },
      })
    })

    logger.info({ reservaId: id, mock: true }, 'reserva aprovada via mock')
    return ok(res, { reservaId: id, status: 'APROVADO', mock: true })
  } catch (err) {
    next(err)
  }
})
