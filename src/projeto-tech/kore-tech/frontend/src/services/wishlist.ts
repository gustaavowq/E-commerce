import { apiDelete, apiGet, apiPost } from './api'
import type { WishlistEntry } from './types'

export async function listWishlist() {
  return apiGet<WishlistEntry[]>('/wishlist')
}

// Backend retorna { added: true, total: number } no POST.
export async function addToWishlist(productId: string) {
  return apiPost<{ added: boolean; total: number }>('/wishlist', { productId })
}

// Backend responde 204 (noContent) no DELETE.
export async function removeFromWishlist(productId: string) {
  return apiDelete<void>(`/wishlist/${encodeURIComponent(productId)}`)
}
