import { z } from 'zod'

export const cartItemAddSchema = z.object({
  variationId: z.string().min(1),
  quantity:    z.number().int().positive().max(99).default(1),
})

export const cartItemUpdateSchema = z.object({
  quantity: z.number().int().min(0).max(99),
})

export type CartItemAddInput    = z.infer<typeof cartItemAddSchema>
export type CartItemUpdateInput = z.infer<typeof cartItemUpdateSchema>
