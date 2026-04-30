import { z } from 'zod'

export const ReservaStatusEnum = z.enum([
  'ATIVA', 'EXPIRADA', 'CANCELADA', 'CONVERTIDA',
])

// POST /api/reservas — cliente solicita criação
export const createReservaSchema = z.object({
  imovelId: z.string().min(1, 'imovelId obrigatório'),
})

// PATCH /api/admin/reservas/:id — ações admin
// Aceita 2 formatos pra compat com painel atual:
//   { status: 'CANCELADA' | ..., extenderDias?: number, notesAdmin?: string }
//   { action: 'cancelar' | 'converter' | 'extender', notesAdmin?: string }
// O handler converte 'action' → status/extenderDias antes de processar.
export const adminPatchReservaSchema = z.object({
  status:        ReservaStatusEnum.optional(),
  notesAdmin:    z.string().max(2000).optional(),
  // Ação especial: estender o prazo (em dias adicionais)
  extenderDias:  z.coerce.number().int().min(1).max(60).optional(),
  // Atalho usado pelo painel — mapeado pra status/extenderDias no handler
  action:        z.enum(['cancelar', 'converter', 'extender']).optional(),
})

// GET admin: filtros
export const listAdminReservasQuerySchema = z.object({
  page:   z.coerce.number().int().min(1).default(1),
  limit:  z.coerce.number().int().min(1).max(60).default(20),
  status: ReservaStatusEnum.optional(),
  search: z.string().trim().min(1).optional(),  // por email/nome do cliente
})

export type CreateReservaInput = z.infer<typeof createReservaSchema>
export type AdminPatchReservaInput = z.infer<typeof adminPatchReservaSchema>
