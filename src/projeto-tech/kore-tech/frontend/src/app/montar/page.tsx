import type { Metadata } from 'next'
import { BuilderClient } from './BuilderClient'

export const metadata: Metadata = {
  title: 'Builder de PC com checagem automatica de compatibilidade',
  description:
    'Monte seu PC peca por peca com checagem de socket, fonte, gabinete e RAM em tempo real. Builder com sugestao automatica de fonte. Salve seu build e compre tudo de uma vez.',
}

export default function MontarPage() {
  return <BuilderClient />
}
