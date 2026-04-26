'use client'

import { useState, useEffect, Suspense } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Store, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { useAuth } from '@/stores/auth'
import { login } from '@/services/auth'
import { ApiError } from '@/lib/api-error'

const schema = z.object({
  email:    z.string().email('Email inválido'),
  password: z.string().min(1, 'Informe a senha'),
})
type Values = z.infer<typeof schema>

function LoginForm() {
  const router = useRouter()
  const params = useSearchParams()
  const setUser = useAuth(s => s.setUser)
  const user    = useAuth(s => s.user)
  const hyd     = useAuth(s => s.hydrated)

  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(
    params.get('error') === 'forbidden' ? 'Esse usuário não tem acesso ao painel.' : null,
  )

  const form = useForm<Values>({ resolver: zodResolver(schema) })

  useEffect(() => {
    if (hyd && user?.role === 'ADMIN') {
      router.replace(params.get('next') ?? '/')
    }
  }, [hyd, user, router, params])

  async function onSubmit(values: Values) {
    setError(null)
    setSubmitting(true)
    try {
      const res = await login(values)
      if (res.user.role !== 'ADMIN') {
        setError('Esse usuário não tem acesso ao painel.')
        return
      }
      setUser(res.user)
      router.replace(params.get('next') ?? '/')
    } catch (err) {
      setError(ApiError.is(err) ? err.message : 'Não foi possível entrar')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-surface-alt p-4">
      <div className="w-full max-w-md rounded-lg border border-border bg-white p-6 shadow-sm sm:p-8">
        <div className="mb-6 flex items-center gap-3">
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-md bg-primary-700 text-white">
            <Store className="h-5 w-5" />
          </span>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-ink-3">Miami Store</p>
            <h1 className="text-lg font-bold text-ink">Painel administrativo</h1>
          </div>
        </div>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4" noValidate>
          <div>
            <label className="block text-sm font-medium text-ink-2">Email</label>
            <Input
              type="email"
              autoComplete="email"
              autoFocus
              {...form.register('email')}
              error={form.formState.errors.email?.message}
              className="mt-1"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-ink-2">Senha</label>
            <Input
              type="password"
              autoComplete="current-password"
              {...form.register('password')}
              error={form.formState.errors.password?.message}
              className="mt-1"
            />
          </div>

          {error && (
            <div className="flex items-start gap-2 rounded-md border border-error/30 bg-error/5 px-3 py-2 text-sm text-error">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" /> <span>{error}</span>
            </div>
          )}

          <Button type="submit" fullWidth size="lg" loading={submitting}>
            Entrar
          </Button>

          <p className="text-center text-sm">
            <Link href="/auth/forgot" className="text-ink-3 hover:text-primary-700">Esqueci a senha</Link>
          </p>
        </form>

        <p className="mt-6 text-center text-xs text-ink-3">
          Acesso restrito ao time da loja.
        </p>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center text-sm text-ink-3">Carregando…</div>}>
      <LoginForm />
    </Suspense>
  )
}
