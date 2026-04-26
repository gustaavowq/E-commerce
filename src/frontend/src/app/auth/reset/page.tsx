import { Suspense } from 'react'
import { ResetForm } from './ResetForm'

export const metadata = { title: 'Nova senha' }
export const dynamic = 'force-dynamic'

export default function ResetPage() {
  return (
    <div className="container-app flex min-h-[60vh] items-center justify-center py-10">
      <div className="w-full max-w-md rounded-lg border border-border bg-white p-6 sm:p-8">
        <h1 className="font-display text-2xl text-ink sm:text-3xl">Nova senha</h1>
        <p className="mt-2 text-sm text-ink-3">
          Cria uma senha nova. Mínimo 8 caracteres, com letra e número.
        </p>
        <div className="mt-6">
          <Suspense fallback={<p className="text-sm text-ink-3">Carregando…</p>}>
            <ResetForm />
          </Suspense>
        </div>
      </div>
    </div>
  )
}
