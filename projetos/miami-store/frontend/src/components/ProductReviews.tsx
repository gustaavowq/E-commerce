'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { MessageSquare, AlertCircle, CheckCircle2 } from 'lucide-react'
import { listReviews, postReview } from '@/services/reviews'
import { useAuth } from '@/stores/auth'
import { StarRating } from './StarRating'
import { Button } from './ui/Button'
import { ApiError } from '@/lib/api-error'
import { formatDateBR as formatDate } from '@/lib/format'
import type { ReviewsPayload } from '@/services/types'

type Props = { productId: string }

export function ProductReviews({ productId }: Props) {
  const user = useAuth(s => s.user)
  const [data, setData]   = useState<ReviewsPayload | null>(null)
  const [loading, setLoading] = useState(true)

  // Form
  const [rating, setRating]   = useState(5)
  const [comment, setComment] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [submitOk, setSubmitOk]       = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    listReviews(productId)
      .then(d => !cancelled && setData(d))
      .catch(() => !cancelled && setData(null))
      .finally(() => !cancelled && setLoading(false))
    return () => { cancelled = true }
  }, [productId])

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitError(null); setSubmitOk(null)
    setSubmitting(true)
    try {
      const res = await postReview({ productId, rating, comment: comment.trim() || undefined })
      setSubmitOk(res.message)
      // Atualiza "mine" sem refetch completo
      setData(d => d ? { ...d, mine: { id: res.id, rating: res.rating, comment: res.comment, isApproved: res.isApproved } } : d)
    } catch (err) {
      setSubmitError(ApiError.is(err) ? err.message : 'Erro ao enviar')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section className="mt-10">
      <h2 className="font-display text-2xl text-ink mb-4 flex items-center gap-2">
        <MessageSquare className="h-5 w-5 text-primary-700" /> Avaliações
      </h2>

      {loading ? (
        <p className="text-sm text-ink-3">Carregando…</p>
      ) : !data || data.summary.total === 0 ? (
        <div className="rounded-lg border border-border bg-white p-6">
          <p className="text-sm text-ink-2">Nenhuma avaliação ainda. Seja o primeiro a comentar.</p>
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
          {/* Resumo */}
          <div className="rounded-lg border border-border bg-white p-5">
            <p className="text-4xl font-bold text-ink">{data.summary.average.toFixed(1)}</p>
            <StarRating value={data.summary.average} size="md" className="mt-1" />
            <p className="mt-1 text-xs text-ink-3">{data.summary.total} {data.summary.total === 1 ? 'avaliação' : 'avaliações'}</p>

            <ul className="mt-4 space-y-1">
              {data.summary.distribution.slice().reverse().map(d => {
                const pct = data.summary.total > 0 ? (d.count / data.summary.total) * 100 : 0
                return (
                  <li key={d.star} className="flex items-center gap-2 text-xs">
                    <span className="w-3 text-ink-3">{d.star}</span>
                    <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-surface-2">
                      <div className="h-full rounded-full bg-warning" style={{ width: `${pct}%` }} />
                    </div>
                    <span className="w-6 text-right text-ink-3">{d.count}</span>
                  </li>
                )
              })}
            </ul>
          </div>

          {/* Lista de reviews */}
          <ul className="space-y-3">
            {data.reviews.map(r => (
              <li key={r.id} className="rounded-lg border border-border bg-white p-4 animate-fade-up">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-ink">{r.userName}</p>
                    <StarRating value={r.rating} size="sm" />
                  </div>
                  <p className="text-xs text-ink-3">{formatDate(r.createdAt)}</p>
                </div>
                {r.comment && <p className="mt-2 text-sm text-ink-2 whitespace-pre-line">{r.comment}</p>}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Form */}
      <div className="mt-6 rounded-lg border border-border bg-white p-5">
        <h3 className="text-base font-bold text-ink mb-3">Avalie esse produto</h3>

        {!user ? (
          <p className="text-sm text-ink-3">
            <Link href={`/auth/login?next=/products`} className="font-semibold text-primary-700 hover:underline">Faça login</Link> pra avaliar.
          </p>
        ) : data?.mine ? (
          <div className="rounded-md border border-success/30 bg-success/5 p-3 text-sm text-success">
            <p className="flex items-center gap-2 font-semibold">
              <CheckCircle2 className="h-4 w-4" /> Você já avaliou esse produto
            </p>
            <div className="mt-2 flex items-center gap-2">
              <StarRating value={data.mine.rating} size="sm" />
              {!data.mine.isApproved && <span className="text-xs text-warning">Em moderação</span>}
            </div>
            {data.mine.comment && <p className="mt-1 text-ink-2">&ldquo;{data.mine.comment}&rdquo;</p>}
          </div>
        ) : (
          <form onSubmit={submit} className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-ink-2 mb-1">Sua nota</label>
              <StarRating value={rating} interactive onChange={setRating} size="lg" />
            </div>
            <div>
              <label className="block text-xs font-medium text-ink-2 mb-1">Comentário <span className="text-ink-4">(opcional)</span></label>
              <textarea
                value={comment} onChange={e => setComment(e.target.value)}
                rows={3} maxLength={1000}
                placeholder="Conta pra galera o que achou…"
                className="w-full rounded-md border border-border bg-white px-3 py-2 text-sm focus:border-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-700/20"
              />
            </div>
            {submitError && (
              <div className="flex items-start gap-2 rounded-md border border-error/30 bg-error/5 px-3 py-2 text-sm text-error">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" /> {submitError}
              </div>
            )}
            {submitOk && (
              <div className="flex items-start gap-2 rounded-md border border-success/30 bg-success/5 px-3 py-2 text-sm text-success">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" /> {submitOk}
              </div>
            )}
            <Button type="submit" loading={submitting}>Enviar avaliação</Button>
          </form>
        )}
      </div>
    </section>
  )
}
