'use client'

/**
 * Sincroniza a wishlist local com o servidor quando o usuario esta logado.
 *
 * Como funciona:
 * - Enquanto nao tem usuario, o store fica com o que veio do localStorage (cache).
 * - Logou: GET /wishlist e substitui ids locais pelos ids do servidor (servidor e fonte da verdade).
 * - Deslogou: limpa.
 *
 * Coloque este hook dentro do Providers (uma instancia so na arvore).
 */
import { useEffect, useRef } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useAuth } from './auth'
import { useWishlist } from './wishlist'
import { listWishlist } from '@/services/wishlist'

export function useWishlistSync() {
  const user = useAuth((s) => s.user)
  const hydrated = useAuth((s) => s.hydrated)
  const setIds = useWishlist((s) => s.setIds)
  const setSyncedFromServer = useWishlist((s) => s.setSyncedFromServer)
  const clear = useWishlist((s) => s.clear)
  const lastUserIdRef = useRef<string | null>(null)
  const qc = useQueryClient()

  // GET /wishlist quando ha sessao. Resultado fica no cache TanStack pra
  // /favoritos consumir sem refetch.
  const wishlistQuery = useQuery({
    queryKey: ['wishlist', 'server', user?.id ?? null],
    queryFn: listWishlist,
    enabled: hydrated && !!user,
    staleTime: 60_000,
  })

  useEffect(() => {
    if (!hydrated) return
    const currentUserId = user?.id ?? null

    // Logout: limpa ids quando o usuario sai.
    if (!currentUserId && lastUserIdRef.current) {
      clear()
      qc.removeQueries({ queryKey: ['wishlist'] })
    }

    lastUserIdRef.current = currentUserId
  }, [hydrated, user, clear, qc])

  // Espelha o resultado do servidor no Zustand.
  useEffect(() => {
    if (!user) return
    if (wishlistQuery.data) {
      setIds(wishlistQuery.data.map((w) => w.product.id))
      setSyncedFromServer(true)
    }
  }, [user, wishlistQuery.data, setIds, setSyncedFromServer])
}
