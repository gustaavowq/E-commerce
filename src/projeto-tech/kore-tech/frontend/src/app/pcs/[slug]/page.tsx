import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft, ArrowRight, ShieldCheck, Truck, Zap, Wrench, Cpu, Clock } from 'lucide-react'
import { getReadyPcBySlug } from '@/services/builds'
import { listRelated } from '@/services/products'
import { ProductImage } from '@/components/ProductImage'
import { ProductCard } from '@/components/ProductCard'
import { FPSBadge } from '@/components/FPSBadge'
import { SpecsTable } from '@/components/SpecsTable'
import { WaitlistButton } from '@/components/WaitlistButton'
import { Button } from '@/components/ui/Button'
import { ApiError } from '@/lib/api-error'
import { formatBRL, installmentLabel, pixPrice } from '@/lib/format'
import type { ProductDetail } from '@/services/types'
import { ProductPdpActions } from '../../produtos/[slug]/ProductPdpActions'

export const revalidate = 60

type Params = { params: { slug: string } }
type FetchResult = { state: 'ok'; product: ProductDetail } | { state: 'not-found' } | { state: 'unavailable' }

async function fetchSafe(slug: string): Promise<FetchResult> {
  try {
    const product = await getReadyPcBySlug(slug)
    return { state: 'ok', product }
  } catch (err) {
    if (ApiError.is(err) && err.status === 404) return { state: 'not-found' }
    if (process.env.NODE_ENV !== 'production') console.error('[pc-pdp] fetch falhou:', err)
    return { state: 'unavailable' }
  }
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const result = await fetchSafe(params.slug)
  if (result.state !== 'ok') return { title: 'PC montado · Kore Tech' }
  const product = result.product
  return {
    title: product.metaTitle ?? product.name,
    description: product.metaDesc ?? product.description.slice(0, 160),
  }
}

