// Loading skeleton da listagem (PLP). Aparece em SSR enquanto a query de produtos
// resolve, evitando flash de tela vazia.
export default function ProductsLoading() {
  return (
    <div className="container-app py-6 sm:py-10">
      <div className="h-7 w-48 animate-pulse rounded bg-surface-2" />
      <div className="mt-2 h-4 w-32 animate-pulse rounded bg-surface-2" />

      <div className="mt-6 grid gap-6 lg:grid-cols-[260px_1fr]">
        <aside className="hidden space-y-4 lg:block">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <div className="h-3 w-20 animate-pulse rounded bg-surface-2" />
              <div className="h-9 w-full animate-pulse rounded-md bg-surface-2" />
            </div>
          ))}
        </aside>

        <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="overflow-hidden rounded-lg bg-white border border-border">
              <div className="aspect-[4/5] animate-pulse bg-surface-2" />
              <div className="space-y-2 p-3">
                <div className="h-4 w-3/4 animate-pulse rounded bg-surface-2" />
                <div className="h-5 w-1/2 animate-pulse rounded bg-surface-2" />
                <div className="h-3 w-2/3 animate-pulse rounded bg-surface-2" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
