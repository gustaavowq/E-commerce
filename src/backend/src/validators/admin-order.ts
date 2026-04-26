import { z } from 'zod'

// Status que admin pode setar manualmente.
// (PAID/CANCELLED ficam por conta do gateway — não bate aqui.)
export const orderStatusUpdateSchema = z.object({
  status:       z.enum(['PREPARING', 'SHIPPED', 'DELIVERED', 'REFUNDED']).optional(),
  trackingCode: z.string().max(60).nullable().optional(),
}).strict().refine(
  d => d.status !== undefined || d.trackingCode !== undefined,
  { message: 'Informe status ou trackingCode' },
)

export type OrderStatusUpdateInput = z.infer<typeof orderStatusUpdateSchema>
