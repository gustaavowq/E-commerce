import { apiGet, apiPost } from './api'
import type { WaitlistSubscription } from './types'

export async function subscribeWaitlist(input: { productId: string; email: string }) {
  return apiPost<WaitlistSubscription>('/waitlist/subscribe', input)
}

export async function getMyWaitlist() {
  return apiGet<WaitlistSubscription[]>('/waitlist/mine')
}
