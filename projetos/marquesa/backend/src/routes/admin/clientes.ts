// Lista de clientes (USER) que tem reserva ou lead. Read-only.
import { Router } from 'express'
import { z } from 'zod'
import type { Prisma } from '@prisma/client'
import { prisma } from '../../lib/prisma.js'
import { ok, errors } from '../../lib/api-response.js'

export const adminClientesRouter: Router = Router()

const querySchema = z.object({
  page:   z.coerce.number().int().min(1).default(1),
  limit:  z.coerce.number().int().min(1).max(60).default(20),
  search: z.string().trim().min(1).optional(),
})

adminClientesRouter.get('/', async (req, res, next) => {
  try {
    const q = querySchema.parse(req.query)

    const where: Prisma.UserWhereInput = {
      role: 'USER',
      ...(q.search
        ? {
            OR: [
              { email: { contains: q.search, mode: 'insensitive' } },
              { name:  { contains: q.search, mode: 'insensitive' } },
              { phone: { contains: q.search } },
            ],
          }
        : {}),
    }

    const [total, items] = await Promise.all([
      prisma.user.count({ where }),
      prisma.user.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (q.page - 1) * q.limit,
        take: q.limit,
        select: {
          id: true, name: true, email: true, phone: true, createdAt: true,
          _count: { select: { reservas: true, leads: true } },
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

adminClientesRouter.get('/:id', async (req, res, next) => {
  try {
    const id = String(req.params.id ?? '')
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true, name: true, email: true, phone: true, role: true, createdAt: true,
        reservas: {
          orderBy: { createdAt: 'desc' },
          include: { imovel: { select: { id: true, slug: true, titulo: true, fotos: true } } },
        },
        leads: {
          orderBy: { createdAt: 'desc' },
          include: { imovel: { select: { id: true, slug: true, titulo: true } } },
        },
      },
    })
    if (!user) throw errors.notFound('Cliente não encontrado')
    return ok(res, user)
  } catch (err) {
    next(err)
  }
})
