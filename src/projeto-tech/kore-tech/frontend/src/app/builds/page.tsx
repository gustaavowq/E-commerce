import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, Wrench, Zap } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { PCBuildCard } from '@/components/PCBuildCard'
import { listReadyPcs } from '@/services/builds'
import type { ProductListItem } from '@/services/types'

export const metadata: Metadata = {
  title: 'Builds prontos por jogo, FPS e tarefa',
  description:
    'Builds prontos do Kore Tech curados por uso (Valorant, Fortnite, CS2, edicao 4K, IA local Llama) com FPS estimado real. Compre montado ou use como base no builder.',
}

const PERSONAS = [
  { slug: 'valorant-240fps', name: 'Valorant 240 FPS', sub: 'Mira firme, lag baixo, peripheral pro' },
  { slug: 'fortnite-competitivo', name: 'Fortnite competitivo', sub: 'Build no zero, edit fluido' },
  { slug: 'cs2-high-tier', name: 'CS2 high tier', sub: '1% low alto, sem tearing' },
  { slug: 'edicao-4k', name: 'Edicao de video 4K', sub: 'Premiere e DaVinci sem travar' },
  { slug: 'streaming', name: 'Streaming completo', sub: 'OBS encoder dedicado, dual setup' },
  { slug: 'ia-local', name: 'IA local com Llama', sub: 'Modelos 7B/70B rodando offline' },
  { slug: 'workstation-3d', name: 'Workstation 3D', sub: 'Blender, AutoCAD, render pesado' },
  { slug: 'entry-gamer', name: 'Entry gamer', sub: 'Custo-beneficio pra comecar' },
] as const

async function safeListAll(): Promise<ProductListItem[]> {
  try {
    const res = await listReadyPcs(24)
    return res.data ?? []
  } catch {
    return []
  }
}

export default async function BuildsPage() {
  const all = await safeListAll()

  return (
    <main className="container-app py-10 sm:py-14">
      <header className="mb-10">
        <p className="font-specs text-xs font-bold uppercase tracking-widest text-primary">Builds prontos</p>
        <h1 className="mt-2 font-display text-3xl font-bold text-text sm:text-4xl">
          Escolha por uso, leve com FPS curado.
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-text-secondary sm:text-base">
          Cada build foi montado, testado e tem FPS estimado em jogos populares. Pegue como esta ou
          use como ponto de partida no builder pra adaptar a peca de cada categoria.
        </p>
      </header>

      <section className="mb-12 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {PERSONAS.map((p, i) => (
          <Link
            key={p.slug}
            href={`/builds/${p.slug}`}
            className="group flex flex-col gap-3 rounded-lg border border-border bg-surface p-5 transition-all hover:-translate-y-1 hover:border-primary/40 hover:shadow-glow-soft animate-fade-up"
            style={{ animationDelay: `${i * 50}ms` }}
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary-soft text-primary group-hover:bg-primary group-hover:text-bg">
              <Zap className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-text">{p.name}</h2>
              <p className="text-xs text-text-secondary">{p.sub}</p>
            </div>
            <span className="mt-auto inline-flex items-center gap-1 text-xs font-semibold text-primary">
              Ver build <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-1" />
            </span>
          </Link>
        ))}
      </section>

      {all.length > 0 ? (
        <section>
          <h2 className="mb-5 font-display text-2xl font-bold text-text">Todos os PCs montados</h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {all.map((pc) => (
              <PCBuildCard key={pc.id} product={pc} />
            ))}
          </div>
        </section>
      ) : (
        <section className="rounded-lg border border-dashed border-border bg-surface/40 p-10 text-center">
          <p className="text-sm text-text-secondary">Os builds aparecem aqui quando o backend estiver online.</p>
          <div className="mt-4">
            <Link href="/montar">
              <Button variant="outline">
                <Wrench className="h-4 w-4" /> Comecar do zero no builder
              </Button>
            </Link>
          </div>
        </section>
      )}
    </main>
  )
}
