import Link from 'next/link'
import { Cpu, ArrowLeft, Wrench } from 'lucide-react'
import { Button } from '@/components/ui/Button'

export default function NotFound() {
  return (
    <main className="container-app flex min-h-[60vh] flex-col items-center justify-center text-center">
      <Cpu className="h-12 w-12 text-primary" />
      <p className="mt-4 font-specs text-sm text-text-secondary">404</p>
      <h1 className="mt-2 text-3xl font-bold text-text">Pagina nao encontrada</h1>
      <p className="mt-2 max-w-md text-sm text-text-secondary">
        Talvez essa peca tenha esgotado, ou o link mudou. Da um pulo no builder ou volta pra home.
      </p>
      <div className="mt-6 flex flex-wrap gap-2">
        <Link href="/">
          <Button variant="primary">
            <ArrowLeft className="h-4 w-4" /> Voltar pra home
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
