import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-bg p-4">
      <div className="w-full max-w-md rounded-lg border border-border bg-surface p-8 text-center shadow-md">
        <p className="text-xs font-semibold uppercase tracking-wide text-primary">404</p>
        <h1 className="mt-2 text-2xl font-bold text-text">Essa página saiu de estoque</h1>
        <p className="mt-2 text-sm text-text-secondary">Volta pra Visão geral ou usa o menu pra navegar.</p>
        <Link
          href="/"
          className="mt-5 inline-flex h-10 items-center justify-center rounded-md bg-primary px-5 text-sm font-semibold text-text-on-primary transition-colors hover:bg-primary-hover"
        >
          Ir pra Visão geral
        </Link>
      </div>
    </div>
  )
}
