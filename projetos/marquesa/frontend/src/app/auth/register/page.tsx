import { Suspense } from 'react'
import { RegisterForm } from './RegisterForm'

export const metadata = {
  title: 'Criar conta',
}

export default function RegisterPage() {
  return (
    <Suspense fallback={null}>
      <RegisterForm />
    </Suspense>
  )
}
