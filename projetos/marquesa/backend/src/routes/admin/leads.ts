// Lista de leads (formulários de interesse) — admin/analyst read.
// Frontend painel/leads consome com filtros básicos e paginação.
import { Router } from 'express'
import { z } from 'zod'
import type { Prisma } from '@prisma/client'
import { prisma } from '../../lib/prisma.js'
import { ok } from '../../lib/api-response.js'

export const adminLeadsRouter: Router = Router()

const querySchema = z.object({
  page:   z.coerce.number().int().min(1).default(1),
  limit:  z.coerce.number().int().min(1).max(100).default(50),
  search: z.string().trim().min(1).optional(),
})

adminLeadsRouter.get('/', async (req, res, next) => {
  try {
    const q = querySchema.parse(req.query)
    const skip = (q.page - 1) * q.limit

    const where: Prisma.LeadWhereInput = q.search
      ? {
          OR: [
            { nome:  { contains: q.search, mode: 'insensitive' } },
            { email: { contains: q.search, mode: 'insensitive' } },
          ],
        }
      : {}

    const [leads, total] = await Promise.all([
      prisma.lead.findMany({
        where,
        include: {
          imovel: { select: { id: true, slug: true, titulo: true, bairro: true } },
          user:   { select: { id: true, name: true, email: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: q.limit,
      }),
      prisma.lead.count({ where }),
    ])

    return ok(res, leads, {
      page:       q.page,
      limit:      q.limit,
      total,
      totalPages: Math.ceil(total / q.limit) || 1,
    })
  } catch (err) {
    next(err)
  }
})
