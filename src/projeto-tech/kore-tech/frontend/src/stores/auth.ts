'use client'

import { create } from 'zustand'
import type { User } from '@/services/types'

type AuthState = {
  user: User | null
  hydrated: boolean
  setUser: (user: User | null) => void
  setHydrated: (h: boolean) => void
}

export const useAuth = create<AuthState>()((set) => ({
  user: null,
  hydrated: false,
  setUser: (user) => set({ user }),
  setHydrated: (hydrated) => set({ hydrated }),
}))
