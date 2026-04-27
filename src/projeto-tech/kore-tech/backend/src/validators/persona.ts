import { z } from 'zod'

const jsonObject = z.record(z.unknown()).optional()

export const personaCreateSchema = z.object({
  slug:        z.string().min(2).max(60).regex(/^[a-z0-9-]+$/, 'Slug deve ser kebab-case'),
  name:        z.string().min(2).max(120),
  headline:    z.string().max(200).optional(),
  subheadline: z.string().max(500).optional(),
  description: z.string().max(5000).optional(),
  targetGames: z.array(z.string().max(80)).max(20).optional(),
  targetFps:   jsonObject,
  heroImage:   z.string().max(2000).optional(),
  iconEmoji:   z.string().max(8).optional(),
  isActive:    z.boolean().default(true),
  sortOrder:   z.coerce.number().int().nonnegative().default(0),
  metaTitle:   z.string().max(160).optional(),
  metaDesc:    z.string().max(320).optional(),
}).strict()

export const personaUpdateSchema = personaCreateSchema.partial()

export type PersonaCreateInput = z.infer<typeof personaCreateSchema>
export type PersonaUpdateInput = z.infer<typeof personaUpdateSchema>
