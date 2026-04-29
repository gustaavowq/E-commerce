import { api, apiList } from '@/lib/api'
import type { ProductDetail, ProductListItem, ProductListQuery } from './types'

export async function listProducts(query: ProductListQuery = {}) {
  return apiList<ProductListItem[]>('/products', { query: query as Record<string, string | number | boolean | undefined> })
}

export async function getProduct(slug: string) {
  return api<ProductDetail>(`/products/${slug}`)
}

export async function listFeatured(limit = 8) {
  return apiList<ProductListItem[]>('/products', { query: { sort: 'featured', limit } })
}

// "Quem viu também levou" — backend (01-backend) vai expor esse endpoint em paralelo.
// Se 404, o componente que consome silencia e some.
export async function getRelated(slug: string, limit = 4) {
  return api<ProductListItem[]>(`/products/${slug}/related`, { query: { limit } })
}
