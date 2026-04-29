import { get, post, del, api } from '@/lib/api'
import type { ServerCart } from './types'

export async function getServerCart() {
  return get<ServerCart>('/cart')
}

export async function addCartItem(input: { variationId: string; quantity?: number }) {
  return post<ServerCart>('/cart/items', input)
}

export async function updateCartItem(itemId: string, quantity: number) {
  return api<ServerCart>(`/cart/items/${itemId}`, {
    method: 'PATCH',
    body:   JSON.stringify({ quantity }),
    headers: { 'Content-Type': 'application/json' },
  })
}

export async function removeCartItem(itemId: string) {
  return del<ServerCart>(`/cart/items/${itemId}`)
}

export async function clearServerCart() {
  return del<ServerCart>('/cart')
}
