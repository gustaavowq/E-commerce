import { get, post } from '@/lib/api'
import type { Order, OrderListItem } from './types'

export async function createOrder(input: {
  addressId:     string
  paymentMethod: 'PIX'
  couponCode?:   string
  notes?:        string
}) {
  return post<Order>('/orders', input)
}

export async function listOrders() {
  return get<OrderListItem[]>('/orders')
}

export async function getOrder(id: string) {
  return get<Order>(`/orders/${id}`)
}

export async function cancelOrder(id: string) {
  return post<Order>(`/orders/${id}/cancel`)
}
