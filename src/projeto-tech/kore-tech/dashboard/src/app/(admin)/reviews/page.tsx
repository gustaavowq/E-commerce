// =============================================================================
// Kore Tech — Painel admin > Reviews (moderação)
//
// Filtra por status (pendentes em destaque). Aprovar / Rejeitar / Remover.
// =============================================================================

'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Star, CheckCircle2, XCircle, Trash2, Filter,
} from 'lucide-react'
import { adminReviews } from '@/services/admin'
import type { AdminReview, ReviewStatus } from '@/services/types'
import { Button } from '@/components/ui/Button'
import { Select } from '@/components/ui/Select'
import { Pagination } from '@/components/Pagination'
import { EmptyState, Skeleton } from '@/components/Skeleton'
import { StatusBadge } from '@/components/StatusBadge'
import { ConfirmDialog } from '@/components/ConfirmDialog'
import { useToast } from '@/components/Toast'
import { formatDateTime } from '@/lib/format'
import { cn } from '@/lib/utils'

const STATUS_FILTERS: Array<{ value: ReviewStatus | ''; label: string }> = [
  { value: '',         label: 'Todos status' },
  { value: 'PENDING',  label: 'Pendentes' },
  { value: 'APPROVED', label: 'Aprovados' },
  { value: 'REJECTED', label: 'Rejeitados' },
]

export default function ReviewsPage() {
  const qc    = useQueryClient()
  const toast = useToast()

  const [status,  setStatus]  = useState<ReviewStatus | ''>('PENDING')
  const [page,    setPage]    = useState(1)
  const [confirmDelete, setConfirmDelete] = useState<AdminReview | null>(null)

  const reviewsQ = useQuery({
    queryKey: ['admin', 'reviews', status || 'all', page],
    queryFn:  () => adminReviews.list({
      status: (status || undefined) as ReviewStatus | undefined,
      page,
      limit: 20,
    }),
  })

  const approve = useMutation({
    mutationFn: (id: string) => adminReviews.approve(id),
    onSuccess: () => {
      toast.push({ tone: 'success', title: 'Review aprovado' })
      qc.invalidateQueries({ queryKey: ['admin', 'reviews'] })
    },
    onError: (err: unknown) => {
      toast.push({ tone: 'error', title: 'Falha ao aprovar', body: err instanceof Error ? err.message : '' })
    },
  })

  const reject = useMutation({
    mutationFn: (id: string) => adminReviews.reject(id),
    onSuccess: () => {
      toast.push({ tone: 'success', title: 'Review rejeitado' })
      qc.invalidateQueries({ queryKey: ['admin', 'reviews'] })
    },
    onError: (err: unknown) => {
      toast.push({ tone: 'error', title: 'Falha ao rejeitar', body: err instanceof Error ? err.message : '' })
    },
  })

  const remove = useMutation({
    mutationFn: (id: string) => adminReviews.remove(id),
    onSuccess: () => {
      toast.push({ tone: 'success', title: 'Review removido' })
      qc.invalidateQueries({ queryKey: ['admin', 'reviews'] })
      setConfirmDelete(null)
    },
    onError: (err: unknown) => {
      toast.push({ tone: 'error', title: 'Falha ao remover', body: err instanceof Error ? err.message : '' })
    },
  })

  const reviews = reviewsQ.data?.data ?? []
  const meta    = reviewsQ.data?.meta

  return (
    <div className="space-y-5">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-text">Reviews</h1>
          <p className="text-sm text-text-secondary">
            Modere reviews antes de aparecerem na PDP. Aprove rápido, rejeite spam ou conteúdo ofensivo.
          </p>
        </div>
        <div className="inline-flex items-center gap-2">
          <Filter className="h-3 w-3 text-text-muted" />
          <Select
            value={status}
            onChange={e => { setStatus(e.target.value as ReviewStatus | ''); setPage(1) }}
            className="w-44"
          >
            {STATUS_FILTERS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
          </Select>
        </div>
      </header>

      {reviewsQ.isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-32 w-full" />)}
        </div>
      ) : reviews.length === 0 ? (
        <EmptyState
          icon={<Star className="h-5 w-5" />}
          title="Nenhum review"
          description={status === 'PENDING' ? 'Sem nada pendente. Bom trabalho!' : 'Nenhum review nesse filtro.'}
        />
      ) : (
        <ul className="space-y-3">
          {reviews.map(r => (
            <li key={r.id} className="rounded-lg border border-border bg-surface p-5 shadow-md">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <Stars rating={r.rating} />
                    <span className="text-xs text-text-muted">{formatDateTime(r.createdAt)}</span>
                    <StatusBadge kind="review" status={r.status} />
                  </div>
                  {r.title && <h3 className="mt-2 text-base font-bold text-text">{r.title}</h3>}
                  <p className="mt-1 text-sm text-text-secondary whitespace-pre-line">{r.body}</p>
                  <div className="mt-3 flex items-center gap-3 text-xs text-text-muted">
                    <span>Por <strong className="text-text">{r.userName}</strong> ({r.userEmail})</span>
                    <span>·</span>
                    <Link href={`/products/${r.productId}`} className="text-primary hover:text-primary-hover">
                      {r.productName}
                    </Link>
                  </div>
                </div>
                <div className="flex shrink-0 flex-col gap-2">
                  {r.status !== 'APPROVED' && (
                    <Button
                      size="sm"
                      variant="primary"
                      leftIcon={<CheckCircle2 className="h-3.5 w-3.5" />}
                      loading={approve.isPending && approve.variables === r.id}
                      onClick={() => approve.mutate(r.id)}
                    >
                      Aprovar
                    </Button>
                  )}
                  {r.status !== 'REJECTED' && (
                    <Button
                      size="sm"
                      variant="secondary"
                      leftIcon={<XCircle className="h-3.5 w-3.5" />}
                      loading={reject.isPending && reject.variables === r.id}
                      onClick={() => reject.mutate(r.id)}
                    >
                      Rejeitar
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="ghost"
                    leftIcon={<Trash2 className="h-3.5 w-3.5" />}
                    onClick={() => setConfirmDelete(r)}
                  >
                    Remover
                  </Button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      {meta && meta.totalPages && meta.page && (
        <Pagination page={meta.page} totalPages={meta.totalPages} total={meta.total} onChange={setPage} />
      )}

      <ConfirmDialog
        open={confirmDelete !== null}
        title="Remover esse review?"
        description="Diferente de rejeitar, remover apaga o registro permanentemente."
        destructive
        confirmLabel="Remover"
        loading={remove.isPending}
        onConfirm={() => confirmDelete && remove.mutate(confirmDelete.id)}
        onClose={() => setConfirmDelete(null)}
      />
    </div>
  )
}

function Stars({ rating }: { rating: number }) {
  return (
    <span className="inline-flex">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={cn(
            'h-3.5 w-3.5',
            i < rating ? 'fill-warning text-warning' : 'text-text-muted',
          )}
        />
      ))}
    </span>
  )
}
