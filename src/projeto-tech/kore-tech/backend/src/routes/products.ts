import { Router } from 'express'
import type { Prisma } from '@prisma/client'
import { prisma } from '../lib/prisma.js'
import { ok, errors } from '../lib/api-response.js'
import { productListQuerySchema } from '../validators/product.js'

export const productsRouter: Router = Router()

function csvList(s?: string): string[] | undefined {
  if (!s) return undefined
  const arr = s.split(',').map(x => x.trim()).filter(Boolean)
  return arr.length ? arr : undefined
}

// =====================================================================
// GET /api/products — lista com filtros + paginação
// Filtros: brand, brands, category, categories, size, color, search,
//          minPrice, maxPrice, inStock, onSale, tags
// Filtros HARDWARE: buildType, hardwareCategory, persona
// Sort: newest|oldest|price_asc|price_desc|name_asc|name_desc|featured
// =====================================================================
productsRouter.get('/', async (req, res, next) => {
  try {
    const q = productListQuerySchema.parse(req.query)

    const brandSlugs    = csvList(q.brands)     ?? (q.brand    ? [q.brand]    : undefined)
    const categorySlugs = csvList(q.categories) ?? (q.category ? [q.category] : undefined)

    const where: Prisma.ProductWhereInput = { isActive: true }
    if (brandSlugs)    where.brand    = { slug: { in: brandSlugs } }
    if (categorySlugs) where.category = { slug: { in: categorySlugs } }
    if (q.buildType)        where.buildType = q.buildType
    if (q.hardwareCategory) where.hardwareCategory = q.hardwareCategory
    if (q.persona)          where.personaSlug = q.persona

    const tagList = csvList(q.tags)
    if (tagList) where.tags = { hasSome: tagList }
    if (q.search) {
      where.OR = [
        { name:        { contains: q.search, mode: 'insensitive' } },
        { description: { contains: q.search, mode: 'insensitive' } },
      ]
    }
    if (q.minPrice !== undefined || q.maxPrice !== undefined) {
      where.basePrice = {}
      if (q.minPrice !== undefined) where.basePrice.gte = q.minPrice
      if (q.maxPrice !== undefined) where.basePrice.lte = q.maxPrice
    }
    const sizeList  = csvList(q.sizes)  ?? (q.size  ? [q.size]  : undefined)
    const colorList = csvList(q.colors) ?? (q.color ? [q.color] : undefined)
    if (sizeList || colorList || q.inStock) {
      where.variations = {
        some: {
          isActive: true,
          ...(sizeList  ? { size:  { in: sizeList,  mode: 'insensitive' as const } } : {}),
          ...(colorList ? { color: { in: colorList, mode: 'insensitive' as const } } : {}),
          ...(q.inStock ? { stock: { gt: 0 } } : {}),
        },
      }
    }
    if (q.onSale) {
      where.comparePrice = { not: null }
    }

    const orderBy: Prisma.ProductOrderByWithRelationInput[] = (() => {
      switch (q.sort) {
        case 'oldest':     return [{ createdAt: 'asc' }]
        case 'price_asc':  return [{ basePrice: 'asc' }]
        case 'price_desc': return [{ basePrice: 'desc' }]
        case 'name_asc':   return [{ name: 'asc' }]
        case 'name_desc':  return [{ name: 'desc' }]
        case 'featured':   return [{ isFeatured: 'desc' }, { createdAt: 'desc' }]
        default:           return [{ createdAt: 'desc' }]
      }
    })()

    const [total, products] = await Promise.all([
      prisma.product.count({ where }),
      prisma.product.findMany({
        where,
        orderBy,
        skip: (q.page - 1) * q.limit,
        take: q.limit,
        select: {
          id: true, slug: true, name: true,
          basePrice: true, comparePrice: true,
          isFeatured: true,
          buildType: true, hardwareCategory: true, personaSlug: true,
          benchmarkFps: true,
          brand:    { select: { id: true, slug: true, name: true } },
          category: { select: { id: true, slug: true, name: true } },
          images: {
            where: { isPrimary: true },
            take: 1,
            select: { url: true, alt: true },
          },
          variations: {
            where: { isActive: true },
            select: { size: true, color: true, colorHex: true, stock: true },
          },
        },
      }),
    ])

    const data = products.map(p => ({
      id:           p.id,
      slug:         p.slug,
      name:         p.name,
      basePrice:    Number(p.basePrice),
      comparePrice: p.comparePrice ? Number(p.comparePrice) : null,
      isFeatured:   p.isFeatured,
      buildType:        p.buildType,
      hardwareCategory: p.hardwareCategory,
      personaSlug:      p.personaSlug,
      benchmarkFps:     p.benchmarkFps ?? null,
      brand:        p.brand,
      category:     p.category,
      primaryImage: p.images[0] ?? null,
      sizes:        Array.from(new Set(p.variations.map(v => v.size))),
      colors:       Array.from(new Map(p.variations.map(v => [v.color, v.colorHex])).entries())
                      .map(([color, hex]) => ({ color, hex })),
      totalStock:   p.variations.reduce((acc, v) => acc + v.stock, 0),
    }))

    return ok(res, data, {
      page:       q.page,
      limit:      q.limit,
      total,
      totalPages: Math.ceil(total / q.limit),
    })
  } catch (err) {
    next(err)
  }
})

