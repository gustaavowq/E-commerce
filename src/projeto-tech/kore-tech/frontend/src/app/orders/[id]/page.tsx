import type { Metadata } from 'next'
import { OrderDetailClient } from './OrderDetailClient'

export const metadata: Metadata = {
  title: 'Detalhe do pedido',
  robots: { index: false, follow: false },
}

export default function OrderDetailPage({ params }: { params: { id: string } }) {
  return <OrderDetailClient id={params.id} />
}
