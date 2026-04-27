import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, ShieldCheck, Truck, Zap } from 'lucide-react'
import { getProductBySlug, listRelated } from '@/services/products'
import { ProductImage } from '@/components/ProductImage'
import { ProductCard } from '@/components/ProductCard'
import { SpecsTable } from '@/components/SpecsTable'
import { WaitlistButton } from '@/components/WaitlistButton'
import { Button } from '@/components/ui/Button'
import { formatBRL, installmentLabel, pixPrice, formatGramsToKg } from '@/lib/format'
import { ApiError } from '@/lib/api-error'
import type { ProductDetail, ProductSpecs } from '@/services/types'
import { ProductPdpActions } from './ProductPdpActions'

export const revalidate = 60

type Params = { params: { slug: string } }

async function fetchSafe(slug: string): Promise<ProductDetail | null> {
  try {
    return await getProductBySlug(slug)
  } catch (err) {
    if (ApiError.is(err) && err.status === 404) return null
    throw err
  }
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const product = await fetchSafe(params.slug)
  if (!product) return { title: 'Produto nao encontrado' }
  return {
    title: product.metaTitle ?? product.name,
    description: product.metaDesc ?? product.description.slice(0, 160),
    openGraph: {
      title: product.name,
      description: product.metaDesc ?? product.description.slice(0, 160),
      images: product.images[0]?.url ? [product.images[0].url] : undefined,
    },
  }
}

function specsToRows(specs: ProductSpecs): Array<{ label: string; value: string | number; highlight?: boolean }> {
  return Object.entries(specs).map(([k, v]) => ({
    label: k.replace(/_/g, ' '),
    value: Array.isArray(v) ? v.join(', ') : v == null ? '-' : String(v),
  }))
}

