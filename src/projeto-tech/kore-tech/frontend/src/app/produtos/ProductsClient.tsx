'use client'

import { useMemo } from 'react'
import { useSearchParams, useRouter, usePathname } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { Cpu, Filter, X } from 'lucide-react'
import { ProductCard } from '@/components/ProductCard'
import { Button } from '@/components/ui/Button'
import { listProducts } from '@/services/products'
import type { ProductCategory } from '@/services/types'

const CATEGORIES: Array<{ slug: ProductCategory; label: string }> = [
  { slug: 'cpu', label: 'Processadores' },
  { slug: 'gpu', label: 'Placas de video' },
  { slug: 'mobo', label: 'Placas-mae' },
  { slug: 'ram', label: 'Memoria RAM' },
  { slug: 'storage', label: 'SSD/HDD' },
  { slug: 'psu', label: 'Fontes' },
  { slug: 'case', label: 'Gabinetes' },
  { slug: 'cooler', label: 'Coolers' },
  { slug: 'monitor', label: 'Monitores' },
  { slug: 'mouse', label: 'Perifericos' },
]

const PERSONAS: Array<{ slug: string; label: string }> = [
  { slug: 'valorant-240fps', label: 'Valorant 240fps' },
  { slug: 'fortnite-competitivo', label: 'Fortnite' },
  { slug: 'cs2-high-tier', label: 'CS2' },
  { slug: 'edicao-4k', label: 'Edicao 4K' },
  { slug: 'streaming', label: 'Streaming' },
  { slug: 'ia-local', label: 'IA local' },
  { slug: 'workstation-3d', label: '3D / CAD' },
  { slug: 'entry-gamer', label: 'Entry gamer' },
]

const PRICE_RANGES = [
  { label: 'Ate R$ 500', min: 0, max: 500 },
  { label: 'R$ 500 a R$ 1.500', min: 500, max: 1500 },
  { label: 'R$ 1.500 a R$ 5.000', min: 1500, max: 5000 },
  { label: 'R$ 5.000 a R$ 10.000', min: 5000, max: 10000 },
  { label: 'Acima de R$ 10.000', min: 10000, max: undefined as number | undefined },
]

