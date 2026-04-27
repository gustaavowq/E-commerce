// =============================================================================
// Kore Tech — Painel admin > Lista de espera
//
// Anti-paper-launch (3º diferencial): produtos esgotados com fila de pessoas
// querendo. Botão "notificar disponível" dispara email pra todos quem inscreveu.
// =============================================================================

'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  BellRing, Bell, Trash2, ChevronDown, ChevronUp, AlertCircle, CheckCircle2,
} from 'lucide-react'
import { adminWaitlist } from '@/services/admin'
import type { WaitlistByProduct, WaitlistEntry } from '@/services/types'
import { Button } from '@/components/ui/Button'
import { EmptyState, Skeleton } from '@/components/Skeleton'
import { ConfirmDialog } from '@/components/ConfirmDialog'
import { useToast } from '@/components/Toast'
import { formatDateTime, relativeTime } from '@/lib/format'

export default function WaitlistPage() {
  const qc    = useQueryClient()
  const toast = useToast()
  const [expanded,     setExpanded]     = useState<string | null>(null)
  const [confirmNotify, setConfirmNotify] = useState<WaitlistByProduct | null>(null)

  const productsQ = useQuery({
    queryKey: ['admin', 'waitlist', 'by-product'],
    queryFn:  () => adminWaitlist.byProduct(50),
  })

  const notifyAll = useMutation({
    mutationFn: (productId: string) => adminWaitlist.notifyAll(productId),
    onSuccess: (res) => {
      toast.push({ tone: 'success', title: `${res.notified} pessoas notificadas` })
      qc.invalidateQueries({ queryKey: ['admin', 'waitlist'] })
      setConfirmNotify(null)
    },
    onError: (err: unknown) => {
      toast.push({ tone: 'error', title: 'Não foi possível notificar', body: err instanceof Error ? err.message : '' })
    },
  })

  const products = productsQ.data ?? []

  return (
    <div className="space-y-5">
      <header>
        <h1 className="text-2xl font-bold text-text">Lista de espera</h1>
        <p className="text-sm text-text-secondary">
          Pessoas esperando produtos esgotados. Quando o estoque voltar, dispare a notificação pra todos da fila.
        </p>
      </header>

      {productsQ.isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-16 w-full" />)}
        </div>
      ) : products.length === 0 ? (
        <EmptyState
          icon={<BellRing className="h-5 w-5" />}
          title="Lista de espera vazia"
          description="Quando alguém clicar em 'me avise quando voltar' em um produto sem estoque, ele aparece aqui."
        />
      ) : (
        <ul className="space-y-2">
          {products.map(p => (
            <li key={p.productId} className="rounded-lg border border-border bg-surface shadow-md overflow-hidden">
              <button
                onClick={() => setExpanded(expanded === p.productId ? null : p.productId)}
                className="flex w-full items-center gap-3 px-5 py-4 text-left hover:bg-surface-2"
              >
                <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-md bg-surface-2 ring-1 ring-border">
                  {p.productImage ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img src={p.productImage} alt={p.productName} className="h-full w-full object-cover" />
                  ) : (
                    <BellRing className="absolute inset-0 m-auto h-4 w-4 text-text-muted" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold text-text">{p.productName}</p>
                  <p className="truncate text-xs font-mono text-text-secondary">{p.productSlug}</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className="font-mono text-lg font-bold text-primary">{p.totalActive}</p>
                    <p className="text-[10px] uppercase tracking-wide text-text-muted">esperando</p>
                  </div>
                  {p.inStock ? (
                    <span className="inline-flex items-center gap-1 rounded-pill bg-success-soft px-2.5 py-1 text-[10px] font-bold uppercase text-success">
                      <CheckCircle2 className="h-3 w-3" /> Em estoque
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 rounded-pill bg-warning-soft px-2.5 py-1 text-[10px] font-bold uppercase text-warning">
                      <AlertCircle className="h-3 w-3" /> Esgotado
                    </span>
                  )}
                  <Button
                    size="sm"
                    variant={p.inStock ? 'primary' : 'secondary'}
                    leftIcon={<Bell className="h-3.5 w-3.5" />}
                    onClick={(e) => { e.stopPropagation(); setConfirmNotify(p) }}
                    disabled={!p.inStock}
                    aria-label={`Notificar ${p.totalActive} pessoas do ${p.productName}`}
                  >
                    Notificar
                  </Button>
                  {expanded === p.productId
                    ? <ChevronUp className="h-4 w-4 text-text-muted" />
                    : <ChevronDown className="h-4 w-4 text-text-muted" />}
                </div>
              </button>

              {expanded === p.productId && (
                <WaitlistEntries productId={p.productId} />
              )}
            </li>
          ))}
        </ul>
      )}

      <ConfirmDialog
        open={confirmNotify !== null}
        title={confirmNotify ? `Notificar ${confirmNotify.totalActive} pessoas?` : ''}
        description={confirmNotify
          ? `Vai disparar email pra todos os ${confirmNotify.totalActive} inscritos avisando que ${confirmNotify.productName} está disponível. Reserva 24h conforme política.`
          : ''}
        confirmLabel="Notificar todos"
        loading={notifyAll.isPending}
        onConfirm={() => confirmNotify && notifyAll.mutate(confirmNotify.productId)}
        onClose={() => setConfirmNotify(null)}
      />
    </div>
  )
}

