import { apiGet } from './api'
import type { Brand } from './types'

export async function listBrands() {
  return apiGet<Brand[]>('/brands')
}
