'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import { Menu, User as UserIcon, X, Heart, ChevronDown, LayoutDashboard, Wrench } from 'lucide-react'
import { CartIndicator } from './CartIndicator'
import { SearchBar } from './SearchBar'
import { Logo } from './Logo'
import { useAuth } from '@/stores/auth'
import { useWishlist } from '@/stores/wishlist'
import { cn } from '@/lib/utils'

const NAV = [
  { href: '/', label: 'Inicio' },
  { href: '/produtos', label: 'Loja', dropdown: 'shop' as const },
  { href: '/montar', label: 'Builder', highlight: true },
  { href: '/builds', label: 'Builds prontos', dropdown: 'builds' as const },
  { href: '/sobre', label: 'Sobre' },
  { href: '/contato', label: 'Contato' },
] as const

const SHOP_CATS = [
  { href: '/produtos', label: 'Tudo' },
  { href: '/produtos?category=cpu', label: 'Processadores (CPU)' },
  { href: '/produtos?category=gpu', label: 'Placas de video (GPU)' },
  { href: '/produtos?category=mobo', label: 'Placas-mae' },
  { href: '/produtos?category=ram', label: 'Memoria RAM' },
  { href: '/produtos?category=storage', label: 'SSD/HDD' },
  { href: '/produtos?category=psu', label: 'Fontes' },
  { href: '/produtos?category=case', label: 'Gabinetes' },
  { href: '/produtos?category=cooler', label: 'Coolers' },
  { href: '/produtos?category=monitor', label: 'Monitores' },
  { href: '/produtos?category=mouse', label: 'Perifericos' },
] as const

const BUILD_PERSONAS = [
  { href: '/builds/valorant-240fps', label: 'Valorant 240 FPS' },
  { href: '/builds/fortnite-competitivo', label: 'Fortnite competitivo' },
  { href: '/builds/cs2-high-tier', label: 'CS2 high tier' },
  { href: '/builds/edicao-4k', label: 'Edicao de video 4K' },
  { href: '/builds/streaming', label: 'Streaming' },
  { href: '/builds/ia-local', label: 'IA local (Llama)' },
  { href: '/builds/workstation-3d', label: 'Workstation 3D' },
  { href: '/builds/entry-gamer', label: 'Entry gamer' },
] as const

