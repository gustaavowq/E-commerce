import { apiGet, apiList } from './api'
import type { ProductDetail, ProductListItem, ProductListQuery } from './types'

export async function listProducts(query: ProductListQuery = {}) {
  return apiList<ProductListItem[]>('/products', { params: query })
}

export async function listFeatured(limit = 8) {
  return apiList<ProductListItem[]>('/products', { params: { sort: 'featured', limit } })
}

export async function listByPersona(slug: string, limit = 6) {
  return apiList<ProductListItem[]>(`/products/by-persona/${encodeURIComponent(slug)}`, { params: { limit } })
}

export async function listByCategory(category: string, limit = 24, extra: Partial<ProductListQuery> = {}) {
  return apiList<ProductListItem[]>('/products', { params: { category, limit, ...extra } })
}

export async function getProductBySlug(slug: string) {
  return apiGet<ProductDetail>(`/products/${encodeURIComponent(slug)}`)
}

export async function listRelated(slug: string, limit = 6) {
  return apiList<ProductListItem[]>(`/products/${encodeURIComponent(slug)}/related`, { params: { limit } })
}
