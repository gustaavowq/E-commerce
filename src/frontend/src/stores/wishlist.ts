// Wishlist client-side. Persistido em localStorage pra visitante;
// quando user loga, sincroniza com servidor.
'use client'

import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

type WishlistState = {
  ids: string[]
  hydrated: boolean
  setIds: (ids: string[]) => void
  toggle: (productId: string) => boolean  // retorna novo estado (true = adicionou)
  has: (productId: string) => boolean
  setHydrated: (h: boolean) => void
  clear: () => void
}

export const useWishlist = create<WishlistState>()(
  persist(
    (set, get) => ({
      ids: [],
      hydrated: false,
      setIds: (ids) => set({ ids: Array.from(new Set(ids)) }),
      toggle: (productId) => {
        const has = get().ids.includes(productId)
        if (has) {
          set({ ids: get().ids.filter(i => i !== productId) })
          return false
        }
        set({ ids: [...get().ids, productId] })
        return true
      },
      has: (productId) => get().ids.includes(productId),
      setHydrated: (h) => set({ hydrated: h }),
      clear: () => set({ ids: [] }),
    }),
    {
      name: 'miami-wishlist-v1',
      storage: createJSONStorage(() => localStorage),
      onRehydrateStorage: () => (state) => { state?.setHydrated(true) },
    },
  ),
)
