'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Search, X } from 'lucide-react'
import { cn } from '@/lib/utils'

/**
 * SearchBar minimalista. Trigger por icone ou Ctrl/Cmd+K.
 * Drawer overlay com input que ao Enter navega pra /search?q=...
 */
export function SearchBar() {
  const [open, setOpen] = useState(false)
  const [q, setQ] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setOpen(true)
      }
      if (e.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  useEffect(() => {
    if (open) inputRef.current?.focus()
  }, [open])

  function submit(e: React.FormEvent) {
    e.preventDefault()
    const term = q.trim()
    if (!term) return
    setOpen(false)
    router.push(`/search?q=${encodeURIComponent(term)}`)
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Buscar (Ctrl+K)"
        className="hidden h-11 w-11 items-center justify-center rounded-md text-text transition hover:bg-surface-2 sm:flex"
      >
        <Search className="h-5 w-5" />
      </button>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Buscar"
        className="flex h-11 w-11 items-center justify-center rounded-md text-text transition hover:bg-surface-2 sm:hidden"
      >
        <Search className="h-5 w-5" />
      </button>

      {open && (
        <div
          role="dialog"
          aria-label="Buscar produtos"
          className="fixed inset-0 z-[150] flex items-start justify-center bg-bg/80 backdrop-blur-sm px-4 pt-20 sm:pt-32 animate-fade-in"
          onClick={(e) => {
            if (e.target === e.currentTarget) setOpen(false)
          }}
        >
          <form
            onSubmit={submit}
            className="w-full max-w-xl rounded-lg border border-border-strong bg-surface shadow-xl animate-slide-down"
          >
            <div className="flex items-center gap-2 px-4 py-3">
              <Search className="h-5 w-5 text-text-secondary" />
              <input
                ref={inputRef}
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Busque RTX, Ryzen, mouse, monitor..."
                className="flex-1 bg-transparent text-sm text-text placeholder:text-text-muted focus:outline-none"
              />
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Fechar busca"
                className="flex h-8 w-8 items-center justify-center rounded-md text-text-secondary hover:bg-surface-2"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className={cn('border-t border-border bg-surface-2 px-4 py-2 text-xs text-text-muted')}>
              Pressione <kbd className="rounded bg-surface px-1.5 py-0.5 text-[10px] font-mono">Enter</kbd> pra buscar
              ou <kbd className="rounded bg-surface px-1.5 py-0.5 text-[10px] font-mono">Esc</kbd> pra fechar
            </div>
          </form>
        </div>
      )}
    </>
  )
}