export default async function ProductPage({ params }: Params) {
  const product = await fetchSafe(params.slug)
  if (!product) notFound()

  // Se for PC montado, redireciona conceitualmente pra rota /pcs (mas como acessou /produtos, mantemos)
  const inStock = product.totalStock > 0
  const pixValue = pixPrice(product.basePrice, 5)

  const relatedRes = await listRelated(product.slug, 4).catch(() => ({ data: [], meta: undefined }))
  const related = relatedRes.data ?? []

  const specsRows = specsToRows(product.specs ?? {})
  const compatBadges: string[] = []
  if (product.compatibility?.socket) compatBadges.push(`Socket ${product.compatibility.socket}`)
  if (product.compatibility?.ramType) compatBadges.push(`Memoria ${product.compatibility.ramType}`)
  if (product.compatibility?.formFactor) compatBadges.push(`Form factor ${product.compatibility.formFactor}`)
  if (product.compatibility?.tdpW) compatBadges.push(`${product.compatibility.tdpW}W TDP`)
  if (product.compatibility?.recommendedPsuW) compatBadges.push(`Pede fonte ${product.compatibility.recommendedPsuW}W+`)
  if (product.compatibility?.lengthMm) compatBadges.push(`${product.compatibility.lengthMm}mm de comprimento`)

  const meta = [
    { label: 'Categoria', value: product.category.toUpperCase() },
    { label: 'Marca', value: product.brand?.name ?? '-' },
    { label: 'Garantia', value: `${product.warrantyMonths} meses` },
    { label: 'Peso', value: formatGramsToKg(product.weightGrams) },
  ]

  return (
    <main className="container-app py-6 sm:py-10">
      <Link href="/produtos" className="mb-4 inline-flex items-center gap-1 text-xs font-semibold text-text-secondary hover:text-primary">
        <ArrowLeft className="h-3 w-3" /> Voltar pro catalogo
      </Link>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Galeria */}
        <div className="space-y-3">
          <div className="relative aspect-square overflow-hidden rounded-lg border border-border bg-surface">
            <ProductImage
              src={product.images[0]?.url}
              alt={product.images[0]?.alt ?? product.name}
              fallbackLabel={product.name}
              priority
              sizes="(max-width: 1024px) 100vw, 600px"
            />
            {!inStock && (
              <div className="absolute inset-0 flex items-center justify-center bg-bg/70 backdrop-blur-sm">
                <span className="rounded-md border border-warning/60 bg-bg/90 px-3 py-1.5 text-sm font-bold uppercase text-warning">
                  Sem estoque
                </span>
              </div>
            )}
          </div>
          {product.images.length > 1 && (
            <div className="grid grid-cols-4 gap-2">
              {product.images.slice(0, 4).map((img, i) => (
                <div key={i} className="relative aspect-square overflow-hidden rounded-md border border-border bg-surface">
                  <ProductImage src={img.url} alt={img.alt ?? product.name} fallbackLabel={product.name} sizes="120px" />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Info + actions */}
        <div>
          <p className="font-specs text-xs font-bold uppercase tracking-widest text-primary">{product.category}</p>
          <h1 className="mt-2 text-2xl font-bold text-text sm:text-3xl">{product.name}</h1>
          {product.brand && (
            <p className="mt-1 text-sm text-text-secondary">por <span className="font-semibold text-text">{product.brand.name}</span></p>
          )}

          {compatBadges.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-1.5">
              {compatBadges.map((b) => (
                <span key={b} className="font-specs rounded-pill border border-primary/40 bg-primary-soft px-2.5 py-1 text-[11px] text-primary">
                  {b}
                </span>
              ))}
            </div>
          )}

          <div className="mt-6 rounded-lg border border-border bg-surface p-5">
            {product.comparePrice && (
              <p className="text-xs text-text-muted line-through">{formatBRL(product.comparePrice)}</p>
            )}
            <p className="text-3xl font-bold text-text sm:text-4xl">{formatBRL(product.basePrice)}</p>
            <p className="mt-1 text-sm text-text-secondary">{installmentLabel(product.basePrice)}</p>
            <p className="mt-1 text-xs text-success">
              <Zap className="mr-1 inline h-3 w-3" />
              No Pix sai por <span className="font-specs font-bold">{formatBRL(pixValue)}</span> (5% off)
            </p>
          </div>

          <div className="mt-5">
            {inStock ? (
              <ProductPdpActions product={product} />
            ) : (
              <WaitlistButton productId={product.id} productName={product.name} />
            )}
          </div>

          <div className="mt-6 grid grid-cols-3 gap-2 rounded-lg border border-border bg-surface/40 p-4 text-xs">
            <div className="flex flex-col items-center gap-1 text-center">
              <ShieldCheck className="h-5 w-5 text-primary" />
              <span className="text-text-secondary">Garantia {product.warrantyMonths} meses</span>
            </div>
            <div className="flex flex-col items-center gap-1 text-center">
              <Truck className="h-5 w-5 text-primary" />
              <span className="text-text-secondary">Frete asseguro+</span>
            </div>
            <div className="flex flex-col items-center gap-1 text-center">
              <Zap className="h-5 w-5 text-primary" />
              <span className="text-text-secondary">DOA 7 dias</span>
            </div>
          </div>
        </div>
      </div>

      {/* Descricao + Specs */}
      <div className="mt-12 grid gap-8 lg:grid-cols-[1fr_360px]">
        <div className="space-y-4">
          <h2 className="font-display text-xl font-bold text-text">Sobre o produto</h2>
          <p className="whitespace-pre-line text-sm leading-relaxed text-text-secondary">{product.description}</p>
        </div>
        <aside className="space-y-4">
          <SpecsTable title="Ficha tecnica" rows={specsRows} />
          <SpecsTable title="Resumo" rows={meta} compact />
        </aside>
      </div>

      {/* Related */}
      {related.length > 0 && (
        <section className="mt-14">
          <h2 className="mb-5 font-display text-xl font-bold text-text">Quem viu, levou junto</h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
            {related.map((p, i) => (
              <ProductCard key={p.id} product={p} index={i} />
            ))}
          </div>
        </section>
      )}
    </main>
  )
}
