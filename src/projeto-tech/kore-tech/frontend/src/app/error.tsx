'use client'

import Link from 'next/link'
import { useEffect } from 'react'
import { AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/Button'

export default function GlobalError({ error, reset }: { error: Error; reset: () => void }) {
  useEffect(() => {
    if (process.env.NODE_ENV !== 'production') console.error(error)
  }, [error])

  return (
    <main className="container-app flex min-h-[60vh] flex-col items-center justify-center text-center">
      <AlertTriangle className="h-12 w-12 text-warning" />
      <h1 className="mt-4 text-2xl font-bold text-text">Algo travou aqui</h1>
      <p className="mt-2 max-w-md text-sm text-text-secondary">
        Tivemos um problema carregando essa pagina. Pode ser temporario, tenta de novo.
      </p>
      <div className="mt-6 flex gap-2">
        <Button onClick={reset}>Tentar de novo</Button>
        <Link href="/">
          <Button variant="secondary">Voltar pra home</Button>
        </Link>
      </div>
    </main>
  )
}
