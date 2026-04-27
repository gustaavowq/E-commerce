import { Router } from 'express'
import { prisma } from '../lib/prisma.js'
import { ok, errors } from '../lib/api-response.js'

export const categoriesRouter: Router = Router()

categoriesRouter.get('/', async (_req, res, next) => {
  try {
    const categories = await prisma.category.findMany({
      where: { isActive: true },
      orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
      select: {
        id: true, slug: true, name: true, parentId: true,
        _count: { select: { products: { where: { isActive: true } } } },
      },
    })

    return ok(res, categories.map(c => ({
      id:           c.id,
      slug:         c.slug,
      name:         c.name,
      parentId:     c.parentId,
      productCount: c._count.products,
    })))
  } catch (err) {
    next(err)
  }
})

categoriesRouter.get('/:slug', async (req, res, next) => {
  try {
    const cat = await prisma.category.findUnique({
      where: { slug: req.params.slug },
      select: {
        id: true, slug: true, name: true, parentId: true, isActive: true,
        _count: { select: { products: { where: { isActive: true } } } },
        children: {
          where: { isActive: true },
          select: { id: true, slug: true, name: true },
        },
      },
    })
    if (!cat || !cat.isActive) throw errors.notFound('Categoria não encontrada')

    return ok(res, {
      id:           cat.id,
      slug:         cat.slug,
      name:         cat.name,
      parentId:     cat.parentId,
      productCount: cat._count.products,
      children:     cat.children,
    })
  } catch (err) {
    next(err)
  }
})
