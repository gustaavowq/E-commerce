// Home Kore Tech — fetch resiliente: se backend offline, fallback gracioso (sem 500).
import Link from 'next/link'
import { ArrowRight, Wrench, BellRing, ShieldCheck, Zap, Cpu, MonitorPlay } from 'lucide-react'
import { ProductCard } from '@/components/ProductCard'
import { PCBuildCard } from '@/components/PCBuildCard'
import { Button } from '@/components/ui/Button'
import { listFeatured, listByPersona } from '@/services/products'
import { listReadyPcs } from '@/services/builds'
import type { ProductListItem } from '@/services/types'

export const revalidate = 60

const FEATURED_PERSONAS = [
  {
    slug: 'valorant-240fps',
    name: 'Valorant 240 FPS',
    sub: 'Mira firme, lag baixo, peripheral pro',
    targetFps: { valorant: 240, cs2: 220 },
  },
  {
    slug: 'fortnite-competitivo',
    name: 'Fortnite competitivo',
    sub: 'Build no zero, edit fluido',
    targetFps: { fortnite: 165, valorant: 240 },
  },
  {
    slug: 'edicao-4k',
    name: 'Edicao de video 4K',
    sub: 'Premiere e DaVinci sem travar',
    targetFps: { premiere_4k: 60, davinci_4k: 50 },
  },
  {
    slug: 'ia-local',
    name: 'IA local com Llama',
    sub: 'Modelos 7B/70B rodando offline',
    targetFps: { llama_7b_tps: 80, llama_70b_tps: 12 },
  },
] as const

async function safeListFeatured(): Promise<ProductListItem[]> {
  try {
    const res = await listFeatured(8)
    return res.data ?? []
  } catch {
    return []
  }
}

async function safeListReadyPcs(persona?: string): Promise<ProductListItem[]> {
  try {
    const res = await listReadyPcs(3, persona)
    return res.data ?? []
  } catch {
    return []
  }
}

async function safeListByPersona(slug: string): Promise<ProductListItem[]> {
  try {
    const res = await listByPersona(slug, 3)
    return res.data ?? []
  } catch {
    return []
  }
}

