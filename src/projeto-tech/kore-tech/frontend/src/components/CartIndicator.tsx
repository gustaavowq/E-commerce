'use client'

import Link from 'next/link'
import { ShoppingCart } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useCart } from '@/stores/cart'

export function CartIndicator() {
  const totalItems = useCart((s) => s.totalItems())
  // evita mismatch SSR vs client (zustand persist nao roda no servidor)
  const [mounted, setMounted] = useState(false)
  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <Link
      href="/cart"
      aria-label="Abrir carrinho"
      className="relative flex h-11 w-11 items-center justify-center rounded-md text-text transition hover:bg-surface-2"
    >
      <ShoppingCart className="h-5 w-5" />
      {mounted && totalItems > 0 && (
        <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-pill bg-primary px-1 text-[10px] font-bold text-bg">
          {totalItems > 99 ? '99+' : totalItems}
        </span>
      )}
    </Link>
  )
}
