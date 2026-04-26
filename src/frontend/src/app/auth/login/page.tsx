import { Suspense } from 'react'
import { AuthForm } from '../AuthForm'

export const metadata = { title: 'Entrar' }

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="container-app py-10 text-center text-ink-3">Carregando…</div>}>
      <AuthForm mode="login" />
    </Suspense>
  )
}
