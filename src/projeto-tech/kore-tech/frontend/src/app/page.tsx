// Home Kore Tech — fetch resiliente: se backend offline, fallback gracioso (sem 500).
import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight, Wrench } from 'lucide-react'
import { ProductCard } from '@/components/ProductCard'
import { PCBuildCard } from '@/components/PCBuildCard'
import { Button } from '@/components/ui/Button'
import { Reveal } from '@/components/Reveal'
import { listFeatured } from '@/services/products'
import { listReadyPcs } from '@/services/builds'
import type { ProductListItem } from '@/services/types'

export const revalidate = 60

const HERO_IMAGE = 'https://images.unsplash.com/photo-1587202372634-32705e3bf49c?auto=format&fit=crop&w=1600&q=85'

async function safeListFeatured(): Promise<ProductListItem[]> {
  try {
    const res = await listFeatured(8)
    return res.data ?? []
  } catch {
    return []
  }
}

async function safeListReadyPcs(): Promise<ProductListItem[]> {
  try {
    const res = await listReadyPcs(4)
    return res.data ?? []
  } catch {
    return []
  }
}

export default async function HomePage() {
  const [featured, readyPcs] = await Promise.all([safeListFeatured(), safeListReadyPcs()])

  return (
    <>
      {/* ───────── Hero ───────── */}
      <section className="relative isolate overflow-hidden border-b border-border">
        <div aria-hidden className="pointer-events-none absolute inset-0 mesh-bg" />
        <div aria-hidden className="pointer-events-none absolute inset-0 grid-pattern opacity-60" />
        <div
          aria-hidden
          className="pointer-events-none absolute -left-32 top-10 h-[36rem] w-[36rem] rounded-full bg-primary/12 blur-3xl animate-aurora-slow"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -right-24 bottom-0 h-[28rem] w-[28rem] rounded-full bg-primary/8 blur-3xl animate-aurora-slow"
          style={{ animationDelay: '-7s' }}
        />

        <div className="container-app relative grid min-h-[80vh] items-center gap-12 py-16 sm:py-24 lg:grid-cols-[1.05fr_1fr] lg:gap-16">
          <div>
            <p className="font-specs text-[11px] font-bold uppercase tracking-[0.22em] text-primary animate-fade-up">
              PCs gamer · builder com checagem automática
            </p>
            <h1
              className="mt-5 font-display text-5xl font-bold leading-[1.02] tracking-tight sm:text-6xl lg:text-7xl xl:text-[5.5rem] animate-fade-up-lg"
              style={{ animationDelay: '120ms' }}
            >
              <span className="hero-title-gradient">Monte certo.</span>
              <br />
              <span className="text-text">Jogue alto.</span>
            </h1>
            <p
              className="mt-7 max-w-xl text-base leading-relaxed text-text-secondary sm:text-lg lg:text-xl animate-fade-up"
              style={{ animationDelay: '260ms' }}
            >
              Builds prontos por jogo, com FPS estimado real. Cada peça passa por checagem
              automática de socket, fonte e gabinete antes de ir pro carrinho.
            </p>
            <div
              className="mt-9 flex flex-wrap items-center gap-3 animate-fade-up"
              style={{ animationDelay: '380ms' }}
            >
              <Link href="/montar">
                <Button variant="primary" size="lg" className="cta-glow">
                  <Wrench className="h-4 w-4" /> Abrir o builder
                </Button>
              </Link>
              <Link href="/builds">
                <Button variant="ghost" size="lg">
                  Ver builds prontos <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
            <p
              className="mt-6 font-specs text-[11px] uppercase tracking-widest text-text-muted animate-fade-up"
              style={{ animationDelay: '500ms' }}
            >
              Pix 5% off · 12x sem juros · Garantia DOA 7 dias
            </p>
          </div>

          {/* Hero visual */}
          <div className="relative animate-scale-in" style={{ animationDelay: '320ms' }}>
            <div className="relative aspect-[4/5] overflow-hidden rounded-2xl border border-border-strong bg-surface shadow-xl sm:aspect-[5/6] lg:aspect-[4/5]">
              <Image
                src={HERO_IMAGE}
                alt="PC gamer montado com iluminação RGB"
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 560px"
                className="object-cover animate-float"
                unoptimized
              />
              <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-bg via-bg/20 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-6 sm:p-8">
                <p className="font-specs text-[10px] font-bold uppercase tracking-widest text-primary">FPS curado</p>
                <p className="mt-2 font-display text-2xl font-bold text-text sm:text-3xl">
                  240 FPS no Valorant
                </p>
                <p className="mt-1 text-xs text-text-secondary sm:text-sm">
                  Ryzen 7 7800X3D · RTX 4070 SUPER · 32GB DDR5
                </p>
              </div>
              <div
                aria-hidden
                className="pointer-events-none absolute inset-0 overflow-hidden rounded-2xl"
              >
                <div className="absolute inset-y-0 -left-1/3 w-1/3 bg-gradient-to-r from-transparent via-primary/15 to-transparent animate-shimmer" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ───────── Builds em destaque ───────── */}
      {readyPcs.length > 0 && (
        <section className="border-b border-border bg-bg">
          <div className="container-app py-20 sm:py-28">
            <Reveal as="header" className="mb-10 flex items-end justify-between gap-6">
              <div>
                <p className="font-specs text-[11px] font-bold uppercase tracking-[0.22em] text-primary">
                  Builds prontos
                </p>
                <h2 className="mt-3 font-display text-3xl font-bold tracking-tight text-text sm:text-4xl lg:text-5xl">
                  PCs montados, com FPS curado.
                </h2>
              </div>
              <Link
                href="/builds"
                className="hidden shrink-0 items-center gap-1 text-sm font-semibold text-primary transition hover:gap-2 sm:inline-flex"
              >
                Ver todos <ArrowRight className="h-4 w-4" />
              </Link>
            </Reveal>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {readyPcs.slice(0, 4).map((pc, i) => (
                <Reveal key={pc.id} delay={i * 90}>
                  <PCBuildCard product={pc} />
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ───────── Banner builder ───────── */}
      <section className="relative overflow-hidden border-b border-border">
        <div aria-hidden className="absolute inset-0 mesh-bg opacity-80" />
        <div
          aria-hidden
          className="pointer-events-none absolute -right-32 top-0 h-[28rem] w-[28rem] rounded-full bg-primary/10 blur-3xl animate-aurora-slow"
        />

        <div className="container-app relative grid items-center gap-10 py-20 sm:py-28 lg:grid-cols-[1fr_1.1fr]">
          <Reveal>
            <p className="font-specs text-[11px] font-bold uppercase tracking-[0.22em] text-primary">
              Builder
            </p>
            <h2 className="mt-3 font-display text-3xl font-bold tracking-tight text-text sm:text-4xl lg:text-5xl">
              50+ checagens automáticas
              <br />
              <span className="text-text-secondary">antes de você fechar o pedido.</span>
            </h2>
            <p className="mt-6 max-w-lg text-base leading-relaxed text-text-secondary sm:text-lg">
              Escolhe a CPU. A lista filtra placas-mãe compatíveis. Adicionou GPU pesada?
              A gente sugere fonte que aguenta. Gabinete pequeno? Mostra só o que cabe.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/montar">
                <Button variant="primary" size="lg" className="cta-glow">
                  <Wrench className="h-4 w-4" /> Abrir o builder
                </Button>
              </Link>
              <Link href="/produtos">
                <Button variant="ghost" size="lg">
                  Explorar componentes <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </Reveal>

          <Reveal delay={120}>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {[
                { label: 'Socket', value: 'AM5 · LGA1700' },
                { label: 'Fonte', value: '550W → 1000W' },
                { label: 'Gabinete', value: 'mATX → E-ATX' },
                { label: 'RAM', value: 'DDR5 5200-7200' },
                { label: 'GPU', value: 'até 460mm' },
                { label: 'Cooler', value: 'air · AIO 360' },
              ].map((s) => (
                <div
                  key={s.label}
                  className="rounded-md border border-border bg-surface/60 p-4 backdrop-blur-sm transition-colors hover:border-primary/40"
                >
                  <p className="text-[10px] font-bold uppercase tracking-wide text-text-muted">{s.label}</p>
                  <p className="mt-1 font-specs text-sm font-bold text-primary sm:text-base">{s.value}</p>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* ───────── Componentes em destaque ───────── */}
      <section className="border-b border-border bg-bg">
        <div className="container-app py-20 sm:py-28">
          <Reveal as="header" className="mb-10 flex items-end justify-between gap-6">
            <div>
              <p className="font-specs text-[11px] font-bold uppercase tracking-[0.22em] text-primary">
                Componentes
              </p>
              <h2 className="mt-3 font-display text-3xl font-bold tracking-tight text-text sm:text-4xl lg:text-5xl">
                Em destaque na semana.
              </h2>
            </div>
            <Link
              href="/produtos"
              className="hidden shrink-0 items-center gap-1 text-sm font-semibold text-primary transition hover:gap-2 sm:inline-flex"
            >
              Ver tudo <ArrowRight className="h-4 w-4" />
            </Link>
          </Reveal>

          {featured.length > 0 ? (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-5 lg:grid-cols-4">
              {featured.map((p, i) => (
                <Reveal key={p.id} delay={(i % 4) * 80}>
                  <ProductCard product={p} index={i} />
                </Reveal>
              ))}
            </div>
          ) : (
            <Reveal>
              <div className="rounded-lg border border-dashed border-border bg-surface/40 p-10 text-center">
                <p className="text-sm text-text-secondary">
                  Catálogo carrega quando o backend estiver online.
                </p>
              </div>
            </Reveal>
          )}
        </div>
      </section>

      {/* ───────── CTA final ───────── */}
      <section className="relative overflow-hidden">
        <div aria-hidden className="absolute inset-0 bg-gradient-to-br from-primary/15 via-bg to-bg" />
        <div className="container-app relative py-20 sm:py-28">
          <Reveal className="mx-auto max-w-3xl text-center">
            <h2 className="font-display text-3xl font-bold tracking-tight text-text sm:text-4xl lg:text-5xl">
              Pronto pra montar o seu?
            </h2>
            <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-text-secondary sm:text-lg">
              Builder em três passos. Compatibilidade garantida. FPS estimado real.
            </p>
            <div className="mt-9 flex flex-wrap justify-center gap-3">
              <Link href="/montar">
                <Button variant="primary" size="lg" className="cta-glow">
                  <Wrench className="h-4 w-4" /> Começar a montar
                </Button>
              </Link>
              <Link href="/builds">
                <Button variant="outline" size="lg">
                  Ver builds prontos <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  )
}
