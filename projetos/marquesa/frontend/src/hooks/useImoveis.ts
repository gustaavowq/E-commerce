import { useQuery } from '@tanstack/react-query'
import { apiList, get } from '@/lib/api'
import type { ImovelDetail, ImovelListItem } from '@/types/api'

export interface UseImoveisFilters {
  tipo?: string
  bairro?: string
  precoMin?: number
  precoMax?: number
  quartosMin?: number
  destaque?: boolean
  sort?: string
  page?: number
  limit?: number
}

export function useImoveis(filters: UseImoveisFilters = {}) {
  return useQuery({
    queryKey: ['imoveis', filters],
    queryFn: () =>
      apiList<ImovelListItem>('/api/imoveis', {
        withAuth: false,
        query: { ...filters },
      }),
  })
}

export function useImovel(slug: string | undefined) {
  return useQuery({
    queryKey: ['imovel', slug],
    queryFn: () => get<ImovelDetail>(`/api/imoveis/${slug}`, { withAuth: false }),
    enabled: !!slug,
  })
}
