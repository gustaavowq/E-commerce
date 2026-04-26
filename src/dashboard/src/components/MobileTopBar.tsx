'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Menu, X, Store, LayoutDashboard, ShoppingBag, Package, Users, LogOut } from 'lucide-react'
import { useAuth } from '@/stores/auth'
import { logout } from '@/services/auth'
import { cn } from '@/lib/utils'

const NAV = [
  { href: '/',          label: 'Visão geral', icon: LayoutDashboard },
  { href: '/orders',    label: 'Pedidos',     icon: ShoppingBag },
  { href: '/products',  label: 'Produtos',    icon: Package },
  { href: '/customers', label: 'Clientes',    icon: Users },
]

export function MobileTopBar() {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()
  const router   = useRouter()
  const user     = useAuth(s => s.user)
  const setUser  = useAuth(s => s.setUser)

  async function onLogout() {
    try { await logout() } catch {}
    setUser(null)
    setOpen(false)
    router.push('/login')
  }

  return (
    <header className="lg:hidden flex h-14 items-center justify-between border-b border-border bg-white px-4 sticky top-0 z-30">
      <Link href="/" className="flex items-center gap-2">
        <span className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-primary-700 text-white">
          <Store className="h-3.5 w-3.5" />
        </span>
        <span className="text-sm font-bold text-ink">Miami · Admin</span>
      </Link>

      <button
        onClick={() => setOpen(true)}
        className="flex h-9 w-9 items-center justify-center rounded-md hover:bg-surface-2"
        aria-label="Abrir menu"
      >
        <Menu className="h-5 w-5 text-ink-2" />
      </button>

      {open && (
        <div className="fixed inset-0 z-40">
          <div className="absolute inset-0 bg-ink/40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-0 h-full w-72 bg-white shadow-xl flex flex-col">
            <div className="flex h-14 items-center justify-between border-b border-border px-4">
              <p className="text-sm font-semibold text-ink">Menu</p>
              <button onClick={() => setOpen(false)} aria-label="Fechar" className="flex h-9 w-9 items-center justify-center rounded-md hover:bg-surface-2">
                <X className="h-5 w-5 text-ink-2" />
              </button>
            </div>
            <nav className="flex-1 space-y-1 p-4">
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
                      'flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition',
                      active ? 'bg-primary-50 text-primary-900' : 'text-ink-2 hover:bg-surface-2',
                    )}
                  >
                    <item.icon className="h-4 w-4" /> {item.label}
                  </Link>
                )
              })}
            </nav>
            <div className="border-t border-border p-4">
              {user && (
                <div className="mb-3 rounded-md bg-surface-2 px-3 py-2 text-xs">
                  <p className="font-semibold text-ink">{user.name}</p>
                  <p className="truncate text-ink-3">{user.email}</p>
                </div>
              )}
              <button onClick={onLogout} className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-ink-3 hover:bg-error/10 hover:text-error">
                <LogOut className="h-4 w-4" /> Sair
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
