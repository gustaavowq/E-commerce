'use client'

// Banner de consentimento de cookies (LGPD).
// 3 categorias: essenciais (sempre on), analytics (toggle), marketing (toggle).
// Aparece só se ainda não decidiu. Barra discreta na base. Settings abre em modal/sheet
// separado, NÃO inline expansível (evita empurrar conteúdo da página).
//
// Spec dimensional do Designer (iter2): desktop ~56px / mobile ~88-96px, sem shadow,
// border-t como único separador, botões compactos px-4 py-2 text-caption.

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

  // ESC fecha o modal de settings sem fechar o banner.
  useEffect(() => {
    if (!showSettings) return
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setShowSettings(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [showSettings])

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
    setShowSettings(false)
    setOpen(false)
  }

  return (
    <>
      {/* Banner barra única, base da viewport. */}
      <div
        role="dialog"
        aria-live="polite"
        aria-label="Consentimento de cookies"
        className={cn(
          'fixed inset-x-0 bottom-0 z-50',
          'border-t border-bone bg-paper/95 backdrop-blur',
        )}
      >
        <div className="container-marquesa py-3">
          {/* Mobile: 2 linhas. Desktop: 1 linha horizontal. */}
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between md:gap-6">
            {/* Texto */}
            <div className="md:flex-1 md:min-w-0">
              <p className="text-body-sm text-ink md:truncate">
                {c.texto_curto}{' '}
                <Link
                  href="/policies/privacidade"
                  className="text-ink underline underline-offset-4 hover:text-moss transition-colors duration-fast"
                >
                  {c.saiba_mais}
                </Link>
              </p>
            </div>

            {/* Ações */}
            <div className="flex items-center gap-3 md:shrink-0 flex-wrap">
              <button
                onClick={handleAcceptAll}
                className="px-4 py-2 bg-moss text-paper text-caption uppercase tracking-[0.04em] hover:bg-moss-deep transition-colors duration-fast"
              >
                {c.aceitar}
              </button>
              <button
                onClick={handleEssentialsOnly}
                className="px-4 py-2 border border-ink text-ink text-caption uppercase tracking-[0.04em] hover:bg-ink hover:text-paper transition-colors duration-fast"
              >
                {c.recusar}
              </button>
              <button
                onClick={() => setShowSettings(true)}
                className="text-caption text-ash hover:text-ink underline underline-offset-4 transition-colors duration-fast"
              >
                {c.configurar}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de preferências — desktop centralizado, mobile bottom-sheet. */}
      {showSettings && (
        <CookieSettingsModal
          analytics={analyticsToggle}
          marketing={marketingToggle}
          onAnalytics={setAnalyticsToggle}
          onMarketing={setMarketingToggle}
          onSave={handleSavePreferences}
          onCancel={() => setShowSettings(false)}
        />
      )}
    </>
  )
}

interface CookieSettingsModalProps {
  analytics: boolean
  marketing: boolean
  onAnalytics: (v: boolean) => void
  onMarketing: (v: boolean) => void
  onSave: () => void
  onCancel: () => void
}

function CookieSettingsModal({
  analytics,
  marketing,
  onAnalytics,
  onMarketing,
  onSave,
  onCancel,
}: CookieSettingsModalProps) {
  const c = microcopy.cookies
  return (
    <div className="fixed inset-0 z-[60] flex items-end md:items-start md:justify-center">
      {/* Backdrop */}
      <button
        type="button"
        aria-label="Fechar"
        onClick={onCancel}
        className="absolute inset-0 bg-ink/60"
      />

      {/* Painel — bottom-sheet mobile / centralizado desktop */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="cookie-modal-title"
        className={cn(
          'relative w-full bg-paper border-t border-bone p-6',
          'md:max-w-md md:mx-auto md:mt-[20vh] md:border md:border-bone md:p-8',
        )}
      >
        <h2
          id="cookie-modal-title"
          className="font-display text-heading-lg text-ink mb-2"
        >
          {c.modal_titulo}
        </h2>
        <p className="text-body-sm text-ash leading-relaxed mb-6">
          {c.modal_subtitulo}
        </p>

        <div className="flex flex-col gap-4 border-t border-bone pt-6">
          <ConsentRow
            title={c.categoria_essenciais_titulo}
            description={c.categoria_essenciais_descricao}
            checked
            disabled
          />
          <ConsentRow
            title={c.categoria_analytics_titulo}
            description={c.categoria_analytics_descricao}
            checked={analytics}
            onChange={onAnalytics}
          />
          <ConsentRow
            title={c.categoria_marketing_titulo}
            description={c.categoria_marketing_descricao}
            checked={marketing}
            onChange={onMarketing}
          />
        </div>

        <div className="mt-8 flex flex-wrap items-center gap-4 justify-end">
          <button
            onClick={onCancel}
            className="text-caption text-ash hover:text-ink underline underline-offset-4 transition-colors duration-fast"
          >
            {c.modal_cancelar}
          </button>
          <button
            onClick={onSave}
            className="px-4 py-2 bg-moss text-paper text-caption uppercase tracking-[0.04em] hover:bg-moss-deep transition-colors duration-fast"
          >
            {c.modal_salvar}
          </button>
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