// -----------------------------------------------------------------------------
// Sub: lista de inscrições do produto
// -----------------------------------------------------------------------------
function WaitlistEntries({ productId }: { productId: string }) {
  const qc    = useQueryClient()
  const toast = useToast()

  const entriesQ = useQuery({
    queryKey: ['admin', 'waitlist', 'product', productId],
    queryFn:  () => adminWaitlist.list(productId),
  })

  const remove = useMutation({
    mutationFn: (entryId: string) => adminWaitlist.remove(entryId),
    onSuccess: () => {
      toast.push({ tone: 'success', title: 'Inscrição removida' })
      qc.invalidateQueries({ queryKey: ['admin', 'waitlist'] })
    },
  })

  const notifyOne = useMutation({
    mutationFn: (entryId: string) => adminWaitlist.notifyOne(entryId),
    onSuccess: () => {
      toast.push({ tone: 'success', title: 'Notificado' })
      qc.invalidateQueries({ queryKey: ['admin', 'waitlist'] })
    },
  })

  if (entriesQ.isLoading) {
    return <div className="border-t border-border px-5 py-3 text-xs text-text-secondary">Carregando…</div>
  }

  const entries: WaitlistEntry[] = entriesQ.data ?? []
  if (entries.length === 0) {
    return <div className="border-t border-border px-5 py-3 text-xs text-text-secondary">Nenhuma inscrição.</div>
  }

  return (
    <ul className="border-t border-border divide-y divide-border bg-surface-2/50">
      {entries.map(e => (
        <li key={e.id} className="flex items-center justify-between gap-3 px-5 py-2.5 text-sm">
          <div className="min-w-0 flex-1">
            <p className="truncate text-text">{e.email}</p>
            <p className="text-xs text-text-muted">
              {relativeTime(e.createdAt)} · {formatDateTime(e.createdAt)}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {e.notifiedAt ? (
              <span className="inline-flex rounded-pill bg-success-soft px-2 py-0.5 text-[10px] font-bold uppercase text-success">
                Notificado
              </span>
            ) : (
              <button
                onClick={() => notifyOne.mutate(e.id)}
                disabled={notifyOne.isPending}
                className="rounded-md border border-primary/40 bg-transparent px-2.5 py-1 text-xs font-semibold text-primary hover:bg-primary-soft disabled:opacity-50"
              >
                Notificar
              </button>
            )}
            <button
              onClick={() => remove.mutate(e.id)}
              disabled={remove.isPending}
              className="rounded p-1.5 text-text-secondary hover:bg-danger-soft hover:text-danger disabled:opacity-50"
              aria-label="Remover inscrição"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        </li>
      ))}
    </ul>
  )
}
