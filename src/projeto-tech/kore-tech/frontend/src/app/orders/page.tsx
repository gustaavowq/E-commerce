import type { Metadata } from 'next'
import { OrdersClient } from './OrdersClient'

export const metadata: Metadata = {
  title: 'Meus pedidos',
  description: 'Acompanhe pedidos, pagamentos e envio dos seus produtos Kore Tech.',
  robots: { index: false, follow: false },
}

export default function OrdersPage() {
  return <OrdersClient />
}
