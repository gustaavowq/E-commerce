import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowRight, Wrench } from 'lucide-react'
import { PersonaHero } from '@/components/PersonaHero'
import { PCBuildCard } from '@/components/PCBuildCard'
import { Button } from '@/components/ui/Button'
import { getPersonaBySlug } from '@/services/personas'
import { listByPersona } from '@/services/products'
import { ApiError } from '@/lib/api-error'
import type { Persona, ProductListItem } from '@/services/types'

export const revalidate = 60

type Params = { params: { persona: string } }

// Personas hardcoded como fallback se backend nao tiver criado as oficiais ainda.
const FALLBACK_PERSONAS: Record<string, Persona> = {
  'valorant-240fps': {
    id: 'fallback-valorant',
    slug: 'valorant-240fps',
    name: 'PC pra Valorant 240 FPS',
    shortDescription: 'Build pra esports rapidos: 240+ FPS estaveis no Valorant, monitor 240Hz aproveitado, latencia minima.',
    description: 'Foco em CPU rapida (alto IPC), GPU mid-high suficiente, RAM baixa latencia, NVMe Gen4 e periferia de eSports. Ideal pra mira firme, sem stutter no clutch.',
    targetGames: ['Valorant', 'CS2', 'Apex'],
    targetFps: { valorant: 240, cs2: 220, apex: 165 },
    heroImageUrl: null,
    startingPrice: 4500,
    buildCount: 0,
    metaTitle: 'PC pra Valorant 240 FPS · Builds prontos · Kore Tech',
    metaDesc: 'PC montado pra rodar Valorant em 240 FPS estaveis. Builds com FPS estimado real, peca por peca compativel.',
  },
  'fortnite-competitivo': {
    id: 'fallback-fortnite',
    slug: 'fortnite-competitivo',
    name: 'PC pra Fortnite competitivo',
    shortDescription: 'Build pra Builds e edits no Fortnite: 165+ FPS no modo Performance, sem queda em endgame.',
    description: 'CPU rapida, GPU media, monitor 165Hz aproveitado. Setup pensado pra builders de alto nivel.',
    targetGames: ['Fortnite', 'Valorant', 'Warzone'],
    targetFps: { fortnite: 165, valorant: 240, warzone: 144 },
    heroImageUrl: null,
    startingPrice: 4900,
    buildCount: 0,
  },
  'cs2-high-tier': {
    id: 'fallback-cs2',
    slug: 'cs2-high-tier',
    name: 'PC pra CS2 high tier',
    shortDescription: '1% low alto, sem tearing. Ideal pra Faceit nivel 10 e ESEA.',
    description: 'CPU 8c+ alto IPC, GPU mid-high, monitor 240Hz IPS.',
    targetGames: ['CS2', 'Valorant', 'R6 Siege'],
    targetFps: { cs2: 280, valorant: 240, r6: 200 },
    heroImageUrl: null,
    startingPrice: 5200,
    buildCount: 0,
  },
  'edicao-4k': {
    id: 'fallback-edicao',
    slug: 'edicao-4k',
    name: 'PC pra Edicao de Video 4K',
    shortDescription: 'Premiere, DaVinci e After Effects rodando suave em 4K. RAM 32-64GB e NVMe Gen5.',
    description: 'CPU 12c+ alto cache, GPU com VRAM 12GB+, RAM ECC opcional, dual NVMe.',
    targetGames: ['Premiere 4K', 'DaVinci 4K', 'After Effects'],
    targetFps: { premiere_4k: 60, davinci_4k: 50, ae_render: 30 },
    heroImageUrl: null,
    startingPrice: 9500,
    buildCount: 0,
  },
  'streaming': {
    id: 'fallback-streaming',
    slug: 'streaming',
    name: 'PC pra Streaming',
    shortDescription: 'OBS encoder dedicado, dual setup pronto, sem queda no game enquanto transmite.',
    description: 'CPU 8c+, GPU com NVENC, RAM 32GB, captura interna.',
    targetGames: ['Stream + jogo', 'Multitask AAA'],
    targetFps: { jogo_obs_1080p: 144, obs_4k: 60 },
    heroImageUrl: null,
    startingPrice: 6500,
    buildCount: 0,
  },
  'ia-local': {
    id: 'fallback-ia',
    slug: 'ia-local',
    name: 'PC pra IA local (Llama 7B/70B)',
    shortDescription: 'Roda Llama, Mistral e Stable Diffusion offline. VRAM alta, RAM 64GB+.',
    description: 'GPU com 16GB+ VRAM (RTX 4080/4090/5080/5090), RAM 64-128GB, NVMe Gen5 pra cache.',
    targetGames: ['Llama 7B (tps)', 'Llama 70B (tps)', 'Stable Diffusion'],
    targetFps: { llama_7b_tps: 80, llama_70b_tps: 12, sd_it_per_s: 18 },
    heroImageUrl: null,
    startingPrice: 14000,
    buildCount: 0,
  },
  'workstation-3d': {
    id: 'fallback-3d',
    slug: 'workstation-3d',
    name: 'Workstation 3D / CAD',
    shortDescription: 'Blender, AutoCAD, SolidWorks. Render rapido, viewport fluido.',
    description: 'CPU 16c+, GPU com Optix/CUDA, RAM 64GB ECC.',
    targetGames: ['Blender Cycles', 'AutoCAD', 'SolidWorks'],
    targetFps: { blender_cycles: 100, autocad: 80, sw_viewport: 90 },
    heroImageUrl: null,
    startingPrice: 12000,
    buildCount: 0,
  },
  'entry-gamer': {
    id: 'fallback-entry',
    slug: 'entry-gamer',
    name: 'PC Entry Gamer',
    shortDescription: 'Custo-beneficio pra comecar. Roda os jogos atuais em 1080p medio/alto.',
    description: 'CPU 6c moderna, GPU entry (RTX 4060), RAM 16GB DDR5.',
    targetGames: ['Valorant 1080p', 'Fortnite 1080p', 'Cyberpunk 1080p'],
    targetFps: { valorant: 200, fortnite: 144, cyberpunk: 60 },
    heroImageUrl: null,
    startingPrice: 3500,
    buildCount: 0,
  },
}

