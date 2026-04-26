'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, ShoppingBag, Package, Users, LogOut, Store } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuth } from '@/stores/auth'
import { logout } from '@/services/auth'
import { useRouter } from 'next/navigation'

const NAV = [
  { href: '/',          label: 'Visão geral',     icon: LayoutDashboard },
  { href: '/orders',    label: 'Pedidos',         icon: ShoppingBag },
  { href: '/products',  label: 'Produtos',        icon: Package },
  { href: '/customers', label: 'Clientes',        icon: Users },
]

export function Sidebar() {
  const pathname = usePathname()
  const router   = useRouter()
  const user     = useAuth(s => s.user)
  const setUser  = useAuth(s => s.setUser)

  async function onLogout() {
    try { await logout() } catch {}
    setUser(null)
    router.push('/login')
  }

  return (
    <aside className="hidden lg:flex lg:w-64 lg:flex-col lg:border-r lg:border-border lg:bg-white">
      <div className="flex h-16 items-center gap-2 border-b border-border px-6">
        <span className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-primary-700 text-white">
          <Store className="h-4 w-4" />
        </span>
        <div>
          <p className="text-sm font-bold text-ink">Miami Store</p>
          <p className="text-[10px] uppercase tracking-wider text-ink-3">Painel admin</p>
        </div>
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
              className={cn(
                'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition',
                active
                  ? 'bg-primary-50 text-primary-900'
                  : 'text-ink-2 hover:bg-surface-2',
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
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
        <button
          onClick={onLogout}
          className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-ink-3 transition hover:bg-error/10 hover:text-error"
        >
          <LogOut className="h-4 w-4" /> Sair
        </button>
      </div>
    </aside>
  )
}
