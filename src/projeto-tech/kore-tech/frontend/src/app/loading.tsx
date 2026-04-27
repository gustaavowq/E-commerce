export default function Loading() {
  return (
    <main className="container-app py-16">
      <div className="mx-auto h-1 w-48 overflow-hidden rounded-pill bg-surface-2">
        <div className="h-full w-1/3 animate-pulse-soft rounded-pill bg-primary" />
      </div>
      <p className="mt-4 text-center text-xs text-text-muted">Carregando...</p>
    </main>
  )
}
