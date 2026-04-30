'use client'

import Link from 'next/link'
import { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { microcopy } from '@/lib/microcopy'
import { cn } from '@/lib/format'

export function Header() {
  const { user, isAuthenticated, isAdmin, logout } = useAuth()
  const [open, setOpen] = useState(false)

  return (
    <header className="sticky top-0 z-40 bg-paper/95 backdrop-blur supports-[backdrop-filter]:bg-paper/80 border-b border-bone">
      <div className="container-marquesa flex items-center justify-between py-5">
        <Link
          href="/"
          className="font-display text-heading-lg tracking-[0.16em] text-ink uppercase"
          aria-label="Marquesa — Início"
        >
          Marquesa
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-10">
          <Link
            href="/imoveis"
            className="font-sans text-body-sm text-ink hover:text-moss transition-colors duration-fast"
          >
            {microcopy.navbar.imoveis}
          </Link>
          <Link
            href="/sobre"
            className="font-sans text-body-sm text-ink hover:text-moss transition-colors duration-fast"
          >
            {microcopy.navbar.sobre}
          </Link>
          <Link
            href="/contato"
            className="font-sans text-body-sm text-ink hover:text-moss transition-colors duration-fast"
          >
            {microcopy.navbar.contato}
          </Link>
          {isAdmin && (
            <Link
              href="/painel"
              className="font-sans text-body-sm text-moss hover:text-moss-deep transition-colors duration-fast"
            >
              {microcopy.navbar.painel}
            </Link>
          )}
          {isAuthenticated ? (
            <button
              onClick={logout}
              className="font-sans text-body-sm text-ink hover:text-moss transition-colors duration-fast"
            >
              {microcopy.navbar.sair}
            </button>
          ) : (
            <Link
              href="/auth/login"
              className="font-sans text-body-sm text-ink hover:text-moss transition-colors duration-fast"
            >
              {microcopy.navbar.entrar}
            </Link>
          )}
        </nav>

        {/* Mobile toggle */}
        <button
          className="md:hidden text-ink p-2"
          onClick={() => setOpen((v) => !v)}
          aria-label="Abrir menu"
          aria-expanded={open}
        >
          <span className="block w-6 h-px bg-ink mb-1.5" />
          <span className="block w-6 h-px bg-ink mb-1.5" />
          <span className="block w-6 h-px bg-ink" />
        </button>
      </div>

      {/* Mobile menu */}
      <div
        className={cn(
          'md:hidden border-t border-bone overflow-hidden transition-[max-height] duration-base ease-standard',
          open ? 'max-h-96' : 'max-h-0',
        )}
      >
        <nav className="container-marquesa py-6 flex flex-col gap-5">
          <Link href="/imoveis" onClick={() => setOpen(false)} className="text-body text-ink">
            {microcopy.navbar.imoveis}
          </Link>
          <Link href="/sobre" onClick={() => setOpen(false)} className="text-body text-ink">
            {microcopy.navbar.sobre}
          </Link>
          <Link href="/contato" onClick={() => setOpen(false)} className="text-body text-ink">
            {microcopy.navbar.contato}
          </Link>
          {isAdmin && (
            <Link href="/painel" onClick={() => setOpen(false)} className="text-body text-moss">
              {microcopy.navbar.painel}
            </Link>
          )}
          {isAuthenticated ? (
            <button
              onClick={() => {
                setOpen(false)
                logout()
              }}
              className="text-body text-ink text-left"
            >
              {microcopy.navbar.sair} {user?.name && `(${user.name})`}
            </button>
          ) : (
            <Link href="/auth/login" onClick={() => setOpen(false)} className="text-body text-ink">
              {microcopy.navbar.entrar}
            </Link>
          )}
        </nav>
      </div>
    </header>
  )
}
