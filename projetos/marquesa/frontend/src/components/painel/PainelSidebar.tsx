'use client'

// PainelSidebar — graphite/paper, Linear-style.
// Logo Marquesa serif (peso de marca), nav agrupado, item ativo com bar lateral
// animada (CSS transitions via top/height calculados a partir do índice ativo).
// Footer: nome + role + email (break-all, sem sobreposição).

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { microcopy } from '@/lib/microcopy'
import { cn } from '@/lib/format'

const navItems = [
  { href: '/painel',          label: microcopy.painel.nav_dashboard, exact: true },
  { href: '/painel/imoveis',  label: microcopy.painel.nav_imoveis },
  { href: '/painel/reservas', label: microcopy.painel.nav_reservas },
  { href: '/painel/clientes', label: microcopy.painel.nav_clientes },
  { href: '/painel/leads',    label: microcopy.painel.nav_leads },
  { href: '/painel/settings', label: microcopy.painel.nav_settings },
]

export function PainelSidebar() {
  const pathname = usePathname()
  const { user, logout } = useAuth()

  const navRef = useRef<HTMLElement>(null)
  const itemRefs = useRef<Array<HTMLAnchorElement | null>>([])
  const [indicator, setIndicator] = useState<{ top: number; height: number } | null>(null)

  const activeIdx = navItems.findIndex((item) =>
    item.exact ? pathname === item.href : pathname.startsWith(item.href),
  )

  // Move o indicador (bar lateral) pra posição do item ativo. Atualiza em route change e resize.
  useEffect(() => {
    function update() {
      const el = itemRefs.current[activeIdx]
      const nav = navRef.current
      if (!el || !nav) {
        setIndicator(null)
        return
      }
      const elRect  = el.getBoundingClientRect()
      const navRect = nav.getBoundingClientRect()
      setIndicator({
        top:    elRect.top - navRect.top,
        height: elRect.height,
      })
    }
    update()
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [activeIdx, pathname])

  return (
    <aside className="w-full md:w-64 bg-graphite text-paper md:min-h-screen flex md:flex-col gap-2 px-4 py-6 md:py-8 md:sticky md:top-0">
      <div className="hidden md:block mb-10 px-3">
        <Link
          href="/painel"
          className="font-display text-display-md tracking-[0.18em] uppercase text-paper leading-none block"
        >
          Marquesa
        </Link>
        <p className="text-caption text-paper/40 mt-2 tracking-[0.16em] uppercase">
          Painel
        </p>
      </div>

      <nav
        ref={navRef}
        className="flex md:flex-col gap-0.5 flex-1 overflow-x-auto md:overflow-visible relative"
        aria-label="Navegação do painel"
      >
        {/* Indicator vertical (desktop) — barra moss à esquerda do item ativo */}
        {indicator && (
          <span
            aria-hidden="true"
            className="hidden md:block absolute left-0 w-[2px] bg-moss transition-[top,height] duration-base ease-standard"
            style={{ top: `${indicator.top}px`, height: `${indicator.height}px` }}
          />
        )}

        {navItems.map((item, i) => {
          const active = i === activeIdx
          return (
            <Link
              key={item.href}
              ref={(el) => { itemRefs.current[i] = el }}
              href={item.href}
              className={cn(
                'relative px-4 py-2.5 text-body-sm whitespace-nowrap transition-colors duration-fast',
                active
                  ? 'text-paper bg-paper/5 md:bg-transparent md:pl-5'
                  : 'text-paper/60 hover:text-paper hover:bg-paper/[0.03]',
              )}
              aria-current={active ? 'page' : undefined}
            >
              {item.label}
            </Link>
          )
        })}
      </nav>

      <div className="hidden md:block mt-auto pt-6 border-t border-paper/10 px-3">
        {user && (
          <div className="mb-4">
            <p className="text-body-sm text-paper font-medium leading-tight">
              {user.name}
            </p>
            <p className="text-caption text-paper/40 mt-0.5 uppercase tracking-[0.08em]">
              {user.role}
            </p>
            <p className="text-caption text-paper/50 mt-1.5 break-all leading-snug">
              {user.email}
            </p>
          </div>
        )}
        <Link
          href="/"
          className="block text-body-sm text-paper/70 hover:text-paper transition-colors duration-fast mb-2"
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
