'use client'

// Meta Pixel (Facebook). Só carrega se:
// 1. pixelId fornecido (env NEXT_PUBLIC_META_PIXEL_ID)
// 2. Consent 'marketing' = true
// 3. Fora de /painel e /auth

import Script from 'next/script'
import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { useCookieConsent } from '@/hooks/useCookieConsent'

interface Props {
  pixelId?: string
}

export function MetaPixel({ pixelId }: Props) {
  const { consent, hydrated } = useCookieConsent()
  const pathname = usePathname()
  const [enabled, setEnabled] = useState(false)

  useEffect(() => {
    if (!hydrated) return
    setEnabled(Boolean(pixelId) && consent.marketing === true)
  }, [pixelId, consent.marketing, hydrated])

  const isAdminArea = pathname?.startsWith('/painel') || pathname?.startsWith('/auth')

  if (!pixelId || !enabled || isAdminArea) return null

  return (
    <>
      <Script id="meta-pixel" strategy="afterInteractive">
        {`
          !function(f,b,e,v,n,t,s)
          {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
          n.callMethod.apply(n,arguments):n.queue.push(arguments)};
          if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
          n.queue=[];t=b.createElement(e);t.async=!0;
          t.src=v;s=b.getElementsByTagName(e)[0];
          s.parentNode.insertBefore(t,s)}(window, document,'script',
          'https://connect.facebook.net/en_US/fbevents.js');
          fbq('init', '${pixelId}');
          fbq('track', 'PageView');
        `}
      </Script>
      <noscript>
        <img
          height="1"
          width="1"
          style={{ display: 'none' }}
          alt=""
          src={`https://www.facebook.com/tr?id=${pixelId}&ev=PageView&noscript=1`}
        />
      </noscript>
    </>
  )
}
