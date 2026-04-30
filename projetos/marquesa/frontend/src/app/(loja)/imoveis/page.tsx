import { Suspense } from 'react'
import Link from 'next/link'
import { FiltersBar } from '@/components/loja/FiltersBar'
import { ImovelGrid, ImovelGridSkeleton } from '@/components/loja/ImovelGrid'

// Página depende de query string — força dynamic pra evitar prerender estático.
export const dynamic = 'force-dynamic'
import { apiList } from '@/lib/api'
import type { ImovelListItem } from '@/types/api'
import { microcopy } from '@/lib/microcopy'

interface SearchParams {
  tipo?: string
  bairro?: string
  precoMin?: string
  precoMax?: string
  quartosMin?: string
  sort?: string
  page?: string
}

async function getImoveis(params: SearchParams) {
  try {
    const res = await apiList<ImovelListItem>('/api/imoveis', {
      query: {
        tipo: params.tipo,
        bairro: params.bairro,
        precoMin: params.precoMin ? Number(params.precoMin) : undefined,
        precoMax: params.precoMax ? Number(params.precoMax) : undefined,
        quartosMin: params.quartosMin ? Number(params.quartosMin) : undefined,
        sort: params.sort,
        page: params.page ? Number(params.page) : 1,
        limit: 12,
      },
      withAuth: false,
      cache: 'no-store',
    })
    return res
  } catch {
    return { data: [], meta: { page: 1, limit: 12, total: 0, totalPages: 1 } }
  }
}

// generateMetadata async — ajusta título/descrição baseado em filtro de tipo/bairro.
const tipoMetaLabel: Record<string, string> = {
  APARTAMENTO: 'Apartamentos',
  CASA: 'Casas',
  COBERTURA: 'Coberturas',
  SOBRADO: 'Sobrados',
  TERRENO: 'Terrenos',
  COMERCIAL: 'Imóveis comerciais',
}

export async function generateMetadata({
  searchParams,
}: {
  searchParams: SearchParams
}): Promise<import('next').Metadata> {
  const tipoLabel = searchParams.tipo ? tipoMetaLabel[searchParams.tipo] : null
  const bairro = searchParams.bairro
  const filtros = [tipoLabel, bairro && `em ${bairro}`].filter(Boolean).join(' ')
  const titulo = filtros ? `${filtros} | Catálogo Marquesa` : 'Catálogo de imóveis | Marquesa'
  const descricao = filtros
    ? `Curadoria atual: ${filtros.toLowerCase()} selecionados pela Marquesa.`
    : 'Imóveis selecionados pela curadoria Marquesa em São Paulo e Rio de Janeiro. Apartamentos, casas, coberturas.'
  return {
    title: titulo,
    description: descricao,
    alternates: { canonical: '/imoveis' },
    openGraph: {
      title: titulo,
      description: descricao,
      url: '/imoveis',
      siteName: 'Marquesa',
      type: 'website',
      locale: 'pt_BR',
    },
    twitter: {
      card: 'summary_large_image',
      title: titulo,
      description: descricao,
    },
  }
}

export default async function CatalogoPage({
  searchParams,
}: {
  searchParams: SearchParams
}) {
  const { data, meta } = await getImoveis(searchParams)

  return (
    <>
      <Suspense fallback={<div className="h-[73px] border-b border-bone bg-paper" />}>
        <FiltersBar />
      </Suspense>
      <section className="container-marquesa py-12 md:py-16">
        <header className="mb-12">
          <p className="text-eyebrow uppercase tracking-[0.16em] text-ash mb-3">Catálogo</p>
          <h1 className="font-display text-display-lg text-ink">{microcopy.catalogo.titulo}</h1>
          <p className="text-body-lg text-ink leading-relaxed mt-4 max-w-2xl">
            {microcopy.catalogo.intro_editorial}
          </p>
          <p className="text-body text-ash mt-6 tnum">
            {meta.total === 1
              ? microcopy.catalogo.resultado_singular
              : microcopy.catalogo.resultado_plural.replace('{n}', String(meta.total))}
          </p>
        </header>

        <Suspense fallback={<ImovelGridSkeleton count={9} />}>
          <ImovelGrid imoveis={data} />
        </Suspense>

        {/* Paginação simples */}
        {meta.totalPages > 1 && <Pagination meta={meta} searchParams={searchParams} />}

        {/* Outro editorial — saída humana sem virar pop-up de captura */}
        <div className="mt-24 text-center">
          <p className="text-body text-ash mb-3">{microcopy.catalogo.outro_editorial}</p>
          <Link
            href="/contato"
            className="inline-block text-body-sm text-ink hover:text-moss border-b border-ink hover:border-moss pb-1 transition-colors duration-fast"
          >
            {microcopy.catalogo.outro_editorial_cta}
          </Link>
        </div>
      </section>
    </>
  )
}

function Pagination({
  meta,
  searchParams,
}: {
  meta: { page: number; totalPages: number }
  searchParams: SearchParams
}) {
  const buildHref = (page: number) => {
    const u = new URLSearchParams()
    Object.entries(searchParams).forEach(([k, v]) => {
      if (v && k !== 'page') u.set(k, String(v))
    })
    u.set('page', String(page))
    return `/imoveis?${u.toString()}`
  }
  const prev = Math.max(1, meta.page - 1)
  const next = Math.min(meta.totalPages, meta.page + 1)

  return (
    <nav className="mt-16 flex items-center justify-center gap-6 text-body-sm">
      <a
        href={buildHref(prev)}
        aria-disabled={meta.page === 1}
        className="text-ink hover:underline underline-offset-4"
      >
        ← Anterior
      </a>
      <span className="text-ash tnum">
        Página {meta.page} de {meta.totalPages}
      </span>
      <a
        href={buildHref(next)}
        aria-disabled={meta.page === meta.totalPages}
        className="text-ink hover:underline underline-offset-4"
      >
        Próxima →
      </a>
    </nav>
  )
}
