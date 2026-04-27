import type { Metadata } from 'next'
import { SearchClient } from './SearchClient'

export const metadata: Metadata = {
  title: 'Buscar',
  description: 'Encontre processadores, GPUs, monitores, perifericos e PCs montados pelo nome ou marca.',
}

export default function SearchPage() {
  return <SearchClient />
}
