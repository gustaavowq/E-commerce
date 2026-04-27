import { z } from 'zod'

export const waitlistSubscribeSchema = z.object({
  productId: z.string().min(1),
  email:     z.string().email('Email inválido').toLowerCase().trim(),
  note:      z.string().max(200).optional(),
}).strict()

export const waitlistNotifySchema = z.object({
  // Se vazio, notifica todos não-notificados ainda. Com IDs específicos, notifica só esses.
  subscriptionIds: z.array(z.string().min(1)).optional(),
  // Mensagem custom (opcional, futuro Resend)
  message: z.string().max(500).optional(),
}).strict()

export type WaitlistSubscribeInput = z.infer<typeof waitlistSubscribeSchema>
export type WaitlistNotifyInput    = z.infer<typeof waitlistNotifySchema>
