import Link from 'next/link'
import type { Metadata } from 'next'
import { Hero } from '@/components/loja/Hero'
import { ImovelGrid } from '@/components/loja/ImovelGrid'
import { ScrollReveal } from '@/components/effects/ScrollReveal'
import { apiList } from '@/lib/api'
import type { ImovelListItem } from '@/types/api'
import { microcopy } from '@/lib/microcopy'

const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
).replace(/\/+$/, '')

export const metadata: Metadata = {
  title: 'Marquesa | Imóveis com curadoria em São Paulo',
  description:
    'Apartamentos, casas e coberturas em endereços selecionados de São Paulo e Rio. Curadoria boutique, reserva por sinal via Pix.',
  alternates: { canonical: '/' },
  openGraph: {
    title: 'Marquesa | Imóveis com curadoria em São Paulo',
    description:
      'Imobiliária boutique. Curadoria de imóveis alto padrão em São Paulo e Rio de Janeiro.',
    url: '/',
    siteName: 'Marquesa',
    type: 'website',
    locale: 'pt_BR',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Marquesa | Imóveis com curadoria',
    description: 'Curadoria de imóveis alto padrão em São Paulo e Rio.',
  },
}

const organizationJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'RealEstateAgent',
  name: 'Marquesa Imóveis',
  alternateName: 'Marquesa',
  url: SITE_URL,
  logo: `${SITE_URL}/logo.svg`,
  description:
    'Imobiliária boutique. Curadoria de imóveis alto padrão em São Paulo e Rio de Janeiro com reserva por sinal via Pix.',
  areaServed: [
    { '@type': 'City', name: 'São Paulo' },
    { '@type': 'City', name: 'Rio de Janeiro' },
  ],
  address: {
    '@type': 'PostalAddress',
    streetAddress: 'Rua dos Tranquilos, 142',
    addressLocality: 'São Paulo',
    addressRegion: 'SP',
    addressCountry: 'BR',
  },
  contactPoint: {
    '@type': 'ContactPoint',
    contactType: 'sales',
    telephone: '+55-11-90000-0000',
    availableLanguage: ['pt-BR'],
  },
  identifier: 'CRECI/SP 12345-J',
}

// force-dynamic — feedback iter3 Gustavo: home estava mostrando "Em destaque"
// vazio por causa de cache stale do build inicial enquanto Railway rebootava.
// Performance: tradeoff aceito — fetch ao Railway é rápido (interno).
export const dynamic = 'force-dynamic'

async function getImoveis(): Promise<{ destaques: ImovelListItem[]; total: number; bairros: string[] }> {
  try {
    const todos = await apiList<ImovelListItem>('/api/imoveis', {
      query: { limit: 50, sort: 'recent' },
      withAuth: false,
    })
    const dataDestaque = todos.data.filter((i) => (i as { destaque?: boolean }).destaque === true)
    const destaques = (dataDestaque.length > 0 ? dataDestaque : todos.data).slice(0, 3)
    const bairros = Array.from(new Set(todos.data.map((i) => i.bairro).filter(Boolean))) as string[]
    return { destaques, total: todos.meta.total ?? todos.data.length, bairros }
  } catch {
    return { destaques: [], total: 0, bairros: [] }
  }
}

const PASSOS = [
  {
    titulo: microcopy.home.processo_passo_1_titulo,
    corpo: microcopy.home.processo_passo_1_corpo,
  },
  {
    titulo: microcopy.home.processo_passo_2_titulo,
    corpo: microcopy.home.processo_passo_2_corpo,
  },
  {
    titulo: microcopy.home.processo_passo_3_titulo,
    corpo: microcopy.home.processo_passo_3_corpo,
  },
] as const

