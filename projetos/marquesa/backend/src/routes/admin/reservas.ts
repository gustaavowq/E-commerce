// CRUD de reservas (admin). ANALYST = leitura. ADMIN pode mudar status.
import { Router } from 'express'
import type { Prisma } from '@prisma/client'
import { prisma } from '../../lib/prisma.js'
import { ok, errors } from '../../lib/api-response.js'
import { requireRole } from '../../middlewares/auth.js'
import { env } from '../../config/env.js'
import {
  adminPatchReservaSchema, listAdminReservasQuerySchema,
} from '../../validators/reserva.js'

export const adminReservasRouter: Router = Router()

adminReservasRouter.get('/', async (req, res, next) => {
  try {
    const q = listAdminReservasQuerySchema.parse(req.query)

    const where: Prisma.ReservaWhereInput = {
      ...(q.status ? { status: q.status } : {}),
      ...(q.search
        ? {
            OR: [
              { user:   { email: { contains: q.search, mode: 'insensitive' } } },
              { user:   { name:  { contains: q.search, mode: 'insensitive' } } },
              { imovel: { titulo:{ contains: q.search, mode: 'insensitive' } } },
            ],
          }
        : {}),
    }

    const [total, items] = await Promise.all([
      prisma.reserva.count({ where }),
      prisma.reserva.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (q.page - 1) * q.limit,
        take: q.limit,
        include: {
          user:   { select: { id: true, name: true, email: true, phone: true } },
          imovel: {
            select: {
              id: true, slug: true, titulo: true, preco: true, status: true,
              cidade: true, bairro: true, fotos: true,
            },
          },
        },
      }),
    ])

    return ok(res, items, {
      page:       q.page,
      limit:      q.limit,
      total,
      totalPages: Math.ceil(total / q.limit) || 1,
    })
  } catch (err) {
    next(err)
  }
})

adminReservasRouter.get('/:id', async (req, res, next) => {
  try {
    const id = String(req.params.id ?? '')
    const reserva = await prisma.reserva.findUnique({
      where: { id },
      include: {
        user:   { select: { id: true, name: true, email: true, phone: true } },
        imovel: true,
      },
    })
    if (!reserva) throw errors.notFound('Reserva não encontrada')
    return ok(res, reserva)
  } catch (err) {
    next(err)
  }
})

// PATCH /api/admin/reservas/:id — ações: cancelar, marcar como CONVERTIDA, estender
// Aceita ambos os formatos: { status, extenderDias } OU { action: 'cancelar' | 'converter' | 'extender' }
adminReservasRouter.patch('/:id', requireRole('ADMIN'), async (req, res, next) => {
  try {
    const id = String(req.params.id ?? '')
    const body = adminPatchReservaSchema.parse(req.body)

    // Mapeia 'action' atalho do painel pra status/extenderDias.
    // Backwards compatible: se o front mandar status/extenderDias direto, segue normal.
    let finalStatus = body.status
    let finalExtender = body.extenderDias
    if (body.action) {
      if (body.action === 'cancelar')        finalStatus = 'CANCELADA'
      else if (body.action === 'converter')  finalStatus = 'CONVERTIDA'
      else if (body.action === 'extender')   finalExtender = finalExtender ?? env.RESERVA_DURACAO_DIAS
    }

    const reserva = await prisma.reserva.findUnique({
      where: { id },
      include: { imovel: { select: { id: true, status: true } } },
    })
    if (!reserva) throw errors.notFound('Reserva não encontrada')

    const now = new Date()
    const data: Prisma.ReservaUpdateInput = {}

    if (body.notesAdmin !== undefined) data.notesAdmin = body.notesAdmin

    if (finalExtender !== undefined) {
      const base = reserva.expiraEm > now ? reserva.expiraEm : now
      data.expiraEm = new Date(base.getTime() + finalExtender * 24 * 60 * 60 * 1000)
    }

    if (finalStatus && finalStatus !== reserva.status) {
      data.status = finalStatus
      if (finalStatus === 'CANCELADA')  data.canceladaEm  = now
      if (finalStatus === 'EXPIRADA')   data.expiradaEm   = now
      if (finalStatus === 'CONVERTIDA') data.convertidaEm = now
    }

    const updated = await prisma.reserva.update({
      where: { id },
      data,
      include: {
        user:   { select: { id: true, name: true, email: true } },
        imovel: { select: { id: true, slug: true, titulo: true, status: true } },
      },
    })

    // Sincroniza status do imóvel:
    //  - CONVERTIDA → imóvel VENDIDO
    //  - CANCELADA  → libera (DISPONIVEL) se não houver outra ativa
    //  - EXPIRADA   → libera (DISPONIVEL) se imóvel estava RESERVADO
    if (finalStatus === 'CONVERTIDA') {
      await prisma.imovel.update({
        where: { id: reserva.imovelId },
        data:  { status: 'VENDIDO' },
      })
    }
    if (finalStatus === 'CANCELADA' || finalStatus === 'EXPIRADA') {
      const outra = await prisma.reserva.findFirst({
        where: { imovelId: reserva.imovelId, status: 'ATIVA', id: { not: reserva.id } },
      })
      if (!outra && reserva.imovel.status === 'RESERVADO') {
        await prisma.imovel.update({
          where: { id: reserva.imovelId },
          data:  { status: 'DISPONIVEL' },
        })
      }
    }

    return ok(res, updated)
  } catch (err) {
    next(err)
  }
})
