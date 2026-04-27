import { apiGet, apiList, apiPost } from './api'
import type { Order, OrderListItem } from './types'

export async function createOrder(input: {
  addressId: string
  paymentMethod: 'PIX' | 'CREDIT_CARD' | 'BOLETO'
  installments?: number
  couponCode?: string
  notes?: string
  items?: Array<{ productId: string; variationId?: string; quantity: number }>
  cartSource?: 'standard' | 'builder'
}) {
  return apiPost<Order>('/orders', input)
}

export async function listMyOrders() {
  return apiList<OrderListItem[]>('/orders')
}

export async function getOrder(id: string) {
  return apiGet<Order>(`/orders/${encodeURIComponent(id)}`)
}
