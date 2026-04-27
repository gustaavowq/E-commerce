// Reviews. GET público (só aprovadas), POST/DELETE requer auth.
// Cliente só pode avaliar produtos que comprou (status PAID em diante).
import { Router } from 'express'
import { z } from 'zod'
import { prisma } from '../lib/prisma.js'
import { ok, errors, noContent } from '../lib/api-response.js'
import { extractUser, requireAuth } from '../middleware/auth.js'

export const reviewsRouter: Router = Router()

const reviewCreateSchema = z.object({
  productId: z.string().min(1),
  rating:    z.number().int().min(1).max(5),
  comment:   z.string().max(1000).optional(),
})

reviewsRouter.get('/product/:productId', extractUser, async (req, res, next) => {
  try {
    const productId = String(req.params.productId ?? '')
    if (!productId) throw errors.badRequest('productId obrigatório')
    const userId = req.user?.id

    const list = await prisma.review.findMany({
      where:   { productId, isApproved: true },
      orderBy: { createdAt: 'desc' },
      take:    50,
      include: { user: { select: { name: true } } },
    })
    const agg = await prisma.review.aggregate({
      where: { productId, isApproved: true },
      _avg:  { rating: true },
      _count: true,
    })
    const mine = userId
      ? await prisma.review.findUnique({
          where:  { productId_userId: { productId, userId } },
          select: { id: true, rating: true, comment: true, isApproved: true },
        })
      : null

    const distribution = [1, 2, 3, 4, 5].map(star => ({
      star, count: list.filter(r => r.rating === star).length,
    }))

    const avgRating = agg._avg?.rating
    return ok(res, {
      summary: {
        average:  avgRating ? +avgRating.toFixed(1) : 0,
        total:    agg._count,
        distribution,
      },
      mine,
      reviews: list.map(r => ({
        id:        r.id,
        rating:    r.rating,
        comment:   r.comment,
        userName:  r.user.name.split(' ').slice(0, 2).join(' '),
        createdAt: r.createdAt,
      })),
    })
  } catch (err) { next(err) }
})

reviewsRouter.post('/', requireAuth, async (req, res, next) => {
  try {
    const body = reviewCreateSchema.parse(req.body)
    const userId = req.user!.id

    const bought = await prisma.orderItem.findFirst({
      where: {
        productId: body.productId,
        order: {
          userId,
          status: { in: ['PAID', 'PREPARING', 'SHIPPED', 'DELIVERED'] },
        },
      },
      select: { id: true },
    })
    if (!bought) throw errors.forbidden('Só dá pra avaliar produto que você já comprou')

    const review = await prisma.review.upsert({
      where:  { productId_userId: { productId: body.productId, userId } },
      update: { rating: body.rating, comment: body.comment, isApproved: false },
      create: {
        productId:  body.productId,
        userId,
        rating:     body.rating,
        comment:    body.comment,
        isApproved: false,
      },
    })

    return ok(res, {
      id: review.id, rating: review.rating, comment: review.comment,
      isApproved: review.isApproved,
      message: 'Obrigado! Sua avaliação tá em moderação e aparece em breve.',
    })
  } catch (err) { next(err) }
})

reviewsRouter.delete('/:id', requireAuth, async (req, res, next) => {
  try {
    const id = String(req.params.id ?? '')
    const r = await prisma.review.findUnique({ where: { id } })
    if (!r || r.userId !== req.user!.id) throw errors.notFound('Avaliação não encontrada')
    await prisma.review.delete({ where: { id: r.id } })
    return noContent(res)
  } catch (err) { next(err) }
})
