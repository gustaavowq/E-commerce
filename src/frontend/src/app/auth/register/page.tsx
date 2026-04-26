import { Suspense } from 'react'
import { AuthForm } from '../AuthForm'

export const metadata = { title: 'Criar conta' }

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="container-app py-10 text-center text-ink-3">Carregando…</div>}>
      <AuthForm mode="register" />
    </Suspense>
  )
}