// =====================================================================
// GET /api/products/by-persona/:slug — produtos (PCs montados) da persona.
// =====================================================================
productsRouter.get('/by-persona/:slug', async (req, res, next) => {
  try {
    const personaSlug = req.params.slug
    const persona = await prisma.persona.findUnique({ where: { slug: personaSlug } })
    if (!persona || !persona.isActive) throw errors.notFound('Persona não encontrada')

    const products = await prisma.product.findMany({
      where: { isActive: true, personaSlug },
      orderBy: [{ isFeatured: 'desc' }, { basePrice: 'asc' }],
      select: {
        id: true, slug: true, name: true,
        basePrice: true, comparePrice: true,
        isFeatured: true, buildType: true,
        benchmarkFps: true, specs: true,
        brand:    { select: { id: true, slug: true, name: true } },
        category: { select: { id: true, slug: true, name: true } },
        images: {
          where: { isPrimary: true },
          take: 1,
          select: { url: true, alt: true },
        },
        variations: {
          where: { isActive: true },
          select: { stock: true },
        },
      },
    })

    return ok(res, {
      persona: {
        id:          persona.id,
        slug:        persona.slug,
        name:        persona.name,
        headline:    persona.headline,
        subheadline: persona.subheadline,
        targetGames: persona.targetGames,
        targetFps:   persona.targetFps,
        heroImage:   persona.heroImage,
      },
      products: products.map(p => ({
        id:           p.id,
        slug:         p.slug,
        name:         p.name,
        basePrice:    Number(p.basePrice),
        comparePrice: p.comparePrice ? Number(p.comparePrice) : null,
        isFeatured:   p.isFeatured,
        buildType:    p.buildType,
        benchmarkFps: p.benchmarkFps ?? null,
        specs:        p.specs ?? null,
        brand:        p.brand,
        category:     p.category,
        primaryImage: p.images[0] ?? null,
        totalStock:   p.variations.reduce((acc, v) => acc + v.stock, 0),
      })),
    })
  } catch (err) { next(err) }
})

// =====================================================================
// GET /api/products/:slug — produto único com tudo (variações, imagens)
// =====================================================================
productsRouter.get('/:slug', async (req, res, next) => {
  try {
    const product = await prisma.product.findUnique({
      where: { slug: req.params.slug },
      select: {
        id: true, slug: true, name: true, description: true,
        basePrice: true, comparePrice: true,
        isActive: true, isFeatured: true,
        metaTitle: true, metaDesc: true,
        buildType: true, hardwareCategory: true, personaSlug: true,
        specs: true, compatibility: true, benchmarkFps: true,
        weightGrams: true, dimensionsMm: true, warrantyMonths: true,
        brand:    { select: { id: true, slug: true, name: true, logoUrl: true } },
        category: { select: { id: true, slug: true, name: true } },
        persona:  { select: { id: true, slug: true, name: true, headline: true, iconEmoji: true } },
        variations: {
          where: { isActive: true },
          orderBy: [{ size: 'asc' }, { color: 'asc' }],
          select: {
            id: true, sku: true, size: true, color: true, colorHex: true,
            stock: true, priceOverride: true,
          },
        },
        images: {
          orderBy: [{ isPrimary: 'desc' }, { sortOrder: 'asc' }],
          select: { id: true, url: true, alt: true, sortOrder: true, isPrimary: true, variationColor: true },
        },
      },
    })
    if (!product || !product.isActive) throw errors.notFound('Produto não encontrado')

    return ok(res, {
      ...product,
      basePrice:    Number(product.basePrice),
      comparePrice: product.comparePrice ? Number(product.comparePrice) : null,
      variations:   product.variations.map(v => ({
        ...v,
        priceOverride: v.priceOverride ? Number(v.priceOverride) : null,
      })),
    })
  } catch (err) {
    next(err)
  }
})

