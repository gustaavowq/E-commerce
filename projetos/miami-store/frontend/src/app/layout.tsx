import type { Metadata, Viewport } from 'next'
import { Inter, DM_Serif_Display } from 'next/font/google'
import './globals.css'
import { Providers } from './providers'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import { PromoStrip } from '@/components/PromoStrip'
import { WhatsAppButton } from '@/components/WhatsAppButton'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
})
const display = DM_Serif_Display({
  subsets: ['latin'],
  weight: '400',
  variable: '--font-display',
  display: 'swap',
})

export const metadata: Metadata = {
  title: { default: 'Miami Store · Lacoste, Nike, Adidas Originais', template: '%s | Miami Store' },
  description: 'Roupa e tênis de marca, original, com preço que cabe no bolso. Pix dá 5% off. Frete fixo R$ 15 pro Brasil todo.',
  applicationName: 'Miami Store',
  authors: [{ name: 'Miami Store' }],
  keywords: ['Lacoste', 'Nike', 'Adidas', 'Tommy', 'Polo Ralph Lauren', 'streetwear', 'roupas originais'],
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#1B5E20',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={`${inter.variable} ${display.variable}`}>
      <body className="min-h-screen flex flex-col bg-surface-alt antialiased">
        <Providers>
          <PromoStrip />
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
          <WhatsAppButton />
        </Providers>
      </body>
    </html>
  )
}
