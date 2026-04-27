import type { Metadata } from 'next'
import Link from 'next/link'
import { AuthShell } from '../AuthShell'
import { ResetForm } from './ResetForm'

export const metadata: Metadata = {
  title: 'Nova senha',
  description: 'Crie uma nova senha pra sua conta Kore Tech.',
}

export default function ResetPage() {
  return (
    <AuthShell
      title="Nova senha"
      subtitle="Escolha uma senha forte com pelo menos 8 caracteres."
      footer={
        <>
          <Link href="/auth/login" className="font-semibold text-primary hover:underline">
            Voltar pro login
          </Link>
        </>
      }
    >
      <ResetForm />
    </AuthShell>
  )
}
