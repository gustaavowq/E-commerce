// Home da loja. SSR com fetch direto na API (server-side via INTERNAL_API_URL).
import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight, ShieldCheck, Truck, Zap } from 'lucide-react'
import { listFeatured } from '@/services/products'
import { listBrands } from '@/services/brands'
import { ProductCard } from '@/components/ProductCard'
import { BrandStrip } from '@/components/BrandStrip'

export const revalidate = 60   // ISR: revalida a cada 60s

export default async function HomePage() {
  const [featuredRes, brands] = await Promise.all([
    listFeatured(8),
    listBrands(),
  ])

  return (
    <>
      {/* Hero */}
      <section className="bg-ink text-white">
        <div className="container-app grid items-center gap-8 py-10 sm:py-16 lg:grid-cols-2">
          <div>
            <p className="text-sm font-bold uppercase tracking-widest text-neon">Chegou peça nova</p>
            <h1 className="mt-3 font-display text-3xl leading-tight sm:text-5xl lg:text-6xl">
              Original,
              <br />
              <span className="text-primary-300">com preço que cabe.</span>
            </h1>
            <p className="mt-4 max-w-md text-base text-ink-4">
              Lacoste, Nike, Adidas, Tommy. Tudo original, vem com caixa, etiqueta e nota fiscal. Pix dá 5% off. Frete fixo R$ 15 em todo lugar.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href="/products" className="inline-flex items-center gap-2 rounded-md bg-primary-700 px-6 py-3 text-base font-semibold text-white transition hover:bg-primary-900">
                Ver coleção <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href="/products?brand=lacoste" className="inline-flex items-center gap-2 rounded-md border border-white/30 px-6 py-3 text-base font-semibold text-white transition hover:bg-white/10">
                Só Lacoste
              </Link>
            </div>
          </div>

          <div className="relative aspect-square w-full overflow-hidden rounded-xl bg-primary-700 lg:aspect-[4/5]">
            <Image
              src="/marketing/hero-banner.jpg"
              alt="Vocês não perdem por esperar"
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
              priority
            />
            <div className="absolute bottom-4 left-4 rounded-md bg-ink/80 px-3 py-1.5 text-xs font-bold uppercase backdrop-blur-sm">
              Drop 2026
            </div>
          </div>
        </div>
      </section>

      {/* USP strip */}
      <section className="border-y border-border bg-white">
        <div className="container-app grid grid-cols-1 gap-4 py-6 sm:grid-cols-3">
          {[
            { icon: ShieldCheck, title: '100% Original',    text: 'Vem com caixa e etiqueta' },
            { icon: Zap,         title: 'Pix com 5% OFF',   text: 'Cai na hora, sem espera' },
            { icon: Truck,       title: 'Frete fixo R$ 15', text: 'Pra qualquer canto do Brasil' },
          ].map((it, i) => (
            <div key={i} className="flex items-center gap-3 rounded-md p-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-pill bg-primary-50 text-primary-700">
                <it.icon className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-bold text-ink">{it.title}</p>
                <p className="text-xs text-ink-3">{it.text}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Marcas */}
      <BrandStrip brands={brands} />

      {/* Produtos em destaque */}
      <section className="container-app py-8 sm:py-12">
        <div className="mb-6 flex items-end justify-between">
          <div>
            <h2 className="font-display text-2xl text-ink sm:text-3xl">Tá saindo</h2>
            <p className="mt-1 text-sm text-ink-3">Peças que não param na vitrine</p>
          </div>
          <Link href="/products" className="text-sm font-semibold text-primary-700 hover:text-primary-900">
            Ver tudo
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
          {featuredRes.data.map(p => <ProductCard key={p.id} product={p} />)}
        </div>
      </section>

      {/* CTA comunidade */}
      <section className="container-app pb-12">
        <div className="relative overflow-hidden rounded-xl bg-primary-700 text-white">
          <Image
            src="/marketing/comunidade.jpg"
            alt="Galera da Miami Store reunida"
            fill
            sizes="100vw"
            className="object-cover opacity-30"
          />
          <div className="relative px-6 py-10 text-center sm:px-12">
            <h2 className="font-display text-2xl sm:text-3xl">Comunidade Miami</h2>
            <p className="mt-3 text-sm text-white/95 sm:text-base">
              Comprou? Marca a gente no Insta. A gente reposta o look e quem aparece ganha cupom no próximo pedido.
            </p>
            <a href="https://www.instagram.com/miamii_storee/" target="_blank" rel="noopener noreferrer" className="mt-5 inline-flex items-center gap-2 rounded-md bg-white px-5 py-2.5 text-sm font-bold text-primary-700 hover:bg-primary-50">
              @miamii_storee
            </a>
          </div>
        </div>
      </section>
    </>
  )
}
