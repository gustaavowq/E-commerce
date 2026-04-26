'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Trash2, ChevronLeft, ChevronRight, Package, Search, X, ImageOff, Star, Eye, EyeOff } from 'lucide-react'
import { adminProducts, refs } from '@/services/admin'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { TableSkeleton, EmptyState } from '@/components/Skeleton'
import { formatBRL, formatDateTime } from '@/lib/format'
import { ApiError } from '@/lib/api-error'

type Filters = {
  search:   string
  status:   '' | 'active' | 'inactive'
  featured: '' | 'yes' | 'no'
  brand:    string
  category: string
  stock:    '' | 'zero' | 'low' | 'ok'
}

const EMPTY: Filters = { search: '', status: '', featured: '', brand: '', category: '', stock: '' }

export default function ProductsListPage() {
  const qc = useQueryClient()
  const [page, setPage] = useState(1)
  const [filters, setFilters] = useState<Filters>(EMPTY)
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const limit = 25

  const brandsQ = useQuery({ queryKey: ['brands'],     queryFn: () => refs.brands() })
  const catsQ   = useQuery({ queryKey: ['categories'], queryFn: () => refs.categories() })

  const q = useQuery({
    queryKey: ['admin', 'products', { page, ...filters }],
    queryFn:  () => adminProducts.list({ page, limit, ...filters }),
  })

  const remove = useMutation({
    mutationFn: (id: string) => adminProducts.remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'products'] }),
  })

  const bulkM = useMutation({
    mutationFn: (action: 'activate' | 'deactivate' | 'feature' | 'unfeature') =>
      adminProducts.bulk(Array.from(selected), action),
    onSuccess: () => {
      setSelected(new Set())
      qc.invalidateQueries({ queryKey: ['admin', 'products'] })
    },
  })

  const total = q.data?.meta?.total ?? 0
  const totalPages = q.data?.meta?.totalPages ?? 1
  const products = q.data?.data ?? []
  const allChecked = products.length > 0 && products.every(p => selected.has(p.id))
  const someChecked = selected.size > 0

  function toggleAll() {
    if (allChecked) setSelected(new Set())
    else setSelected(new Set(products.map(p => p.id)))
  }
  function toggleOne(id: string) {
    setSelected(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id); else next.add(id)
      return next
    })
  }

  const activeFiltersCount = useMemo(() => {
    return Object.entries(filters).filter(([, v]) => v).length
  }, [filters])

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-ink">Produtos</h1>
          <p className="text-sm text-ink-3">{total} produto{total !== 1 ? 's' : ''}{activeFiltersCount > 0 && ` · ${activeFiltersCount} filtro${activeFiltersCount > 1 ? 's' : ''}`}</p>
        </div>
        <Link href="/products/new">
          <Button leftIcon={<Plus className="h-4 w-4" />}>Novo produto</Button>
        </Link>
      </header>

      {/* Filtros */}
      <section className="rounded-lg border border-border bg-white p-4 shadow-sm">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-6">
          <div className="lg:col-span-2">
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-ink-3">Buscar</label>
            <div className="mt-1 flex items-center gap-2 rounded-md border border-border bg-white px-3 py-2 focus-within:border-primary-700 focus-within:ring-2 focus-within:ring-primary-700/20">
              <Search className="h-4 w-4 text-ink-3" />
              <input
                type="text"
                value={filters.search}
                onChange={e => { setFilters(f => ({ ...f, search: e.target.value })); setPage(1) }}
                placeholder="Nome, slug ou SKU…"
                className="flex-1 bg-transparent text-sm focus:outline-none"
              />
            </div>
          </div>
          <FilterSelect label="Status"    value={filters.status}   onChange={v => { setFilters(f => ({ ...f, status: v as Filters['status'] })); setPage(1) }}
            options={[['', 'Todos'], ['active', 'Ativos'], ['inactive', 'Inativos']]} />
          <FilterSelect label="Destaque"  value={filters.featured} onChange={v => { setFilters(f => ({ ...f, featured: v as Filters['featured'] })); setPage(1) }}
            options={[['', 'Todos'], ['yes', 'Em destaque'], ['no', 'Sem destaque']]} />
          <FilterSelect label="Marca"     value={filters.brand}    onChange={v => { setFilters(f => ({ ...f, brand: v })); setPage(1) }}
            options={[['', 'Todas'], ...(brandsQ.data?.map(b => [b.slug, b.name] as [string, string]) ?? [])]} />
          <FilterSelect label="Categoria" value={filters.category} onChange={v => { setFilters(f => ({ ...f, category: v })); setPage(1) }}
            options={[['', 'Todas'], ...(catsQ.data?.map(c => [c.slug, c.name] as [string, string]) ?? [])]} />
          <FilterSelect label="Estoque"   value={filters.stock}    onChange={v => { setFilters(f => ({ ...f, stock: v as Filters['stock'] })); setPage(1) }}
            options={[['', 'Todos'], ['zero', 'Zerado'], ['low', 'Baixo (≤5)'], ['ok', 'OK']]} />
        </div>
        {activeFiltersCount > 0 && (
          <button
            onClick={() => { setFilters(EMPTY); setPage(1) }}
            className="mt-3 inline-flex items-center gap-1 text-xs text-primary-700 hover:underline"
          >
            <X className="h-3 w-3" /> Limpar filtros
          </button>
        )}
      </section>

      {/* Bulk action bar (aparece só quando tem seleção) */}
      {someChecked && (
        <div className="sticky top-2 z-30 flex flex-wrap items-center gap-3 rounded-lg border border-primary-700 bg-primary-50 px-4 py-3 shadow-md animate-fade-up">
          <p className="text-sm font-bold text-primary-700">
            {selected.size} selecionado{selected.size !== 1 ? 's' : ''}
          </p>
          <div className="flex flex-wrap gap-2">
            <Button size="sm" variant="secondary" leftIcon={<Eye className="h-3.5 w-3.5" />} loading={bulkM.isPending} onClick={() => bulkM.mutate('activate')}>Ativar</Button>
            <Button size="sm" variant="secondary" leftIcon={<EyeOff className="h-3.5 w-3.5" />} loading={bulkM.isPending} onClick={() => bulkM.mutate('deactivate')}>Inativar</Button>
            <Button size="sm" variant="secondary" leftIcon={<Star className="h-3.5 w-3.5" />} loading={bulkM.isPending} onClick={() => bulkM.mutate('feature')}>Destaque</Button>
            <Button size="sm" variant="secondary" loading={bulkM.isPending} onClick={() => bulkM.mutate('unfeature')}>Sem destaque</Button>
          </div>
          <button onClick={() => setSelected(new Set())} className="ml-auto text-xs text-ink-3 hover:text-ink">
            Cancelar
          </button>
        </div>
      )}

      {q.isLoading ? (
        <TableSkeleton rows={6} cols={8} />
      ) : products.length > 0 ? (
        <div className="overflow-x-auto rounded-lg border border-border bg-white shadow-sm">
          <table className="min-w-[900px] w-full divide-y divide-border">
            <thead className="bg-surface-2 text-left text-[11px] font-semibold uppercase tracking-wider text-ink-3">
              <tr>
                <th className="px-3 py-2 w-10">
                  <input type="checkbox" checked={allChecked} onChange={toggleAll} className="h-4 w-4 accent-primary-700" />
                </th>
                <th className="px-3 py-2 w-14">Foto</th>
                <th className="px-4 py-2">Produto</th>
                <th className="px-4 py-2">Marca</th>
                <th className="px-4 py-2">Categoria</th>
                <th className="px-4 py-2 text-right">Preço</th>
                <th className="px-4 py-2 text-right">Estoque</th>
                <th className="px-4 py-2 text-center">Status</th>
                <th className="px-4 py-2">Atualizado</th>
                <th className="px-4 py-2"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {products.map(p => {
                const checked = selected.has(p.id)
                const thumb = (p as any).thumbnail as string | null  // backend retorna thumbnail
                return (
                  <tr key={p.id} className={`transition hover:bg-primary-50/40 ${checked ? 'bg-primary-50/30' : ''}`}>
                    <td className="px-3 py-3">
                      <input type="checkbox" checked={checked} onChange={() => toggleOne(p.id)} className="h-4 w-4 accent-primary-700" />
                    </td>
                    <td className="px-3 py-2">
                      <div className="relative h-10 w-10 overflow-hidden rounded-md border border-border bg-surface-2">
                        {thumb ? (
                          <Image src={thumb} alt={p.name} fill sizes="40px" className="object-cover" unoptimized />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-ink-4">
                            <ImageOff className="h-4 w-4" />
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="table-cell-base">
                      <Link href={`/products/${p.id}`} className="font-medium text-ink hover:text-primary-700">
                        {p.name}
                      </Link>
                      <p className="text-xs text-ink-4">{p.slug}</p>
                    </td>
                    <td className="table-cell-base text-ink-2">{p.brand.name}</td>
                    <td className="table-cell-base text-ink-2">{p.category.name}</td>
                    <td className="table-cell-base text-right font-mono">{formatBRL(p.basePrice)}</td>
                    <td className="table-cell-base text-right font-mono">
                      <span className={p.totalStock < 5 ? 'text-warning font-bold' : 'text-ink-2'}>
                        {p.totalStock}
                      </span>
                      <span className="ml-1 text-[10px] text-ink-4">({p.variationCount} SKUs)</span>
                    </td>
                    <td className="table-cell-base text-center">
                      {p.isActive
                        ? <span className="inline-flex rounded-full bg-success/10 px-2 py-0.5 text-xs font-semibold text-success">Ativo</span>
                        : <span className="inline-flex rounded-full bg-ink-3/10 px-2 py-0.5 text-xs font-semibold text-ink-3">Inativo</span>}
                      {p.isFeatured && <span className="ml-1 inline-flex rounded-full bg-primary-50 px-2 py-0.5 text-xs font-semibold text-primary-700">Destaque</span>}
                    </td>
                    <td className="table-cell-base text-xs text-ink-3">{formatDateTime(p.updatedAt)}</td>
                    <td className="table-cell-base text-right">
                      {p.isActive && (
                        <button
                          onClick={() => {
                            if (confirm(`Tira "${p.name}" da loja? Ele some das vitrines mas o histórico fica.`)) remove.mutate(p.id)
                          }}
                          className="text-ink-3 transition hover:text-error"
                          aria-label={`Inativar ${p.name}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <EmptyState
          icon={<Package className="h-6 w-6" />}
          title={activeFiltersCount > 0 ? 'Nenhum produto bate com esses filtros' : 'Catálogo vazio'}
          description={activeFiltersCount > 0
            ? 'Tira um filtro ou limpa tudo pra ver o catálogo.'
            : 'Bora cadastrar o primeiro produto da loja.'}
          action={activeFiltersCount > 0 ? (
            <Button variant="secondary" onClick={() => { setFilters(EMPTY); setPage(1) }} leftIcon={<X className="h-4 w-4" />}>
              Limpar filtros
            </Button>
          ) : (
            <Link href="/products/new">
              <Button leftIcon={<Plus className="h-4 w-4" />}>Cadastrar produto</Button>
            </Link>
          )}
        />
      )}

      {ApiError.is(remove.error) && (
        <p className="text-sm text-error">{remove.error.message}</p>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-xs text-ink-3">Página {page} de {totalPages}</p>
          <div className="flex gap-1">
            <Button size="sm" variant="secondary" disabled={page === 1} onClick={() => setPage(p => p - 1)} leftIcon={<ChevronLeft className="h-4 w-4" />}>
              Anterior
            </Button>
            <Button size="sm" variant="secondary" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)} rightIcon={<ChevronRight className="h-4 w-4" />}>
              Próxima
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

function FilterSelect({
  label, value, onChange, options,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  options: Array<[string, string]>
}) {
  return (
    <div>
      <label className="block text-[11px] font-semibold uppercase tracking-wider text-ink-3">{label}</label>
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        className="mt-1 w-full rounded-md border border-border bg-white px-2 py-2 text-sm focus:border-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-700/20"
      >
        {options.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
      </select>
    </div>
  )
}
