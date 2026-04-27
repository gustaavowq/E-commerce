'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/Button'
import { AlertTriangle } from 'lucide-react'

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => { console.error(error) }, [error])
  return (
    <div className="flex min-h-screen items-center justify-center bg-bg p-4">
      <div className="w-full max-w-md rounded-lg border border-danger/30 bg-surface p-8 text-center shadow-md">
        <AlertTriangle className="mx-auto h-10 w-10 text-danger" />
        <h1 className="mt-3 text-xl font-bold text-text">Algo travou aqui</h1>
        <p className="mt-2 text-sm text-text-secondary">Tenta de novo. Se continuar, recarrega a página.</p>
        {error.digest && <p className="mt-3 font-mono text-[10px] text-text-muted">id: {error.digest}</p>}
        <Button onClick={reset} className="mt-5">Tentar de novo</Button>
      </div>
    </div>
  )
}
