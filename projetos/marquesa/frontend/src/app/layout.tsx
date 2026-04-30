import type { Metadata } from 'next'
import { Cormorant_Garamond, Inter } from 'next/font/google'
import { Providers } from './providers'
import { GoogleAnalytics } from '@/components/analytics/GoogleAnalytics'
import { MetaPixel } from '@/components/analytics/MetaPixel'
import { CookieConsent } from '@/components/CookieConsent'
import './globals.css'

// preload + display:swap COM adjustFontFallback (default true) reduz FOUT.
// Adicionado fallback explícito casado nas métricas pra evitar
// "bold mudando ao recarregar" — feedback Gustavo iter5.
const display = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['300', '400', '500'],
  variable: '--font-display-google',
  display: 'swap',
  preload: true,
  fallback: ['Georgia', 'Cambria', 'Times New Roman', 'serif'],
  adjustFontFallback: true,
})

const sans = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-sans-google',
  display: 'swap',
  preload: true,
  fallback: ['system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
  adjustFontFallback: true,
})

export const metadata: Metadata = {
  title: {
    default: 'Marquesa — Imóveis com curadoria',
    template: '%s · Marquesa',
  },
  description:
    'Apartamentos, casas e coberturas em endereços selecionados de São Paulo. Reserva por sinal via Pix.',
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
  openGraph: {
    title: 'Marquesa — Imóveis com curadoria',
    description: 'Imobiliária boutique. Curadoria de imóveis alto padrão em São Paulo e Rio.',
    type: 'website',
    locale: 'pt_BR',
  },
  robots: { index: true, follow: true },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={`${display.variable} ${sans.variable}`}>
      <head>
        {/* Preenche as CSS vars usadas pelos tokens com as fontes carregadas via next/font.
            Tokens.css declara fallback Cormorant/Inter; aqui usamos a versão otimizada do next. */}
        <style>{`
          :root {
            --font-display: var(--font-display-google), 'Cormorant Garamond', Georgia, serif;
            --font-sans: var(--font-sans-google), 'Inter', system-ui, sans-serif;
          }
        `}</style>
      </head>
      <body className="bg-paper text-ink antialiased">
        <Providers>{children}</Providers>
        {/* Analytics carregam só com consent do usuário (LGPD). */}
        <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA4_ID} />
        <MetaPixel pixelId={process.env.NEXT_PUBLIC_META_PIXEL_ID} />
        <CookieConsent />
      </body>
    </html>
  )
}