export default async function HomePage() {
  const { destaques, total, bairros } = await getImoveis()
  const heroImovel = destaques[0]
  const bairrosTop = bairros.slice(0, 6)

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
      />
      <Hero imovelSlug={heroImovel?.slug} imageUrl={heroImovel?.fotos?.[0]} />

      {/* Critério — abertura editorial entre Hero e Destaques */}
      <section className="container-marquesa py-16 md:py-24">
        <ScrollReveal>
          <div className="max-w-2xl">
            <p className="text-eyebrow uppercase tracking-[0.16em] text-ash mb-4">
              {microcopy.home.curadoria_intro_eyebrow}
            </p>
            <p className="font-display font-light text-display-md text-ink leading-snug">
              {microcopy.home.curadoria_intro}
            </p>
          </div>
        </ScrollReveal>
      </section>

      {/* Em destaque — 3 cards estáticos */}
      <section className="container-marquesa pb-24">
        <ScrollReveal>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-12">
            <div>
              <p className="text-eyebrow uppercase tracking-[0.16em] text-ash mb-3">
                {microcopy.home.secao_destaques}
              </p>
              <h2 className="font-display text-display-lg text-ink">Seleção atual</h2>
              <p className="text-body text-ash mt-3 max-w-xl">
                {microcopy.home.secao_destaques_subtitulo}
              </p>
            </div>
            <Link
              href="/imoveis"
              className="text-body-sm text-ink hover:text-moss border-b border-ink hover:border-moss pb-1 self-start md:self-auto transition-colors duration-fast"
            >
              Ver catálogo completo
            </Link>
          </div>
        </ScrollReveal>
        <ImovelGrid imoveis={destaques} emptyMessage={microcopy.vazio.sem_destaques} />
      </section>

      {/* Bairros que cobrimos — grid de 6 chips com link pra catálogo filtrado */}
      {bairrosTop.length > 0 && (
        <section className="bg-paper-warm py-24">
          <div className="container-marquesa">
            <ScrollReveal>
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-14">
                <div className="max-w-2xl">
                  <p className="text-eyebrow uppercase tracking-[0.16em] text-ash mb-3">
                    {microcopy.home.secao_bairros}
                  </p>
                  <h2 className="font-display text-display-lg text-ink mb-4">
                    Onde estamos hoje.
                  </h2>
                  <p className="text-body text-ash leading-relaxed">
                    {microcopy.home.secao_bairros_subtitulo}
                  </p>
                </div>
              </div>
            </ScrollReveal>
            <ScrollReveal>
              <ul className="grid grid-cols-2 md:grid-cols-3 gap-px bg-bone border border-bone">
                {bairrosTop.map((bairro) => (
                  <li key={bairro} className="bg-paper-warm">
                    <Link
                      href={`/imoveis?bairro=${encodeURIComponent(bairro)}`}
                      className="block px-6 py-8 hover:bg-paper transition-colors duration-fast group"
                    >
                      <p className="font-display text-heading-lg text-ink group-hover:text-moss transition-colors duration-fast">
                        {bairro}
                      </p>
                      <p className="text-caption text-ash mt-2 uppercase tracking-[0.12em]">
                        Ver imóveis →
                      </p>
                    </Link>
                  </li>
                ))}
              </ul>
            </ScrollReveal>
          </div>
        </section>
      )}

      {/* Como funciona — 3 passos */}
      <section className="container-marquesa py-24">
        <ScrollReveal>
          <div className="max-w-2xl mb-16">
            <p className="text-eyebrow uppercase tracking-[0.16em] text-ash mb-3">
              {microcopy.home.secao_processo}
            </p>
            <h2 className="font-display text-display-lg text-ink mb-4">
              Três tempos. Sem ruído.
            </h2>
            <p className="text-body text-ash leading-relaxed">
              {microcopy.home.secao_processo_subtitulo}
            </p>
          </div>
        </ScrollReveal>
        <ScrollReveal>
          <ol className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {PASSOS.map((passo, i) => (
              <li key={passo.titulo} className="border-t border-ink pt-6">
                <p className="font-display text-display-md text-ink leading-none mb-6 tnum">
                  {String(i + 1).padStart(2, '0')}
                </p>
                <h3 className="font-display text-heading-lg text-ink mb-3">{passo.titulo}</h3>
                <p className="text-body text-ash leading-relaxed">{passo.corpo}</p>
              </li>
            ))}
          </ol>
        </ScrollReveal>
      </section>

      {/* Números — 4 stats horizontais */}
      <section className="bg-graphite text-paper py-24">
        <div className="container-marquesa">
          <ScrollReveal>
            <div className="max-w-2xl mb-14">
              <p className="text-eyebrow uppercase tracking-[0.16em] text-paper/60 mb-3">
                {microcopy.home.secao_numeros}
              </p>
              <h2 className="font-display text-display-lg text-paper">
                A curadoria em números.
              </h2>
              <p className="text-body text-paper/70 mt-4 leading-relaxed">
                {microcopy.home.secao_numeros_subtitulo}
              </p>
            </div>
          </ScrollReveal>
          <ScrollReveal>
            <dl className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
              <Stat numero={total.toString()} label={microcopy.home.numero_imoveis_label} />
              <Stat numero={bairros.length.toString()} label={microcopy.home.numero_bairros_label} />
              <Stat numero="100%" label={microcopy.home.numero_documentacao_label} />
              <Stat numero="5%" label={microcopy.home.numero_sinal_label} />
            </dl>
          </ScrollReveal>
        </div>
      </section>

      {/* Sobre Marquesa */}
      <section className="bg-paper-warm py-24">
        <ScrollReveal>
          <div className="container-marquesa max-w-3xl text-center">
            <p className="text-eyebrow uppercase tracking-[0.16em] text-ash mb-6">Sobre</p>
            <h2 className="font-display text-display-lg text-ink mb-6">
              {microcopy.home.secao_sobre_titulo}
            </h2>
            <p className="text-body-lg text-ink leading-relaxed mb-8">
              {microcopy.home.secao_sobre_corpo}
            </p>
            <Link
              href="/sobre"
              className="inline-block text-body-sm text-ink uppercase tracking-[0.04em] border-b border-ink pb-1 hover:text-moss hover:border-moss transition-colors duration-fast"
            >
              Conheça a Marquesa
            </Link>
          </div>
        </ScrollReveal>
      </section>

      {/* Contato rápido */}
      <section className="container-marquesa py-24">
        <ScrollReveal>
          <div className="max-w-3xl">
            <p className="text-eyebrow uppercase tracking-[0.16em] text-ash mb-6">
              Vamos conversar
            </p>
            <h2 className="font-display text-display-lg text-ink mb-6">
              {microcopy.home.secao_contato_titulo}
            </h2>
            <p className="text-body-lg text-ink leading-relaxed mb-8 max-w-2xl">
              {microcopy.home.secao_contato_corpo}
            </p>
            <Link
              href="/contato"
              className="inline-flex items-center justify-center px-8 py-4 font-sans font-medium text-body-sm uppercase tracking-[0.04em] bg-moss text-paper hover:bg-moss-deep transition-colors duration-fast"
            >
              Falar com a Marquesa
            </Link>
          </div>
        </ScrollReveal>
      </section>
    </>
  )
}

function Stat({ numero, label }: { numero: string; label: string }) {
  return (
    <div>
      <dt className="font-display font-light text-paper text-display-lg leading-none mb-3 tnum">
        {numero}
      </dt>
      <dd className="text-body-sm text-paper/70 leading-snug">{label}</dd>
    </div>
  )
}
