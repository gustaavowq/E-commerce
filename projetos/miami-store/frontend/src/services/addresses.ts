import { get, post, del, api } from '@/lib/api'
import type { Address, AddressInput } from './types'

export async function listAddresses() {
  return get<Address[]>('/addresses')
}

export async function createAddress(input: AddressInput) {
  return post<Address>('/addresses', input)
}

export async function updateAddress(id: string, input: Partial<AddressInput>) {
  return api<Address>(`/addresses/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(input),
    headers: { 'Content-Type': 'application/json' },
  })
}

export async function deleteAddress(id: string) {
  return del<null>(`/addresses/${id}`)
}