export default async function PcPage({ params }: Params) {
  const result = await fetchSafe(params.slug)
  if (result.state === 'not-found') notFound()
  if (result.state === 'unavailable') {
    return (
      <main className="container-app py-10 sm:py-16">
        <Link href="/builds" className="mb-6 inline-flex items-center gap-1 text-xs font-semibold text-text-secondary hover:text-primary">
          <ArrowLeft className="h-3 w-3" /> Voltar pros builds prontos
        </Link>
        <div className="rounded-lg border border-border bg-surface p-8 sm:p-12 text-center">
          <div className="mx-auto inline-flex h-12 w-12 items-center justify-center rounded-full border border-border bg-bg">
            <Clock className="h-5 w-5 text-primary" aria-hidden />
          </div>
          <h1 className="mt-4 font-display text-2xl font-bold text-text">PC temporariamente indisponível</h1>
          <p className="mx-auto mt-2 max-w-md text-sm text-text-secondary">
            Estamos atualizando esse build. Recarregue em instantes ou explore outras opções.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-2">
            <Link href="/builds">
              <Button variant="primary">Ver builds prontos</Button>
            </Link>
            <Link href="/montar">
              <Button variant="outline">Montar pelo builder</Button>
            </Link>
          </div>
        </div>
      </main>
    )
  }
  const product = result.product

  const inStock = product.totalStock > 0
  const benchmarks = product.benchmarkFps ?? {}
  const games = Object.entries(benchmarks)

  const periphsRes = await listRelated(product.slug, 6).catch(() => ({ data: [], meta: undefined }))
  const periphs = periphsRes.data ?? []

  const pixValue = pixPrice(product.basePrice, 5)

  // Estimativa do "vs comprar peca por peca" — soma das pecas + 8% de "montagem" (fictício pra demo)
  const partsTotal = product.buildParts?.reduce((acc) => acc, 0) ?? null

  return (
    <main className="container-app py-6 sm:py-10">
      <Link href="/builds" className="mb-4 inline-flex items-center gap-1 text-xs font-semibold text-text-secondary hover:text-primary">
        <ArrowLeft className="h-3 w-3" /> Ver outros builds prontos
      </Link>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Galeria */}
        <div className="space-y-3">
          <div className="relative aspect-video overflow-hidden rounded-lg border border-border bg-surface">
            <ProductImage
              src={product.images[0]?.url}
              alt={product.images[0]?.alt ?? product.name}
              fallbackLabel={product.name}
              priority
              sizes="(max-width: 1024px) 100vw, 600px"
            />
            <span className="absolute left-3 top-3 inline-flex items-center rounded-sm border border-primary bg-bg/85 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-primary backdrop-blur-sm">
              PC montado · BTO
            </span>
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

        {/* Info */}
        <div>
          <p className="font-specs text-xs font-bold uppercase tracking-widest text-primary">PC montado</p>
          <h1 className="mt-2 text-2xl font-bold text-text sm:text-3xl">{product.name}</h1>
          {product.persona && (
            <p className="mt-1 text-sm text-text-secondary">
              Build pra <Link href={`/builds/${product.persona}`} className="text-primary hover:underline">{product.persona.replace(/-/g, ' ')}</Link>
            </p>
          )}

          {/* FPS estimado em destaque */}
          {games.length > 0 && (
            <div className="mt-5">
              <p className="mb-2 text-xs font-bold uppercase tracking-wide text-text-secondary">FPS estimado em jogos</p>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {games.slice(0, 6).map(([game, fps]) => {
                  const [g, ...rest] = game.split('_')
                  return <FPSBadge key={game} game={g} fps={fps} resolution={rest.join(' ')} size="lg" />
                })}
              </div>
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
              <span className="text-text-secondary">Garantia 12 meses</span>
            </div>
            <div className="flex flex-col items-center gap-1 text-center">
              <Truck className="h-5 w-5 text-primary" />
              <span className="text-text-secondary">Frete asseguro+</span>
            </div>
            <div className="flex flex-col items-center gap-1 text-center">
              <Cpu className="h-5 w-5 text-primary" />
              <span className="text-text-secondary">Montagem profissional</span>
            </div>
          </div>
        </div>
      </div>

      {/* Lista de pecas */}
      {product.buildParts && product.buildParts.length > 0 && (
        <section className="mt-12">
          <h2 className="mb-4 font-display text-xl font-bold text-text">Lista de pecas</h2>
          <div className="overflow-hidden rounded-lg border border-border bg-surface">
            <ul className="divide-y divide-border">
              {product.buildParts.map((p) => (
                <li key={p.productId} className="flex items-center justify-between gap-4 px-4 py-3 transition hover:bg-surface-2">
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="font-specs rounded bg-bg px-2 py-0.5 text-[10px] uppercase text-text-secondary">
                      {p.category}
                    </span>
                    <Link href={`/produtos/${p.productSlug}`} className="truncate text-sm text-text hover:text-primary">
                      {p.productName}
                    </Link>
                  </div>
                  <Link href={`/produtos/${p.productSlug}`} className="text-xs font-semibold text-primary hover:underline shrink-0">
                    Ver peca
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {/* Comparador montado vs peças soltas */}
      <section className="mt-10 rounded-lg border border-border bg-surface p-6 sm:p-8">
        <h2 className="font-display text-lg font-bold text-text">Por que comprar montado em vez de peca por peca?</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          <div className="rounded-md border border-primary/40 bg-primary-soft p-4">
            <p className="text-xs font-bold uppercase tracking-wide text-primary">Esse PC montado</p>
            <p className="mt-2 text-xl font-bold text-text">{formatBRL(product.basePrice)}</p>
            <p className="mt-1 text-xs text-text-secondary">Pronto pra ligar e jogar. BTO em 5 a 7 dias uteis.</p>
          </div>
          <div className="rounded-md border border-border bg-bg/40 p-4">
            <p className="text-xs font-bold uppercase tracking-wide text-text-secondary">Peca por peca</p>
            <p className="mt-2 text-xl font-bold text-text">{partsTotal != null ? formatBRL(partsTotal) : 'Calcule no builder'}</p>
            <p className="mt-1 text-xs text-text-secondary">Voce monta. Risco de incompatibilidade.</p>
            <Link href="/montar" className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline">
              <Wrench className="h-3 w-3" /> Abrir builder
            </Link>
          </div>
          <div className="rounded-md border border-border bg-bg/40 p-4">
            <p className="text-xs font-bold uppercase tracking-wide text-text-secondary">Voce ganha com o montado</p>
            <ul className="mt-2 space-y-1 text-xs text-text-secondary">
              <li>· Cable management feito</li>
              <li>· Teste de stress 4h antes de enviar</li>
              <li>· Garantia de funcionamento</li>
              <li>· DOA 7 dias sem perguntas</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Specs detalhadas */}
      <section className="mt-12 grid gap-8 lg:grid-cols-[1fr_360px]">
        <div className="space-y-4">
          <h2 className="font-display text-xl font-bold text-text">Sobre essa build</h2>
          <p className="whitespace-pre-line text-sm leading-relaxed text-text-secondary">{product.description}</p>
          <div className="flex flex-wrap gap-3 pt-4">
            <Link href="/montar">
              <Button variant="outline" size="md">
                <Wrench className="h-4 w-4" /> Adaptar essa build no builder
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
        <aside className="space-y-4">
          <SpecsTable
            title="Resumo tecnico"
            rows={Object.entries(product.specs ?? {}).map(([k, v]) => ({
              label: k.replace(/_/g, ' '),
              value: Array.isArray(v) ? v.join(', ') : v == null ? '-' : String(v),
            }))}
          />
        </aside>
      </section>

      {/* Cross-sell perifericos */}
      {periphs.length > 0 && (
        <section className="mt-14">
          <h2 className="mb-5 font-display text-xl font-bold text-text">Complete o setup</h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-6">
            {periphs.slice(0, 6).map((p, i) => (
              <ProductCard key={p.id} product={p} index={i} />
            ))}
          </div>
        </section>
      )}
    </main>
  )
}
