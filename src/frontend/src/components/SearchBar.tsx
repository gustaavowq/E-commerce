'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { Search, X, Loader2 } from 'lucide-react'
import { listProducts } from '@/services/products'
import { formatBRL } from '@/lib/format'
import { cn } from '@/lib/utils'
import type { ProductListItem } from '@/services/types'

const DEBOUNCE_MS = 250
const MAX_PREVIEW = 6

export function SearchBar() {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<ProductListItem[]>([])
  const [loading, setLoading] = useState(false)
  const [activeIdx, setActiveIdx] = useState(-1)

  const inputRef    = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // Foco quando abre
  useEffect(() => {
    if (open) inputRef.current?.focus()
    else { setQuery(''); setResults([]); setActiveIdx(-1) }
  }, [open])

  // Click fora → fecha
  useEffect(() => {
    if (!open) return
    function onClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [open])

  // ESC fecha, Cmd/Ctrl+K abre
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape' && open) setOpen(false)
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setOpen(true)
      }
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open])

  // Debounced fetch
  useEffect(() => {
    if (!open || query.trim().length < 2) {
      setResults([])
      return
    }
    setLoading(true)
    const handle = setTimeout(async () => {
      try {
        const res = await listProducts({ search: query.trim(), limit: MAX_PREVIEW })
        setResults(res.data)
      } catch {
        setResults([])
      } finally {
        setLoading(false)
      }
    }, DEBOUNCE_MS)
    return () => clearTimeout(handle)
  }, [query, open])

  const submit = useCallback(() => {
    const q = query.trim()
    if (!q) return
    setOpen(false)
    router.push(`/search?q=${encodeURIComponent(q)}`)
  }, [query, router])

  function onInputKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') {
      if (activeIdx >= 0 && results[activeIdx]) {
        setOpen(false)
        router.push(`/products/${results[activeIdx].slug}`)
      } else {
        submit()
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActiveIdx(i => Math.min(results.length - 1, i + 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActiveIdx(i => Math.max(-1, i - 1))
    }
  }

  return (
    <div ref={containerRef} className="relative">
      {/* Botão lupa (sempre visível) */}
      <button
        type="button"
        aria-label="Buscar produtos"
        onClick={() => setOpen(true)}
        className="hidden h-11 w-11 items-center justify-center rounded-md text-ink hover:bg-surface-2 transition sm:flex"
      >
        <Search className="h-5 w-5" />
      </button>

      {/* Overlay + Drawer */}
      {open && (
        <>
          <div
            className="fixed inset-0 z-[150] bg-ink/40 backdrop-blur-sm animate-fade-in"
            aria-hidden
          />
          <div className="fixed left-0 right-0 top-0 z-[200] bg-white shadow-xl animate-slide-down">
            <div className="container-app py-4 sm:py-5">
              <div className="flex items-center gap-3">
                <Search className="h-5 w-5 shrink-0 text-ink-3" />
                <input
                  ref={inputRef}
                  type="search"
                  value={query}
                  onChange={e => { setQuery(e.target.value); setActiveIdx(-1) }}
                  onKeyDown={onInputKeyDown}
                  placeholder="Polo Lacoste, tênis preto, boné…"
                  className="flex-1 bg-transparent text-base outline-none placeholder:text-ink-4 sm:text-lg"
                />
                {loading && <Loader2 className="h-4 w-4 animate-spin text-ink-3" />}
                <kbd className="hidden rounded border border-border px-1.5 py-0.5 text-[10px] font-mono text-ink-3 sm:inline-block">
                  ESC
                </kbd>
                <button
                  onClick={() => setOpen(false)}
                  aria-label="Fechar busca"
                  className="flex h-9 w-9 items-center justify-center rounded-md text-ink-3 hover:bg-surface-2"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Resultados */}
              {query.trim().length >= 2 && (
                <div className="mt-4 border-t border-border pt-3">
                  {results.length === 0 && !loading ? (
                    <div className="py-8 text-center text-sm text-ink-3">
                      Nada encontrado pra <strong className="text-ink">&ldquo;{query}&rdquo;</strong>.
                      <p className="mt-1 text-xs">Tenta uma palavra mais curta ou outra marca.</p>
                    </div>
                  ) : (
                    <ul className="-mx-2 max-h-[60vh] space-y-1 overflow-y-auto">
                      {results.map((p, i) => (
                        <li key={p.id}>
                          <Link
                            href={`/products/${p.slug}`}
                            onClick={() => setOpen(false)}
                            onMouseEnter={() => setActiveIdx(i)}
                            className={cn(
                              'flex items-center gap-3 rounded-md px-2 py-2 transition',
                              activeIdx === i ? 'bg-primary-50' : 'hover:bg-surface-2',
                            )}
                          >
                            <div className="relative h-14 w-12 shrink-0 overflow-hidden rounded bg-surface-2">
                              {p.primaryImage?.url && (
                                <Image
                                  src={p.primaryImage.url}
                                  alt={p.primaryImage.alt ?? p.name}
                                  fill
                                  sizes="48px"
                                  className="object-cover"
                                  unoptimized
                                />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-ink line-clamp-1">{p.name}</p>
                              <p className="text-xs text-ink-3">{p.brand.name} · {p.category.name}</p>
                            </div>
                            <p className="text-sm font-bold text-ink shrink-0">{formatBRL(p.basePrice)}</p>
                          </Link>
                        </li>
                      ))}
                      <li className="px-2 pt-2">
                        <button
                          onClick={submit}
                          className="block w-full rounded-md bg-primary-50 py-2 text-center text-sm font-semibold text-primary-700 hover:bg-primary-100 transition"
                        >
                          Ver todos os resultados pra &ldquo;{query}&rdquo; →
                        </button>
                      </li>
                    </ul>
                  )}
                </div>
              )}

              {/* Sugestões quando vazio */}
              {query.trim().length < 2 && (
                <div className="mt-4 border-t border-border pt-3">
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-ink-3">Buscas populares</p>
                  <div className="flex flex-wrap gap-2">
                    {['Polo Lacoste', 'Tênis preto', 'Boné', 'Conjunto tactel', 'Camiseta'].map(term => (
                      <button
                        key={term}
                        onClick={() => { setQuery(term); inputRef.current?.focus() }}
                        className="rounded-full border border-border bg-white px-3 py-1 text-xs text-ink-2 hover:border-primary-700 hover:text-primary-700 transition"
                      >
                        {term}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
