'use client'

// Captura email pra newsletter com promessa de cupom de 5% off na primeira compra.
// Aparece só na home, depois de 30s. Persiste dismissal por 7 dias no localStorage.
// Por ora salva email no localStorage (e console.log) — quando integrar Resend,
// trocar pelo POST real pra /api/newsletter.

import { useEffect, useState } from 'react'
import { Mail, X, Sparkles, Check } from 'lucide-react'
import { Button } from '@/components/ui/Button'

const STORAGE_KEY = 'miami_newsletter_state'  // valores: 'dismissed' | 'subscribed' | timestamp

export function NewsletterPopup() {
  const [open, setOpen] = useState(false)
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (typeof window === 'undefined') return
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      // Se foi dismissed/subscribed nos últimos 7 dias, não mostra
      try {
        const data = JSON.parse(raw)
        const sevenDays = 7 * 24 * 60 * 60 * 1000
        if (data.ts && Date.now() - data.ts < sevenDays) return
      } catch {}
    }
    const t = setTimeout(() => setOpen(true), 30_000)  // 30 segundos
    return () => clearTimeout(t)
  }, [])

  function dismiss() {
    setOpen(false)
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ status: 'dismissed', ts: Date.now() }))
    }
  }

  function submit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Email inválido. Confere aí.')
      return
    }
    // TODO(resend): enviar email real via /api/newsletter quando integrar.
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ status: 'subscribed', email, ts: Date.now() }))
    }
    setSubmitted(true)
    setTimeout(() => setOpen(false), 2500)
  }

  // ESC fecha
  useEffect(() => {
    if (!open) return
    function onKey(e: KeyboardEvent) { if (e.key === 'Escape') dismiss() }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-[200] flex items-end justify-center bg-ink/40 p-4 sm:items-center backdrop-blur-sm animate-fade-in"
      onClick={dismiss}
      role="dialog"
      aria-modal="true"
      aria-label="Receba 5% de desconto"
    >
      <div
        className="relative w-full max-w-md overflow-hidden rounded-xl bg-white shadow-2xl animate-slide-up"
        onClick={e => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={dismiss}
          aria-label="Fechar"
          className="absolute right-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white/80 text-ink-3 hover:bg-white hover:text-ink"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="bg-gradient-to-br from-primary-700 via-primary-900 to-ink p-6 text-white">
          <Sparkles className="h-8 w-8 text-neon" />
          <h2 className="mt-3 font-display text-2xl">Ganha 5% de desconto</h2>
          <p className="mt-1 text-sm text-white/90">Cupom exclusivo pra primeira compra. Direto no seu email.</p>
        </div>

        <div className="p-6">
          {submitted ? (
            <div className="flex items-center gap-3 rounded-md bg-success/10 px-4 py-3 text-sm text-success animate-fade-up">
              <Check className="h-5 w-5 shrink-0" />
              <p>Pronto! Confere seu email — o cupom tá indo agora.</p>
            </div>
          ) : (
            <form onSubmit={submit} className="space-y-3">
              <label className="block">
                <span className="block text-sm font-medium text-ink-2">Seu email</span>
                <div className="mt-1 flex items-center gap-2 rounded-md border border-border bg-white px-3 py-2 focus-within:border-primary-700 focus-within:ring-2 focus-within:ring-primary-700/20">
                  <Mail className="h-4 w-4 text-ink-3" />
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="voce@exemplo.com"
                    autoFocus
                    className="flex-1 bg-transparent text-sm focus:outline-none"
                  />
                </div>
              </label>
              {error && <p className="text-xs text-error">{error}</p>}
              <Button type="submit" fullWidth size="lg">Quero meu cupom de 5%</Button>
              <p className="text-center text-[11px] text-ink-3">
                Pode cancelar quando quiser. A gente não enche o saco.
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
