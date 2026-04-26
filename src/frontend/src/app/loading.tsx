// Loading global. Aparece durante navegação SSR.
export default function Loading() {
  return (
    <div className="container-app py-12">
      <div className="space-y-4">
        <div className="h-8 w-1/3 animate-pulse rounded-md bg-surface-2" />
        <div className="h-4 w-1/2 animate-pulse rounded-md bg-surface-2" />
        <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <div className="aspect-[4/5] w-full animate-pulse rounded-lg bg-surface-2" />
              <div className="h-4 animate-pulse rounded bg-surface-2" />
              <div className="h-5 w-2/3 animate-pulse rounded bg-surface-2" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
