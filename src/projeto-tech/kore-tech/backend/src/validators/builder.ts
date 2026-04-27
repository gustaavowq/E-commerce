import { z } from 'zod'

// Aceita IDs vazios/nulos pra permitir checagem progressiva: cliente seleciona
// CPU primeiro, depois mobo, depois RAM... A cada add o front bate na rota
// e mostra status atual.
export const buildPartsSchema = z.object({
  cpuId:      z.string().min(1).nullable().optional(),
  moboId:     z.string().min(1).nullable().optional(),
  ramIds:     z.array(z.string().min(1)).max(8).optional(),
  gpuId:      z.string().min(1).nullable().optional(),
  psuId:      z.string().min(1).nullable().optional(),
  caseId:     z.string().min(1).nullable().optional(),
  coolerId:   z.string().min(1).nullable().optional(),
  storageIds: z.array(z.string().min(1)).max(8).optional(),
})

export const checkCompatibilitySchema = z.object({
  parts: buildPartsSchema,
}).strict()

export const recommendPsuSchema = z.object({
  parts: buildPartsSchema,
  limit: z.coerce.number().int().min(1).max(10).optional(),
}).strict()

export const buildSaveSchema = z.object({
  name:      z.string().min(2).max(100).optional(),
  parts:     buildPartsSchema,
  isPublic:  z.boolean().default(false),
}).strict()

export const buildUpdateSchema = z.object({
  name:      z.string().min(2).max(100).optional(),
  parts:     buildPartsSchema.optional(),
  isPublic:  z.boolean().optional(),
}).strict().refine(
  d => Object.keys(d).length > 0,
  { message: 'Informe pelo menos 1 campo pra atualizar' },
)

export type BuildPartsInput          = z.infer<typeof buildPartsSchema>
export type CheckCompatibilityInput  = z.infer<typeof checkCompatibilitySchema>
export type RecommendPsuInput        = z.infer<typeof recommendPsuSchema>
export type BuildSaveInput           = z.infer<typeof buildSaveSchema>
export type BuildUpdateInput         = z.infer<typeof buildUpdateSchema>
