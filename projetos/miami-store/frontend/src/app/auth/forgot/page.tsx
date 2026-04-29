import { ForgotForm } from './ForgotForm'

export const metadata = { title: 'Recuperar senha' }

export default function ForgotPage() {
  return (
    <div className="container-app flex min-h-[60vh] items-center justify-center py-10">
      <div className="w-full max-w-md rounded-lg border border-border bg-white p-6 sm:p-8">
        <h1 className="font-display text-2xl text-ink sm:text-3xl">Esqueci a senha</h1>
        <p className="mt-2 text-sm text-ink-3">
          Põe o email do teu cadastro e a gente manda um link pra criar uma nova.
        </p>
        <div className="mt-6">
          <ForgotForm />
        </div>
      </div>
    </div>
  )
}
