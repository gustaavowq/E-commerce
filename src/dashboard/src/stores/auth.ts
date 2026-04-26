'use client'

import { create } from 'zustand'
import type { AdminUser } from '@/services/types'

type AuthState = {
  user: AdminUser | null
  hydrated: boolean
  setUser: (u: AdminUser | null) => void
  setHydrated: (h: boolean) => void
}

export const useAuth = create<AuthState>()((set) => ({
  user: null,
  hydrated: false,
  setUser: (user) => set({ user }),
  setHydrated: (hydrated) => set({ hydrated }),
}))
