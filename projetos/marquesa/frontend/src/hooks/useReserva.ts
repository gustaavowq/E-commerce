import { useMutation, useQuery } from '@tanstack/react-query'
import { post, apiList } from '@/lib/api'
import type { Reserva } from '@/types/api'

export function useCriarReserva() {
  return useMutation({
    mutationFn: (input: { imovelId: string }) =>
      post<{ reserva: Reserva; sandbox: boolean }>('/api/reservas', input, { withAuth: true }),
  })
}

export function useMinhasReservas() {
  return useQuery({
    queryKey: ['minhas-reservas'],
    queryFn: () => apiList<Reserva>('/api/reservas/me', { withAuth: true }),
  })
}
