// Moderação de reviews. Lista todas (aprovadas + pendentes), permite aprovar/reprovar.
import { Router } from 'express'
import { z } from 'zod'
import { prisma } from '../../lib/prisma.js'
import { ok, errors, noContent } from '../../lib/api-response.js'

export const adminReviewsRouter: Router = Router()

adminReviewsRouter.get('/', async (req, res, next) => {
  try {
    const page  = Math.max(1, Number(req.query.page  ?? 1))
    const limit = Math.min(100, Math.max(1, Number(req.query.limit ?? 25)))
    const onlyPending = req.query.pending === 'true'

    const where = onlyPending ? { isApproved: false } : {}
    const [total, reviews] = await Promise.all([
      prisma.review.count({ where }),
      prisma.review.findMany({
        where, orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit, take: limit,
        include: {
          user:    { select: { id: true, name: true, email: true } },
          product: { select: { id: true, slug: true, name: true } },
        },
      }),
    ])
    return ok(res, reviews, { page, limit, total, totalPages: Math.ceil(total / limit) })
  } catch (err) { next(err) }
})

adminReviewsRouter.patch('/:id', async (req, res, next) => {
  try {
    const body = z.object({ isApproved: z.boolean() }).parse(req.body)
    const exists = await prisma.review.findUnique({ where: { id: req.params.id } })
    if (!exists) throw errors.notFound('Avaliação não encontrada')
    const r = await prisma.review.update({
      where: { id: exists.id }, data: { isApproved: body.isApproved },
    })
    return ok(res, r)
  } catch (err) { next(err) }
})

adminReviewsRouter.delete('/:id', async (req, res, next) => {
  try {
    await prisma.review.delete({ where: { id: req.params.id } }).catch(() => null)
    return noContent(res)
  } catch (err) { next(err) }
})
