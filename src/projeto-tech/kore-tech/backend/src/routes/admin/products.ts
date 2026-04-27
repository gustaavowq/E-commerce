// CRUD de produtos pro painel admin.
// Diferente das rotas públicas: lista inativos, permite criar/atualizar/deletar.
import { Router } from 'express'
import { Prisma } from '@prisma/client'
import { prisma } from '../../lib/prisma.js'
import { ok, created, errors, noContent } from '../../lib/api-response.js'
import {
  productCreateSchema, productUpdateSchema, variationUpdateSchema,
  imageInputSchema, productBulkActionSchema,
} from '../../validators/product.js'

export const adminProductsRouter: Router = Router()

adminProductsRouter.get('/', async (req, res, next) => {
  try {
    const page  = Math.max(1, Number(req.query.page  ?? 1))
    const limit = Math.min(100, Math.max(1, Number(req.query.limit ?? 20)))

    const status   = String(req.query.status   ?? '')
    const featured = String(req.query.featured ?? '')
    const brandSlug    = String(req.query.brand    ?? '').trim()
    const categorySlug = String(req.query.category ?? '').trim()
    const buildType    = String(req.query.buildType ?? '').trim()
    const hardwareCat  = String(req.query.hardwareCategory ?? '').trim()
    const stock    = String(req.query.stock ?? '')
    const search   = String(req.query.search ?? '').trim()

    const where: Prisma.ProductWhereInput = {}
    if (status === 'active')   where.isActive = true
    if (status === 'inactive') where.isActive = false
    if (featured === 'yes')    where.isFeatured = true
    if (featured === 'no')     where.isFeatured = false
    if (brandSlug)             where.brand    = { slug: brandSlug }
    if (categorySlug)          where.category = { slug: categorySlug }
    if (buildType)             where.buildType = buildType
    if (hardwareCat)           where.hardwareCategory = hardwareCat
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { slug: { contains: search, mode: 'insensitive' } },
        { variations: { some: { sku: { contains: search, mode: 'insensitive' } } } },
      ]
    }

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
          buildType: true, hardwareCategory: true, personaSlug: true,
          brand:    { select: { name: true, slug: true } },
          category: { select: { name: true, slug: true } },
          _count:   { select: { variations: true } },
          variations: { select: { stock: true } },
          images:   { where: { isPrimary: true }, take: 1, select: { url: true } },
          updatedAt: true,
        },
      }),
    ])

    let filtered = products
    if (stock === 'zero') filtered = products.filter(p => p.variations.reduce((s, v) => s + v.stock, 0) === 0)
    if (stock === 'low')  filtered = products.filter(p => {
      const t = p.variations.reduce((s, v) => s + v.stock, 0)
      return t > 0 && t <= 5
    })
    if (stock === 'ok')   filtered = products.filter(p => p.variations.reduce((s, v) => s + v.stock, 0) > 5)

    return ok(res, filtered.map(p => ({
      id:          p.id,
      slug:        p.slug,
      name:        p.name,
      basePrice:   Number(p.basePrice),
      isActive:    p.isActive,
      isFeatured:  p.isFeatured,
      buildType:        p.buildType,
      hardwareCategory: p.hardwareCategory,
      personaSlug:      p.personaSlug,
      brand:       p.brand,
      category:    p.category,
      variationCount: p._count.variations,
      totalStock:  p.variations.reduce((acc, v) => acc + v.stock, 0),
      thumbnail:   p.images[0]?.url ?? null,
      updatedAt:   p.updatedAt,
    })), { page, limit, total, totalPages: Math.ceil(total / limit) })
  } catch (err) {
    next(err)
  }
})

adminProductsRouter.patch('/bulk', async (req, res, next) => {
  try {
    const body = productBulkActionSchema.parse(req.body)
    const data: Prisma.ProductUpdateManyMutationInput =
      body.action === 'activate'   ? { isActive: true }   :
      body.action === 'deactivate' ? { isActive: false }  :
      body.action === 'feature'    ? { isFeatured: true } :
                                     { isFeatured: false }

    const r = await prisma.product.updateMany({
      where: { id: { in: body.ids } },
      data,
    })
    return ok(res, { updated: r.count })
  } catch (err) { next(err) }
})