async function fetchPersona(slug: string): Promise<Persona | null> {
  try {
    return await getPersonaBySlug(slug)
  } catch (err) {
    if (ApiError.is(err) && (err.status === 404 || err.status === 0)) {
      return FALLBACK_PERSONAS[slug] ?? null
    }
    return FALLBACK_PERSONAS[slug] ?? null
  }
}

async function fetchPcs(slug: string): Promise<ProductListItem[]> {
  try {
    const res = await listByPersona(slug, 6)
    return res.data ?? []
  } catch {
    return []
  }
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const persona = await fetchPersona(params.persona)
  if (!persona) return { title: 'Build nao encontrado' }
  const title = persona.metaTitle ?? `${persona.name} · Kore Tech`
  const desc = persona.metaDesc ?? persona.shortDescription
  return {
    title,
    description: desc,
    openGraph: { title, description: desc, type: 'website' },
  }
}

export default async function PersonaBuildPage({ params }: Params) {
  const persona = await fetchPersona(params.persona)
  if (!persona) notFound()

  const pcs = await fetchPcs(persona.slug)

  // JSON-LD pra SEO (BreadcrumbList + ItemList de PCs)
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3001'
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Inicio', item: baseUrl },
          { '@type': 'ListItem', position: 2, name: 'Builds prontos', item: `${baseUrl}/builds` },
          { '@type': 'ListItem', position: 3, name: persona.name, item: `${baseUrl}/builds/${persona.slug}` },
        ],
      },
      pcs.length > 0 && {
        '@type': 'ItemList',
        name: persona.name,
        itemListElement: pcs.map((pc, i) => ({
          '@type': 'ListItem',
          position: i + 1,
          item: {
            '@type': 'Product',
            name: pc.name,
            url: `${baseUrl}/pcs/${pc.slug}`,
            image: pc.primaryImage?.url,
            offers: {
              '@type': 'Offer',
              price: pc.basePrice,
              priceCurrency: 'BRL',
              availability: pc.totalStock > 0 ? 'InStock' : 'OutOfStock',
            },
          },
        })),
      },
    ].filter(Boolean),
  }

  return (
    <main>
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <PersonaHero
        slug={persona.slug}
        name={persona.name}
        shortDescription={persona.shortDescription}
        targetGames={persona.targetGames}
        targetFps={persona.targetFps}
        heroImageUrl={persona.heroImageUrl}
        startingPrice={persona.startingPrice}
      />

      <section id="builds-prontos" className="container-app py-12 sm:py-16">
        <header className="mb-7">
          <p className="font-specs text-xs font-bold uppercase tracking-widest text-primary">Builds prontos</p>
          <h2 className="mt-2 font-display text-2xl font-bold text-text sm:text-3xl">
            3 PCs prontos pra {persona.name.toLowerCase()}
          </h2>
        </header>

        {pcs.length > 0 ? (
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
            {pcs.slice(0, 3).map((pc) => (
              <PCBuildCard key={pc.id} product={pc} />
            ))}
          </div>
        ) : (
          <div className="rounded-lg border border-dashed border-border bg-surface/40 p-10 text-center">
            <p className="text-sm text-text-secondary">Builds dessa persona aparecem quando o backend estiver online com seed.</p>
            <p className="mt-2 text-xs text-text-muted">Enquanto isso, abra o builder e monte sob medida.</p>
            <div className="mt-4">
              <Link href={`/montar?persona=${encodeURIComponent(persona.slug)}`}>
                <Button variant="outline">
                  <Wrench className="h-4 w-4" /> Abrir o builder
                </Button>
              </Link>
            </div>
          </div>
        )}
      </section>

      {/* CTA "monte o seu" */}
      <section className="border-t border-border bg-surface/40 py-12 sm:py-16">
        <div className="container-app">
          <div className="rounded-xl border border-primary/30 bg-gradient-to-br from-primary-soft to-bg p-6 sm:p-10">
            <h2 className="font-display text-2xl font-bold text-text sm:text-3xl">
              Quer ajustar essa build?
            </h2>
            <p className="mt-2 max-w-2xl text-sm text-text-secondary sm:text-base">
              Abre o builder com a persona selecionada. Filtra so peca compativel, calcula a fonte automatico e voce monta exatamente como quer.
            </p>
            <div className="mt-5">
              <Link href={`/montar?persona=${encodeURIComponent(persona.slug)}`}>
                <Button variant="primary" size="lg" className="cta-glow">
                  <Wrench className="h-4 w-4" /> Comecar montagem <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
