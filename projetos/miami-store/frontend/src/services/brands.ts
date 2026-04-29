import { api } from '@/lib/api'
import type { Brand } from './types'

export async function listBrands() {
  return api<Brand[]>('/brands')
}

export async function getBrand(slug: string) {
  return api<Brand>(`/brands/${slug}`)
}