adminProductsRouter.get('/issues', async (_req, res, next) => {
  try {
    const all = await prisma.product.findMany({
      where: { isActive: true },
      select: {
        id: true, slug: true, name: true, description: true,
        buildType: true, hardwareCategory: true,
        compatibility: true,
        brand:    { select: { name: true, slug: true } },
        category: { select: { name: true, slug: true } },
        _count:   { select: { images: true } },
        variations: { select: { stock: true } },
      },
    })
    const noImage       = all.filter(p => p._count.images === 0).slice(0, 10)
    const noDescription = all.filter(p => !p.description || p.description.trim().length < 30).slice(0, 10)
    const outOfStock    = all.filter(p => p.variations.reduce((s, v) => s + v.stock, 0) === 0).slice(0, 10)
    // Crítico em hardware: componente sem `compatibility` JSON quebra builder
    const componentNoCompat = all.filter(p =>
      p.buildType === 'componente' &&
      (p.compatibility === null || (typeof p.compatibility === 'object' && Object.keys(p.compatibility as object).length === 0))
    ).slice(0, 10)

    function pick(p: typeof all[number]) {
      return { id: p.id, slug: p.slug, name: p.name, brand: p.brand, category: p.category, hardwareCategory: p.hardwareCategory }
    }
    return ok(res, {
      noImage:             noImage.map(pick),
      noDescription:       noDescription.map(pick),
      outOfStock:          outOfStock.map(pick),
      componentNoCompat:   componentNoCompat.map(pick),
    })
  } catch (err) { next(err) }
})

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
        tags:         body.tags,
        buildType:        body.buildType,
        hardwareCategory: body.hardwareCategory,
        personaSlug:      body.personaSlug,
        specs:         (body.specs         ?? Prisma.JsonNull) as Prisma.InputJsonValue,
        compatibility: (body.compatibility ?? Prisma.JsonNull) as Prisma.InputJsonValue,
        benchmarkFps:  (body.benchmarkFps  ?? Prisma.JsonNull) as Prisma.InputJsonValue,
        weightGrams:   body.weightGrams,
        dimensionsMm:  (body.dimensionsMm  ?? Prisma.JsonNull) as Prisma.InputJsonValue,
        warrantyMonths: body.warrantyMonths,
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

adminProductsRouter.get('/:id', async (req, res, next) => {
  try {
    const product = await prisma.product.findUnique({
      where: { id: req.params.id },
      include: {
        brand:    true,
        category: true,
        persona:  true,
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

adminProductsRouter.patch('/:id', async (req, res, next) => {
  try {
    const body = productUpdateSchema.parse(req.body)
    const exists = await prisma.product.findUnique({ where: { id: req.params.id } })
    if (!exists) throw errors.notFound('Produto não encontrado')

    const { specs, compatibility, benchmarkFps, dimensionsMm, ...rest } = body
    const data: Prisma.ProductUpdateInput = { ...rest }
    if (specs !== undefined) {
      data.specs = specs === null ? Prisma.JsonNull : (specs as Prisma.InputJsonValue)
    }
    if (compatibility !== undefined) {
      data.compatibility = compatibility === null ? Prisma.JsonNull : (compatibility as Prisma.InputJsonValue)
    }
    if (benchmarkFps !== undefined) {
      data.benchmarkFps = benchmarkFps === null ? Prisma.JsonNull : (benchmarkFps as Prisma.InputJsonValue)
    }
    if (dimensionsMm !== undefined) {
      data.dimensionsMm = dimensionsMm === null ? Prisma.JsonNull : (dimensionsMm as Prisma.InputJsonValue)
    }

    const updated = await prisma.product.update({
      where: { id: exists.id },
      data,
      select: { id: true, slug: true, name: true, isActive: true },
    })
    return ok(res, updated)
  } catch (err) { next(err) }
})

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

adminProductsRouter.post('/:id/images', async (req, res, next) => {
  try {
    const body = imageInputSchema.parse(req.body)
    const product = await prisma.product.findUnique({ where: { id: req.params.id } })
    if (!product) throw errors.notFound('Produto não encontrado')

    if (body.isPrimary) {
      await prisma.productImage.updateMany({
        where: { productId: product.id, isPrimary: true },
        data:  { isPrimary: false },
      })
    }

    const image = await prisma.productImage.create({
      data: {
        productId: product.id,
        url:       body.url,
        alt:       body.alt,
        sortOrder: body.sortOrder,
        isPrimary: body.isPrimary,
        variationColor: body.variationColor ?? null,
      },
    })
    return created(res, image)
  } catch (err) { next(err) }
})

adminProductsRouter.delete('/:id/images/:imgId', async (req, res, next) => {
  try {
    const image = await prisma.productImage.findUnique({ where: { id: req.params.imgId } })
    if (!image || image.productId !== req.params.id) {
      throw errors.notFound('Imagem não encontrada')
    }
    await prisma.productImage.delete({ where: { id: image.id } })
    return noContent(res)
  } catch (err) { next(err) }
})

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
