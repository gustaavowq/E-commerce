// CRUD de produtos pro painel admin. Diferente das rotas públicas:
//   - Lista produtos INATIVOS também (filtro opcional)
//   - Permite criar/atualizar/deletar
//   - Mostra estoque e SKU detalhados
import { Router } from 'express'
import { Prisma } from '@prisma/client'
import { prisma } from '../../lib/prisma.js'
import { ok, created, errors, noContent } from '../../lib/api-response.js'
import { productCreateSchema, productUpdateSchema, variationUpdateSchema } from '../../validators/product.js'

export const adminProductsRouter: Router = Router()

// GET /api/admin/products — lista TUDO (inclui inativos)
adminProductsRouter.get('/', async (req, res, next) => {
  try {
    const page  = Math.max(1, Number(req.query.page  ?? 1))
    const limit = Math.min(100, Math.max(1, Number(req.query.limit ?? 20)))
    const onlyInactive = req.query.onlyInactive === 'true'

    const where: Prisma.ProductWhereInput = onlyInactive ? { isActive: false } : {}

    const [total, products] = await Promise.all([
      prisma.product.count({ where }),
      prisma.product.findMany({
        where,
        orderBy: { updatedAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        select: {
          id: true, slug: true, name: true,
          basePrice: true, isActive: true, isFeatured: true,
          brand:    { select: { name: true, slug: true } },
          category: { select: { name: true, slug: true } },
          _count:   { select: { variations: true } },
          variations: { select: { stock: true } },
          updatedAt: true,
        },
      }),
    ])

    return ok(res, products.map(p => ({
      id:          p.id,
      slug:        p.slug,
      name:        p.name,
      basePrice:   Number(p.basePrice),
      isActive:    p.isActive,
      isFeatured:  p.isFeatured,
      brand:       p.brand,
      category:    p.category,
      variationCount: p._count.variations,
      totalStock:  p.variations.reduce((acc, v) => acc + v.stock, 0),
      updatedAt:   p.updatedAt,
    })), { page, limit, total, totalPages: Math.ceil(total / limit) })
  } catch (err) {
    next(err)
  }
})

// POST /api/admin/products — cria produto com variações + imagens
adminProductsRouter.post('/', async (req, res, next) => {
  try {
    const body = productCreateSchema.parse(req.body)

    const product = await prisma.product.create({
      data: {
        slug:         body.slug,
        name:         body.name,
        description:  body.description,
        basePrice:    body.basePrice,
        comparePrice: body.comparePrice,
        brandId:      body.brandId,
        categoryId:   body.categoryId,
        isActive:     body.isActive,
        isFeatured:   body.isFeatured,
        measureTable: (body.measureTable ?? Prisma.JsonNull) as Prisma.InputJsonValue,
        variations: {
          create: body.variations.map(v => ({
            sku:           v.sku,
            size:          v.size,
            color:         v.color,
            colorHex:      v.colorHex,
            stock:         v.stock,
            priceOverride: v.priceOverride,
          })),
        },
        images: {
          create: body.images.map(i => ({
            url:       i.url,
            alt:       i.alt,
            sortOrder: i.sortOrder,
            isPrimary: i.isPrimary,
          })),
        },
      },
      select: { id: true, slug: true, name: true },
    })

    return created(res, product)
  } catch (err) {
    next(err)
  }
})

// GET /api/admin/products/:id — detalhe completo
adminProductsRouter.get('/:id', async (req, res, next) => {
  try {
    const product = await prisma.product.findUnique({
      where: { id: req.params.id },
      include: {
        brand:    true,
        category: true,
        variations: { orderBy: [{ color: 'asc' }, { size: 'asc' }] },
        images:     { orderBy: { sortOrder: 'asc' } },
      },
    })
    if (!product) throw errors.notFound('Produto não encontrado')

    return ok(res, {
      ...product,
      basePrice:    Number(product.basePrice),
      comparePrice: product.comparePrice == null ? null : Number(product.comparePrice),
      variations: product.variations.map(v => ({
        ...v,
        priceOverride: v.priceOverride == null ? null : Number(v.priceOverride),
      })),
    })
  } catch (err) { next(err) }
})

// PATCH /api/admin/products/:id — atualiza só o "miolo"
adminProductsRouter.patch('/:id', async (req, res, next) => {
  try {
    const body = productUpdateSchema.parse(req.body)
    const exists = await prisma.product.findUnique({ where: { id: req.params.id } })
    if (!exists) throw errors.notFound('Produto não encontrado')

    const { measureTable, ...rest } = body
    const data: Prisma.ProductUpdateInput = { ...rest }
    if (measureTable !== undefined) {
      data.measureTable = measureTable === null
        ? Prisma.JsonNull
        : (measureTable as Prisma.InputJsonValue)
    }

    const updated = await prisma.product.update({
      where: { id: exists.id },
      data,
      select: { id: true, slug: true, name: true, isActive: true },
    })
    return ok(res, updated)
  } catch (err) { next(err) }
})

// PATCH /api/admin/products/:id/variations/:vid — ajusta estoque/preço/etc
adminProductsRouter.patch('/:id/variations/:vid', async (req, res, next) => {
  try {
    const body = variationUpdateSchema.parse(req.body)
    const variation = await prisma.productVariation.findUnique({ where: { id: req.params.vid } })
    if (!variation || variation.productId !== req.params.id) {
      throw errors.notFound('Variação não encontrada')
    }
    const updated = await prisma.productVariation.update({
      where: { id: variation.id },
      data:  body,
    })
    return ok(res, {
      ...updated,
      priceOverride: updated.priceOverride == null ? null : Number(updated.priceOverride),
    })
  } catch (err) { next(err) }
})

// DELETE /api/admin/products/:id — soft delete (isActive=false)
adminProductsRouter.delete('/:id', async (req, res, next) => {
  try {
    const exists = await prisma.product.findUnique({ where: { id: req.params.id } })
    if (!exists) throw errors.notFound('Produto não encontrado')

    await prisma.product.update({
      where: { id: req.params.id },
      data:  { isActive: false },
    })
    return noContent(res)
  } catch (err) {
    next(err)
  }
})
