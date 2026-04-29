'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/Button'
import { login as apiLogin, register as apiRegister } from '@/services/auth'
import { useAuth } from '@/stores/auth'
import { ApiError } from '@/lib/api-error'

const authSchema = z.object({
  name: z.string().min(2, 'Nome muito curto').optional(),
  email: z.string().email('Email inválido'),
  password: z.string().min(1, 'Informe a senha'),
})

type Values = z.infer<typeof authSchema>
type Mode = 'login' | 'register'

export function AuthForm({ mode }: { mode: Mode }) {
  const router = useRouter()
  const params = useSearchParams()
  const setUser = useAuth(s => s.setUser)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError]   = useState<string | null>(null)
  const [adminRedirect, setAdminRedirect] = useState(false)

  const schema = mode === 'register'
    ? authSchema.extend({
        name: z.string().min(2, 'Nome muito curto'),
        password: z.string().min(8, 'Mínimo 8 caracteres').regex(/[A-Za-z]/, 'Precisa de letra').regex(/[0-9]/, 'Precisa de número'),
      })
    : authSchema

  const form = useForm<Values>({ resolver: zodResolver(schema) })

  async function onSubmit(values: Values) {
    setError(null)
    setSubmitting(true)
    try {
      const res = mode === 'login'
        ? await apiLogin({ email: values.email, password: values.password })
        : await apiRegister({ email: values.email, password: values.password, name: values.name! })
      setUser(res.user)

      const next = params.get('next')
      if (next) {
        router.push(next)
        router.refresh()
        return
      }

      // Admin é redirecionado pro painel externo (dashboard Next.js separado).
      // Cookie é compartilhado entre subdomínios (Domain=.miami.test) então
      // ele já chega autenticado lá.
      if (res.user.role === 'ADMIN') {
        const dashboardUrl = process.env.NEXT_PUBLIC_DASHBOARD_URL ?? '/admin'
        setAdminRedirect(true)
        setTimeout(() => { window.location.href = dashboardUrl }, 900)
        return
      }

      router.push('/')
      router.refresh()
    } catch (err) {
      setError(ApiError.is(err) ? err.message : 'Erro inesperado')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="container-app flex min-h-[60vh] items-center justify-center py-10">
      <div className="w-full max-w-md rounded-lg border border-border bg-white p-6 sm:p-8">
        <h1 className="font-display text-2xl text-ink sm:text-3xl">
          {mode === 'login' ? 'Entrar' : 'Criar conta'}
        </h1>
        <p className="mt-2 text-sm text-ink-3">
          {mode === 'login' ? 'Vê seus pedidos e fecha a compra mais rápido.' : 'Leva 30 segundos. Sem rodeio.'}
        </p>

        <form onSubmit={form.handleSubmit(onSubmit)} className="mt-6 space-y-4" noValidate>
          {mode === 'register' && (
            <Field label="Nome">
              <input
                type="text" autoComplete="name" {...form.register('name')}
                className="w-full rounded-md border border-border px-3 py-2.5 text-base focus:border-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-700/20"
              />
              <ErrMsg msg={form.formState.errors.name?.message} />
            </Field>
          )}

          <Field label="Email">
            <input
              type="email" autoComplete="email" inputMode="email" {...form.register('email')}
              className="w-full rounded-md border border-border px-3 py-2.5 text-base focus:border-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-700/20"
            />
            <ErrMsg msg={form.formState.errors.email?.message} />
          </Field>

          <Field label="Senha">
            <input
              type="password" autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
              {...form.register('password')}
              className="w-full rounded-md border border-border px-3 py-2.5 text-base focus:border-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-700/20"
            />
            <ErrMsg msg={form.formState.errors.password?.message} />
          </Field>

          {error && (
            <div role="alert" className="rounded-md border border-error/30 bg-error/5 px-3 py-2 text-sm text-error">
              {error}
            </div>
          )}

          {adminRedirect && (
            <div role="status" className="rounded-md border border-primary-700/30 bg-primary-50 px-3 py-2 text-sm text-primary-700 animate-fade-up">
              Acesso de administrador detectado. Indo pro painel…
            </div>
          )}

          <Button type="submit" fullWidth size="lg" loading={submitting || adminRedirect}>
            {mode === 'login' ? 'Entrar' : 'Criar conta'}
          </Button>

          {mode === 'login' && (
            <p className="text-center text-sm">
              <Link href="/auth/forgot" className="text-ink-3 hover:text-primary-700">Esqueci a senha</Link>
            </p>
          )}
        </form>

        <p className="mt-6 text-center text-sm text-ink-2">
          {mode === 'login' ? (
            <>Não tem conta? <Link href="/auth/register" className="font-semibold text-primary-700 hover:underline">Criar agora</Link></>
          ) : (
            <>Já tem conta? <Link href="/auth/login" className="font-semibold text-primary-700 hover:underline">Fazer login</Link></>
          )}
        </p>
      </div>
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="block text-sm font-medium text-ink-2">{label}</span>
      <div className="mt-1">{children}</div>
    </label>
  )
}

function ErrMsg({ msg }: { msg?: string }) {
  if (!msg) return null
  return <p className="mt-1 text-xs text-error">{msg}</p>
}
