import { z } from 'zod'

export const createLeadSchema = z.object({
  imovelId: z.string().min(1),
  nome:     z.string().min(2).max(100).trim(),
  email:    z.string().email().toLowerCase().trim(),
  telefone: z.string().min(10).max(20).optional(),
  mensagem: z.string().min(2).max(2000).optional(),
})

export type CreateLeadInput = z.infer<typeof createLeadSchema>
