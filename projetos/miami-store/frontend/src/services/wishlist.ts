import { get, post, del } from '@/lib/api'
import type { WishlistEntry } from './types'

export async function listWishlist() {
  return get<WishlistEntry[]>('/wishlist')
}

export async function addToWishlist(productId: string) {
  return post<{ added: boolean; total: number }>('/wishlist', { productId })
}

export async function removeFromWishlist(productId: string) {
  return del<null>(`/wishlist/${productId}`)
}
