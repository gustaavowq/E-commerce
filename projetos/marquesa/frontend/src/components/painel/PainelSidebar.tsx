'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { microcopy } from '@/lib/microcopy'
import { cn } from '@/lib/format'

const navItems = [
  { href: '/painel', label: microcopy.painel.nav_dashboard, exact: true },
  { href: '/painel/imoveis', label: microcopy.painel.nav_imoveis },
  { href: '/painel/reservas', label: microcopy.painel.nav_reservas },
  { href: '/painel/clientes', label: microcopy.painel.nav_clientes },
  { href: '/painel/leads', label: microcopy.painel.nav_leads },
  { href: '/painel/settings', label: microcopy.painel.nav_settings },
]

export function PainelSidebar() {
  const pathname = usePathname()
  const { user, logout } = useAuth()

  return (
    <aside className="w-full md:w-64 bg-graphite text-paper md:min-h-screen flex md:flex-col gap-2 px-4 py-6 md:py-8 md:sticky md:top-0">
      <div className="hidden md:block mb-8">
        <Link href="/painel" className="font-display text-heading-lg tracking-[0.16em] uppercase">
          Marquesa
        </Link>
        <p className="text-caption text-paper/40 mt-1">Painel</p>
      </div>

      <nav className="flex md:flex-col gap-1 flex-1 overflow-x-auto md:overflow-visible">
        {navItems.map((item) => {
          const active = item.exact
            ? pathname === item.href
            : pathname.startsWith(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'px-4 py-2.5 text-body-sm transition-colors duration-fast whitespace-nowrap',
                active
                  ? 'bg-paper/10 text-paper'
                  : 'text-paper/70 hover:bg-paper/5 hover:text-paper',
              )}
            >
              {item.label}
            </Link>
          )
        })}
      </nav>

      <div className="hidden md:block mt-auto pt-6 border-t border-paper/10">
        {user && (
          <p className="text-caption text-paper/50 mb-3">
            {user.name}
            <br />
            <span className="text-paper/40">{user.role}</span>
          </p>
        )}
        <Link
          href="/"
          className="block text-body-sm text-paper/70 hover:text-paper transition-colors duration-fast mb-3"
        >
          ← {microcopy.painel.voltar_loja}
        </Link>
        <button
          onClick={logout}
          className="text-body-sm text-paper/70 hover:text-paper transition-colors duration-fast"
        >
          {microcopy.navbar.sair}
        </button>
      </div>
    </aside>
  )
}
