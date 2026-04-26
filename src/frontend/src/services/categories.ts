import { api } from '@/lib/api'
import type { Category } from './types'

export async function listCategories() {
  return api<Category[]>('/categories')
}

export async function getCategory(slug: string) {
  return api<Category>(`/categories/${slug}`)
}
