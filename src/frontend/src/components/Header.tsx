'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { Menu, User, X, Heart } from 'lucide-react'
import { CartIndicator } from './CartIndicator'
import { SearchBar } from './SearchBar'
import { useAuth } from '@/stores/auth'
import { useWishlist } from '@/stores/wishlist'
import { cn } from '@/lib/utils'

export function Header() {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const user = useAuth(s => s.user)
  const wishlistCount = useWishlist(s => s.ids.length)

  // Sombra mais forte ao scrollar — header ganha presença
  useEffect(() => {
    function onScroll() { setScrolled(window.scrollY > 8) }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header className={cn(
      'sticky top-0 z-[100] bg-white border-b transition-all duration-200',
      scrolled ? 'border-border shadow-md' : 'border-transparent shadow-sm',
    )}>
      <div className="container-app flex h-14 items-center gap-3">
        {/* Menu mobile */}
        <button
          type="button"
          aria-label={open ? 'Fechar menu' : 'Abrir menu'}
          onClick={() => setOpen(!open)}
          className="flex h-11 w-11 items-center justify-center rounded-md text-ink hover:bg-surface-2 transition lg:hidden"
        >
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 font-display text-xl font-bold text-primary-700 sm:text-2xl group">
          <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-primary-700 text-xs font-black text-white transition-transform group-hover:scale-110">M</span>
          <span className="tracking-wide transition-colors group-hover:text-primary-900">MIAMI STORE</span>
        </Link>

        {/* Nav desktop */}
        <nav className="ml-8 hidden items-center gap-6 text-sm font-medium text-ink-2 lg:flex">
          {[
            { href: '/products',                    label: 'Todos' },
            { href: '/products?category=polos',     label: 'Polos' },
            { href: '/products?category=tenis',     label: 'Tênis' },
            { href: '/products?category=bones',     label: 'Bonés' },
            { href: '/products?category=conjuntos', label: 'Conjuntos' },
            { href: '/products?brand=lacoste',      label: 'Lacoste' },
          ].map(it => (
            <Link key={it.href} href={it.href} className="relative py-1 hover:text-primary-700 transition-colors after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-0 after:bg-primary-700 after:transition-all hover:after:w-full">
              {it.label}
            </Link>
          ))}
        </nav>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Right icons */}
        <SearchBar />
        <Link
          href="/favoritos"
          aria-label="Favoritos"
          className="relative flex h-11 w-11 items-center justify-center rounded-md text-ink hover:bg-surface-2 transition"
        >
          <Heart className="h-5 w-5" />
          {wishlistCount > 0 && (
            <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-pill bg-accent px-1 text-[10px] font-bold text-white">
              {wishlistCount}
            </span>
          )}
        </Link>
        <Link
          href={user ? '/account' : '/auth/login'}
          aria-label={user ? 'Minha conta' : 'Entrar'}
          className="flex h-11 w-11 items-center justify-center rounded-md text-ink hover:bg-surface-2 transition"
        >
          <User className="h-5 w-5" />
        </Link>
        <CartIndicator />
      </div>

      {/* Menu mobile expandido */}
      {open && (
        <nav className="border-t border-border bg-white lg:hidden animate-slide-down">
          <ul className="container-app flex flex-col py-2">
            {[
              { href: '/products',                     label: 'Todos' },
              { href: '/products?category=polos',      label: 'Polos' },
              { href: '/products?category=tenis',      label: 'Tênis' },
              { href: '/products?category=bones',      label: 'Bonés' },
              { href: '/products?category=conjuntos',  label: 'Conjuntos' },
              { href: '/products?brand=lacoste',       label: 'Marca Lacoste' },
            ].map((it) => (
              <li key={it.href}>
                <Link href={it.href} onClick={() => setOpen(false)} className="block rounded-md px-3 py-3 text-base text-ink-2 hover:bg-surface-2 transition-colors">
                  {it.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </header>
  )
}
