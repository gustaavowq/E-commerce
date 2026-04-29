import { get } from '@/lib/api'
import type { StoreSettings } from './types'

export async function getStoreSettings() {
  return get<StoreSettings>('/settings')
}
