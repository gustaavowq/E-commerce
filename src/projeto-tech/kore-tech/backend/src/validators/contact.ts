import { z } from 'zod'

export const contactSchema = z.object({
  name:    z.string().min(2, 'Nome muito curto').max(100).trim(),
  email:   z.string().email('Email inválido').toLowerCase().trim(),
  // Telefone opcional — formato livre porque vem com máscara da loja, sanity
  // só na quantidade.
  phone:   z.string().min(8).max(30).trim().optional().or(z.literal('').transform(() => undefined)),
  subject: z.string().min(2, 'Assunto muito curto').max(150).trim(),
  message: z.string().min(10, 'Mensagem muito curta').max(2000).trim(),
})

export type ContactInput = z.infer<typeof contactSchema>