export default async function HomePage() {
  const [featured, allReadyPcs, ...personaPcs] = await Promise.all([
    safeListFeatured(),
    safeListReadyPcs(),
    ...FEATURED_PERSONAS.map((p) => safeListByPersona(p.slug)),
  ])

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-border bg-bg">
        <div aria-hidden className="pointer-events-none absolute -left-32 top-0 h-[28rem] w-[28rem] rounded-full bg-primary/15 blur-3xl" />
        <div aria-hidden className="pointer-events-none absolute -right-20 -bottom-20 h-96 w-96 rounded-full bg-primary/10 blur-3xl" />

        <div className="container-app relative grid items-center gap-10 py-12 sm:py-20 lg:grid-cols-[1.1fr_1fr]">
          <div>
            <p className="font-specs text-xs font-bold uppercase tracking-widest text-primary animate-fade-up">
              Builder com checagem automatica de compatibilidade
            </p>
            <h1 className="mt-3 font-display text-4xl font-bold leading-tight text-text sm:text-5xl lg:text-6xl animate-fade-up" style={{ animationDelay: '80ms' }}>
              Monte certo.
              <br />
              <span className="text-primary">Jogue alto.</span>
            </h1>
            <p className="mt-5 max-w-xl text-base text-text-secondary sm:text-lg animate-fade-up" style={{ animationDelay: '160ms' }}>
              Builds prontos por jogo, com FPS estimado real. Componentes com checagem de socket, fonte e gabinete em tempo real. Lista de espera anti-paper-launch.
            </p>
            <div className="mt-7 flex flex-wrap items-center gap-3 animate-fade-up" style={{ animationDelay: '240ms' }}>
              <Link href="/montar">
                <Button variant="primary" size="lg" className="cta-glow">
                  <Wrench className="h-4 w-4" /> Abrir o builder
                </Button>
              </Link>
              <Link href="/builds/valorant-240fps">
                <Button variant="outline" size="lg">
                  Ver build Valorant <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
            <p className="mt-4 text-xs text-text-muted">
              Pix com 5% off · Parcele em 12x sem juros · Frete asseguro+
            </p>
          </div>

          <div className="relative overflow-hidden rounded-xl border border-border-strong bg-surface p-6 sm:p-8 animate-scale-in">
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: 'Valorant', fps: 240 },
                { label: 'Fortnite', fps: 165 },
                { label: 'CS2', fps: 220 },
                { label: 'Cyberpunk', fps: 90 },
                { label: 'Edicao 4K', fps: 60 },
                { label: 'Llama 7B', fps: 80 },
              ].map((m) => (
                <div key={m.label} className="rounded-md border border-border bg-bg/60 px-3 py-3">
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-text-secondary">{m.label}</p>
                  <p className="font-specs text-2xl font-bold text-primary leading-none">{m.fps}</p>
                  <p className="font-specs text-[10px] text-text-muted">FPS estimado</p>
                </div>
              ))}
            </div>
            <div className="mt-5 rounded-md border border-primary/40 bg-primary-soft p-3">
              <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-primary">
                <Zap className="h-3.5 w-3.5" /> Builder calcula automatico
              </p>
              <p className="mt-1 text-xs text-text-secondary">
                Socket, fonte, gabinete, RAM. Voce escolhe a peca, a gente garante compativel.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* USP strip */}
      <section className="border-b border-border bg-surface">
        <div className="container-app grid grid-cols-1 gap-4 py-6 sm:grid-cols-3">
          {[
            {
              icon: Wrench,
              title: 'Builder com 50+ checks',
              text: 'Compatibilidade de socket, fonte, gabinete em tempo real',
            },
            {
              icon: BellRing,
              title: 'Lista de espera ativa',
              text: 'Te avisamos quando GPU/CPU volta. Reserva 24h pra primeiros',
            },
            {
              icon: ShieldCheck,
              title: 'Garantia DOA + Pix 5% off',
              text: '7 dias troca sem perguntas. Pix da 5% de desconto',
            },
          ].map((it, i) => (
            <div
              key={i}
              className="group flex items-start gap-3 rounded-md border border-border bg-bg/40 p-3 transition hover:border-primary/40 hover:bg-bg/60 animate-fade-up"
              style={{ animationDelay: `${100 + i * 80}ms` }}
            >
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-primary-soft text-primary transition-transform group-hover:scale-110">
                <it.icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-bold text-text">{it.title}</p>
                <p className="text-xs text-text-secondary">{it.text}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Personas em destaque */}
      <section className="container-app py-10 sm:py-14">
        <div className="mb-7 flex items-end justify-between">
          <div>
            <p className="font-specs text-xs font-bold uppercase tracking-widest text-primary">Builds por uso</p>
            <h2 className="mt-2 font-display text-2xl font-bold text-text sm:text-3xl">Pra que voce vai usar?</h2>
            <p className="mt-1 text-sm text-text-secondary">
              Escolha por jogo ou tarefa. A gente entrega FPS estimado e build pronto.
            </p>
          </div>
          <Link href="/builds" className="hidden text-sm font-semibold text-primary hover:underline sm:inline-flex">
            Ver todos
          </Link>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURED_PERSONAS.map((p, i) => (
            <Link
              key={p.slug}
              href={`/builds/${p.slug}`}
              className="group flex flex-col gap-3 rounded-lg border border-border bg-surface p-5 transition-all hover:-translate-y-1 hover:border-primary/40 hover:shadow-glow-soft animate-fade-up"
              style={{ animationDelay: `${i * 60}ms` }}
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-md bg-primary-soft text-primary transition-colors group-hover:bg-primary group-hover:text-bg">
                {p.slug === 'edicao-4k' ? (
                  <MonitorPlay className="h-5 w-5" />
                ) : p.slug === 'ia-local' ? (
                  <Cpu className="h-5 w-5" />
                ) : (
                  <Zap className="h-5 w-5" />
                )}
              </div>
              <div>
                <h3 className="text-base font-bold text-text">{p.name}</h3>
                <p className="text-xs text-text-secondary">{p.sub}</p>
              </div>
              <div className="grid grid-cols-2 gap-1.5 pt-2">
                {Object.entries(p.targetFps).map(([game, fps]) => (
                  <div key={game} className="rounded bg-bg/60 px-2 py-1">
                    <p className="text-[10px] uppercase text-text-muted">{game}</p>
                    <p className="font-specs text-sm text-primary">{fps} FPS</p>
                  </div>
                ))}
              </div>
              <span className="mt-auto inline-flex items-center gap-1 pt-2 text-xs font-semibold text-primary">
                Ver build <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-1" />
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* Builds prontos por persona */}
      {personaPcs.some((arr) => arr.length > 0) && (
        <section className="border-y border-border bg-surface/50 py-10 sm:py-14">
          <div className="container-app">
            <div className="mb-7">
              <p className="font-specs text-xs font-bold uppercase tracking-widest text-primary">Builds prontos</p>
              <h2 className="mt-2 font-display text-2xl font-bold text-text sm:text-3xl">PCs montados, com FPS curado</h2>
              <p className="mt-1 text-sm text-text-secondary">Pegue como esta ou use como ponto de partida no builder.</p>
            </div>

            <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
              {FEATURED_PERSONAS.slice(0, 2).map((p, idx) => {
                const pcs = personaPcs[idx] ?? []
                if (pcs.length === 0) return null
                return (
                  <div key={p.slug} className="rounded-lg border border-border bg-surface p-4 sm:p-6">
                    <div className="mb-4 flex items-center justify-between">
                      <h3 className="text-base font-bold text-text">Para {p.name}</h3>
                      <Link href={`/builds/${p.slug}`} className="text-xs font-semibold text-primary hover:underline">
                        Ver landing
                      </Link>
                    </div>
                    <div className="grid grid-cols-1 gap-3">
                      {pcs.slice(0, 1).map((pc) => (
                        <PCBuildCard key={pc.id} product={pc} />
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </section>
      )}

      {/* Componentes em destaque */}
      <section className="container-app py-10 sm:py-14">
        <div className="mb-6 flex items-end justify-between">
          <div>
            <p className="font-specs text-xs font-bold uppercase tracking-widest text-primary">Componentes</p>
            <h2 className="mt-2 font-display text-2xl font-bold text-text sm:text-3xl">Em destaque na semana</h2>
            <p className="mt-1 text-sm text-text-secondary">Pecas mais buscadas e melhores precos.</p>
          </div>
          <Link href="/produtos" className="text-sm font-semibold text-primary hover:underline">
            Ver tudo
          </Link>
        </div>
        {featured.length > 0 ? (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
            {featured.map((p, i) => (
              <ProductCard key={p.id} product={p} index={i} />
            ))}
          </div>
        ) : allReadyPcs.length > 0 ? (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
            {allReadyPcs.map((p, i) => (
              <ProductCard key={p.id} product={p} index={i} />
            ))}
          </div>
        ) : (
          <div className="rounded-lg border border-dashed border-border bg-surface/40 p-8 text-center">
            <Cpu className="mx-auto h-10 w-10 text-text-muted" />
            <p className="mt-3 text-sm text-text-secondary">Catalogo carrega quando o backend estiver online.</p>
            <p className="mt-1 text-xs text-text-muted">
              Demo: <code className="font-specs">cd src/projeto-tech/kore-tech && docker compose up</code>
            </p>
          </div>
        )}
      </section>

      {/* CTA dupla */}
      <section className="container-app grid gap-4 py-12 sm:py-16 lg:grid-cols-2">
        <div className="relative overflow-hidden rounded-xl border border-primary/30 bg-gradient-to-br from-primary-soft to-bg p-7 sm:p-10">
          <h3 className="font-display text-xl font-bold text-text sm:text-2xl">Builder de PC, do iniciante ao pro</h3>
          <p className="mt-2 text-sm text-text-secondary">
            Escolhe a primeira peca, o resto da lista filtra automatico. Adicionou GPU pesada? A gente sugere fonte que aguenta.
          </p>
          <div className="mt-5">
            <Link href="/montar">
              <Button variant="primary" size="md" className="cta-glow">
                <Wrench className="h-4 w-4" /> Comecar montagem
              </Button>
            </Link>
          </div>
        </div>

        <div className="relative overflow-hidden rounded-xl border border-border bg-surface p-7 sm:p-10">
          <h3 className="font-display text-xl font-bold text-text sm:text-2xl">GPU sumiu do mercado?</h3>
          <p className="mt-2 text-sm text-text-secondary">
            Ativa lista de espera. Te avisamos por email/WhatsApp quando entrar e reservamos 24h pra voce.
          </p>
          <div className="mt-5">
            <Link href="/produtos?category=gpu">
              <Button variant="outline" size="md">
                Ver placas de video <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
