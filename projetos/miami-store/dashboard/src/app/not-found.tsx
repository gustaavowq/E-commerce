import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-surface-alt p-4 text-center animate-fade-up">
      <p className="font-display text-7xl font-black text-primary-700/20">404</p>
      <h1 className="mt-2 text-xl font-bold text-ink">Página não encontrada</h1>
      <p className="mt-1 text-sm text-ink-3">A rota que você tentou acessar não existe no painel.</p>
      <Link href="/" className="mt-6 inline-flex items-center gap-2 rounded-md bg-primary-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-primary-900">
        <ArrowLeft className="h-4 w-4" /> Voltar pro painel
      </Link>
    </div>
  )
}