export function Header() {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [openDropdown, setOpenDropdown] = useState<null | 'shop' | 'builds'>(null)
  const [scrolled, setScrolled] = useState(false)
  const user = useAuth((s) => s.user)
  const hydrated = useAuth((s) => s.hydrated)
  const wishlistCount = useWishlist((s) => s.ids.length)
  const isAdmin = hydrated && user?.role === 'ADMIN'
  const wrapRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 8)
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    setMobileOpen(false)
    setOpenDropdown(null)
  }, [pathname])

  useEffect(() => {
    if (!openDropdown) return
    function onClickAway(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpenDropdown(null)
    }
    document.addEventListener('mousedown', onClickAway)
    return () => document.removeEventListener('mousedown', onClickAway)
  }, [openDropdown])

  function isActive(href: string) {
    if (href === '/') return pathname === '/'
    return pathname.startsWith(href)
  }

  return (
    <header
      className={cn(
        'sticky top-0 z-[100] bg-bg/95 backdrop-blur border-b transition-all duration-200',
        scrolled ? 'border-border-strong shadow-md' : 'border-border',
      )}
    >
      <div className="container-app flex h-14 items-center gap-3">
        {/* Hamburger mobile */}
        <button
          type="button"
          aria-label={mobileOpen ? 'Fechar menu' : 'Abrir menu'}
          aria-expanded={mobileOpen}
          onClick={() => setMobileOpen(!mobileOpen)}
          className="flex h-11 w-11 items-center justify-center rounded-md text-text transition hover:bg-surface-2 lg:hidden"
        >
          {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>

        <Logo />

        {/* Nav desktop */}
        <nav ref={wrapRef} className="ml-6 hidden items-center gap-1 text-sm font-medium lg:flex">
          {NAV.map((it) => {
            if ('dropdown' in it && it.dropdown) {
              const dKey = it.dropdown
              const items = dKey === 'shop' ? SHOP_CATS : BUILD_PERSONAS
              const open = openDropdown === dKey
              return (
                <div key={it.href} className="relative">
                  <button
                    type="button"
                    onClick={() => setOpenDropdown(open ? null : dKey)}
                    onMouseEnter={() => setOpenDropdown(dKey)}
                    aria-expanded={open}
                    aria-haspopup="true"
                    className={cn(
                      'inline-flex items-center gap-1 rounded-md px-3 py-2 transition-colors',
                      isActive(it.href) ? 'text-primary' : 'text-text-secondary hover:text-text',
                    )}
                  >
                    {it.label}
                    <ChevronDown className={cn('h-3.5 w-3.5 transition-transform', open && 'rotate-180')} />
                  </button>
                  {open && (
                    <div
                      onMouseLeave={() => setOpenDropdown(null)}
                      className="absolute left-0 top-full mt-1 w-64 overflow-hidden rounded-lg border border-border-strong bg-surface shadow-xl animate-fade-up"
                    >
                      <ul className="py-2">
                        {items.map((c) => (
                          <li key={c.href}>
                            <Link
                              href={c.href}
                              className="block px-4 py-2.5 text-sm text-text-secondary transition-colors hover:bg-surface-2 hover:text-primary"
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
                  'relative inline-flex items-center gap-1.5 rounded-md px-3 py-2 transition-colors',
                  isActive(it.href) ? 'text-primary font-semibold' : 'text-text-secondary hover:text-text',
                  'highlight' in it && it.highlight && 'border border-primary/40 bg-primary-soft text-primary hover:bg-primary/15',
                )}
              >
                {'highlight' in it && it.highlight ? <Wrench className="h-3.5 w-3.5" /> : null}
                {it.label}
              </Link>
            )
          })}
        </nav>

        <div className="flex-1" />

        <SearchBar />

        {isAdmin && process.env.NEXT_PUBLIC_DASHBOARD_URL && (
          <a
            href={process.env.NEXT_PUBLIC_DASHBOARD_URL}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Abrir painel admin"
            title="Painel admin"
            className="hidden items-center gap-1.5 rounded-md border border-primary bg-primary-soft px-3 py-2 text-xs font-bold text-primary transition hover:bg-primary hover:text-bg sm:inline-flex"
          >
            <LayoutDashboard className="h-3.5 w-3.5" /> Painel
          </a>
        )}

        <Link
          href="/favoritos"
          aria-label="Favoritos"
          className="relative flex h-11 w-11 items-center justify-center rounded-md text-text transition hover:bg-surface-2"
        >
          <Heart className="h-5 w-5" />
          {wishlistCount > 0 && (
            <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-pill bg-primary px-1 text-[10px] font-bold text-bg">
              {wishlistCount}
            </span>
          )}
        </Link>
        <Link
          href={user ? '/account' : '/auth/login'}
          aria-label={user ? 'Minha conta' : 'Entrar'}
          className="flex h-11 w-11 items-center justify-center rounded-md text-text transition hover:bg-surface-2"
        >
          <UserIcon className="h-5 w-5" />
        </Link>
        <CartIndicator />
      </div>

      {/* Mobile expanded */}
      {mobileOpen && (
        <nav className="border-t border-border bg-bg lg:hidden animate-slide-down">
          <ul className="container-app flex flex-col py-2">
            {NAV.map((it) => (
              <li key={it.href}>
                <Link
                  href={it.href}
                  className={cn(
                    'block rounded-md px-3 py-3 text-base transition-colors',
                    isActive(it.href) ? 'text-primary font-semibold bg-primary-soft' : 'text-text-secondary hover:bg-surface-2',
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
                  className="flex items-center gap-2 rounded-md bg-primary-soft px-3 py-3 text-base font-bold text-primary"
                >
                  <LayoutDashboard className="h-4 w-4" />
                  Abrir painel admin
                </a>
              </li>
            )}
            <li className="my-2 border-t border-border" />
            <li className="px-3 pb-1 pt-2 text-xs font-semibold uppercase tracking-wide text-text-muted">
              Categorias
            </li>
            {SHOP_CATS.slice(0, 7).map((c) => (
              <li key={c.href}>
                <Link href={c.href} className="block rounded-md px-3 py-2.5 text-sm text-text-secondary hover:bg-surface-2">
                  {c.label}
                </Link>
              </li>
            ))}
            <li className="my-2 border-t border-border" />
            <li className="px-3 pb-1 pt-2 text-xs font-semibold uppercase tracking-wide text-text-muted">
              Builds prontos
            </li>
            {BUILD_PERSONAS.map((p) => (
              <li key={p.href}>
                <Link href={p.href} className="block rounded-md px-3 py-2.5 text-sm text-text-secondary hover:bg-surface-2">
                  {p.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </header>
  )
}
