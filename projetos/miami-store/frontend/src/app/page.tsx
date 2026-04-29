// Home da loja. SSR com fetch direto na API (server-side via INTERNAL_API_URL).
import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight, ShieldCheck, Truck, Zap, MapPin, MessageCircle, Heart } from 'lucide-react'
import { listFeatured } from '@/services/products'
import { listBrands } from '@/services/brands'
import { ProductCard } from '@/components/ProductCard'
import { BrandStrip } from '@/components/BrandStrip'
import { NewsletterPopup } from '@/components/NewsletterPopup'

export const revalidate = 60   // ISR: revalida a cada 60s

export default async function HomePage() {
  const [featuredRes, brands] = await Promise.all([
    listFeatured(8),
    listBrands(),
  ])

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-ink text-white">
        {/* Glow decorativo */}
        <div aria-hidden className="absolute -left-32 top-1/2 h-96 w-96 -translate-y-1/2 rounded-full bg-primary-700/30 blur-3xl" />
        <div aria-hidden className="absolute -right-20 -top-20 h-80 w-80 rounded-full bg-accent/20 blur-3xl" />

        <div className="container-app relative grid items-center gap-8 py-10 sm:py-16 lg:grid-cols-2">
          <div>
            <p className="text-sm font-bold uppercase tracking-widest text-neon animate-fade-up" style={{ animationDelay: '0ms' }}>
              Chegou peça nova
            </p>
            <h1 className="mt-3 font-display text-3xl leading-tight sm:text-5xl lg:text-6xl animate-fade-up" style={{ animationDelay: '100ms' }}>
              Original,
              <br />
              <span className="text-shine">com preço que cabe.</span>
            </h1>
            <p className="mt-4 max-w-md text-base text-ink-4 animate-fade-up" style={{ animationDelay: '200ms' }}>
              Lacoste, Nike, Adidas, Tommy. Tudo original, vem com caixa, etiqueta e nota fiscal. Pix dá 5% off. Frete fixo R$ 15 em todo lugar.
            </p>
            <div className="mt-6 flex flex-wrap gap-3 animate-fade-up" style={{ animationDelay: '300ms' }}>
              <Link
                href="/products"
                className="group inline-flex items-center gap-2 rounded-md bg-primary-700 px-6 py-3 text-base font-semibold text-white transition-all hover:bg-primary-900 hover:gap-3 hover:shadow-lg hover:shadow-primary-700/30"
              >
                Ver coleção
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link href="/products?brand=lacoste" className="inline-flex items-center gap-2 rounded-md border border-white/30 px-6 py-3 text-base font-semibold text-white transition-all hover:bg-white/10 hover:border-white/60">
                Só Lacoste
              </Link>
            </div>
          </div>

          <div className="relative aspect-square w-full overflow-hidden rounded-xl bg-primary-700 lg:aspect-[4/5] animate-scale-in" style={{ animationDelay: '150ms' }}>
            <Image
              src="/marketing/hero-banner.jpg"
              alt="Vocês não perdem por esperar"
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover transition-transform duration-700 hover:scale-105"
              priority
            />
            <div className="absolute bottom-4 left-4 rounded-md bg-ink/80 px-3 py-1.5 text-xs font-bold uppercase backdrop-blur-sm animate-fade-up" style={{ animationDelay: '500ms' }}>
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
            <div
              key={i}
              className="group flex items-center gap-3 rounded-md p-3 animate-fade-up transition hover:bg-primary-50/40"
              style={{ animationDelay: `${100 + i * 80}ms` }}
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-pill bg-primary-50 text-primary-700 transition-transform group-hover:scale-110 group-hover:rotate-6">
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
          {featuredRes.data.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
        </div>
      </section>

      {/* Sobre teaser */}
      <section className="bg-surface-alt py-12 sm:py-16">
        <div className="container-app grid items-center gap-10 lg:grid-cols-2">
          <div className="relative aspect-[4/5] overflow-hidden rounded-xl bg-primary-700 lg:aspect-square animate-scale-in">
            <Image
              src="/marketing/comunidade.jpg"
              alt="Comunidade Miami Store"
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover transition-transform duration-700 hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-ink/40 via-transparent to-transparent" />
          </div>
          <div className="animate-fade-up">
            <p className="text-xs font-bold uppercase tracking-widest text-primary-700">Sobre a Miami</p>
            <h2 className="mt-2 font-display text-2xl text-ink sm:text-4xl">
              Loja de marca, jeito de gente.
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-ink-2 sm:text-base">
              A gente nasceu em 2020 cansado de ver gente boa pagando o triplo do preço. Hoje somos um time pequeno em São Paulo atendendo o Brasil inteiro, e cada peça que sai daqui foi conferida na mão.
            </p>
            <ul className="mt-5 space-y-2.5 text-sm text-ink-2">
              <li className="flex items-start gap-2">
                <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-primary-700" />
                <span><strong className="text-ink">100% original</strong>. Caixa, etiqueta e nota fiscal sempre</span>
              </li>
              <li className="flex items-start gap-2">
                <Heart className="mt-0.5 h-5 w-5 shrink-0 text-primary-700" />
                <span><strong className="text-ink">Atendimento humano</strong>. Zap direto, sem robô</span>
              </li>
              <li className="flex items-start gap-2">
                <Truck className="mt-0.5 h-5 w-5 shrink-0 text-primary-700" />
                <span><strong className="text-ink">+15 mil pedidos</strong> entregues no Brasil todo</span>
              </li>
            </ul>
            <Link
              href="/sobre"
              className="group mt-6 inline-flex items-center gap-2 rounded-md border border-primary-700 px-5 py-2.5 text-sm font-semibold text-primary-700 transition-all hover:gap-3 hover:bg-primary-700 hover:text-white"
            >
              Conhecer a história
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </div>
      </section>

      {/* CTA dupla: Comunidade + Contato */}
      <section className="container-app grid gap-4 py-12 sm:py-16 lg:grid-cols-2">
        <div className="relative overflow-hidden rounded-xl bg-primary-700 text-white animate-fade-up">
          <Image
            src="/marketing/comunidade.jpg"
            alt="Galera da Miami Store reunida"
            fill
            sizes="(max-width: 1024px) 100vw, 50vw"
            className="object-cover opacity-30"
          />
          <div className="relative px-6 py-10 sm:px-8 sm:py-12">
            <h2 className="font-display text-xl sm:text-2xl">Comunidade Miami</h2>
            <p className="mt-2 text-sm text-white/95">
              Comprou? Marca a gente no Insta. A gente reposta e quem aparece ganha cupom no próximo pedido.
            </p>
            <a
              href="https://www.instagram.com/miamii_storee/"
              target="_blank" rel="noopener noreferrer"
              className="mt-4 inline-flex items-center gap-2 rounded-md bg-white px-5 py-2.5 text-sm font-bold text-primary-700 transition hover:bg-primary-50"
            >
              @miamii_storee
            </a>
          </div>
        </div>

        <div className="relative overflow-hidden rounded-xl border border-border bg-white animate-fade-up" style={{ animationDelay: '100ms' }}>
          <div aria-hidden className="absolute -right-12 -top-12 h-48 w-48 rounded-full bg-primary-700/5 blur-3xl" />
          <div className="relative px-6 py-10 sm:px-8 sm:py-12">
            <div className="flex items-center gap-2 text-primary-700">
              <MessageCircle className="h-5 w-5" />
              <p className="text-xs font-bold uppercase tracking-widest">Tira sua dúvida</p>
            </div>
            <h2 className="mt-2 font-display text-xl text-ink sm:text-2xl">Fala com a gente</h2>
            <p className="mt-2 text-sm text-ink-2">
              Atendimento de seg a sáb. Tira dúvida de tamanho, prazo, troca, ou só vem dar um oi mesmo.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <Link
                href="/contato"
                className="inline-flex items-center gap-2 rounded-md bg-primary-700 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-primary-900"
              >
                Página de contato
              </Link>
              <a
                href="https://wa.me/5511999999999"
                target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-md border border-whatsapp/40 px-4 py-2.5 text-sm font-semibold text-whatsapp transition hover:bg-whatsapp/10"
              >
                <MessageCircle className="h-4 w-4" /> Zap direto
              </a>
            </div>
            <p className="mt-4 flex items-center gap-1.5 text-xs text-ink-3">
              <MapPin className="h-3.5 w-3.5" /> São Paulo · Atende o Brasil todo
            </p>
          </div>
        </div>
      </section>

      {/* Newsletter popup (aparece após 30s, persiste 7d no localStorage) */}
      <NewsletterPopup />
    </>
  )
}
