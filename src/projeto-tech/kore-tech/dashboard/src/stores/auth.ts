'use client'

// Auth store. Hidratação correta = lição #02 do Miami (ver memoria/30-LICOES/
// — login race condition que causava double-login).
//
// Regras importantes:
//  - `hydrated` indica se já passamos pelo getMe() inicial do Providers
//  - Login sucesso seta {user, hydrated:true} ATOMICAMENTE pra evitar window
//    onde guard do AdminLayout vê hydrated=true sem user e redireciona pra /login
//  - getMe() pendente NÃO sobrescreve user já setado por login concorrente
//    (ver Providers.tsx, lógica de "useAuth.getState().user" guard)

import { create } from 'zustand'
import type { AdminUser } from '@/services/types'

type AuthState = {
  user:        AdminUser | null
  hydrated:    boolean
  setUser:     (u: AdminUser | null) => void
  setHydrated: (h: boolean) => void
  // Atômico: evita gap entre setUser e setHydrated no fluxo de login
  loginSuccess: (u: AdminUser) => void
  clear:       () => void
}

export const useAuth = create<AuthState>()((set) => ({
  user: null,
  hydrated: false,
  setUser:      (user) => set({ user }),
  setHydrated:  (hydrated) => set({ hydrated }),
  loginSuccess: (user) => set({ user, hydrated: true }),
  clear:        () => set({ user: null }),
}))
