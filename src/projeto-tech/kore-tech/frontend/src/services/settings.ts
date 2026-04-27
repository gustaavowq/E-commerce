import { apiGet } from './api'
import type { StoreSettings } from './types'

export async function getStoreSettings() {
  return apiGet<StoreSettings>('/settings')
}
