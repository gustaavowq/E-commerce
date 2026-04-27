'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/Button'
import { RefreshCcw } from 'lucide-react'

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => { console.error(error) }, [error])
  return (
    <div className="flex min-h-screen items-center justify-center bg-bg p-4">
      <div className="w-full max-w-md rounded-lg border border-border bg-surface p-8 text-center shadow-md">
        <div className="mx-auto inline-flex h-12 w-12 items-center justify-center rounded-full border border-border bg-bg">
          <RefreshCcw className="h-5 w-5 text-primary" aria-hidden />
        </div>
        <h1 className="mt-4 text-xl font-bold text-text">Não foi possível carregar essa página</h1>
        <p className="mt-2 text-sm text-text-secondary">
          Ocorreu uma instabilidade ao buscar os dados. Tente novamente em alguns segundos.
        </p>
        <Button onClick={reset} className="mt-5">
          <RefreshCcw className="h-4 w-4" /> Tentar novamente
        </Button>
        {error.digest && (
          <p className="mt-5 font-specs text-[10px] text-text-muted">
            Código do incidente: <span className="font-mono">{error.digest}</span>
          </p>
        )}
      </div>
    </div>
  )
}
