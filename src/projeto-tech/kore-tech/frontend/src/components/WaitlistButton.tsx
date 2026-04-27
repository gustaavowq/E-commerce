'use client'

import { useState } from 'react'
import { Bell, BellRing, Check } from 'lucide-react'
import { Button } from './ui/Button'
import { subscribeWaitlist } from '@/services/waitlist'
import { useAuth } from '@/stores/auth'
import { ApiError } from '@/lib/api-error'
import { cn } from '@/lib/utils'

type Props = {
  productId: string
  productName: string
  className?: string
}

/**
 * Substitui o botao "comprar" quando produto esta sem estoque.
 * Coleta email (preenchido automatico se logado), POSTa pra /api/waitlist/subscribe.
 */
export function WaitlistButton({ productId, productName, className }: Props) {
  const user = useAuth((s) => s.user)
  const [open, setOpen] = useState(false)
  const [email, setEmail] = useState(user?.email ?? '')
  const [done, setDone] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!email.trim()) return
    setSubmitting(true)
    setError(null)
    try {
      await subscribeWaitlist({ productId, email: email.trim() })
      setDone(true)
    } catch (err) {
      const msg = ApiError.is(err) ? err.message : 'Nao foi possivel inscrever na lista. Tente de novo.'
      setError(msg)
    } finally {
      setSubmitting(false)
    }
  }

  if (done) {
    return (
      <div className={cn('flex items-center gap-2 rounded-md border border-success bg-success/10 px-4 py-3 text-sm text-success', className)}>
        <Check className="h-5 w-5" />
        <span>Voce vai ser avisado quando {productName.length > 30 ? 'o produto' : productName} entrar em estoque.</span>
      </div>
    )
  }

  return (
    <div className={cn('rounded-md border border-warning/40 bg-warning/5', className)}>
      {!open ? (
        <div className="flex flex-col gap-2 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-text">Sem estoque no momento</p>
            <p className="text-xs text-text-secondary">Reservamos 24h pra primeiros da fila quando chega novo lote.</p>
          </div>
          <Button onClick={() => setOpen(true)} variant="outline" size="md" className="touch-44">
            <Bell className="h-4 w-4" /> Avise-me
          </Button>
        </div>
      ) : (
        <form onSubmit={submit} className="flex flex-col gap-3 p-4">
          <label className="flex items-center gap-2 text-sm font-semibold text-text">
            <BellRing className="h-4 w-4 text-primary" />
            Te aviso por e-mail assim que chegar
          </label>
          <input
            type="email"
            value={email}
            required
            onChange={(e) => setEmail(e.target.value)}
            placeholder="seu@email.com"
            className="h-11 rounded-md border border-border bg-bg px-3 text-sm text-text placeholder:text-text-muted focus:border-primary focus:outline-none"
          />
          {error && <p className="text-xs text-danger">{error}</p>}
          <div className="flex gap-2">
            <Button type="submit" loading={submitting} className="flex-1 touch-44">
              Entrar na lista
            </Button>
            <Button type="button" variant="ghost" onClick={() => setOpen(false)} className="touch-44">
              Cancelar
            </Button>
          </div>
        </form>
      )}
    </div>
  )
}
