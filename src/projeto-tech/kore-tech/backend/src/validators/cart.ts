import { z } from 'zod'

// Sprint 2 — `source` opcional pra rastrear origem do carrinho
// (ex: 'builder' quando frontend monta via /montar). Whitelist explícita
// pra não aceitar string arbitrária (anti-fraude do BUILDER10).
export const cartSourceSchema = z.enum(['builder']).nullable().optional()

export const cartItemAddSchema = z.object({
  variationId: z.string().min(1),
  quantity:    z.number().int().positive().max(99).default(1),
  source:      cartSourceSchema,
})

export const cartItemUpdateSchema = z.object({
  quantity: z.number().int().min(0).max(99),
})

export const cartUpdateSchema = z.object({
  source: cartSourceSchema,
})

export type CartItemAddInput    = z.infer<typeof cartItemAddSchema>
export type CartItemUpdateInput = z.infer<typeof cartItemUpdateSchema>
export type CartUpdateInput     = z.infer<typeof cartUpdateSchema>
