import { z } from 'zod'

const orderItemSchema = z.object({
  productId:   z.string().min(1),
  variationId: z.string().min(1).optional(),
  quantity:    z.number().int().positive().max(99),
})

export const orderCreateSchema = z.object({
  addressId:     z.string().min(1, 'Selecione um endereço'),
  paymentMethod: z.enum(['PIX']),  // V1 só Pix; cartão via MP entra V2
  couponCode:    z.string().trim().min(2).max(40).optional(),
  notes:         z.string().max(500).optional(),
  items:         z.array(orderItemSchema).min(1).optional(),
  cartSource:    z.enum(['standard', 'builder']).optional(),
})

export type OrderCreateInput = z.infer<typeof orderCreateSchema>
