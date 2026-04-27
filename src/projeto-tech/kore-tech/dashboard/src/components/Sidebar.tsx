'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  LayoutDashboard, ShoppingBag, Package, Cpu, Users2, LogOut,
  Tag, BellRing, Star, Settings as SettingsIcon, ExternalLink,
  Layers, BarChart3,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuth } from '@/stores/auth'
import { logout } from '@/services/auth'
import { usePendingCounts } from '@/hooks/useNewOrderNotification'

// Inclui Builds (PCs montados — curados pelo admin pra venda) ao lado de Produtos.
// Personas separado pra refletir que é uma entidade própria (cada persona = landing SEO).
// Lista de espera tem destaque (anti-paper-launch é diferencial Kore Tech).
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

export function Sidebar() {
  const pathname = usePathname()
  const router   = useRouter()
  const user     = useAuth(s => s.user)
  const clear    = useAuth(s => s.clear)
  const counts   = usePendingCounts()
  const pendingOrders = counts?.pendingActions ?? 0

  const storeUrl = process.env.NEXT_PUBLIC_STORE_URL ?? 'https://kore-tech-loja.vercel.app'

  async function onLogout() {
    try { await logout() } catch {}
    clear()
    router.push('/login')
  }

  return (
    <aside className="hidden lg:flex lg:w-64 lg:flex-col lg:border-r lg:border-border lg:bg-surface">
      {/* Brand mark */}
      <div className="flex h-16 items-center gap-2 border-b border-border px-6">
        <span className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-primary text-text-on-primary shadow-glow-primary">
          <Cpu className="h-4 w-4" />
        </span>
        <div>
          <p className="text-sm font-bold text-text">Kore Tech</p>
          <p className="text-[10px] uppercase tracking-wide text-text-muted">Painel admin</p>
        </div>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto p-4">
        {NAV.map(item => {
          const active = item.href === '/'
            ? pathname === '/'
            : pathname.startsWith(item.href)
          const showBadge = item.href === '/orders' && pendingOrders > 0
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors duration-fast',
                active
                  ? 'bg-primary-soft text-primary'
                  : 'text-text-secondary hover:bg-surface-2 hover:text-text',
              )}
              aria-current={active ? 'page' : undefined}
            >
              <item.icon className="h-4 w-4" />
              <span className="flex-1">{item.label}</span>
              {showBadge && (
                <span className="inline-flex h-5 min-w-[20px] items-center justify-center rounded-pill bg-danger px-1.5 text-[10px] font-bold text-white animate-pulse-glow">
                  {pendingOrders > 99 ? '99+' : pendingOrders}
                </span>
              )}
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
          className="group flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-primary transition-colors hover:bg-primary-soft"
        >
          <ExternalLink className="h-4 w-4" />
          <span className="flex-1 text-left">Ver loja</span>
        </a>
        <button
          onClick={onLogout}
          className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-text-secondary transition-colors hover:bg-danger-soft hover:text-danger"
        >
          <LogOut className="h-4 w-4" /> Sair
        </button>
      </div>
    </aside>
  )
}