// =====================================================================
// GET /api/products/:slug/related — cross-sell por categoria + marca
// =====================================================================
productsRouter.get('/:slug/related', async (req, res, next) => {
  try {
    const limit = Math.min(20, Math.max(1, Number(req.query.limit ?? 4)))

    const base = await prisma.product.findUnique({
      where: { slug: req.params.slug },
      select: { id: true, brandId: true, categoryId: true, hardwareCategory: true, personaSlug: true, buildType: true },
    })
    if (!base) throw errors.notFound('Produto não encontrado')

    const baseSelect = {
      id: true, slug: true, name: true,
      basePrice: true, comparePrice: true, isFeatured: true,
      buildType: true, hardwareCategory: true, personaSlug: true,
      benchmarkFps: true,
      brand:    { select: { id: true, slug: true, name: true } },
      category: { select: { id: true, slug: true, name: true } },
      variations: { select: { stock: true, color: true, colorHex: true, size: true } },
      images: { where: { isPrimary: true }, take: 1, select: { url: true, alt: true } },
    } satisfies Prisma.ProductSelect

    // Pra PC montado: relaciona outros PCs da mesma persona primeiro.
    // Pra componente: mesma hardwareCategory + mesma marca.
    type RelatedRow = Prisma.ProductGetPayload<{ select: typeof baseSelect }>
    let result: RelatedRow[] = []
    if (base.buildType === 'pc_pronto' && base.personaSlug) {
      result = await prisma.product.findMany({
        where: {
          isActive: true, id: { not: base.id },
          personaSlug: base.personaSlug, buildType: 'pc_pronto',
        },
        orderBy: [{ isFeatured: 'desc' }, { updatedAt: 'desc' }],
        take: limit,
        select: baseSelect,
      })
    } else {
      const sameCatBrand = await prisma.product.findMany({
        where: {
          isActive: true, id: { not: base.id },
          brandId: base.brandId, hardwareCategory: base.hardwareCategory,
        },
        orderBy: [{ isFeatured: 'desc' }, { updatedAt: 'desc' }],
        take: limit,
        select: baseSelect,
      })
      result = sameCatBrand
      if (result.length < limit) {
        const more = await prisma.product.findMany({
          where: {
            isActive: true, id: { notIn: [base.id, ...sameCatBrand.map(p => p.id)] },
            hardwareCategory: base.hardwareCategory,
          },
          orderBy: [{ isFeatured: 'desc' }, { updatedAt: 'desc' }],
          take: limit - result.length,
          select: baseSelect,
        })
        result = [...result, ...more]
      }
    }

    return ok(res, result.map(p => ({
      id:           p.id,
      slug:         p.slug,
      name:         p.name,
      basePrice:    Number(p.basePrice),
      comparePrice: p.comparePrice ? Number(p.comparePrice) : null,
      isFeatured:   p.isFeatured,
      buildType:        p.buildType,
      hardwareCategory: p.hardwareCategory,
      personaSlug:      p.personaSlug,
      benchmarkFps:     p.benchmarkFps ?? null,
      brand:        p.brand,
      category:     p.category,
      primaryImage: p.images[0] ?? null,
      sizes:        Array.from(new Set(p.variations.map(v => v.size))),
      colors:       Array.from(new Map(p.variations.map(v => [v.color, { color: v.color, hex: v.colorHex }])).values()),
      totalStock:   p.variations.reduce((acc, v) => acc + v.stock, 0),
    })))
  } catch (err) {
    next(err)
  }
})
