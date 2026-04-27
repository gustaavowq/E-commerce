import { z } from 'zod'

// JSON livre (objeto) usado pra specs/compatibility/benchmarkFps. Sem schema
// rígido pra não amarrar evolução do catálogo. Validação deeper acontece no
// uso (motor de compatibilidade lê chaves específicas).
const jsonObject = z.record(z.unknown()).optional()

export const productListQuerySchema = z.object({
  // Filtros básicos
  brand:      z.string().optional(),                              // slug da marca
  brands:     z.string().optional(),                              // CSV de slugs
  category:   z.string().optional(),                              // slug
  categories: z.string().optional(),
  size:       z.string().optional(),
  sizes:      z.string().optional(),
  color:      z.string().optional(),
  colors:     z.string().optional(),
  tags:       z.string().optional(),
  search:     z.string().min(1).max(100).optional(),
  minPrice:   z.coerce.number().nonnegative().optional(),
  maxPrice:   z.coerce.number().nonnegative().optional(),
  inStock:    z.coerce.boolean().optional(),
  onSale:     z.coerce.boolean().optional(),

  // Filtros de hardware
  buildType:        z.enum(['componente', 'pc_pronto', 'monitor', 'periferico']).optional(),
  hardwareCategory: z.string().optional(),  // 'cpu' | 'gpu' | 'ram' | ...
  persona:          z.string().optional(),  // slug da persona

  // Ordenação
  sort: z.enum([
    'newest', 'oldest', 'price_asc', 'price_desc', 'name_asc', 'name_desc', 'featured',
  ]).default('newest'),

  // Paginação
  page:  z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
}).strict()

export type ProductListQuery = z.infer<typeof productListQuerySchema>

const tagsArraySchema = z.array(z.string().trim().min(1).max(30)).max(10)

export const productCreateSchema = z.object({
  slug:         z.string().min(2).max(100).regex(/^[a-z0-9-]+$/, 'Slug deve ser kebab-case lowercase'),
  name:         z.string().min(2).max(200),
  description:  z.string().max(8000),
  basePrice:    z.coerce.number().positive(),
  comparePrice: z.coerce.number().positive().optional(),
  brandId:      z.string().min(1),
  categoryId:   z.string().min(1),
  isActive:     z.boolean().default(true),
  isFeatured:   z.boolean().default(false),
  tags:         tagsArraySchema.default([]),

  // Campos de hardware
  buildType:        z.enum(['componente', 'pc_pronto', 'monitor', 'periferico']).optional(),
  hardwareCategory: z.string().min(1).max(40).default('componente'),
  personaSlug:      z.string().min(2).max(60).nullable().optional(),
  specs:            jsonObject,
  compatibility:    jsonObject,
  benchmarkFps:     jsonObject,
  weightGrams:      z.coerce.number().int().nonnegative().nullable().optional(),
  dimensionsMm:     jsonObject,
  warrantyMonths:   z.coerce.number().int().min(0).max(120).default(12),

  variations:   z.array(z.object({
    sku:           z.string().min(1).max(100),
    size:          z.string().min(1).max(40),
    color:         z.string().max(50),  // pode ser '' em hardware
    colorHex:      z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
    stock:         z.coerce.number().int().nonnegative().default(0),
    priceOverride: z.coerce.number().positive().optional(),
  })).min(1, 'Produto precisa ter pelo menos 1 variação'),
  images:       z.array(z.object({
    url:       z.string().min(1),
    alt:       z.string().optional(),
    sortOrder: z.coerce.number().int().nonnegative().default(0),
    isPrimary: z.boolean().default(false),
  })).default([]),
}).strict()

export type ProductCreateInput = z.infer<typeof productCreateSchema>

export const productUpdateSchema = z.object({
  name:         z.string().min(2).max(200).optional(),
  slug:         z.string().min(2).max(100).regex(/^[a-z0-9-]+$/).optional(),
  description:  z.string().max(8000).optional(),
  basePrice:    z.coerce.number().positive().optional(),
  comparePrice: z.coerce.number().positive().nullable().optional(),
  brandId:      z.string().min(1).optional(),
  categoryId:   z.string().min(1).optional(),
  isActive:     z.boolean().optional(),
  isFeatured:   z.boolean().optional(),
  metaTitle:    z.string().max(160).nullable().optional(),
  metaDesc:     z.string().max(320).nullable().optional(),
  tags:         tagsArraySchema.optional(),

  buildType:        z.enum(['componente', 'pc_pronto', 'monitor', 'periferico']).nullable().optional(),
  hardwareCategory: z.string().min(1).max(40).optional(),
  personaSlug:      z.string().min(2).max(60).nullable().optional(),
  specs:            jsonObject.nullable(),
  compatibility:    jsonObject.nullable(),
  benchmarkFps:     jsonObject.nullable(),
  weightGrams:      z.coerce.number().int().nonnegative().nullable().optional(),
  dimensionsMm:     jsonObject.nullable(),
  warrantyMonths:   z.coerce.number().int().min(0).max(120).optional(),
}).strict()
export type ProductUpdateInput = z.infer<typeof productUpdateSchema>

export const imageInputSchema = z.object({
  url:            z.string().min(1).max(2000),
  alt:            z.string().max(200).optional(),
  sortOrder:      z.coerce.number().int().nonnegative().default(0),
  isPrimary:      z.boolean().default(false),
  variationColor: z.string().max(50).nullable().optional(),
}).strict()
export type ImageInput = z.infer<typeof imageInputSchema>

export const productBulkActionSchema = z.object({
  ids:    z.array(z.string().min(1)).min(1, 'Informe pelo menos 1 produto').max(500),
  action: z.enum(['activate', 'deactivate', 'feature', 'unfeature']),
}).strict()
export type ProductBulkActionInput = z.infer<typeof productBulkActionSchema>

export const variationUpdateSchema = z.object({
  size:          z.string().min(1).max(40).optional(),
  color:         z.string().max(50).optional(),
  colorHex:      z.string().regex(/^#[0-9A-Fa-f]{6}$/).nullable().optional(),
  stock:         z.coerce.number().int().nonnegative().optional(),
  priceOverride: z.coerce.number().positive().nullable().optional(),
  isActive:      z.boolean().optional(),
}).strict()
export type VariationUpdateInput = z.infer<typeof variationUpdateSchema>
