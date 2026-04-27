import type { Metadata } from 'next'
import { ContatoClient } from './ContatoClient'

export const metadata: Metadata = {
  title: 'Contato',
  description: 'Fale com a Kore Tech: WhatsApp, email ou formulario. Resposta em ate 1 dia util.',
}

export default function ContatoPage() {
  return <ContatoClient />
}
