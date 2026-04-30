// Validadores pra imóveis (público + admin).
// Tipos write/read separados (memória 30-LICOES/31).
import { z } from 'zod'

export const ImovelTipoEnum = z.enum([
  'APARTAMENTO', 'CASA', 'COBERTURA', 'SOBRADO', 'TERRENO', 'COMERCIAL',
])

export const ImovelStatusEnum = z.enum([
  'DISPONIVEL', 'RESERVADO', 'EM_NEGOCIACAO', 'VENDIDO', 'INATIVO',
])

// Filtros do GET /api/imoveis (público)
export const listImoveisQuerySchema = z.object({
  page:     z.coerce.number().int().min(1).default(1),
  limit:    z.coerce.number().int().min(1).max(60).default(12),
  tipo:     ImovelTipoEnum.optional(),
  status:   ImovelStatusEnum.optional(),
  bairro:   z.string().trim().optional(),
  cidade:   z.string().trim().optional(),
  estado:   z.string().trim().length(2).optional(),
  precoMin: z.coerce.number().min(0).optional(),
  precoMax: z.coerce.number().min(0).optional(),
  quartosMin: z.coerce.number().int().min(0).optional(),
  destaque: z.coerce.boolean().optional(),
  search:   z.string().trim().min(1).optional(),
  // Ordenação
  sort:     z.enum(['recent', 'precoAsc', 'precoDesc', 'areaDesc']).default('recent'),
})

// Payload de escrita admin (POST/PATCH). Tudo opcional no PATCH (Partial<...>)
export const imovelWriteSchema = z.object({
  slug:       z.string().min(2).max(120)
                .regex(/^[a-z0-9-]+$/, 'Slug só pode ter minúsculas, números e hífen'),
  titulo:     z.string().min(2).max(160),
  descricao:  z.string().min(20).max(8000),
  tipo:       ImovelTipoEnum,
  status:     ImovelStatusEnum.optional(),
  preco:      z.coerce.number().positive(),
  precoSinal: z.coerce.number().positive().optional(),
  area:       z.coerce.number().positive(),
  areaTotal:  z.coerce.number().positive().optional(),
  quartos:    z.coerce.number().int().min(0),
  suites:     z.coerce.number().int().min(0).default(0),
  banheiros:  z.coerce.number().int().min(0),
  vagas:      z.coerce.number().int().min(0).default(0),
  endereco:   z.string().min(2).max(200),
  bairro:     z.string().min(2).max(100),
  cidade:     z.string().min(2).max(100),
  estado:     z.string().length(2),
  cep:        z.string().min(8).max(10),
  latitude:   z.coerce.number().min(-90).max(90),
  longitude:  z.coerce.number().min(-180).max(180),
  fotos:      z.array(z.string().url()).default([]),
  videoUrl:   z.string().url().optional(),
  tourUrl:    z.string().url().optional(),
  destaque:   z.boolean().default(false),
  novidade:   z.boolean().default(false),
  iptuAnual:  z.coerce.number().min(0).optional(),
  condominio: z.coerce.number().min(0).optional(),
  amenidades: z.array(z.string().min(1).max(50)).default([]),
})

export const imovelPatchSchema = imovelWriteSchema.partial()

export type ListImoveisQuery = z.infer<typeof listImoveisQuerySchema>
export type ImovelWritePayload = z.infer<typeof imovelWriteSchema>
export type ImovelPatchPayload = z.infer<typeof imovelPatchSchema>
