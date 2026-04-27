// =============================================================================
// Kore Tech — Painel admin > Produtos (lista)
//
// Lista paginada com filtros (status, buildType, category, persona, brand,
// stock), busca debounced, bulk actions (ativar/desativar/destacar/excluir).
// URL state pra filtros (não useState perdido em refresh).
// =============================================================================

'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter, useSearchParams } from 'next/navigation'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Plus, Search, Filter, Package, Star, Eye, EyeOff, Trash2,
} from 'lucide-react'
import { adminProducts, refs, type AdminProductFilters } from '@/services/admin'
import type { AdminProductListItem, BuildType, ProductCategory } from '@/services/types'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { DataTable, BulkActionBar, type DataTableColumn } from '@/components/DataTable'
import { Pagination } from '@/components/Pagination'
import { EmptyState } from '@/components/Skeleton'
import { ConfirmDialog } from '@/components/ConfirmDialog'
import { useToast } from '@/components/Toast'
import { useDebounce } from '@/hooks/useDebounce'
import { formatBRL } from '@/lib/format'

const BUILD_TYPES: Array<{ value: BuildType | ''; label: string }> = [
  { value: '',           label: 'Todos os tipos' },
  { value: 'componente', label: 'Componente' },
  { value: 'pc_pronto',  label: 'PC pronto' },
  { value: 'periferico', label: 'Periférico' },
  { value: 'monitor',    label: 'Monitor' },
]

const CATEGORIES: Array<{ value: ProductCategory | ''; label: string }> = [
  { value: '',          label: 'Todas categorias' },
  { value: 'cpu',       label: 'CPU' },
  { value: 'gpu',       label: 'GPU' },
  { value: 'mobo',      label: 'Placa-mãe' },
  { value: 'ram',       label: 'Memória RAM' },
  { value: 'storage',   label: 'Armazenamento' },
  { value: 'psu',       label: 'Fonte' },
  { value: 'case',      label: 'Gabinete' },
  { value: 'cooler',    label: 'Cooler' },
  { value: 'pc_full',   label: 'PC montado' },
  { value: 'monitor',   label: 'Monitor' },
  { value: 'mouse',     label: 'Mouse' },
  { value: 'teclado',   label: 'Teclado' },
  { value: 'headset',   label: 'Headset' },
  { value: 'cadeira',   label: 'Cadeira' },
  { value: 'fan',       label: 'Ventoinha' },
  { value: 'cabo',      label: 'Cabos' },
  { value: 'outro',     label: 'Outros' },
]

