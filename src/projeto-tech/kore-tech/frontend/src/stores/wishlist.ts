'use client'

import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import { addToWishlist, removeFromWishlist } from '@/services/wishlist'

/**
 * Wishlist store.
 * - localStorage como cache offline-friendly (fica disponivel sem rede).
 * - Quando o usuario esta logado, o servidor e a fonte da verdade (sync via useWishlistSync).
 * - toggle e otimista: atualiza UI antes do response e reverte se falhar.
 *
 * Quem chama:
 *   - WishlistHeart.tsx -> toggle(productId)
 *   - AccountClient.tsx -> ids.length pra contagem
 *   - FavoritosClient.tsx -> ids[] pra filtro
 *   - Providers (via useWishlistSync) -> hydrate ao logar / clear ao deslogar
 */
type WishlistState = {
  ids: string[]
  hydrated: boolean
  /** true depois do primeiro fetch bem sucedido do servidor (ou erro tratado). */
  syncedFromServer: boolean
  setIds: (ids: string[]) => void
  /** Atualiza local + chama API. Otimista, com revert em caso de erro. */
  toggle: (productId: string) => Promise<boolean>
  has: (productId: string) => boolean
  setHydrated: (h: boolean) => void
  setSyncedFromServer: (v: boolean) => void
  clear: () => void
}

export const useWishlist = create<WishlistState>()(
  persist(
    (set, get) => ({
      ids: [],
      hydrated: false,
      syncedFromServer: false,
      setIds: (ids) => set({ ids: Array.from(new Set(ids)) }),
      toggle: async (productId) => {
        const had = get().ids.includes(productId)
        // 1. otimista: aplica local
        if (had) {
          set({ ids: get().ids.filter((i) => i !== productId) })
        } else {
          set({ ids: [...get().ids, productId] })
        }
        // 2. tenta sincronizar com servidor
        try {
          if (had) {
            await removeFromWishlist(productId)
          } else {
            await addToWishlist(productId)
          }
          return !had
        } catch (err) {
          // 3. reverte em caso de erro de auth/rede. 401 (deslogado) e 404 (produto sumiu) tambem revertem.
          if (had) {
            set({ ids: [...get().ids, productId] })
          } else {
            set({ ids: get().ids.filter((i) => i !== productId) })
          }
          if (typeof console !== 'undefined') console.warn('[wishlist] toggle falhou, revertendo', err)
          return had
        }
      },
      has: (productId) => get().ids.includes(productId),
      setHydrated: (h) => set({ hydrated: h }),
      setSyncedFromServer: (v) => set({ syncedFromServer: v }),
      clear: () => set({ ids: [], syncedFromServer: false }),
    }),
    {
      name: 'kore-wishlist-v1',
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({ ids: s.ids }),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated(true)
      },
    },
  ),
)
