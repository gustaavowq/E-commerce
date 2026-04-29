import Link from 'next/link'
import type { Brand } from '@/services/types'

type Props = { brands: Brand[] }

// Tira de marcas em destaque na home. Mobile: scroll horizontal.
export function BrandStrip({ brands }: Props) {
  if (!brands.length) return null
  return (
    <section className="container-app py-6 sm:py-8">
      <h2 className="mb-3 text-xs font-bold uppercase tracking-widest text-ink-3">Marcas</h2>
      <div className="flex gap-3 overflow-x-auto scrollbar-none -mx-4 px-4 snap-x snap-mandatory sm:mx-0 sm:px-0">
        {brands.map(b => (
          <Link
            key={b.id}
            href={`/products?brand=${b.slug}`}
            className="flex shrink-0 snap-start items-center justify-center rounded-md border border-border bg-white px-5 py-3 text-sm font-semibold text-ink-2 transition hover:border-primary-700 hover:text-primary-700 sm:px-6 sm:py-4 sm:text-base"
          >
            {b.name}
            {b.productCount > 0 && (
              <span className="ml-1.5 rounded-pill bg-primary-50 px-1.5 py-0.5 text-xs font-bold text-primary-700">
                {b.productCount}
              </span>
            )}
          </Link>
        ))}
      </div>
    </section>
  )
}
