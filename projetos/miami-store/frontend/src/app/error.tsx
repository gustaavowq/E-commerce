'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { AlertTriangle, RefreshCw, ArrowLeft } from 'lucide-react'

// Error boundary global da loja. Pega qualquer erro não tratado nas páginas.
export default function ErrorBoundary({ error, reset }: { error: Error; reset: () => void }) {
  useEffect(() => { console.error('[loja:error-boundary]', error) }, [error])

  return (
    <div className="container-app flex min-h-[60vh] flex-col items-center justify-center py-12 text-center animate-fade-up">
      <div className="flex h-20 w-20 items-center justify-center rounded-pill bg-error/10 text-error">
        <AlertTriangle className="h-10 w-10" />
      </div>
      <h1 className="mt-6 font-display text-2xl text-ink sm:text-3xl">Algo deu ruim</h1>
      <p className="mt-2 max-w-md text-sm text-ink-3">
        Tivemos um problema inesperado. Tenta de novo. Se continuar, nos chama no WhatsApp.
      </p>
      <div className="mt-6 flex flex-wrap gap-3 justify-center">
        <button onClick={reset} className="inline-flex items-center gap-2 rounded-md bg-primary-700 px-6 py-3 text-base font-semibold text-white hover:bg-primary-900 transition">
          <RefreshCw className="h-4 w-4" /> Tentar de novo
        </button>
        <Link href="/" className="inline-flex items-center gap-2 rounded-md border border-border px-6 py-3 text-base font-semibold text-ink-2 hover:bg-surface-2 transition">
          <ArrowLeft className="h-4 w-4" /> Voltar pra home
        </Link>
      </div>
    </div>
  )
}
