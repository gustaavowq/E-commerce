'use client'

import { Suspense, useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Store, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { resetPassword } from '@/services/auth'
import { useAuth } from '@/stores/auth'
import { ApiError } from '@/lib/api-error'

const schema = z.object({
  password: z.string()
              .min(8, 'Mínimo 8 caracteres')
              .regex(/[A-Za-z]/, 'Precisa de letra')
              .regex(/[0-9]/, 'Precisa de número'),
  confirm:  z.string(),
}).refine(d => d.password === d.confirm, { message: 'As senhas não batem', path: ['confirm'] })
type Values = z.infer<typeof schema>

function ResetView() {
  const router  = useRouter()
  const params  = useSearchParams()
  const setUser = useAuth(s => s.setUser)
  const token = params.get('token')

  const form = useForm<Values>({ resolver: zodResolver(schema) })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function onSubmit(values: Values) {
    setError(null)
    setSubmitting(true)
    try {
      const res = await resetPassword({ token: token!, password: values.password })
      if (res.user.role !== 'ADMIN') {
        setError('Esse usuário não tem acesso ao painel.')
        return
      }
      setUser(res.user)
      router.replace('/')
    } catch (err) {
      setError(ApiError.is(err) ? err.message : 'Não deu pra trocar a senha agora')
    } finally {
      setSubmitting(false)
    }
  }

  if (!token) {
    return (
      <div className="rounded-md border border-error/30 bg-error/5 p-4 text-sm text-error">
        Link inválido. Solicita um novo em <Link href="/auth/forgot" className="underline">recuperar acesso</Link>.
      </div>
    )
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4" noValidate>
      <p className="text-sm text-ink-3">Cria uma senha nova, mínimo 8 caracteres, com letra e número.</p>
      <div>
        <label className="block text-sm font-medium text-ink-2">Nova senha</label>
        <Input type="password" autoComplete="new-password" autoFocus
          {...form.register('password')}
          error={form.formState.errors.password?.message}
          className="mt-1" />
      </div>
      <div>
        <label className="block text-sm font-medium text-ink-2">Confirma</label>
        <Input type="password" autoComplete="new-password"
          {...form.register('confirm')}
          error={form.formState.errors.confirm?.message}
          className="mt-1" />
      </div>

      {error && (
        <div className="flex items-start gap-2 rounded-md border border-error/30 bg-error/5 px-3 py-2 text-sm text-error">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" /> <span>{error}</span>
        </div>
      )}

      <Button type="submit" fullWidth size="lg" loading={submitting}>
        Salvar nova senha
      </Button>
    </form>
  )
}

export default function AdminResetPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-surface-alt p-4">
      <div className="w-full max-w-md rounded-lg border border-border bg-white p-6 shadow-sm sm:p-8">
        <div className="mb-6 flex items-center gap-3">
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-md bg-primary-700 text-white">
            <Store className="h-5 w-5" />
          </span>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-ink-3">Miami Store</p>
            <h1 className="text-lg font-bold text-ink">Nova senha</h1>
          </div>
        </div>
        <Suspense fallback={<p className="text-sm text-ink-3">Carregando…</p>}>
          <ResetView />
        </Suspense>
      </div>
    </div>
  )
}
