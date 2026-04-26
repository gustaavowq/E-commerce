'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Menu, Search, User, X } from 'lucide-react'
import { CartIndicator } from './CartIndicator'
import { useAuth } from '@/stores/auth'

export function Header() {
  const [open, setOpen] = useState(false)
  const user = useAuth(s => s.user)

  return (
    <header className="sticky top-0 z-[100] bg-white border-b border-border shadow-sm">
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
        <Link href="/" className="flex items-center gap-2 font-display text-xl font-bold text-primary-700 sm:text-2xl">
          <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-primary-700 text-xs font-black text-white">M</span>
          <span className="tracking-wide">MIAMI STORE</span>
        </Link>

        {/* Nav desktop */}
        <nav className="ml-8 hidden items-center gap-6 text-sm font-medium text-ink-2 lg:flex">
          <Link href="/products" className="hover:text-primary-700">Todos</Link>
          <Link href="/products?category=polos" className="hover:text-primary-700">Polos</Link>
          <Link href="/products?category=tenis" className="hover:text-primary-700">Tênis</Link>
          <Link href="/products?category=bones" className="hover:text-primary-700">Bonés</Link>
          <Link href="/products?category=conjuntos" className="hover:text-primary-700">Conjuntos</Link>
          <Link href="/products?brand=lacoste" className="hover:text-primary-700">Lacoste</Link>
        </nav>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Right icons */}
        <Link href="/products" aria-label="Buscar" className="hidden h-11 w-11 items-center justify-center rounded-md text-ink hover:bg-surface-2 transition sm:flex">
          <Search className="h-5 w-5" />
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
        <nav className="border-t border-border bg-white lg:hidden animate-fade-in">
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
                <Link href={it.href} onClick={() => setOpen(false)} className="block rounded-md px-3 py-3 text-base text-ink-2 hover:bg-surface-2">
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
