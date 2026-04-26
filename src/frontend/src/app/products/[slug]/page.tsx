import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getProduct } from '@/services/products'
import { ApiError } from '@/lib/api-error'
import { ProductDetailView } from './ProductDetailView'

type Props = { params: { slug: string } }

export const revalidate = 30

export async function generateMetadata({ params }: Props) {
  try {
    const product = await getProduct(params.slug)
    return {
      title: product.metaTitle ?? `${product.name} · ${product.brand.name}`,
      description: product.metaDesc ?? product.description.slice(0, 160),
    }
  } catch {
    return { title: 'Produto' }
  }
}

export default async function ProductPage({ params }: Props) {
  let product
  try {
    product = await getProduct(params.slug)
  } catch (err) {
    if (ApiError.is(err) && err.status === 404) notFound()
    throw err
  }

  return (
    <div className="container-app py-4 sm:py-8">
      <nav className="mb-3 text-xs text-ink-3">
        <Link href="/" className="hover:text-primary-700">Home</Link>
        <span className="mx-1.5">›</span>
        <Link href="/products" className="hover:text-primary-700">Produtos</Link>
        <span className="mx-1.5">›</span>
        <Link href={`/products?category=${product.category.slug}`} className="hover:text-primary-700">{product.category.name}</Link>
        <span className="mx-1.5">›</span>
        <span className="text-ink-2">{product.name}</span>
      </nav>

      <ProductDetailView product={product} />
    </div>
  )
}
