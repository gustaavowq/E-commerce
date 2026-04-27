'use client'

import { useState, useEffect, Suspense } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Cpu, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { useAuth } from '@/stores/auth'
import { login } from '@/services/auth'
import { ApiError } from '@/lib/api-error'

const schema = z.object({
  email:    z.string().email('Email inválido'),
  password: z.string().min(1, 'Informe a senha'),
  remember: z.boolean().optional(),
})
type Values = z.infer<typeof schema>

function LoginForm() {
  const router = useRouter()
  const params = useSearchParams()
  const user   = useAuth(s => s.user)
  const hyd    = useAuth(s => s.hydrated)
  const loginSuccess = useAuth(s => s.loginSuccess)

  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(
    params.get('error') === 'forbidden'
      ? 'Esse usuário não tem acesso ao painel.'
      : params.get('error') === 'session_expired'
      ? 'Sua sessão expirou. Entra de novo.'
      : null,
  )

  const form = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: { email: '', password: '', remember: true },
  })

  // Já está logado? Redireciona pro destino (após hidratar)
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
      // Atomic — evita race entre setUser e setHydrated.
      // Se Providers ainda estiver com getMe pendente (cold-load + submit rápido),
      // AdminLayout precisa ver hydrated=true E user no MESMO snapshot, senão
      // ou trava em "Verificando acesso…" ou redireciona pra /login.
      // Lição: race condition do login do Miami (memoria/30-LICOES/).
      loginSuccess(res.user)
      router.replace(params.get('next') ?? '/')
    } catch (err) {
      setError(ApiError.is(err) ? err.message : 'Não foi possível entrar')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-bg p-4">
      <div className="w-full max-w-md rounded-xl border border-border bg-surface p-6 shadow-xl sm:p-8 animate-fade-up">
        <div className="mb-6 flex items-center gap-3">
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-md bg-primary text-text-on-primary shadow-glow-primary">
            <Cpu className="h-5 w-5" />
          </span>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-primary">Kore Tech</p>
            <h1 className="text-lg font-bold text-text">Painel administrativo</h1>
          </div>
        </div>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4" noValidate>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wide text-text-secondary">Email</label>
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
            <label className="block text-xs font-semibold uppercase tracking-wide text-text-secondary">Senha</label>
            <Input
              type="password"
              autoComplete="current-password"
              {...form.register('password')}
              error={form.formState.errors.password?.message}
              className="mt-1"
            />
          </div>

          <label className="flex items-center gap-2 text-xs text-text-secondary">
            <input
              type="checkbox"
              {...form.register('remember')}
              className="h-4 w-4 rounded border-border-strong bg-surface accent-primary"
            />
            Manter conectado neste dispositivo
          </label>

          {error && (
            <div className="flex items-start gap-2 rounded-md border border-danger/30 bg-danger-soft px-3 py-2 text-sm text-danger">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" /> <span>{error}</span>
            </div>
          )}

          <Button type="submit" fullWidth size="lg" loading={submitting}>
            Entrar
          </Button>

          <p className="text-center text-sm">
            <Link href="/auth/forgot" className="text-text-secondary hover:text-primary">Esqueci a senha</Link>
          </p>
        </form>

        <p className="mt-6 text-center text-xs text-text-muted">
          Acesso restrito ao time da Kore Tech.
        </p>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center bg-bg text-sm text-text-secondary">
        Carregando…
      </div>
    }>
      <LoginForm />
    </Suspense>
  )
}
