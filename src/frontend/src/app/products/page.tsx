// Listagem de produtos com filtro por brand/category via querystring.
// Server component — SSR direto na API. Filtros básicos via Link (nada de client state pra MVP).
import Link from 'next/link'
import { listProducts } from '@/services/products'
import { listBrands } from '@/services/brands'
import { listCategories } from '@/services/categories'
import { ProductCard } from '@/components/ProductCard'
import type { ProductListQuery } from '@/services/types'

type Props = { searchParams: { brand?: string; category?: string; sort?: string; search?: string } }

export const dynamic = 'force-dynamic'

export default async function ProductsPage({ searchParams }: Props) {
  const query: ProductListQuery = {
    brand:    searchParams.brand,
    category: searchParams.category,
    search:   searchParams.search,
    sort:     (searchParams.sort as ProductListQuery['sort']) ?? 'newest',
    limit:    24,
  }

  const [productsRes, brands, categories] = await Promise.all([
    listProducts(query),
    listBrands(),
    listCategories(),
  ])

  const total = productsRes.meta?.total ?? productsRes.data.length

  // Pra montar links de filtro mantendo outros parâmetros
  const buildLink = (changes: Partial<typeof searchParams>) => {
    const sp = new URLSearchParams()
    Object.entries({ ...searchParams, ...changes }).forEach(([k, v]) => {
      if (v) sp.set(k, v)
      else sp.delete(k)
    })
    const qs = sp.toString()
    return `/products${qs ? `?${qs}` : ''}`
  }

  return (
    <div className="container-app py-6 sm:py-10">
      {/* Breadcrumb + título */}
      <nav className="mb-3 text-xs text-ink-3">
        <Link href="/" className="hover:text-primary-700">Home</Link>
        <span className="mx-1.5">›</span>
        <span>Produtos</span>
      </nav>
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl text-ink sm:text-3xl">
            {searchParams.brand
              ? brands.find(b => b.slug === searchParams.brand)?.name ?? 'Marca'
              : searchParams.category
                ? categories.find(c => c.slug === searchParams.category)?.name ?? 'Categoria'
                : 'Todos os produtos'}
          </h1>
          <p className="mt-1 text-sm text-ink-3">{total} {total === 1 ? 'produto' : 'produtos'}</p>
        </div>
      </header>

      <div className="mt-6 grid gap-6 lg:grid-cols-[260px_1fr]">
        {/* Sidebar de filtros — desktop. Mobile vira drawer no sprint 2. */}
        <aside className="hidden space-y-6 lg:block">
          <FilterSection title="Marcas">
            <FilterLink href={buildLink({ brand: undefined })} active={!searchParams.brand}>Todas</FilterLink>
            {brands.map(b => (
              <FilterLink key={b.slug} href={buildLink({ brand: b.slug })} active={searchParams.brand === b.slug} count={b.productCount}>
                {b.name}
              </FilterLink>
            ))}
          </FilterSection>
          <FilterSection title="Categorias">
            <FilterLink href={buildLink({ category: undefined })} active={!searchParams.category}>Todas</FilterLink>
            {categories.map(c => (
              <FilterLink key={c.slug} href={buildLink({ category: c.slug })} active={searchParams.category === c.slug} count={c.productCount}>
                {c.name}
              </FilterLink>
            ))}
          </FilterSection>
          <FilterSection title="Ordenar por">
            {[
              { v: 'newest',     l: 'Mais recentes' },
              { v: 'featured',   l: 'Em destaque' },
              { v: 'price_asc',  l: 'Menor preço' },
              { v: 'price_desc', l: 'Maior preço' },
              { v: 'name_asc',   l: 'A → Z' },
            ].map(o => (
              <FilterLink key={o.v} href={buildLink({ sort: o.v })} active={(searchParams.sort ?? 'newest') === o.v}>
                {o.l}
              </FilterLink>
            ))}
          </FilterSection>
        </aside>

        {/* Grid */}
        <div>
          {productsRes.data.length === 0 ? (
            <div className="rounded-lg border border-border bg-white p-10 text-center">
              <p className="text-lg font-semibold text-ink">Nenhum produto encontrado</p>
              <p className="mt-2 text-sm text-ink-3">Tenta tirar algum filtro ou voltar pra <Link href="/products" className="text-primary-700 hover:underline">todos os produtos</Link>.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4">
              {productsRes.data.map(p => <ProductCard key={p.id} product={p} />)}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function FilterSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="mb-2 text-xs font-bold uppercase tracking-wider text-ink-3">{title}</h3>
      <div className="space-y-1">{children}</div>
    </div>
  )
}

function FilterLink({ href, active, count, children }: { href: string; active?: boolean; count?: number; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className={`flex items-center justify-between rounded-md px-3 py-2 text-sm transition ${
        active
          ? 'bg-primary-50 font-semibold text-primary-700'
          : 'text-ink-2 hover:bg-surface-2'
      }`}
    >
      <span>{children}</span>
      {count !== undefined && count > 0 && (
        <span className="text-xs text-ink-3">{count}</span>
      )}
    </Link>
  )
}
