import { apiGet } from './api'
import type { Category } from './types'

export async function listCategories() {
  return apiGet<Category[]>('/categories')
}
