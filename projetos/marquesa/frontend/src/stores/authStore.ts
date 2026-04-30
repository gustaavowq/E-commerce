// Auth store — Zustand. Mantém user e role no client.
// Cookie httpOnly do backend é a fonte de verdade real; este store é só pra
// renderizar UI rápida. Hidratamos chamando GET /api/auth/me no boot.

import { create } from 'zustand'
import type { User } from '@/types/api'

interface AuthState {
  user: User | null
  hydrated: boolean
  setUser: (user: User | null) => void
  setHydrated: () => void
  clear: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  hydrated: false,
  setUser: (user) => set({ user }),
  setHydrated: () => set({ hydrated: true }),
  clear: () => set({ user: null }),
}))
