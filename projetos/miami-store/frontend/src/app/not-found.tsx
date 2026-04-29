import Link from 'next/link'
import { Search, ArrowLeft } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="container-app flex min-h-[60vh] flex-col items-center justify-center py-12 text-center animate-fade-up">
      <div className="relative">
        <p className="font-display text-9xl font-black text-primary-50 select-none">404</p>
        <p className="absolute inset-0 flex items-center justify-center font-display text-3xl text-ink">Perdido?</p>
      </div>
      <p className="mt-6 max-w-md text-base text-ink-2">
        Essa página não existe ou foi tirada do ar. Bora voltar e achar algo bom.
      </p>
      <div className="mt-8 flex flex-wrap gap-3 justify-center">
        <Link href="/" className="inline-flex items-center gap-2 rounded-md bg-primary-700 px-6 py-3 text-base font-semibold text-white hover:bg-primary-900 transition">
          <ArrowLeft className="h-4 w-4" /> Voltar pra home
        </Link>
        <Link href="/products" className="inline-flex items-center gap-2 rounded-md border border-primary-700 px-6 py-3 text-base font-semibold text-primary-700 hover:bg-primary-50 transition">
          <Search className="h-4 w-4" /> Ver produtos
        </Link>
      </div>
    </div>
  )
}
