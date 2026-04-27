import type { Metadata } from 'next'
import { CartClient } from './CartClient'

export const metadata: Metadata = {
  title: 'Carrinho',
  description: 'Revise os itens, aplique cupom e siga pro pagamento com Pix 5% off ou parcelado.',
}

export default function CartPage() {
  return <CartClient />
}
