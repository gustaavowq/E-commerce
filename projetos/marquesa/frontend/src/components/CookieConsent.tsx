'use client'

// Banner de consentimento de cookies (LGPD).
// 3 categorias: essenciais (sempre on), analytics (toggle), marketing (toggle).
// Aparece só se ainda não decidiu. Discreto no rodapé, sem bloquear conteúdo.

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useCookieConsent } from '@/hooks/useCookieConsent'
import { microcopy } from '@/lib/microcopy'
import { cn } from '@/lib/format'

export function CookieConsent() {
  const { consent, hydrated, hasDecided, acceptAll, rejectNonEssential, update } =
    useCookieConsent()
  const [open, setOpen] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [analyticsToggle, setAnalyticsToggle] = useState(consent.analytics)
  const [marketingToggle, setMarketingToggle] = useState(consent.marketing)

  // Só mostra depois de hidratar — evita flash em SSR.
  useEffect(() => {
    if (hydrated && !hasDecided) {
      // Pequeno delay pra não competir com hero load.
      const t = setTimeout(() => setOpen(true), 600)
      return () => clearTimeout(t)
    }
  }, [hydrated, hasDecided])

  useEffect(() => {
    setAnalyticsToggle(consent.analytics)
    setMarketingToggle(consent.marketing)
  }, [consent.analytics, consent.marketing])

  if (!hydrated || hasDecided || !open) return null

  const c = microcopy.cookies

  function handleAcceptAll() {
    acceptAll()
    setOpen(false)
  }
  function handleEssentialsOnly() {
    rejectNonEssential()
    setOpen(false)
  }
  function handleSavePreferences() {
    update({ analytics: analyticsToggle, marketing: marketingToggle })
    setOpen(false)
  }

  return (
    <div
      role="dialog"
      aria-live="polite"
      aria-label="Consentimento de cookies"
      className={cn(
        'fixed inset-x-0 bottom-0 z-50',
        'border-t border-bone bg-paper/98 backdrop-blur',
        'shadow-[0_-8px_32px_rgba(0,0,0,0.06)]',
      )}
    >
      <div className="container-marquesa py-6 md:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-6 items-start">
          <div className="max-w-3xl">
            <p className="text-eyebrow uppercase tracking-[0.16em] text-ash mb-2">
              {c.titulo}
            </p>
            <p className="text-body-sm text-ink leading-relaxed">
              {c.texto}{' '}
              <Link
                href="/policies/privacidade"
                className="underline underline-offset-4 hover:text-moss transition-colors duration-fast"
              >
                {c.saiba_mais}
              </Link>
              .
            </p>

            {showSettings && (
              <div className="mt-5 flex flex-col gap-3 border border-bone p-4 bg-paper-warm">
                <ConsentRow
                  title="Essenciais"
                  description="Necessários pra autenticação, sessão e segurança. Sempre ativos."
                  checked
                  disabled
                />
                <ConsentRow
                  title="Analytics"
                  description="Entender como o site é usado pra melhorar o catálogo e a experiência."
                  checked={analyticsToggle}
                  onChange={setAnalyticsToggle}
                />
                <ConsentRow
                  title="Marketing"
                  description="Mensurar campanhas e personalizar comunicações. Opcional."
                  checked={marketingToggle}
                  onChange={setMarketingToggle}
                />
              </div>
            )}
          </div>

          <div className="flex flex-col sm:flex-row lg:flex-col gap-3 lg:items-end">
            {showSettings ? (
              <button
                onClick={handleSavePreferences}
                className="inline-flex items-center justify-center px-6 py-3 bg-moss text-paper text-body-sm uppercase tracking-[0.04em] hover:bg-moss-deep transition-colors duration-fast"
              >
                Salvar preferências
              </button>
            ) : (
              <button
                onClick={handleAcceptAll}
                className="inline-flex items-center justify-center px-6 py-3 bg-moss text-paper text-body-sm uppercase tracking-[0.04em] hover:bg-moss-deep transition-colors duration-fast"
              >
                {c.aceitar}
              </button>
            )}
            <button
              onClick={handleEssentialsOnly}
              className="inline-flex items-center justify-center px-6 py-3 border border-ink text-ink text-body-sm uppercase tracking-[0.04em] hover:bg-ink hover:text-paper transition-colors duration-fast"
            >
              {c.recusar}
            </button>
            <button
              onClick={() => setShowSettings((v) => !v)}
              className="text-body-sm text-ash hover:text-ink transition-colors duration-fast underline underline-offset-4"
            >
              {showSettings ? 'Fechar configurações' : 'Configurar'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function ConsentRow({
  title,
  description,
  checked,
  disabled,
  onChange,
}: {
  title: string
  description: string
  checked: boolean
  disabled?: boolean
  onChange?: (v: boolean) => void
}) {
  return (
    <label
      className={cn(
        'flex items-start gap-3 cursor-pointer',
        disabled && 'cursor-not-allowed opacity-70',
      )}
    >
      <input
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={(e) => onChange?.(e.target.checked)}
        className="mt-1 accent-moss"
      />
      <span>
        <span className="block text-body-sm text-ink font-medium">{title}</span>
        <span className="block text-caption text-ash mt-0.5">{description}</span>
      </span>
    </label>
  )
}
