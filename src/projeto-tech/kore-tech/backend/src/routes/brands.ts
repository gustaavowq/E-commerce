import { Router } from 'express'
import { prisma } from '../lib/prisma.js'
import { ok, errors } from '../lib/api-response.js'

export const brandsRouter: Router = Router()

brandsRouter.get('/', async (_req, res, next) => {
  try {
    const brands = await prisma.brand.findMany({
      where: { isActive: true },
      orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
      select: {
        id: true, slug: true, name: true, logoUrl: true,
        _count: { select: { products: { where: { isActive: true } } } },
      },
    })

    return ok(res, brands.map(b => ({
      id:           b.id,
      slug:         b.slug,
      name:         b.name,
      logoUrl:      b.logoUrl,
      productCount: b._count.products,
    })))
  } catch (err) {
    next(err)
  }
})

brandsRouter.get('/:slug', async (req, res, next) => {
  try {
    const brand = await prisma.brand.findUnique({
      where: { slug: req.params.slug },
      select: {
        id: true, slug: true, name: true, logoUrl: true, isActive: true,
        _count: { select: { products: { where: { isActive: true } } } },
      },
    })
    if (!brand || !brand.isActive) throw errors.notFound('Marca não encontrada')

    return ok(res, {
      id:           brand.id,
      slug:         brand.slug,
      name:         brand.name,
      logoUrl:      brand.logoUrl,
      productCount: brand._count.products,
    })
  } catch (err) {
    next(err)
  }
})
