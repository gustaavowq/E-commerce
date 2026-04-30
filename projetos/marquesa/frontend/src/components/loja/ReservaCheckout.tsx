'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { post } from '@/lib/api'
import { useAuth } from '@/hooks/useAuth'
import { microcopy } from '@/lib/microcopy'
import { formatBRL } from '@/lib/format'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import type { ImovelDetail, Reserva } from '@/types/api'

interface ReservaCheckoutProps {
  open: boolean
  onClose: () => void
  imovel: ImovelDetail
}

export function ReservaCheckout({ open, onClose, imovel }: ReservaCheckoutProps) {
  const router = useRouter()
  const { isAuthenticated } = useAuth()
  const [accept, setAccept] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleConfirmar = async () => {
    setError(null)

    // Login necessário pra reservar — passa redirect respeitando lição.
    if (!isAuthenticated) {
      const redirect = `/imoveis/${imovel.slug}`
      router.push(`/auth/login?redirect=${encodeURIComponent(redirect)}`)
      return
    }

    if (!accept) {
      setError(microcopy.validacoes.termos_aceitar)
      return
    }

    setLoading(true)
    try {
      const data = await post<{ reserva: Reserva; sandbox: boolean }>(
        '/api/reservas',
        { imovelId: imovel.id },
        { withAuth: true },
      )
      if (data.reserva.mpInitPoint) {
        // Redireciona pro checkout do MP
        window.location.href = data.reserva.mpInitPoint
      } else {
        setError('Falha ao gerar checkout. Tente novamente.')
      }
    } catch (err) {
      setError((err as Error).message || microcopy.erros.rede)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal open={open} onClose={onClose} title={microcopy.checkout_sinal.titulo} size="md">
      <div className="flex flex-col gap-6">
        <p className="text-body text-ash">{microcopy.checkout_sinal.explicacao}</p>

        <div className="border border-bone divide-y divide-bone">
          <Row
            label={microcopy.checkout_sinal.valor_imovel}
            value={formatBRL(imovel.preco)}
          />
          <Row
            label={microcopy.checkout_sinal.valor_label}
            value={formatBRL(imovel.precoSinal)}
            highlight
          />
          <Row
            label={microcopy.checkout_sinal.prazo_label}
            value={microcopy.checkout_sinal.prazo_valor}
          />
        </div>

        <label className="flex items-start gap-3 text-body-sm text-ink cursor-pointer">
          <input
            type="checkbox"
            checked={accept}
            onChange={(e) => setAccept(e.target.checked)}
            className="mt-1 accent-moss"
          />
          <span>{microcopy.checkout_sinal.termos}</span>
        </label>

        {error && (
          <p className="text-caption text-red-600 bg-red-50 border border-red-100 px-3 py-2">
            {error}
          </p>
        )}

        <div className="flex flex-col-reverse sm:flex-row gap-3 sm:justify-end">
          <Button variant="ghost" onClick={onClose} type="button">
            {microcopy.checkout_sinal.voltar}
          </Button>
          <Button onClick={handleConfirmar} loading={loading} type="button">
            {microcopy.checkout_sinal.avancar}
          </Button>
        </div>
      </div>
    </Modal>
  )
}

function Row({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="flex items-center justify-between px-4 py-3">
      <span className="text-eyebrow uppercase tracking-[0.16em] text-ash">{label}</span>
      <span
        className={
          highlight
            ? 'font-display text-heading-lg text-ink tnum'
            : 'font-sans text-body text-ink tnum'
        }
      >
        {value}
      </span>
    </div>
  )
}
