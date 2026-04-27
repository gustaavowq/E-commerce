'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { Search as SearchIcon, X, Cpu } from 'lucide-react'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Skeleton } from '@/components/ui/Skeleton'
import { ProductCard } from '@/components/ProductCard'
import { listProducts } from '@/services/products'
import type { ProductCategory } from '@/services/types'

const CATEGORIES: Array<{ slug?: ProductCategory; label: string }> = [
  { label: 'Tudo' },
  { slug: 'cpu', label: 'CPU' },
  { slug: 'gpu', label: 'GPU' },
  { slug: 'mobo', label: 'Placa-mae' },
  { slug: 'ram', label: 'RAM' },
  { slug: 'storage', label: 'Storage' },
  { slug: 'psu', label: 'Fonte' },
  { slug: 'case', label: 'Gabinete' },
  { slug: 'monitor', label: 'Monitor' },
  { slug: 'mouse', label: 'Periferico' },
  { slug: 'pc_full', label: 'PC montado' },
]

export function SearchClient() {
  const sp = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()

  const initialQ = sp.get('q') ?? ''
  const initialCat = (sp.get('category') as ProductCategory | null) ?? undefined
  const [q, setQ] = useState(initialQ)
  const [cat, setCat] = useState<ProductCategory | undefined>(initialCat)

  useEffect(() => {
    setQ(sp.get('q') ?? '')
    setCat((sp.get('category') as ProductCategory | null) ?? undefined)
  }, [sp])

  const { data, isLoading, isError } = useQuery({
    queryKey: ['search', initialQ, initialCat],
    queryFn: () => listProducts({ q: initialQ || undefined, category: initialCat, limit: 36 }),
    enabled: initialQ.length > 0 || !!initialCat,
  })

  function submit(e: React.FormEvent) {
    e.preventDefault()
    const next = new URLSearchParams()
    if (q.trim()) next.set('q', q.trim())
    if (cat) next.set('category', cat)
    router.push(`${pathname}?${next.toString()}`)
  }

  function setCategory(c?: ProductCategory) {
    setCat(c)
    const next = new URLSearchParams(sp.toString())
    if (c) next.set('category', c)
    else next.delete('category')
    router.push(`${pathname}?${next.toString()}`, { scroll: false })
  }

  function clear() {
    setQ('')
    setCat(undefined)
    router.push(pathname)
  }

  const items = data?.data ?? []
  const total = data?.meta?.total ?? items.length

  return (
    <main className="container-app py-8 sm:py-12">
      <header className="mb-6">
        <p className="font-specs text-xs font-bold uppercase tracking-widest text-primary">Busca</p>
        <h1 className="mt-1 font-display text-2xl font-bold text-text sm:text-3xl">
          {initialQ ? `Resultados para "${initialQ}"` : 'O que voce procura?'}
        </h1>
      </header>

      <form onSubmit={submit} className="mb-4 flex gap-2">
        <Input
          name="q"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Busque por RTX, Ryzen, mouse, monitor 240Hz..."
          leftIcon={<SearchIcon className="h-4 w-4" />}
          rightSlot={
            q ? (
              <button
                type="button"
                onClick={() => setQ('')}
                aria-label="Limpar termo"
                className="flex h-8 w-8 items-center justify-center rounded text-text-muted hover:text-text"
              >
                <X className="h-4 w-4" />
              </button>
            ) : null
          }
          className="flex-1"
        />
        <Button type="submit" className="cta-glow">
          Buscar
        </Button>
      </form>

      <div className="mb-6 flex flex-wrap gap-1.5">
        {CATEGORIES.map((c) => {
          const active = (c.slug ?? null) === (cat ?? null)
          return (
            <button
              key={c.label}
              type="button"
              onClick={() => setCategory(c.slug)}
              className={`rounded-pill border px-3 py-1 text-xs transition ${active ? 'border-primary bg-primary-soft text-primary' : 'border-border text-text-secondary hover:border-primary/40'}`}
            >
              {c.label}
            </button>
          )
        })}
      </div>

      {!initialQ && !initialCat && (
        <div className="rounded-lg border border-dashed border-border bg-surface/40 p-10 text-center">
          <SearchIcon className="mx-auto h-10 w-10 text-text-muted" />
          <p className="mt-3 text-sm text-text-secondary">Digite um termo ou escolha uma categoria pra comecar.</p>
          <p className="mt-1 text-xs text-text-muted">Tente: RTX 4070, Ryzen 7 7700, mouse leve, monitor 240Hz.</p>
        </div>
      )}

      {(initialQ || initialCat) && (
        <>
          <p className="mb-3 text-xs text-text-secondary">
            {isLoading ? 'Buscando...' : `${total} ${total === 1 ? 'item' : 'itens'} encontrados`}
          </p>

          {isLoading && (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="aspect-[4/5]" />
              ))}
            </div>
          )}

          {isError && (
            <div className="rounded-lg border border-danger/40 bg-danger/5 p-6 text-sm text-danger">
              Nao deu pra buscar agora. Verifique se o backend esta online.
            </div>
          )}

          {!isLoading && !isError && items.length === 0 && (
            <div className="rounded-lg border border-dashed border-border bg-surface/40 p-10 text-center">
              <Cpu className="mx-auto h-10 w-10 text-text-muted" />
              <p className="mt-3 text-sm text-text-secondary">
                Nao achei nada com {initialQ ? `"${initialQ}"` : 'esses filtros'}.
              </p>
              <p className="mt-1 text-xs text-text-muted">
                Tente termos mais curtos ou{' '}
                <Link href="/produtos" className="text-primary hover:underline">veja todo o catalogo</Link>.
              </p>
              <Button variant="outline" size="sm" className="mt-4" onClick={clear}>
                Limpar busca
              </Button>
            </div>
          )}

          {!isLoading && items.length > 0 && (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
              {items.map((p, i) => (
                <ProductCard key={p.id} product={p} index={i} />
              ))}
            </div>
          )}
        </>
      )}
    </main>
  )
}
