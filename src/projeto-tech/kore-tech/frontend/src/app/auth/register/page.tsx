import type { Metadata } from 'next'
import Link from 'next/link'
import { AuthShell } from '../AuthShell'
import { RegisterForm } from './RegisterForm'

export const metadata: Metadata = {
  title: 'Criar conta',
  description: 'Crie sua conta Kore Tech pra salvar builds, acompanhar pedidos e entrar na lista de espera.',
}

export default function RegisterPage() {
  return (
    <AuthShell
      title="Criar conta"
      subtitle="Salva builds, acompanha pedidos e entra na lista de espera."
      footer={
        <>
          Ja tem conta?{' '}
          <Link href="/auth/login" className="font-semibold text-primary hover:underline">
            Entrar
          </Link>
        </>
      }
    >
      <RegisterForm />
    </AuthShell>
  )
}
