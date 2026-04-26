// Listagem com filtros avançados (preço, tamanho, cor, promoção, marca, categoria).
import Link from 'next/link'
import { listProducts } from '@/services/products'
import { listBrands } from '@/services/brands'
import { listCategories } from '@/services/categories'
import { ProductCard } from '@/components/ProductCard'
import { Filters } from './Filters'
import type { ProductListQuery } from '@/services/types'

type Props = {
  searchParams: {
    brands?: string; brand?: string;
    categories?: string; category?: string;
    sizes?: string; colors?: string;
    minPrice?: string; maxPrice?: string;
    onSale?: string;
    sort?: string; search?: string;
  }
}

export const dynamic = 'force-dynamic'

export default async function ProductsPage({ searchParams }: Props) {
  const fullQuery: Record<string, string | number | undefined> = {
    brand:    searchParams.brand,
    brands:   searchParams.brands,
    category: searchParams.category,
    categories: searchParams.categories,
    search:   searchParams.search,
    sort:     searchParams.sort ?? 'newest',
    minPrice: searchParams.minPrice ? Number(searchParams.minPrice) : undefined,
    maxPrice: searchParams.maxPrice ? Number(searchParams.maxPrice) : undefined,
    limit:    24,
  }
  if (searchParams.sizes)  fullQuery.sizes  = searchParams.sizes
  if (searchParams.colors) fullQuery.colors = searchParams.colors
  if (searchParams.onSale) fullQuery.onSale = searchParams.onSale

  const [productsRes, brands, categories] = await Promise.all([
    listProducts(fullQuery as ProductListQuery),
    listBrands(),
    listCategories(),
  ])

  const total = productsRes.meta?.total ?? productsRes.data.length

  // Coleta tamanhos/cores únicos pra mostrar como filtros
  const sizesSet  = new Set<string>()
  const colorsMap = new Map<string, string | null>()
  productsRes.data.forEach(p => {
    p.sizes.forEach(s => sizesSet.add(s))
    p.colors.forEach(c => colorsMap.set(c.color, c.hex))
  })
  const SIZE_ORDER = ['PP', 'P', 'M', 'G', 'GG', 'XGG']
  const sizes = Array.from(sizesSet).sort((a, b) => {
    const ia = SIZE_ORDER.indexOf(a); const ib = SIZE_ORDER.indexOf(b)
    if (ia !== -1 || ib !== -1) return (ia === -1 ? 99 : ia) - (ib === -1 ? 99 : ib)
    const na = Number(a); const nb = Number(b)
    if (!isNaN(na) && !isNaN(nb)) return na - nb
    return a.localeCompare(b)
  })
  const colors = Array.from(colorsMap.entries()).map(([name, hex]) => ({ name, hex }))

  return (
    <div className="container-app py-6 sm:py-10">
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
        <Filters
          brands={brands}
          categories={categories}
          availableSizes={sizes}
          availableColors={colors}
        />
      </header>

      <div className="mt-6 grid gap-6 lg:grid-cols-[260px_1fr]">
        <Filters
          brands={brands}
          categories={categories}
          availableSizes={sizes}
          availableColors={colors}
        />

        <div>
          {productsRes.data.length === 0 ? (
            <div className="rounded-lg border border-border bg-white p-10 text-center animate-fade-up">
              <p className="text-lg font-semibold text-ink">Nada bate com esses filtros</p>
              <p className="mt-2 text-sm text-ink-3">Tira um filtro ou volta pra <Link href="/products" className="text-primary-700 hover:underline">todos os produtos</Link>.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4">
              {productsRes.data.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
