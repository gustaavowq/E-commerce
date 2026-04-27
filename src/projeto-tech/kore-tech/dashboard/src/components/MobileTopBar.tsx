'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  Menu, X, Cpu, LayoutDashboard, ShoppingBag, Package, Users2, LogOut,
  Tag, BellRing, Star, Settings as SettingsIcon, ExternalLink, Layers, BarChart3,
} from 'lucide-react'
import { useAuth } from '@/stores/auth'
import { logout } from '@/services/auth'
import { cn } from '@/lib/utils'

const NAV = [
  { href: '/',          label: 'Visão geral',    icon: LayoutDashboard },
  { href: '/orders',    label: 'Pedidos',        icon: ShoppingBag },
  { href: '/products',  label: 'Produtos',       icon: Package },
  { href: '/builds',    label: 'PCs montados',   icon: Cpu },
  { href: '/personas',  label: 'Personas',       icon: Layers },
  { href: '/customers', label: 'Clientes',       icon: Users2 },
  { href: '/coupons',   label: 'Cupons',         icon: Tag },
  { href: '/waitlist',  label: 'Lista de espera', icon: BellRing },
  { href: '/reviews',   label: 'Reviews',        icon: Star },
  { href: '/analytics', label: 'Analytics',      icon: BarChart3 },
  { href: '/settings',  label: 'Configurações',  icon: SettingsIcon },
]

export function MobileTopBar() {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()
  const router   = useRouter()
  const user     = useAuth(s => s.user)
  const clear    = useAuth(s => s.clear)

  const storeUrl = process.env.NEXT_PUBLIC_STORE_URL ?? '/'

  async function onLogout() {
    try { await logout() } catch {}
    clear()
    setOpen(false)
    if (process.env.NEXT_PUBLIC_STORE_URL) {
      window.location.href = process.env.NEXT_PUBLIC_STORE_URL
    } else {
      router.push('/login')
    }
  }

  return (
    <header className="lg:hidden flex h-14 items-center justify-between border-b border-border bg-surface px-4 sticky top-0 z-sticky">
      <Link href="/" className="flex items-center gap-2">
        <span className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-primary text-text-on-primary">
          <Cpu className="h-3.5 w-3.5" />
        </span>
        <span className="text-sm font-bold text-text">Kore · Admin</span>
      </Link>

      <button
        onClick={() => setOpen(true)}
        className="flex h-9 w-9 items-center justify-center rounded-md hover:bg-surface-2"
        aria-label="Abrir menu"
      >
        <Menu className="h-5 w-5 text-text" />
      </button>

      {open && (
        <div className="fixed inset-0 z-drawer">
          <div className="absolute inset-0 bg-bg/80 backdrop-blur-sm" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-0 h-full w-72 bg-surface shadow-xl flex flex-col animate-fade-in">
            <div className="flex h-14 items-center justify-between border-b border-border px-4">
              <p className="text-sm font-semibold text-text">Menu</p>
              <button onClick={() => setOpen(false)} aria-label="Fechar" className="flex h-9 w-9 items-center justify-center rounded-md hover:bg-surface-2">
                <X className="h-5 w-5 text-text" />
              </button>
            </div>
            <nav className="flex-1 space-y-1 overflow-y-auto p-4">
              {NAV.map(item => {
                const active = item.href === '/'
                  ? pathname === '/'
                  : pathname.startsWith(item.href)
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className={cn(
                      'flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors',
                      active ? 'bg-primary-soft text-primary' : 'text-text-secondary hover:bg-surface-2 hover:text-text',
                    )}
                  >
                    <item.icon className="h-4 w-4" /> {item.label}
                  </Link>
                )
              })}
            </nav>
            <div className="border-t border-border p-4 space-y-1">
              {user && (
                <div className="mb-3 rounded-md bg-surface-2 px-3 py-2 text-xs">
                  <p className="font-semibold text-text truncate">{user.name}</p>
                  <p className="truncate text-text-secondary">{user.email}</p>
                </div>
              )}
              <a
                href={storeUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setOpen(false)}
                className="group flex w-full items-center gap-2 rounded-md px-3 py-2.5 text-sm font-medium text-primary hover:bg-primary-soft"
              >
                <ExternalLink className="h-4 w-4" />
                <span className="flex-1 text-left">Ver loja</span>
              </a>
              <button onClick={onLogout} className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-text-secondary hover:bg-danger-soft hover:text-danger">
                <LogOut className="h-4 w-4" /> Sair
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
