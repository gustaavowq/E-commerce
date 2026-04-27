import type { Metadata } from 'next'
import { FavoritosClient } from './FavoritosClient'

export const metadata: Metadata = {
  title: 'Favoritos',
  description: 'Sua lista de produtos salvos pra comprar depois.',
  robots: { index: false, follow: false },
}

export default function FavoritosPage() {
  return <FavoritosClient />
}
