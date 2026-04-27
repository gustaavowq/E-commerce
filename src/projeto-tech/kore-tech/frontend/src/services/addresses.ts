import { apiDelete, apiGet, apiPost, apiPut } from './api'
import type { Address } from './types'

export type AddressInput = {
  label?: string
  recipient: string
  zipcode: string
  street: string
  number: string
  complement?: string
  district: string
  city: string
  state: string
  phone?: string
  isDefault?: boolean
}

export async function listAddresses() {
  return apiGet<Address[]>('/addresses')
}

export async function createAddress(input: AddressInput) {
  return apiPost<Address>('/addresses', input)
}

export async function updateAddress(id: string, input: AddressInput) {
  return apiPut<Address>(`/addresses/${id}`, input)
}

export async function deleteAddress(id: string) {
  return apiDelete<{ message: string }>(`/addresses/${id}`)
}
