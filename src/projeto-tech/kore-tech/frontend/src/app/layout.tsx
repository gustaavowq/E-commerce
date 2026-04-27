import type { Metadata, Viewport } from 'next'
import { Inter, JetBrains_Mono } from 'next/font/google'
import './globals.css'
import { Providers } from './providers'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
})

const jetbrains = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
})

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3001'),
  title: {
    default: 'Kore Tech · PCs gamer e componentes com builder inteligente',
    template: '%s | Kore Tech',
  },
  description:
    'Monte seu PC gamer com checagem automatica de compatibilidade. Builds prontos por jogo, FPS estimado, lista de espera anti-paper-launch. Pix com 5% off, parcele em 12x.',
  applicationName: 'Kore Tech',
  authors: [{ name: 'Kore Tech' }],
  keywords: [
    'pc gamer',
    'montar pc',
    'pc builder',
    'rtx 4070',
    'ryzen',
    'pc para valorant',
    'pc para fortnite',
    'workstation',
    'pc para edicao',
    'pc para ia local',
  ],
  openGraph: {
    type: 'website',
    siteName: 'Kore Tech',
    locale: 'pt_BR',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#0A0E14',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={`${inter.variable} ${jetbrains.variable} dark`}>
      <body className="min-h-screen flex flex-col bg-bg text-text antialiased">
        <Providers>
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  )
}
