import { notFound } from 'next/navigation'
import Link from 'next/link'
import type { Metadata } from 'next'
import { api, apiList } from '@/lib/api'
import { formatBRL, formatBRLDetailed, formatArea, tipoLabel } from '@/lib/format'
import { PdpGallery } from '@/components/loja/PdpGallery'
import { PdpMap } from '@/components/loja/PdpMap'
import { ImovelCard } from '@/components/loja/ImovelCard'
import { ScrollReveal } from '@/components/effects/ScrollReveal'
import { ImovelActions } from './ImovelActions'
import { ViewTracker } from './ViewTracker'
import { microcopy } from '@/lib/microcopy'
import type { ImovelDetail, ImovelListItem } from '@/types/api'

interface PageProps {
  params: { slug: string }
}

async function getImovel(slug: string): Promise<ImovelDetail | null> {
  try {
    return await api<ImovelDetail>(`/api/imoveis/${slug}`, {
      withAuth: false,
      cache: 'no-store',
    })
  } catch {
    return null
  }
}

async function getSimilares(imovel: ImovelDetail): Promise<ImovelListItem[]> {
  try {
    const res = await apiList<ImovelListItem>('/api/imoveis', {
      query: { tipo: imovel.tipo, limit: 6 },
      withAuth: false,
      cache: 'no-store',
    })
    return res.data.filter((i) => i.id !== imovel.id).slice(0, 3)
  } catch {
    return []
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const imovel = await getImovel(params.slug)
  if (!imovel) return { title: 'Imóvel não encontrado' }
  const description = imovel.descricao.slice(0, 160)
  const image = imovel.fotos?.[0]
  return {
    title: imovel.titulo,
    description,
    alternates: {
      canonical: `/imoveis/${imovel.slug}`,
    },
    openGraph: {
      title: `${imovel.titulo} · Marquesa`,
      description,
      url: `/imoveis/${imovel.slug}`,
      siteName: 'Marquesa',
      images: image ? [{ url: image, alt: imovel.titulo }] : [],
      type: 'website',
      locale: 'pt_BR',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${imovel.titulo} · Marquesa`,
      description,
      images: image ? [image] : [],
    },
  }
}

const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
).replace(/\/+$/, '')

// JSON-LD RealEstateListing — gerado por imóvel pra rich result Google.
// Schema.org: name, description, image, offers, address, geo, numberOfRooms, floorSize.
function buildJsonLd(imovel: ImovelDetail) {
  const status = String(imovel.status)
  const availability =
    status === 'DISPONIVEL'
      ? 'https://schema.org/InStock'
      : status === 'RESERVADO' || status === 'EM_NEGOCIACAO'
        ? 'https://schema.org/LimitedAvailability'
        : 'https://schema.org/OutOfStock'

  return {
    '@context': 'https://schema.org',
    '@type': 'RealEstateListing',
    name: imovel.titulo,
    description: imovel.descricao.slice(0, 280),
    image: imovel.fotos,
    url: `${SITE_URL}/imoveis/${imovel.slug}`,
    datePosted: imovel.createdAt,
    dateModified: imovel.updatedAt,
    offers: {
      '@type': 'Offer',
      price: Number(imovel.preco),
      priceCurrency: 'BRL',
      availability,
    },
    address: {
      '@type': 'PostalAddress',
      streetAddress: imovel.endereco,
      addressLocality: imovel.cidade,
      addressRegion: imovel.estado,
      postalCode: imovel.cep,
      addressCountry: 'BR',
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: imovel.latitude,
      longitude: imovel.longitude,
    },
    numberOfRooms: imovel.quartos,
    numberOfBathroomsTotal: imovel.banheiros,
    floorSize: {
      '@type': 'QuantitativeValue',
      value: imovel.area,
      unitCode: 'MTK',
    },
  }
}

export default async function PDPPage({ params }: PageProps) {
  const imovel = await getImovel(params.slug)
  if (!imovel) notFound()

  const similares = await getSimilares(imovel)
  const altText = `${tipoLabel(imovel.tipo)} de ${formatArea(imovel.area)} em ${imovel.bairro}, ${imovel.cidade}`
  const jsonLd = buildJsonLd(imovel)

  return (
    <>
      <script
        type="application/ld+json"
        // Stringify resolve aspas + caracteres unicode com segurança.
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ViewTracker slug={imovel.slug} />

      <div className="container-marquesa py-8">
        <Link
          href="/imoveis"
          className="text-body-sm text-ash hover:text-ink transition-colors duration-fast inline-block"
        >
          ← {microcopy.pdp.voltar_catalogo}
        </Link>
      </div>

      {/* Header da PDP */}
      <header className="container-marquesa pt-4 pb-12">
        <p className="text-eyebrow uppercase tracking-[0.16em] text-ash mb-3 tnum">
          {imovel.bairro} · {imovel.cidade}
        </p>
        <h1 className="font-display font-light text-display-xl text-ink max-w-4xl">
          {imovel.titulo}
        </h1>
      </header>

      {/* Galeria + sidebar */}
      <section className="container-marquesa pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-12">
          <div>
            <PdpGallery fotos={imovel.fotos} alt={altText} />
          </div>

          {/* Sidebar de preço/ações */}
          <aside className="lg:sticky lg:top-24 lg:self-start flex flex-col gap-6 border border-bone p-8 bg-paper">
            <div>
              <p className="text-eyebrow uppercase tracking-[0.16em] text-ash mb-2">Preço</p>
              <p className="font-display text-display-md text-ink tnum">
                {formatBRL(imovel.preco)}
              </p>
              <p className="text-body-sm text-ash mt-1 tnum">
                Sinal sugerido: {formatBRLDetailed(imovel.precoSinal)}
              </p>
            </div>

            <ul className="grid grid-cols-2 gap-y-3 text-body-sm tnum">
              <Stat label="Área útil" value={formatArea(imovel.area)} />
              <Stat label="Quartos" value={String(imovel.quartos)} />
              {imovel.suites > 0 && <Stat label="Suítes" value={String(imovel.suites)} />}
              <Stat label="Banheiros" value={String(imovel.banheiros)} />
              <Stat label="Vagas" value={String(imovel.vagas)} />
              {imovel.areaTotal && (
                <Stat label="Área total" value={formatArea(imovel.areaTotal)} />
              )}
            </ul>

            <ImovelActions imovel={imovel} />
          </aside>
        </div>
      </section>

      {/* Descrição + ficha */}
      <section className="container-marquesa py-16 border-t border-bone">
        <ScrollReveal>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div>
              <p className="text-eyebrow uppercase tracking-[0.16em] text-ash mb-4">
                {microcopy.pdp.sobre_imovel}
              </p>
              <div className="prose-marquesa text-body-lg text-ink leading-relaxed whitespace-pre-line">
                {imovel.descricao}
              </div>
            </div>

            <div>
              <p className="text-eyebrow uppercase tracking-[0.16em] text-ash mb-4">
                {microcopy.pdp.ficha_tecnica}
              </p>
              <dl className="border-t border-bone">
                <Row label="Tipo" value={tipoLabel(imovel.tipo)} />
                <Row label="Bairro" value={imovel.bairro} />
                <Row label="Cidade" value={`${imovel.cidade} · ${imovel.estado}`} />
                <Row label={microcopy.pdp.area_util} value={formatArea(imovel.area)} numeric />
                {imovel.areaTotal && (
                  <Row label="Área total" value={formatArea(imovel.areaTotal)} numeric />
                )}
                <Row label={microcopy.pdp.quartos} value={String(imovel.quartos)} numeric />
                {imovel.suites > 0 && (
                  <Row label={microcopy.pdp.suites} value={String(imovel.suites)} numeric />
                )}
                <Row label={microcopy.pdp.banheiros} value={String(imovel.banheiros)} numeric />
                <Row label={microcopy.pdp.vagas} value={String(imovel.vagas)} numeric />
                {imovel.iptuAnual != null && (
                  <Row
                    label={microcopy.pdp.iptu_anual}
                    value={formatBRLDetailed(imovel.iptuAnual)}
                    numeric
                  />
                )}
                {imovel.condominio != null && (
                  <Row
                    label={microcopy.pdp.condominio}
                    value={formatBRLDetailed(imovel.condominio)}
                    numeric
                  />
                )}
              </dl>

              {imovel.amenidades && imovel.amenidades.length > 0 && (
                <div className="mt-8">
                  <p className="text-eyebrow uppercase tracking-[0.16em] text-ash mb-3">
                    Comodidades
                  </p>
                  <ul className="flex flex-wrap gap-2">
                    {imovel.amenidades.map((a) => (
                      <li
                        key={a}
                        className="px-3 py-1 border border-bone text-body-sm text-ash capitalize"
                      >
                        {a}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </ScrollReveal>
      </section>

      {/* Mapa */}
      <section className="container-marquesa py-16 border-t border-bone">
        <ScrollReveal>
          <p className="text-eyebrow uppercase tracking-[0.16em] text-ash mb-4">
            {microcopy.pdp.localizacao}
          </p>
          <h2 className="font-display text-display-md text-ink mb-8">
            {imovel.bairro}, {imovel.cidade}
          </h2>
          <PdpMap lat={imovel.latitude} lng={imovel.longitude} titulo={imovel.titulo} />
        </ScrollReveal>
      </section>

      {/* Similares */}
      {similares.length > 0 && (
        <section className="container-marquesa py-24 border-t border-bone">
          <ScrollReveal>
            <p className="text-eyebrow uppercase tracking-[0.16em] text-ash mb-3">
              {microcopy.pdp.outros_imoveis}
            </p>
            <h2 className="font-display text-display-md text-ink mb-12">
              {microcopy.pdp.outros_imoveis_subtitulo}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {similares.map((s) => (
                <ImovelCard key={s.id} imovel={s} />
              ))}
            </div>
          </ScrollReveal>
        </section>
      )}
    </>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <li className="flex flex-col gap-1">
      <span className="text-eyebrow uppercase tracking-[0.16em] text-ash">{label}</span>
      <span className="font-sans font-medium text-body text-ink tnum">{value}</span>
    </li>
  )
}

function Row({
  label,
  value,
  numeric,
}: {
  label: string
  value: string
  numeric?: boolean
}) {
  return (
    <div className="flex items-center justify-between border-b border-bone py-4">
      <dt className="text-eyebrow uppercase tracking-[0.16em] text-ash">{label}</dt>
      <dd className={`font-sans font-medium text-body text-ink ${numeric ? 'tnum' : ''}`}>
        {value}
      </dd>
    </div>
  )
}
