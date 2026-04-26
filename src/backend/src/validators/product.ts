import { z } from 'zod'

export const productListQuerySchema = z.object({
  // Filtros
  brand:      z.string().optional(),                              // slug da marca
  brands:     z.string().optional(),                              // CSV de slugs
  category:   z.string().optional(),                              // slug
  categories: z.string().optional(),
  size:       z.string().optional(),                              // single (compat)
  sizes:      z.string().optional(),                              // CSV (P,M,G)
  color:      z.string().optional(),                              // single (compat)
  colors:     z.string().optional(),                              // CSV (Vermelho,Azul)
  tags:       z.string().optional(),                              // CSV (novidade,promo)
  search:     z.string().min(1).max(100).optional(),
  minPrice:   z.coerce.number().nonnegative().optional(),
  maxPrice:   z.coerce.number().nonnegative().optional(),
  inStock:    z.coerce.boolean().optional(),
  onSale:     z.coerce.boolean().optional(),                      // só com comparePrice > basePrice

  // Ordenação
  sort:       z.enum([
    'newest', 'oldest', 'price_asc', 'price_desc', 'name_asc', 'name_desc', 'featured',
  ]).default('newest'),

  // Paginação
  page:       z.coerce.number().int().positive().default(1),
  limit:      z.coerce.number().int().positive().max(100).default(20),
}).strict()

export type ProductListQuery = z.infer<typeof productListQuerySchema>

// Tabela de medidas estruturada. Aceita formato {headers, rows} OU formato livre
// (legacy, produtos antigos podem ter shapes diferentes). passthrough = aceita
// chaves extras pra não quebrar dados pré-existentes.
const measureTableSchema = z.object({
  headers: z.array(z.string().min(1).max(40)).min(1).max(8),
  rows:    z.array(z.object({
    size:   z.string().min(1).max(20),
    values: z.record(z.string()),
  })).min(1).max(50),
}).passthrough()

// Tags livres do produto. Cada tag é kebab-friendly (lowercase, sem espaços
// nas pontas), 1-30 chars. Limite de 10 tags pra não virar bagunça.
const tagsArraySchema = z.array(z.string().trim().min(1).max(30)).max(10)

export const productCreateSchema = z.object({
  slug:         z.string().min(2).max(100).regex(/^[a-z0-9-]+$/, 'Slug deve ser kebab-case lowercase'),
  name:         z.string().min(2).max(200),
  description:  z.string().max(5000),
  basePrice:    z.coerce.number().positive(),
  comparePrice: z.coerce.number().positive().optional(),
  brandId:      z.string().min(1),
  categoryId:   z.string().min(1),
  isActive:     z.boolean().default(true),
  isFeatured:   z.boolean().default(false),
  measureTable: measureTableSchema.optional(),
  tags:         tagsArraySchema.default([]),
  variations:   z.array(z.object({
    sku:           z.string().min(1).max(100),
    size:          z.string().min(1).max(20),
    color:         z.string().min(1).max(50),
    colorHex:      z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
    stock:         z.coerce.number().int().nonnegative().default(0),
    priceOverride: z.coerce.number().positive().optional(),
  })).min(1, 'Produto precisa ter pelo menos 1 variação'),
  images:       z.array(z.object({
    url:       z.string().min(1),  // aceita URL absoluta ou path relativo (/products/foo.jpg)
    alt:       z.string().optional(),
    sortOrder: z.coerce.number().int().nonnegative().default(0),
    isPrimary: z.boolean().default(false),
  })).default([]),
}).strict()

export type ProductCreateInput = z.infer<typeof productCreateSchema>

// Update parcial — só campos do produto (variations/images têm endpoints próprios)
export const productUpdateSchema = z.object({
  name:         z.string().min(2).max(200).optional(),
  slug:         z.string().min(2).max(100).regex(/^[a-z0-9-]+$/).optional(),
  description:  z.string().max(5000).optional(),
  basePrice:    z.coerce.number().positive().optional(),
  comparePrice: z.coerce.number().positive().nullable().optional(),
  brandId:      z.string().min(1).optional(),
  categoryId:   z.string().min(1).optional(),
  isActive:     z.boolean().optional(),
  isFeatured:   z.boolean().optional(),
  metaTitle:    z.string().max(160).nullable().optional(),
  metaDesc:     z.string().max(320).nullable().optional(),
  measureTable: measureTableSchema.nullable().optional(),
  tags:         tagsArraySchema.optional(),
}).strict()
export type ProductUpdateInput = z.infer<typeof productUpdateSchema>

// Input pra adicionar imagem isolada num produto existente
export const imageInputSchema = z.object({
  url:            z.string().min(1).max(2000),  // path relativo ou URL absoluta
  alt:            z.string().max(200).optional(),
  sortOrder:      z.coerce.number().int().nonnegative().default(0),
  isPrimary:      z.boolean().default(false),
  variationColor: z.string().max(50).nullable().optional(),
}).strict()
export type ImageInput = z.infer<typeof imageInputSchema>

// Bulk action — ativa/desativa/destaca/remove destaque em batch
export const productBulkActionSchema = z.object({
  ids:    z.array(z.string().min(1)).min(1, 'Informe pelo menos 1 produto').max(500),
  action: z.enum(['activate', 'deactivate', 'feature', 'unfeature']),
}).strict()
export type ProductBulkActionInput = z.infer<typeof productBulkActionSchema>

// Update de variação individual
export const variationUpdateSchema = z.object({
  size:          z.string().min(1).max(20).optional(),
  color:         z.string().min(1).max(50).optional(),
  colorHex:      z.string().regex(/^#[0-9A-Fa-f]{6}$/).nullable().optional(),
  stock:         z.coerce.number().int().nonnegative().optional(),
  priceOverride: z.coerce.number().positive().nullable().optional(),
  isActive:      z.boolean().optional(),
}).strict()
export type VariationUpdateInput = z.infer<typeof variationUpdateSchema>
