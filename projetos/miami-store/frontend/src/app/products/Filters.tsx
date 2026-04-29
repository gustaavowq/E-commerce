'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Filter, X, Tag } from 'lucide-react'
import type { Brand, Category } from '@/services/types'

type Props = {
  brands: Brand[]
  categories: Category[]
  // Stats agregados pra mostrar tamanhos/cores reais que existem (vindo do server).
  // Pra MVP vamos deixar hardcoded de tamanhos comuns. Cliente pode editar depois.
  availableSizes:  string[]
  availableColors: Array<{ name: string; hex?: string | null }>
}

const SORTS = [
  { v: 'newest',     l: 'Mais recentes' },
  { v: 'featured',   l: 'Em destaque' },
  { v: 'price_asc',  l: 'Menor preço' },
  { v: 'price_desc', l: 'Maior preço' },
  { v: 'name_asc',   l: 'A → Z' },
] as const

export function Filters({ brands, categories, availableSizes, availableColors }: Props) {
  const router = useRouter()
  const params = useSearchParams()
  const [open, setOpen] = useState(false)  // drawer mobile

  const get = useCallback((k: string) => params.get(k) ?? '', [params])
  const getList = useCallback((k: string) => (params.get(k) ?? '').split(',').filter(Boolean), [params])

  const [minPrice, setMinPrice] = useState(get('minPrice'))
  const [maxPrice, setMaxPrice] = useState(get('maxPrice'))

  useEffect(() => { setMinPrice(get('minPrice')); setMaxPrice(get('maxPrice')) }, [get])

  function patch(updates: Record<string, string | string[] | null>) {
    const sp = new URLSearchParams(params.toString())
    for (const [k, v] of Object.entries(updates)) {
      if (v === null || v === '' || (Array.isArray(v) && v.length === 0)) sp.delete(k)
      else sp.set(k, Array.isArray(v) ? v.join(',') : v)
    }
    sp.delete('page')  // reset paginação ao mudar filtro
    router.push(`/products?${sp.toString()}`)
  }

  function toggleInList(key: string, value: string) {
    const list = getList(key)
    const idx  = list.indexOf(value)
    if (idx >= 0) list.splice(idx, 1)
    else list.push(value)
    patch({ [key]: list })
  }

  function applyPrice() {
    patch({ minPrice: minPrice || null, maxPrice: maxPrice || null })
  }

  function clearAll() {
    router.push('/products')
  }

  const activeCount = ['brands', 'categories', 'sizes', 'colors', 'minPrice', 'maxPrice', 'onSale']
    .reduce((acc, k) => acc + (params.get(k) ? 1 : 0), 0)

  const content = (
    <div className="space-y-6">
      {/* Sort */}
      <Section title="Ordenar por">
        <select
          value={get('sort') || 'newest'}
          onChange={e => patch({ sort: e.target.value === 'newest' ? null : e.target.value })}
          className="w-full rounded-md border border-border bg-white px-3 py-2 text-sm focus:border-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-700/20"
        >
          {SORTS.map(s => <option key={s.v} value={s.v}>{s.l}</option>)}
        </select>
      </Section>

      {/* Promoção toggle */}
      <Section title="Ofertas">
        <label className="flex cursor-pointer items-center gap-2 rounded-md border border-border bg-white p-2 text-sm hover:border-primary-700">
          <input
            type="checkbox"
            checked={!!get('onSale')}
            onChange={e => patch({ onSale: e.target.checked ? '1' : null })}
            className="h-4 w-4 accent-accent"
          />
          <Tag className="h-4 w-4 text-accent" />
          <span className="font-medium">Em promoção</span>
        </label>
      </Section>

      {/* Faixa de preço */}
      <Section title="Faixa de preço (R$)">
        <div className="flex items-center gap-2">
          <input
            type="number" min="0" placeholder="De"
            value={minPrice} onChange={e => setMinPrice(e.target.value)}
            onBlur={applyPrice}
            className="w-full rounded-md border border-border bg-white px-2 py-2 text-sm"
          />
          <span className="text-ink-3">—</span>
          <input
            type="number" min="0" placeholder="Até"
            value={maxPrice} onChange={e => setMaxPrice(e.target.value)}
            onBlur={applyPrice}
            className="w-full rounded-md border border-border bg-white px-2 py-2 text-sm"
          />
        </div>
        <div className="mt-2 flex flex-wrap gap-1">
          {[100, 200, 300, 500].map(p => (
            <button
              key={p}
              onClick={() => patch({ maxPrice: String(p), minPrice: null })}
              className="rounded-full border border-border bg-white px-2 py-0.5 text-[11px] text-ink-3 hover:border-primary-700 hover:text-primary-700"
            >
              até R$ {p}
            </button>
          ))}
        </div>
      </Section>

      {/* Tamanhos */}
      {availableSizes.length > 0 && (
        <Section title="Tamanho">
          <div className="flex flex-wrap gap-1.5">
            {availableSizes.map(size => {
              const active = getList('sizes').includes(size)
              return (
                <button
                  key={size}
                  onClick={() => toggleInList('sizes', size)}
                  className={
                    'min-w-[2.5rem] rounded-md border px-2.5 py-1 text-xs font-semibold transition ' +
                    (active
                      ? 'border-primary-700 bg-primary-700 text-white'
                      : 'border-border bg-white text-ink-2 hover:border-ink-3')
                  }
                >
                  {size}
                </button>
              )
            })}
          </div>
        </Section>
      )}

      {/* Cores */}
      {availableColors.length > 0 && (
        <Section title="Cor">
          <div className="flex flex-wrap gap-2">
            {availableColors.map(c => {
              const active = getList('colors').includes(c.name)
              return (
                <button
                  key={c.name}
                  onClick={() => toggleInList('colors', c.name)}
                  title={c.name}
                  className={
                    'h-8 w-8 rounded-pill border-2 transition ' +
                    (active ? 'border-primary-700 ring-2 ring-primary-700 ring-offset-1' : 'border-border hover:border-ink-3')
                  }
                  style={{ backgroundColor: c.hex ?? '#ccc' }}
                />
              )
            })}
          </div>
        </Section>
      )}

      {/* Marcas */}
      <Section title="Marcas">
        <div className="space-y-1">
          {brands.map(b => (
            <Toggle
              key={b.slug}
              checked={getList('brands').includes(b.slug)}
              onChange={() => toggleInList('brands', b.slug)}
              label={b.name}
            />
          ))}
        </div>
      </Section>

      {/* Categorias */}
      <Section title="Categorias">
        <div className="space-y-1">
          {categories.map(c => (
            <Toggle
              key={c.slug}
              checked={getList('categories').includes(c.slug)}
              onChange={() => toggleInList('categories', c.slug)}
              label={c.name}
            />
          ))}
        </div>
      </Section>

      {activeCount > 0 && (
        <button
          onClick={clearAll}
          className="w-full rounded-md border border-border bg-white px-3 py-2 text-sm font-medium text-ink-2 hover:bg-surface-2"
        >
          Limpar tudo
        </button>
      )}
    </div>
  )

  return (
    <>
      {/* Botão filtros (mobile) */}
      <button
        onClick={() => setOpen(true)}
        className="lg:hidden inline-flex items-center gap-2 rounded-md border border-border bg-white px-3 py-2 text-sm font-medium hover:border-primary-700"
      >
        <Filter className="h-4 w-4" />
        Filtros
        {activeCount > 0 && (
          <span className="rounded-pill bg-primary-700 px-1.5 py-0.5 text-[10px] font-bold text-white">{activeCount}</span>
        )}
      </button>

      {/* Sidebar (desktop) */}
      <aside className="hidden lg:block">
        {content}
      </aside>

      {/* Drawer mobile */}
      {open && (
        <div className="fixed inset-0 z-[200] lg:hidden">
          <div className="absolute inset-0 bg-ink/40 animate-fade-in" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-0 h-full w-80 max-w-full overflow-y-auto bg-white p-4 shadow-xl animate-slide-in-right">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display text-lg text-ink">Filtros</h2>
              <button onClick={() => setOpen(false)} aria-label="Fechar" className="flex h-9 w-9 items-center justify-center rounded-md hover:bg-surface-2">
                <X className="h-5 w-5" />
              </button>
            </div>
            {content}
            <button
              onClick={() => setOpen(false)}
              className="mt-6 w-full rounded-md bg-primary-700 px-4 py-3 text-sm font-semibold text-white hover:bg-primary-900"
            >
              Aplicar filtros
            </button>
          </div>
        </div>
      )}
    </>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="mb-2 text-xs font-bold uppercase tracking-wider text-ink-3">{title}</h3>
      {children}
    </div>
  )
}

function Toggle({ checked, onChange, label }: { checked: boolean; onChange: () => void; label: string }) {
  return (
    <label className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-surface-2">
      <input type="checkbox" checked={checked} onChange={onChange} className="h-4 w-4 accent-primary-700" />
      <span className={checked ? 'font-semibold text-primary-700' : 'text-ink-2'}>{label}</span>
    </label>
  )
}
