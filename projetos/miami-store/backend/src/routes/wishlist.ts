// Wishlist do cliente. Tudo requer auth.
import { Router } from 'express'
import { prisma } from '../lib/prisma.js'
import { ok, errors, noContent } from '../lib/api-response.js'
import { requireAuth } from '../middleware/auth.js'
import { z } from 'zod'

export const wishlistRouter: Router = Router()
wishlistRouter.use(requireAuth)

// GET /api/wishlist — lista produtos favoritados (com snapshot de preço/imagem)
wishlistRouter.get('/', async (req, res, next) => {
  try {
    const items = await prisma.wishlistItem.findMany({
      where:   { userId: req.user!.id },
      orderBy: { createdAt: 'desc' },
      include: {
        product: {
          select: {
            id: true, slug: true, name: true,
            basePrice: true, comparePrice: true, isActive: true,
            brand:    { select: { name: true, slug: true } },
            category: { select: { name: true, slug: true } },
            images:   { where: { isPrimary: true }, take: 1, select: { url: true, alt: true } },
          },
        },
      },
    })
    return ok(res, items.filter(i => i.product.isActive).map(i => ({
      id:         i.id,
      addedAt:    i.createdAt,
      product: {
        id:           i.product.id,
        slug:         i.product.slug,
        name:         i.product.name,
        basePrice:    Number(i.product.basePrice),
        comparePrice: i.product.comparePrice == null ? null : Number(i.product.comparePrice),
        brand:        i.product.brand,
        category:     i.product.category,
        primaryImage: i.product.images[0] ?? null,
      },
    })))
  } catch (err) { next(err) }
})

// POST /api/wishlist — adiciona produto. Idempotente.
wishlistRouter.post('/', async (req, res, next) => {
  try {
    const { productId } = z.object({ productId: z.string().min(1) }).parse(req.body)
    const product = await prisma.product.findUnique({ where: { id: productId }, select: { id: true, isActive: true } })
    if (!product || !product.isActive) throw errors.notFound('Produto não encontrado')

    await prisma.wishlistItem.upsert({
      where:  { userId_productId: { userId: req.user!.id, productId } },
      update: {},
      create: { userId: req.user!.id, productId },
    })
    const count = await prisma.wishlistItem.count({ where: { userId: req.user!.id } })
    return ok(res, { added: true, total: count })
  } catch (err) { next(err) }
})

// DELETE /api/wishlist/:productId
wishlistRouter.delete('/:productId', async (req, res, next) => {
  try {
    await prisma.wishlistItem.deleteMany({
      where: { userId: req.user!.id, productId: req.params.productId },
    })
    return noContent(res)
  } catch (err) { next(err) }
})