export function ProductsClient() {
  const sp = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()

  const filters = useMemo(
    () => ({
      category: sp.get('category') ?? undefined,
      brand: sp.get('brand') ?? undefined,
      persona: sp.get('persona') ?? undefined,
      minPrice: sp.get('minPrice') ? Number(sp.get('minPrice')) : undefined,
      maxPrice: sp.get('maxPrice') ? Number(sp.get('maxPrice')) : undefined,
      buildType: sp.get('buildType') ?? undefined,
      sort: (sp.get('sort') as 'newest' | 'price_asc' | 'price_desc' | 'featured' | undefined) ?? 'featured',
      q: sp.get('q') ?? undefined,
      page: sp.get('page') ? Number(sp.get('page')) : 1,
      limit: 24,
    }),
    [sp],
  )

  const { data, isLoading, isError } = useQuery({
    queryKey: ['products', filters],
    queryFn: () => listProducts(filters),
  })

  function setFilter(key: string, value: string | number | undefined) {
    const next = new URLSearchParams(sp.toString())
    if (value === undefined || value === '' || value === null) next.delete(key)
    else next.set(key, String(value))
    next.delete('page')
    router.push(`${pathname}?${next.toString()}`, { scroll: false })
  }

  function clearAll() {
    router.push(pathname, { scroll: false })
  }

  const items = data?.data ?? []
  const total = data?.meta?.total ?? items.length
  const activeCount = ['category', 'brand', 'persona', 'minPrice', 'maxPrice', 'buildType', 'q'].filter((k) => sp.get(k)).length

  return (
    <main className="container-app py-8 sm:py-12">
      <header className="mb-6">
        <p className="font-specs text-xs font-bold uppercase tracking-widest text-primary">Catalogo</p>
        <h1 className="mt-2 font-display text-2xl font-bold text-text sm:text-3xl">
          {filters.category ? CATEGORIES.find((c) => c.slug === filters.category)?.label ?? 'Produtos' : 'Todos os produtos'}
        </h1>
        <p className="mt-1 text-sm text-text-secondary">
          {isLoading ? 'Carregando...' : `${total} ${total === 1 ? 'item' : 'itens'} encontrados`}
        </p>
      </header>

      <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
        <aside className="space-y-5">
          <div className="rounded-lg border border-border bg-surface p-4">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-text">
                <Filter className="h-3.5 w-3.5" /> Filtros
              </h2>
              {activeCount > 0 && (
                <button
                  type="button"
                  onClick={clearAll}
                  className="inline-flex items-center gap-1 text-xs text-text-secondary hover:text-primary"
                >
                  <X className="h-3 w-3" /> Limpar
                </button>
              )}
            </div>

            <div className="mb-4">
              <p className="mb-2 text-[11px] font-bold uppercase text-text-secondary">Categoria</p>
              <ul className="space-y-1">
                <li>
                  <button
                    onClick={() => setFilter('category', undefined)}
                    className={`block w-full rounded px-2 py-1 text-left text-xs ${!filters.category ? 'bg-primary-soft text-primary font-semibold' : 'text-text-secondary hover:bg-surface-2'}`}
                  >
                    Todas
                  </button>
                </li>
                {CATEGORIES.map((c) => (
                  <li key={c.slug}>
                    <button
                      onClick={() => setFilter('category', c.slug)}
                      className={`block w-full rounded px-2 py-1 text-left text-xs ${filters.category === c.slug ? 'bg-primary-soft text-primary font-semibold' : 'text-text-secondary hover:bg-surface-2'}`}
                    >
                      {c.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            <div className="mb-4">
              <p className="mb-2 text-[11px] font-bold uppercase text-text-secondary">Tipo</p>
              <div className="flex flex-wrap gap-1.5">
                {[
                  { v: undefined, l: 'Tudo' },
                  { v: 'pc_pronto', l: 'PC montado' },
                  { v: 'componente', l: 'Componente' },
                  { v: 'periferico', l: 'Periferico' },
                  { v: 'monitor', l: 'Monitor' },
                ].map((t) => (
                  <button
                    key={t.l}
                    onClick={() => setFilter('buildType', t.v)}
                    className={`rounded-pill border px-3 py-1 text-[11px] transition ${filters.buildType === t.v ? 'border-primary bg-primary-soft text-primary' : 'border-border text-text-secondary hover:border-primary/40'}`}
                  >
                    {t.l}
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-4">
              <p className="mb-2 text-[11px] font-bold uppercase text-text-secondary">Persona</p>
              <div className="flex flex-wrap gap-1.5">
                {PERSONAS.map((p) => (
                  <button
                    key={p.slug}
                    onClick={() => setFilter('persona', filters.persona === p.slug ? undefined : p.slug)}
                    className={`rounded-pill border px-2.5 py-1 text-[11px] transition ${filters.persona === p.slug ? 'border-primary bg-primary-soft text-primary' : 'border-border text-text-secondary hover:border-primary/40'}`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="mb-2 text-[11px] font-bold uppercase text-text-secondary">Faixa de preco</p>
              <ul className="space-y-1">
                {PRICE_RANGES.map((r, i) => {
                  const active = filters.minPrice === r.min && (filters.maxPrice ?? undefined) === r.max
                  return (
                    <li key={i}>
                      <button
                        onClick={() => {
                          setFilter('minPrice', r.min)
                          setFilter('maxPrice', r.max)
                        }}
                        className={`block w-full rounded px-2 py-1 text-left text-xs ${active ? 'bg-primary-soft text-primary font-semibold' : 'text-text-secondary hover:bg-surface-2'}`}
                      >
                        {r.label}
                      </button>
                    </li>
                  )
                })}
              </ul>
            </div>
          </div>
        </aside>

        <section>
          <div className="mb-4 flex items-center justify-end gap-2">
            <label className="text-xs text-text-secondary">Ordenar:</label>
            <select
              value={filters.sort}
              onChange={(e) => setFilter('sort', e.target.value)}
              className="h-9 rounded-md border border-border bg-surface px-2 text-xs text-text"
            >
              <option value="featured">Destaques</option>
              <option value="newest">Mais novos</option>
              <option value="price_asc">Menor preco</option>
              <option value="price_desc">Maior preco</option>
            </select>
          </div>

          {isLoading && (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="aspect-[4/5] animate-pulse-soft rounded-lg border border-border bg-surface/60" />
              ))}
            </div>
          )}

          {isError && (
            <div className="rounded-lg border border-danger/40 bg-danger/5 p-6 text-sm text-danger">
              Nao deu pra carregar o catalogo. Verifique se o backend esta online.
            </div>
          )}

          {!isLoading && !isError && items.length === 0 && (
            <div className="rounded-lg border border-dashed border-border bg-surface/40 p-10 text-center">
              <Cpu className="mx-auto h-10 w-10 text-text-muted" />
              <p className="mt-3 text-sm text-text-secondary">Nenhum produto encontrado com esses filtros.</p>
              <Button variant="outline" size="sm" className="mt-4" onClick={clearAll}>
                Limpar filtros
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
        </section>
      </div>
    </main>
  )
}
