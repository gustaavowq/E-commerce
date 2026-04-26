import { post } from '@/lib/api'
import type { ShippingQuote } from './types'

export async function calculateShipping(zipcode: string) {
  return post<ShippingQuote>('/shipping/calculate', { zipcode })
}
