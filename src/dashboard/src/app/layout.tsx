import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from './providers'

const inter = Inter({ subsets: ['latin'], variable: '--font-sans', display: 'swap' })

export const metadata: Metadata = {
  title: { default: 'Miami Store · Painel', template: '%s | Miami Admin' },
  description: 'Painel administrativo da Miami Store',
  robots: { index: false, follow: false },  // dashboard interno, fora do indexador
}
export const viewport: Viewport = { width: 'device-width', initialScale: 1, themeColor: '#1B5E20' }

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={inter.variable}>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
