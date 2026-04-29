import { z } from 'zod'

export const orderCreateSchema = z.object({
  addressId:    z.string().min(1, 'Selecione um endereço'),
  paymentMethod: z.enum(['PIX']),  // por enquanto só Pix; cartão entra depois
  couponCode:   z.string().trim().min(2).max(40).optional(),
  notes:        z.string().max(500).optional(),
})

export type OrderCreateInput = z.infer<typeof orderCreateSchema>
