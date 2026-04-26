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
