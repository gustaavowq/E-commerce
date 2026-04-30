'use client'

// Hook canônico de cookie consent (LGPD).
// Storage key persistente em localStorage; analytics + marketing components
// LEEM este hook antes de carregar scripts. Categoria 'essential' é sempre true.

import { useEffect, useState, useCallback } from 'react'

export type ConsentCategory = 'essential' | 'analytics' | 'marketing'

export interface ConsentState {
  essential: true
  analytics: boolean
  marketing: boolean
  // ISO date — usado pra forçar re-prompt depois de N meses se a política mudar.
  decidedAt?: string
}

const STORAGE_KEY = 'marquesa-cookie-consent'

const DEFAULT_CONSENT: ConsentState = {
  essential: true,
  analytics: false,
  marketing: false,
}

// Eventos custom pra propagar mudança entre componentes (ex: Footer + Analytics).
const CONSENT_EVENT = 'marquesa:consent-changed'

function readConsent(): ConsentState | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as Partial<ConsentState>
    return {
      essential: true,
      analytics: parsed.analytics === true,
      marketing: parsed.marketing === true,
      decidedAt: parsed.decidedAt,
    }
  } catch {
    return null
  }
}

function writeConsent(next: ConsentState) {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
  window.dispatchEvent(new CustomEvent(CONSENT_EVENT, { detail: next }))
}

export function useCookieConsent() {
  const [consent, setConsent] = useState<ConsentState>(DEFAULT_CONSENT)
  const [hydrated, setHydrated] = useState(false)
  const [hasDecided, setHasDecided] = useState(false)

  useEffect(() => {
    const saved = readConsent()
    if (saved) {
      setConsent(saved)
      setHasDecided(true)
    }
    setHydrated(true)

    function onChange(e: Event) {
      const detail = (e as CustomEvent<ConsentState>).detail
      if (detail) {
        setConsent(detail)
        setHasDecided(true)
      }
    }
    window.addEventListener(CONSENT_EVENT, onChange)
    return () => window.removeEventListener(CONSENT_EVENT, onChange)
  }, [])

  const update = useCallback(
    (next: Partial<Omit<ConsentState, 'essential'>>) => {
      const merged: ConsentState = {
        essential: true,
        analytics: next.analytics ?? consent.analytics,
        marketing: next.marketing ?? consent.marketing,
        decidedAt: new Date().toISOString(),
      }
      writeConsent(merged)
      setConsent(merged)
      setHasDecided(true)
    },
    [consent.analytics, consent.marketing],
  )

  const acceptAll = useCallback(() => {
    update({ analytics: true, marketing: true })
  }, [update])

  const rejectNonEssential = useCallback(() => {
    update({ analytics: false, marketing: false })
  }, [update])

  return {
    consent,
    hydrated,
    hasDecided,
    update,
    acceptAll,
    rejectNonEssential,
  }
}
