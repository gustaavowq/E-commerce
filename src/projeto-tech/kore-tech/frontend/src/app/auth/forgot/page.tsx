import type { Metadata } from 'next'
import Link from 'next/link'
import { AuthShell } from '../AuthShell'
import { ForgotForm } from './ForgotForm'

export const metadata: Metadata = {
  title: 'Recuperar senha',
  description: 'Te enviamos um link pra criar nova senha.',
}

export default function ForgotPage() {
  return (
    <AuthShell
      title="Recuperar senha"
      subtitle="Coloque seu email cadastrado. Enviamos um link pra criar nova senha."
      footer={
        <>
          Lembrou a senha?{' '}
          <Link href="/auth/login" className="font-semibold text-primary hover:underline">
            Voltar pro login
          </Link>
        </>
      }
    >
      <ForgotForm />
    </AuthShell>
  )
}
