import { apiDelete, apiGet, apiPost, apiPut } from './api'
import type { ServerCart } from './types'

export type CartSource = 'standard' | 'builder'

export async function getServerCart() {
  return apiGet<ServerCart>('/cart')
}

export async function addCartItem(input: {
  productId: string
  variationId: string
  quantity: number
  source?: CartSource
}) {
  return apiPost<ServerCart>('/cart/items', input)
}

/**
 * Batch add (usado pelo builder). Marca `source: 'builder'` no body pra que o backend
 * possa validar cupons como BUILDER10. Se o backend nao reconhecer o campo ainda, ignora.
 *
 * Cada item vai numa request individual hoje (nao temos endpoint /cart/items/batch).
 * Quando o backend abrir /cart/items/batch, trocamos por uma chamada so.
 */
export async function addCartItemsBatch(items: Array<{ productId: string; variationId: string; quantity: number }>, source: CartSource = 'builder') {
  let last: ServerCart = null
  for (const it of items) {
    last = await addCartItem({ ...it, source })
  }
  return last
}

export async function updateCartItemQty(itemId: string, quantity: number) {
  return apiPut<ServerCart>(`/cart/items/${itemId}`, { quantity })
}

export async function removeCartItem(itemId: string) {
  return apiDelete<ServerCart>(`/cart/items/${itemId}`)
}

export async function clearServerCart() {
  return apiDelete<{ message: string }>('/cart')
}