export default function ProductsListPage() {
  const router       = useRouter()
  const searchParams = useSearchParams()
  const qc           = useQueryClient()
  const toast        = useToast()

  const filters: AdminProductFilters = useMemo(() => ({
    page:      Number(searchParams.get('page')      ?? '1'),
    limit:     Number(searchParams.get('limit')     ?? '20'),
    search:    searchParams.get('search')           ?? '',
    status:    (searchParams.get('status')          ?? '') as AdminProductFilters['status'],
    buildType: (searchParams.get('buildType')       ?? '') as BuildType | '',
    category:  (searchParams.get('category')        ?? '') as ProductCategory | '',
    persona:   searchParams.get('persona')          ?? '',
    brand:     searchParams.get('brand')            ?? '',
    stock:     (searchParams.get('stock')           ?? '') as AdminProductFilters['stock'],
    featured:  (searchParams.get('featured')        ?? '') as AdminProductFilters['featured'],
  }), [searchParams])

  const [searchInput, setSearchInput] = useState(filters.search ?? '')
  const debouncedSearch = useDebounce(searchInput, 350)

  // Sincroniza search debounced → URL (só quando muda)
  useEffect(() => {
    if (debouncedSearch === (filters.search ?? '')) return
    const next = new URLSearchParams(searchParams.toString())
    if (debouncedSearch) next.set('search', debouncedSearch)
    else                 next.delete('search')
    next.delete('page')
    router.replace(`/products?${next.toString()}`)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch])

  const [selected, setSelected] = useState<string[]>([])
  const [bulkConfirm, setBulkConfirm] = useState<null | 'delete' | 'activate' | 'deactivate' | 'feature' | 'unfeature'>(null)

  const productsQ = useQuery({
    queryKey: ['admin', 'products', 'list', filters],
    queryFn:  () => adminProducts.list(filters),
  })

  const brandsQ = useQuery({
    queryKey: ['admin', 'brands'],
    queryFn:  () => refs.brands(),
    staleTime: 5 * 60_000,
  })

  const bulk = useMutation({
    mutationFn: (action: 'activate' | 'deactivate' | 'feature' | 'unfeature' | 'delete') =>
      adminProducts.bulk(selected, action),
    onSuccess: (res, action) => {
      toast.push({ tone: 'success', title: `${res.updated} produtos atualizados`, body: actionLabel(action) })
      setSelected([])
      setBulkConfirm(null)
      qc.invalidateQueries({ queryKey: ['admin', 'products'] })
    },
    onError: (err: unknown) => {
      toast.push({
        tone: 'error',
        title: 'Não foi possível concluir a ação',
        body:  err instanceof Error ? err.message : 'Tenta de novo em alguns segundos.',
      })
    },
  })

  function setQuery(patch: Record<string, string | number | null>) {
    const next = new URLSearchParams(searchParams.toString())
    for (const [k, v] of Object.entries(patch)) {
      if (v === null || v === '' || v === undefined) next.delete(k)
      else next.set(k, String(v))
    }
    router.replace(`/products?${next.toString()}`)
  }

  const rows = productsQ.data?.data ?? []
  const meta = productsQ.data?.meta

  const columns: DataTableColumn<AdminProductListItem>[] = [
    {
      key: 'name',
      header: 'Produto',
      render: row => (
        <div className="flex items-center gap-3">
          <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-md bg-surface-2 ring-1 ring-border">
            {row.primaryImage
              ? <Image src={row.primaryImage} alt={row.name} fill unoptimized className="object-cover" sizes="40px" />
              : <Package className="absolute inset-0 m-auto h-4 w-4 text-text-muted" />}
          </div>
          <div className="min-w-0">
            <p className="truncate font-semibold text-text">{row.name}</p>
            <p className="truncate text-xs text-text-secondary font-mono">{row.slug}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'category',
      header: 'Categoria',
      hideOnMobile: true,
      render: row => (
        <div className="space-y-0.5 text-xs">
          <p className="text-text">{CATEGORIES.find(c => c.value === row.category)?.label ?? '—'}</p>
          <p className="text-text-muted">{BUILD_TYPES.find(b => b.value === row.buildType)?.label ?? '—'}</p>
        </div>
      ),
    },
    {
      key: 'brand',
      header: 'Marca',
      hideOnMobile: true,
      render: row => <span className="text-xs text-text-secondary">{row.brand?.name ?? '—'}</span>,
    },
    {
      key: 'price',
      header: 'Preço',
      align: 'right',
      render: row => <span className="font-mono text-sm text-text">{formatBRL(row.basePrice)}</span>,
    },
    {
      key: 'stock',
      header: 'Estoque',
      align: 'right',
      hideOnMobile: true,
      render: row => (
        <span className={
          'font-mono text-sm ' +
          (row.totalStock === 0 ? 'text-danger'
            : row.totalStock < 5 ? 'text-warning'
            : 'text-text')
        }>
          {row.totalStock}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      align: 'center',
      render: row => (
        <div className="flex items-center justify-center gap-1.5">
          {row.isActive
            ? <span className="inline-flex rounded-pill bg-success-soft px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-success">Ativo</span>
            : <span className="inline-flex rounded-pill bg-surface-2 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-text-muted">Inativo</span>}
          {row.isFeatured && <Star className="h-3.5 w-3.5 fill-primary text-primary" aria-label="Destaque" />}
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-5">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-text">Produtos</h1>
          <p className="text-sm text-text-secondary">
            Gerencia o catálogo: componentes, PCs montados, periféricos, monitores.
          </p>
        </div>
        <Link href="/products/new">
          <Button leftIcon={<Plus className="h-4 w-4" />}>Novo produto</Button>
        </Link>
      </header>

      {/* Filtros */}
      <section className="rounded-lg border border-border bg-surface p-4 shadow-md">
        <div className="grid gap-3 lg:grid-cols-[1.5fr_1fr_1fr_1fr_1fr_1fr]">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
            <Input
              value={searchInput}
              onChange={e => setSearchInput(e.target.value)}
              placeholder="Buscar por nome, SKU, slug…"
              className="pl-9"
              aria-label="Buscar produtos"
            />
          </div>
          <Select value={filters.buildType} onChange={e => setQuery({ buildType: e.target.value || null, page: 1 })} aria-label="Filtrar por tipo">
            {BUILD_TYPES.map(b => <option key={b.value} value={b.value}>{b.label}</option>)}
          </Select>
          <Select value={filters.category} onChange={e => setQuery({ category: e.target.value || null, page: 1 })} aria-label="Filtrar por categoria">
            {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
          </Select>
          <Select value={filters.brand} onChange={e => setQuery({ brand: e.target.value || null, page: 1 })} aria-label="Filtrar por marca">
            <option value="">Todas marcas</option>
            {brandsQ.data?.map(b => <option key={b.id} value={b.slug}>{b.name}</option>)}
          </Select>
          <Select value={filters.status} onChange={e => setQuery({ status: e.target.value || null, page: 1 })} aria-label="Filtrar por status">
            <option value="">Todos status</option>
            <option value="active">Ativos</option>
            <option value="inactive">Inativos</option>
          </Select>
          <Select value={filters.stock} onChange={e => setQuery({ stock: e.target.value || null, page: 1 })} aria-label="Filtrar por estoque">
            <option value="">Estoque qualquer</option>
            <option value="zero">Sem estoque</option>
            <option value="low">Estoque baixo</option>
            <option value="ok">Estoque ok</option>
          </Select>
        </div>
        {(filters.search || filters.buildType || filters.category || filters.brand || filters.status || filters.stock || filters.featured) && (
          <div className="mt-3 flex items-center gap-2 text-xs text-text-secondary">
            <Filter className="h-3 w-3" />
            <span>Filtros ativos.</span>
            <button
              type="button"
              onClick={() => router.replace('/products')}
              className="font-semibold text-primary hover:text-primary-hover"
            >
              Limpar tudo
            </button>
          </div>
        )}
      </section>

      {/* Lista */}
      {!productsQ.isLoading && rows.length === 0 ? (
        <EmptyState
          icon={<Package className="h-5 w-5" />}
          title="Nenhum produto por aqui"
          description={filters.search ? 'Nenhum produto encontrado pra essa busca. Ajusta os filtros.' : 'Cadastra o primeiro produto pra começar.'}
          action={
            <Link href="/products/new">
              <Button leftIcon={<Plus className="h-4 w-4" />}>Novo produto</Button>
            </Link>
          }
        />
      ) : (
        <>
          <DataTable
            loading={productsQ.isLoading}
            columns={columns}
            rows={rows}
            rowKey={r => r.id}
            rowHref={r => `/products/${r.id}`}
            selectable
            selectedIds={selected}
            onSelectionChange={setSelected}
          />

          {meta && meta.totalPages && meta.page && (
            <Pagination
              page={meta.page}
              totalPages={meta.totalPages}
              total={meta.total}
              onChange={p => setQuery({ page: p })}
            />
          )}
        </>
      )}

      {/* Bulk action bar — só aparece quando tem seleção */}
      <BulkActionBar count={selected.length} onClear={() => setSelected([])}>
        <Button size="sm" variant="secondary" leftIcon={<Eye className="h-3.5 w-3.5" />} onClick={() => setBulkConfirm('activate')}>
          Ativar
        </Button>
        <Button size="sm" variant="secondary" leftIcon={<EyeOff className="h-3.5 w-3.5" />} onClick={() => setBulkConfirm('deactivate')}>
          Desativar
        </Button>
        <Button size="sm" variant="secondary" leftIcon={<Star className="h-3.5 w-3.5" />} onClick={() => setBulkConfirm('feature')}>
          Destacar
        </Button>
        <Button size="sm" variant="danger" leftIcon={<Trash2 className="h-3.5 w-3.5" />} onClick={() => setBulkConfirm('delete')}>
          Excluir
        </Button>
      </BulkActionBar>

      {/* Confirmação */}
      <ConfirmDialog
        open={bulkConfirm !== null}
        title={bulkConfirm ? `${actionLabel(bulkConfirm)} ${selected.length} produtos?` : ''}
        description={
          bulkConfirm === 'delete'
            ? 'A exclusão é permanente. Vai liberar variações, imagens e referências em pedidos antigos preservadas como histórico.'
            : 'A ação é aplicada agora e pode ser revertida.'
        }
        destructive={bulkConfirm === 'delete'}
        confirmLabel={bulkConfirm ? actionLabel(bulkConfirm) : 'Confirmar'}
        loading={bulk.isPending}
        onConfirm={() => bulkConfirm && bulk.mutate(bulkConfirm)}
        onClose={() => setBulkConfirm(null)}
      />
    </div>
  )
}

function actionLabel(a: 'delete' | 'activate' | 'deactivate' | 'feature' | 'unfeature'): string {
  switch (a) {
    case 'activate':   return 'Ativar'
    case 'deactivate': return 'Desativar'
    case 'feature':    return 'Destacar'
    case 'unfeature':  return 'Tirar destaque'
    case 'delete':     return 'Excluir'
  }
}
