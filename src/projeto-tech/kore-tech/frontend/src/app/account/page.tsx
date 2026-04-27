import type { Metadata } from 'next'
import { AccountClient } from './AccountClient'

export const metadata: Metadata = {
  title: 'Minha conta',
  description: 'Dados, enderecos, pedidos, builds salvos e lista de espera.',
  robots: { index: false, follow: false },
}

export default function AccountPage() {
  return <AccountClient />
}
