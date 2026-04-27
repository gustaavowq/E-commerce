import type { Metadata } from 'next'
import { ProductsClient } from './ProductsClient'

export const metadata: Metadata = {
  title: 'Produtos · Componentes, perifericos e PCs',
  description:
    'Procure CPUs, GPUs, placas-mae, RAM, SSDs, fontes, gabinetes e perifericos. Filtre por categoria, marca, faixa de preco ou persona.',
}

export default function ProdutosPage() {
  return <ProductsClient />
}
