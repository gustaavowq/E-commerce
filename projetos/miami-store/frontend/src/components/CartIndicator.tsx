'use client'

import Link from 'next/link'
import { ShoppingBag } from 'lucide-react'
import { useCart } from '@/stores/cart'
import { useEffect, useState } from 'react'

// Indicador de carrinho com contador. Hydration-safe: o número só
// aparece após mount client-side (evita mismatch SSR vs localStorage).
export function CartIndicator() {
  const totalItems = useCart(s => s.totalItems())
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  return (
    <Link
      href="/cart"
      aria-label={`Carrinho com ${totalItems} ${totalItems === 1 ? 'item' : 'itens'}`}
      className="relative flex h-11 w-11 items-center justify-center rounded-md text-ink hover:bg-surface-2 transition"
    >
      <ShoppingBag className="h-6 w-6" />
      {mounted && totalItems > 0 && (
        <span className="absolute -top-1 -right-1 flex h-5 min-w-[1.25rem] items-center justify-center rounded-pill bg-accent px-1 text-xs font-bold text-white">
          {totalItems > 99 ? '99+' : totalItems}
        </span>
      )}
    </Link>
  )
}
