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

// Metadata da home: explícita pra OG/Twitter de boa qualidade.
// Imagem OG é a foto do imóvel destaque (escolhido em runtime no componente);
// aqui usamos uma imagem fixa neutra como fallback até GA fornecer asset oficial.
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

// Organization schema — assina identidade da Marquesa pra Google Knowledge Graph.
const organizationJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'RealEstateAgent',
  name: 'Marquesa Imóveis',
  alternateName: 'Marquesa',
  url: SITE_URL,
  // logoUrl real virá do SiteSettings em fase futura — placeholder até lá.
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
  // CRECI placeholder — substituir por real em produção.
  identifier: 'CRECI/SP 12345-J',
}

// SSR — busca destaques no servidor pra HTML inicial completo.
async function getDestaques(): Promise<ImovelListItem[]> {
  try {
    const res = await apiList<ImovelListItem>('/api/imoveis', {
      query: { destaque: 'true', limit: 6, sort: 'recentes' },
      withAuth: false,
      next: { revalidate: 60 } as never,
    })
    return res.data
  } catch {
    return []
  }
}

export default async function HomePage() {
  const destaques = await getDestaques()
  const heroImovel = destaques[0]

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
      />
      <Hero imovelSlug={heroImovel?.slug} imageUrl={heroImovel?.fotos?.[0]} />

      {/* Destaques */}
      <section className="container-marquesa py-24">
        <ScrollReveal>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-12">
            <div>
              <p className="text-eyebrow uppercase tracking-[0.16em] text-ash mb-3">
                Catálogo
              </p>
              <h2 className="font-display text-display-lg text-ink">
                {microcopy.home.secao_destaques}
              </h2>
              <p className="text-body text-ash mt-3 max-w-md">
                {microcopy.home.secao_destaques_subtitulo}
              </p>
            </div>
            <Link
              href="/imoveis"
              className="text-body-sm text-ink hover:underline underline-offset-4 self-start md:self-auto"
            >
              Ver catálogo completo →
            </Link>
          </div>
        </ScrollReveal>
        <ImovelGrid imoveis={destaques} />
      </section>

      {/* Sobre Marquesa */}
      <section className="bg-paper-warm py-24">
        <ScrollReveal>
          <div className="container-marquesa max-w-3xl text-center">
            <p className="text-eyebrow uppercase tracking-[0.16em] text-ash mb-6">
              Sobre
            </p>
            <h2 className="font-display text-display-lg text-ink mb-6">
              Curadoria, não listagem em massa.
            </h2>
            <p className="text-body-lg text-ink leading-relaxed mb-8">
              A Marquesa cura endereço. Cada imóvel passa por triagem técnica e visita presencial
              da equipe antes de entrar no catálogo. Documentação verificada, fotografia profissional,
              ficha completa, corretor responsável atribuído.
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
              Buscando algo específico?
            </h2>
            <p className="text-body-lg text-ink leading-relaxed mb-8 max-w-2xl">
              Atendimento por agendamento, segunda a sexta. Conte o que você procura, e nossa
              equipe sugere imóveis adequados, dentro ou fora do catálogo.
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
