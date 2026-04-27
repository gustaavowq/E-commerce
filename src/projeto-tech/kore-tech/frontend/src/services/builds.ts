// Listagem de builds prontos (PCs montados pela loja). Diferente de "build salvo do user".
import { apiGet, apiList } from './api'
import type { ProductListItem, ProductDetail } from './types'

export async function listReadyPcs(limit = 12, persona?: string) {
  return apiList<ProductListItem[]>('/products', {
    params: { buildType: 'pc_pronto', persona, limit, sort: 'featured' },
  })
}

export async function getReadyPcBySlug(slug: string) {
  return apiGet<ProductDetail>(`/products/${encodeURIComponent(slug)}`)
}
