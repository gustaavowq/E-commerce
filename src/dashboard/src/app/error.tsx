'use client'

import { useEffect } from 'react'
import { AlertTriangle, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/Button'

export default function ErrorBoundary({ error, reset }: { error: Error; reset: () => void }) {
  useEffect(() => { console.error('[admin:error-boundary]', error) }, [error])

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-surface-alt p-4 text-center animate-fade-up">
      <div className="flex h-16 w-16 items-center justify-center rounded-pill bg-error/10 text-error">
        <AlertTriangle className="h-8 w-8" />
      </div>
      <h1 className="mt-4 text-xl font-bold text-ink">Erro inesperado</h1>
      <p className="mt-1 max-w-md text-sm text-ink-3">{error.message}</p>
      <Button onClick={reset} leftIcon={<RefreshCw className="h-4 w-4" />} className="mt-5">Tentar de novo</Button>
    </div>
  )
}
