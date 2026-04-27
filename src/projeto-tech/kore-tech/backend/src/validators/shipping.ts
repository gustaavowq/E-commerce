import { z } from 'zod'

export const shippingCalcSchema = z.object({
  zipcode: z.string().regex(/^\d{5}-?\d{3}$/, 'CEP inválido'),
})

export type ShippingCalcInput = z.infer<typeof shippingCalcSchema>
