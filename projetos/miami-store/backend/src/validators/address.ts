import { z } from 'zod'

const cepRegex = /^\d{5}-?\d{3}$/

export const addressCreateSchema = z.object({
  label:      z.string().max(40).optional(),
  recipient:  z.string().min(2).max(120),
  zipcode:    z.string().regex(cepRegex, 'CEP inválido'),
  street:     z.string().min(2).max(160),
  number:     z.string().min(1).max(20),
  complement: z.string().max(80).optional(),
  district:   z.string().min(2).max(80),
  city:       z.string().min(2).max(80),
  state:      z.string().length(2, 'UF deve ter 2 letras').toUpperCase(),
  phone:      z.string().min(10).max(20).optional(),
  isDefault:  z.boolean().default(false),
})

export const addressUpdateSchema = addressCreateSchema.partial()

export type AddressCreateInput = z.infer<typeof addressCreateSchema>
export type AddressUpdateInput = z.infer<typeof addressUpdateSchema>
