import { get, post, del } from '@/lib/api'
import type { ReviewsPayload } from './types'

export async function listReviews(productId: string) {
  return get<ReviewsPayload>(`/reviews/product/${productId}`)
}

export async function postReview(input: { productId: string; rating: number; comment?: string }) {
  return post<{ id: string; rating: number; comment: string | null; isApproved: boolean; message: string }>('/reviews', input)
}

export async function deleteReview(id: string) {
  return del<null>(`/reviews/${id}`)
}
