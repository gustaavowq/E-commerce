import type { Metadata } from 'next'
import Link from 'next/link'
import { AuthShell } from '../AuthShell'
import { LoginForm } from './LoginForm'

export const metadata: Metadata = {
  title: 'Entrar',
  description: 'Acesse sua conta Kore Tech pra acompanhar pedidos, builds salvos e lista de espera.',
}

export default function LoginPage() {
  return (
    <AuthShell
      title="Entrar"
      subtitle="Acesse seus pedidos, builds salvos e lista de espera."
      footer={
        <>
          Nao tem conta?{' '}
          <Link href="/auth/register" className="font-semibold text-primary hover:underline">
            Criar agora
          </Link>
        </>
      }
    >
      <LoginForm />
    </AuthShell>
  )
}
