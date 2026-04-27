'use client'

import Link from 'next/link'
import { useEffect } from 'react'
import { RefreshCcw, Home } from 'lucide-react'
import { Button } from '@/components/ui/Button'

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    if (process.env.NODE_ENV !== 'production') console.error(error)
  }, [error])

  return (
    <main className="container-app flex min-h-[60vh] flex-col items-center justify-center text-center">
      <div className="rounded-full border border-border bg-surface p-4">
        <RefreshCcw className="h-8 w-8 text-primary" aria-hidden />
      </div>
      <h1 className="mt-5 font-display text-2xl font-bold text-text sm:text-3xl">
        Não foi possível carregar essa página
      </h1>
      <p className="mt-3 max-w-md text-sm text-text-secondary">
        Tivemos uma instabilidade momentânea ao buscar os dados. Tente novamente em alguns segundos
        ou volte para a home.
      </p>
      <div className="mt-7 flex flex-wrap items-center justify-center gap-2">
        <Button variant="primary" onClick={reset}>
          <RefreshCcw className="h-4 w-4" /> Tentar novamente
        </Button>
        <Link href="/">
          <Button variant="outline">
            <Home className="h-4 w-4" /> Voltar para a home
          </Button>
        </Link>
      </div>
      {error.digest && (
        <p className="mt-6 font-specs text-[10px] text-text-muted">
          Código do incidente: <span className="font-mono">{error.digest}</span>
        </p>
      )}
    </main>
  )
}
