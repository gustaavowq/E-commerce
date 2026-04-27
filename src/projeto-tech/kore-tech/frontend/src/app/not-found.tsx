import Link from 'next/link'
import { ArrowLeft, Wrench } from 'lucide-react'
import { Button } from '@/components/ui/Button'

export default function NotFound() {
  return (
    <main className="container-app flex min-h-[60vh] flex-col items-center justify-center text-center">
      <p className="font-specs text-xs font-bold uppercase tracking-widest text-primary">404</p>
      <h1 className="mt-3 font-display text-3xl font-bold text-text sm:text-4xl">
        Página não encontrada
      </h1>
      <p className="mt-3 max-w-md text-sm text-text-secondary">
        O endereço que você acessou não existe ou foi movido. Volte para a home ou abra o builder
        para montar o PC do zero.
      </p>
      <div className="mt-7 flex flex-wrap items-center justify-center gap-2">
        <Link href="/">
          <Button variant="primary">
            <ArrowLeft className="h-4 w-4" /> Voltar para a home
          </Button>
        </Link>
        <Link href="/montar">
          <Button variant="outline">
            <Wrench className="h-4 w-4" /> Abrir o builder
          </Button>
        </Link>
      </div>
    </main>
  )
}
