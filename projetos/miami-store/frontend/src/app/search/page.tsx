import Link from 'next/link'
import { Search as SearchIcon } from 'lucide-react'
import { listProducts } from '@/services/products'
import { ProductCard } from '@/components/ProductCard'

type Props = { searchParams: { q?: string } }

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Busca' }

export default async function SearchPage({ searchParams }: Props) {
  const q = (searchParams.q ?? '').trim()
  const res = q ? await listProducts({ search: q, limit: 48 }) : { data: [], meta: { total: 0 } }
  const total = res.meta?.total ?? res.data.length

  return (
    <div className="container-app py-6 sm:py-10">
      <nav className="mb-3 text-xs text-ink-3">
        <Link href="/" className="hover:text-primary-700">Home</Link>
        <span className="mx-1.5">›</span>
        <span>Busca</span>
      </nav>

      <header className="animate-fade-up">
        <div className="flex items-center gap-3">
          <SearchIcon className="h-6 w-6 text-primary-700" />
          <h1 className="font-display text-2xl text-ink sm:text-3xl">
            {q ? <>Resultados pra &ldquo;<span className="text-primary-700">{q}</span>&rdquo;</> : 'O que você procura?'}
          </h1>
        </div>
        {q && (
          <p className="mt-1 text-sm text-ink-3">
            {total === 0 ? 'Nada bateu com essa busca' : `${total} ${total === 1 ? 'peça encontrada' : 'peças encontradas'}`}
          </p>
        )}
      </header>

      {!q ? (
        <div className="mt-8 rounded-lg border border-border bg-white p-10 text-center">
          <p className="text-ink-2">Use a lupinha lá em cima ou tenta uma das buscas populares:</p>
          <div className="mt-4 flex flex-wrap justify-center gap-2">
            {['polo lacoste', 'tênis preto', 'boné', 'conjunto', 'camiseta'].map(term => (
              <Link
                key={term}
                href={`/search?q=${encodeURIComponent(term)}`}
                className="rounded-full border border-border bg-white px-3 py-1.5 text-sm text-ink-2 hover:border-primary-700 hover:text-primary-700 transition"
              >
                {term}
              </Link>
            ))}
          </div>
        </div>
      ) : res.data.length === 0 ? (
        <div className="mt-8 rounded-lg border border-border bg-white p-10 text-center animate-fade-up">
          <p className="text-lg font-semibold text-ink">Nada encontrado</p>
          <p className="mt-2 text-sm text-ink-3">
            Tenta uma palavra mais curta, conferir a grafia, ou{' '}
            <Link href="/products" className="font-semibold text-primary-700 hover:underline">ver todos os produtos</Link>.
          </p>
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
          {res.data.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
        </div>
      )}
    </div>
  )
}
