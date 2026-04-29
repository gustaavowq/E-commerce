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
// Filtros suportados: brand, brands (CSV), category, categories (CSV),
// size, color, search, minPrice, maxPrice, inStock
// Ordenação: sort=newest|oldest|price_asc|price_desc|name_asc|name_desc|featured
// Paginação: page, limit (default 20, max 100)
// =====================================================================
productsRouter.get('/', async (req, res, next) => {
  try {
    const q = productListQuerySchema.parse(req.query)

    const brandSlugs    = csvList(q.brands)    ?? (q.brand    ? [q.brand]    : undefined)
    const categorySlugs = csvList(q.categories) ?? (q.category ? [q.category] : undefined)

    const where: Prisma.ProductWhereInput = {
      isActive: true,
    }
    if (brandSlugs)    where.brand    = { slug: { in: brandSlugs } }
    if (categorySlugs) where.category = { slug: { in: categorySlugs } }
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
    // "Em promoção" = comparePrice setado e > basePrice
    if (q.onSale) {
      // Prisma 5 não tem comparação coluna-coluna nativa em where simples,
      // então usa NOT null + filter posterior. Pra MVP: só comparePrice not null.
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
      brand:        p.brand,
      category:     p.category,
      primaryImage: p.images[0] ?? null,
      // Resumo das variações disponíveis
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
        measureTable: true,
        metaTitle: true, metaDesc: true,
        brand:    { select: { id: true, slug: true, name: true, logoUrl: true } },
        category: { select: { id: true, slug: true, name: true } },
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
// GET /api/products/:slug/related — "Quem viu também levou" (cross-sell)
// Mesma categoria + mesma marca primeiro; completa com mesma categoria.
// =====================================================================
productsRouter.get('/:slug/related', async (req, res, next) => {
  try {
    const limit = Math.min(20, Math.max(1, Number(req.query.limit ?? 4)))

    const base = await prisma.product.findUnique({
      where: { slug: req.params.slug },
      select: { id: true, brandId: true, categoryId: true },
    })
    if (!base) throw errors.notFound('Produto não encontrado')

    const baseSelect = {
      id: true, slug: true, name: true,
      basePrice: true, comparePrice: true, isFeatured: true,
      brand:    { select: { id: true, slug: true, name: true } },
      category: { select: { id: true, slug: true, name: true } },
      variations: { select: { stock: true, color: true, colorHex: true, size: true } },
      images: { where: { isPrimary: true }, take: 1, select: { url: true, alt: true } },
    } satisfies Prisma.ProductSelect

    // 1) Mesma categoria + marca, sem o próprio
    const sameBrand = await prisma.product.findMany({
      where: {
        isActive: true, id: { not: base.id },
        brandId: base.brandId, categoryId: base.categoryId,
      },
      orderBy: [{ isFeatured: 'desc' }, { updatedAt: 'desc' }],
      take: limit,
      select: baseSelect,
    })

    let result = sameBrand
    if (result.length < limit) {
      // 2) Completa com mesma categoria (qualquer marca)
      const more = await prisma.product.findMany({
        where: {
          isActive: true, id: { notIn: [base.id, ...sameBrand.map(p => p.id)] },
          categoryId: base.categoryId,
        },
        orderBy: [{ isFeatured: 'desc' }, { updatedAt: 'desc' }],
        take: limit - result.length,
        select: baseSelect,
      })
      result = [...result, ...more]
    }

    return ok(res, result.map(p => ({
      id:           p.id,
      slug:         p.slug,
      name:         p.name,
      basePrice:    Number(p.basePrice),
      comparePrice: p.comparePrice ? Number(p.comparePrice) : null,
      isFeatured:   p.isFeatured,
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
