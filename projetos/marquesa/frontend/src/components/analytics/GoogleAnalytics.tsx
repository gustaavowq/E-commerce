'use client'

// GA4 placeholder. Só carrega scripts se:
// 1. gaId foi fornecido (env NEXT_PUBLIC_GA4_ID)
// 2. Cookie consent autorizou categoria 'analytics' (LGPD)
// 3. Não estamos no painel admin (ruído analítico)

import Script from 'next/script'
import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { useCookieConsent } from '@/hooks/useCookieConsent'

interface Props {
  gaId?: string
}

export function GoogleAnalytics({ gaId }: Props) {
  const { consent, hydrated } = useCookieConsent()
  const pathname = usePathname()
  const [enabled, setEnabled] = useState(false)

  useEffect(() => {
    if (!hydrated) return
    setEnabled(Boolean(gaId) && consent.analytics === true)
  }, [gaId, consent.analytics, hydrated])

  // Não rastreia área autenticada — pra não poluir KPIs com sessão de admin.
  const isAdminArea = pathname?.startsWith('/painel') || pathname?.startsWith('/auth')

  if (!gaId || !enabled || isAdminArea) return null

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
        strategy="afterInteractive"
      />
      <Script id="ga4-init" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${gaId}', {
            anonymize_ip: true,
            cookie_flags: 'SameSite=Lax;Secure'
          });
        `}
      </Script>
    </>
  )
}
