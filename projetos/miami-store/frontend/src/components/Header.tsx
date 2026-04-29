'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, useEffect, useRef } from 'react'
import { Menu, User, X, Heart, ChevronDown, LayoutDashboard } from 'lucide-react'
import { CartIndicator } from './CartIndicator'
import { SearchBar } from './SearchBar'
import { useAuth } from '@/stores/auth'
import { useWishlist } from '@/stores/wishlist'
import { cn } from '@/lib/utils'

const NAV = [
  { href: '/',         label: 'Início' },
  { href: '/products', label: 'Loja',     dropdown: true },
  { href: '/sobre',    label: 'Sobre' },
  { href: '/contato',  label: 'Contato' },
] as const

const CATEGORIAS = [
  { href: '/products',                    label: 'Todos os produtos' },
  { href: '/products?category=polos',     label: 'Polos' },
  { href: '/products?category=tenis',     label: 'Tênis' },
  { href: '/products?category=bones',     label: 'Bonés' },
  { href: '/products?category=conjuntos', label: 'Conjuntos' },
  { href: '/products?brand=lacoste',      label: 'Marca: Lacoste' },
  { href: '/products?onSale=1',           label: 'Em promoção', highlight: true },
] as const

export function Header() {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [shopOpen, setShopOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const user     = useAuth(s => s.user)
  const hydrated = useAuth(s => s.hydrated)
  const wishlistCount = useWishlist(s => s.ids.length)
  // Só consideramos "admin" depois que o /auth/me hidratou no client.
  // Sem isso o botão pode piscar entre re-renders ou mostrar flash de cache.
  const isAdmin = hydrated && user?.role === 'ADMIN'
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Sombra mais forte ao scrollar — header ganha presença
  useEffect(() => {
    function onScroll() { setScrolled(window.scrollY > 8) }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Fecha menu mobile e dropdown ao trocar de rota
  useEffect(() => {
    setMobileOpen(false)
    setShopOpen(false)
  }, [pathname])

  // Click fora fecha dropdown
  useEffect(() => {
    if (!shopOpen) return
    function onClickAway(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) setShopOpen(false)
    }
    document.addEventListener('mousedown', onClickAway)
    return () => document.removeEventListener('mousedown', onClickAway)
  }, [shopOpen])

  function isActive(href: string) {
    if (href === '/') return pathname === '/'
    return pathname.startsWith(href)
  }

  return (
    <header className={cn(
      'sticky top-0 z-[100] bg-white border-b transition-all duration-200',
      scrolled ? 'border-border shadow-md' : 'border-transparent shadow-sm',
    )}>
      <div className="container-app flex h-14 items-center gap-3">
        {/* Menu mobile */}
        <button
          type="button"
          aria-label={mobileOpen ? 'Fechar menu' : 'Abrir menu'}
          aria-expanded={mobileOpen}
          onClick={() => setMobileOpen(!mobileOpen)}
          className="flex h-11 w-11 items-center justify-center rounded-md text-ink hover:bg-surface-2 transition lg:hidden"
        >
          {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 font-display text-xl font-bold text-primary-700 sm:text-2xl group">
          <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-primary-700 text-xs font-black text-white transition-transform group-hover:scale-110">M</span>
          <span className="tracking-wide transition-colors group-hover:text-primary-900">MIAMI STORE</span>
        </Link>

        {/* Nav desktop */}
        <nav className="ml-8 hidden items-center gap-1 text-sm font-medium lg:flex">
          {NAV.map(it => {
            if ('dropdown' in it && it.dropdown) {
              return (
                <div key={it.href} ref={dropdownRef} className="relative">
                  <button
                    type="button"
                    onClick={() => setShopOpen(o => !o)}
                    onMouseEnter={() => setShopOpen(true)}
                    aria-expanded={shopOpen}
                    aria-haspopup="true"
                    className={cn(
                      'inline-flex items-center gap-1 rounded-md px-3 py-2 transition-colors',
                      isActive(it.href) ? 'text-primary-700 font-semibold' : 'text-ink-2 hover:text-primary-700',
                    )}
                  >
                    {it.label}
                    <ChevronDown className={cn('h-3.5 w-3.5 transition-transform', shopOpen && 'rotate-180')} />
                  </button>
                  {shopOpen && (
                    <div
                      onMouseLeave={() => setShopOpen(false)}
                      className="absolute left-0 top-full mt-1 w-60 overflow-hidden rounded-lg border border-border bg-white shadow-xl animate-fade-up"
                    >
                      <ul className="py-2">
                        {CATEGORIAS.map(c => (
                          <li key={c.href}>
                            <Link
                              href={c.href}
                              className={cn(
                                'block px-4 py-2.5 text-sm transition-colors',
                                'highlight' in c && c.highlight
                                  ? 'font-semibold text-accent hover:bg-accent/10'
                                  : 'text-ink-2 hover:bg-surface-2 hover:text-primary-700',
                              )}
                            >
                              {c.label}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )
            }
            return (
              <Link
                key={it.href}
                href={it.href}
                className={cn(
                  'relative px-3 py-2 transition-colors after:absolute after:bottom-0 after:left-3 after:right-3 after:h-0.5 after:bg-primary-700 after:transition-all after:scale-x-0 hover:after:scale-x-100',
                  isActive(it.href) ? 'text-primary-700 font-semibold after:scale-x-100' : 'text-ink-2 hover:text-primary-700',
                )}
              >
                {it.label}
              </Link>
            )
          })}
        </nav>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Right icons */}
        <SearchBar />

        {/* Atalho "Painel" só pra admin (abre painel externo em nova aba) */}
        {isAdmin && process.env.NEXT_PUBLIC_DASHBOARD_URL && (
          <a
            href={process.env.NEXT_PUBLIC_DASHBOARD_URL}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Abrir painel admin"
            title="Painel admin"
            className="hidden sm:inline-flex items-center gap-1.5 rounded-md border border-primary-700 bg-primary-50 px-3 py-2 text-xs font-bold text-primary-700 transition hover:bg-primary-700 hover:text-white"
          >
            <LayoutDashboard className="h-3.5 w-3.5" />
            Painel
          </a>
        )}

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
      {mobileOpen && (
        <nav className="border-t border-border bg-white lg:hidden animate-slide-down">
          <ul className="container-app flex flex-col py-2">
            {NAV.map(it => (
              <li key={it.href}>
                <Link
                  href={it.href}
                  className={cn(
                    'block rounded-md px-3 py-3 text-base transition-colors',
                    isActive(it.href) ? 'text-primary-700 font-semibold bg-primary-50/40' : 'text-ink-2 hover:bg-surface-2',
                  )}
                >
                  {it.label}
                </Link>
              </li>
            ))}
            {isAdmin && process.env.NEXT_PUBLIC_DASHBOARD_URL && (
              <li>
                <a
                  href={process.env.NEXT_PUBLIC_DASHBOARD_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 rounded-md bg-primary-50 px-3 py-3 text-base font-bold text-primary-700"
                >
                  <LayoutDashboard className="h-4 w-4" />
                  Abrir painel admin
                </a>
              </li>
            )}
            <li className="my-2 border-t border-border" />
            <li className="px-3 pb-1 pt-2 text-xs font-semibold uppercase tracking-wide text-ink-3">
              Categorias
            </li>
            {CATEGORIAS.map(c => (
              <li key={c.href}>
                <Link
                  href={c.href}
                  className={cn(
                    'block rounded-md px-3 py-2.5 text-sm transition-colors',
                    'highlight' in c && c.highlight
                      ? 'font-semibold text-accent hover:bg-accent/10'
                      : 'text-ink-2 hover:bg-surface-2',
                  )}
                >
                  {c.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </header>
  )
}
