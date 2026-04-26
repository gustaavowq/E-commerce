'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Trash2, ChevronLeft, ChevronRight, Eye, EyeOff, Package } from 'lucide-react'
import { adminProducts } from '@/services/admin'
import { Button } from '@/components/ui/Button'
import { TableSkeleton, EmptyState } from '@/components/Skeleton'
import { formatBRL, formatDateTime } from '@/lib/format'
import { ApiError } from '@/lib/api-error'

export default function ProductsListPage() {
  const qc = useQueryClient()
  const [page, setPage] = useState(1)
  const [showInactive, setShowInactive] = useState(false)
  const limit = 25

  const q = useQuery({
    queryKey: ['admin', 'products', { page, showInactive }],
    queryFn:  () => adminProducts.list({ page, limit, onlyInactive: showInactive }),
  })

  const remove = useMutation({
    mutationFn: (id: string) => adminProducts.remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'products'] }),
  })

  const total = q.data?.meta?.total ?? 0
  const totalPages = q.data?.meta?.totalPages ?? 1

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-ink">Produtos</h1>
          <p className="text-sm text-ink-3">{total} produtos {showInactive ? 'inativos' : 'ativos'}</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="secondary"
            size="md"
            onClick={() => { setShowInactive(s => !s); setPage(1) }}
            leftIcon={showInactive ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
          >
            {showInactive ? 'Ver ativos' : 'Ver inativos'}
          </Button>
          <Link href="/products/new">
            <Button leftIcon={<Plus className="h-4 w-4" />}>Novo produto</Button>
          </Link>
        </div>
      </header>

      {q.isLoading ? (
        <TableSkeleton rows={6} cols={7} />
      ) : q.data && q.data.data.length > 0 ? (
        <div className="overflow-x-auto rounded-lg border border-border bg-white shadow-sm">
          <table className="min-w-full divide-y divide-border">
            <thead className="bg-surface-2 text-left text-[11px] font-semibold uppercase tracking-wider text-ink-3">
              <tr>
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
              {q.data.data.map(p => (
                <tr key={p.id} className="transition hover:bg-primary-50/40">
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
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <EmptyState
          icon={<Package className="h-6 w-6" />}
          title={showInactive ? 'Nenhum produto inativo' : 'Catálogo vazio'}
          description={showInactive
            ? 'Tudo que você cadastra fica ativo por padrão.'
            : 'Bora cadastrar o primeiro produto da loja.'}
          action={!showInactive && (
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
