'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Heart, X, ShoppingBag } from 'lucide-react'
import { useWishlist } from '@/stores/wishlist'
import { useAuth } from '@/stores/auth'
import { listProducts } from '@/services/products'
import { listWishlist } from '@/services/wishlist'
import { formatBRL } from '@/lib/format'
import type { ProductListItem } from '@/services/types'

export function FavoritesView() {
  const ids        = useWishlist(s => s.ids)
  const hyd        = useWishlist(s => s.hydrated)
  const toggle     = useWishlist(s => s.toggle)
  const setIds     = useWishlist(s => s.setIds)
  const user       = useAuth(s => s.user)

  const [products, setProducts] = useState<ProductListItem[]>([])
  const [loading, setLoading]   = useState(true)

  // Quando user loga, sincroniza ids do server
  useEffect(() => {
    if (!user || !hyd) return
    listWishlist().then(items => {
      const serverIds = items.map(i => i.product.id)
      // União: o que tá local + server
      const merged = Array.from(new Set([...ids, ...serverIds]))
      setIds(merged)
    }).catch(() => {})
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, hyd])

  // Hidrata produtos a partir dos ids
  useEffect(() => {
    if (!hyd) return
    if (ids.length === 0) { setProducts([]); setLoading(false); return }
    setLoading(true)
    // Busca todos e filtra (API não tem filtro por id — uso /products?limit=100)
    listProducts({ limit: 100 })
      .then(res => setProducts(res.data.filter(p => ids.includes(p.id))))
      .finally(() => setLoading(false))
  }, [ids, hyd])

  if (!hyd || loading) {
    return <p className="text-center text-sm text-ink-3 py-12">Carregando favoritos…</p>
  }

  if (ids.length === 0) {
    return (
      <div className="rounded-lg border border-border bg-white p-12 text-center animate-fade-up">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-pill bg-primary-50">
          <Heart className="h-8 w-8 text-primary-700" />
        </div>
        <h1 className="mt-6 font-display text-2xl text-ink sm:text-3xl">Sua lista tá vazia</h1>
        <p className="mt-2 text-sm text-ink-3">Clica no coração de qualquer peça pra salvar pra depois.</p>
        <Link
          href="/products"
          className="mt-6 inline-flex items-center gap-2 rounded-md bg-primary-700 px-6 py-3 text-base font-semibold text-white transition hover:bg-primary-900"
        >
          <ShoppingBag className="h-4 w-4" /> Ver produtos
        </Link>
      </div>
    )
  }

  return (
    <>
      <header className="mb-6 animate-fade-up">
        <h1 className="font-display text-2xl text-ink sm:text-3xl flex items-center gap-2">
          <Heart className="h-6 w-6 fill-accent text-accent" /> Meus favoritos
        </h1>
        <p className="mt-1 text-sm text-ink-3">{products.length} {products.length === 1 ? 'peça salva' : 'peças salvas'}</p>
      </header>

      <ul className="space-y-3">
        {products.map((p, i) => (
          <li
            key={p.id}
            className="flex gap-3 rounded-lg border border-border bg-white p-3 transition hover:border-primary-700/30 hover:shadow-md animate-fade-up"
            style={{ animationDelay: `${i * 40}ms` }}
          >
            <Link href={`/products/${p.slug}`} className="relative h-24 w-20 shrink-0 overflow-hidden rounded-md bg-surface-2 sm:h-28 sm:w-24">
              {p.primaryImage?.url && (
                <Image src={p.primaryImage.url} alt={p.primaryImage.alt ?? p.name} fill sizes="100px" className="object-cover" unoptimized />
              )}
            </Link>
            <div className="flex flex-1 flex-col">
              <Link href={`/products/${p.slug}`} className="text-sm font-semibold text-ink hover:text-primary-700 sm:text-base line-clamp-2">
                {p.name}
              </Link>
              <p className="text-xs text-ink-3 mt-0.5">{p.brand.name}</p>
              <div className="mt-auto flex items-end justify-between">
                <p className="text-base font-bold text-ink sm:text-lg">{formatBRL(p.basePrice)}</p>
                <button
                  onClick={() => toggle(p.id)}
                  aria-label="Remover"
                  className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs text-ink-3 transition hover:bg-error/10 hover:text-error"
                >
                  <X className="h-3.5 w-3.5" /> Tirar
                </button>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </>
  )
}
