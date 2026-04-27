'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Heart, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Skeleton } from '@/components/ui/Skeleton'
import { ProductCard } from '@/components/ProductCard'
import { useWishlist } from '@/stores/wishlist'
import { useAuth } from '@/stores/auth'
import { listWishlist } from '@/services/wishlist'
import { listProducts } from '@/services/products'
import type { ProductListItem, WishlistEntry } from '@/services/types'

/**
 * Wishlist client side.
 * - Logado: usa GET /wishlist via TanStack Query (servidor e fonte da verdade) e mostra os produtos retornados.
 * - Visitante: usa o cache local (Zustand persist) e busca os produtos correspondentes pra exibir.
 */
export function FavoritosClient() {
  const localIds = useWishlist((s) => s.ids)
  const localHydrated = useWishlist((s) => s.hydrated)
  const user = useAuth((s) => s.user)
  const authHydrated = useAuth((s) => s.hydrated)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const ready = mounted && localHydrated && authHydrated

  // Logado: pega do servidor.
  const serverQuery = useQuery({
    queryKey: ['wishlist', 'server', user?.id ?? null],
    queryFn: listWishlist,
    enabled: ready && !!user,
    staleTime: 60_000,
  })

  // Visitante: pega tudo (limit 60) e filtra pelos ids locais. Pra MVP/demo basta.
  const guestQuery = useQuery({
    queryKey: ['wishlist-products-guest', localIds],
    queryFn: () => listProducts({ limit: 60 }),
    enabled: ready && !user && localIds.length > 0,
  })

  // Itens normalizados pra ProductCard.
  const cards: ProductListItem[] = useMemo(() => {
    if (user && serverQuery.data) {
      return serverQuery.data.map((w: WishlistEntry) => mapWishlistToCard(w))
    }
    const all = guestQuery.data?.data ?? []
    return all.filter((p) => localIds.includes(p.id))
  }, [user, serverQuery.data, guestQuery.data, localIds])

  const isLoading = (user ? serverQuery.isLoading : guestQuery.isLoading) && ready
  const totalCount = user ? serverQuery.data?.length ?? 0 : localIds.length

  if (!ready) {
    return (
      <main className="container-app py-12">
        <Skeleton className="h-64 w-full" />
      </main>
    )
  }

  if (totalCount === 0) {
    return (
      <main className="container-app py-16">
        <div className="mx-auto max-w-md rounded-lg border border-dashed border-border bg-surface/40 p-10 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-pill bg-primary-soft">
            <Heart className="h-8 w-8 text-primary" />
          </div>
          <h1 className="mt-4 font-display text-2xl font-bold text-text">Sua lista de favoritos esta vazia</h1>
          <p className="mt-2 text-sm text-text-secondary">
            Toca no coracao em qualquer produto pra salvar e comparar depois.
          </p>
          <Link href="/produtos" className="mt-6 inline-block">
            <Button>
              Ver catalogo <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </main>
    )
  }

  return (
    <main className="container-app py-8 sm:py-12">
      <header className="mb-6">
        <p className="font-specs text-xs font-bold uppercase tracking-widest text-primary">Favoritos</p>
        <h1 className="mt-1 font-display text-2xl font-bold text-text sm:text-3xl">
          {totalCount} {totalCount === 1 ? 'item salvo' : 'itens salvos'}
        </h1>
        <p className="mt-1 text-sm text-text-secondary">
          Volte aqui quando quiser comparar precos ou seguir pra compra.
        </p>
      </header>

      {isLoading && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="aspect-[4/5]" />
          ))}
        </div>
      )}

      {!isLoading && cards.length > 0 && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
          {cards.map((p, i) => (
            <ProductCard key={p.id} product={p} index={i} />
          ))}
        </div>
      )}

      {!isLoading && cards.length === 0 && totalCount > 0 && (
        <div className="rounded-lg border border-dashed border-border bg-surface/40 p-10 text-center">
          <p className="text-sm text-text-secondary">
            Nao deu pra carregar os produtos da sua lista. Verifique se o backend esta online.
          </p>
        </div>
      )}
    </main>
  )
}

// Backend devolve o payload da wishlist com um formato proprio. Convertemos pro ProductListItem
// pra reusar o ProductCard sem precisar de outro componente.
function mapWishlistToCard(w: WishlistEntry): ProductListItem {
  const p = w.product
  return {
    id: p.id,
    slug: p.slug,
    name: p.name,
    // Wishlist nao traz buildType/category, preenchemos com defaults pro filtro de UI nao quebrar.
    buildType: 'componente',
    category: 'outro',
    persona: null,
    brand: { id: '', slug: '', name: '' },
    basePrice: p.basePrice,
    comparePrice: p.comparePrice,
    isFeatured: false,
    primaryImage: p.primaryImage,
    totalStock: 1,
    benchmarkFps: null,
  }
}
