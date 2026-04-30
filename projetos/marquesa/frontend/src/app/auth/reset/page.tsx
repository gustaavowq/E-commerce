import { Suspense } from 'react'
import { ResetForm } from './ResetForm'

export const metadata = {
  title: 'Redefinir senha',
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={null}>
      <ResetForm />
    </Suspense>
  )
}
