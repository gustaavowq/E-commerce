'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Store, CheckCircle2, AlertCircle, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { forgotPassword } from '@/services/auth'
import { ApiError } from '@/lib/api-error'

const schema = z.object({ email: z.string().email('Email inválido') })
type Values = z.infer<typeof schema>

export default function AdminForgotPage() {
  const form = useForm<Values>({ resolver: zodResolver(schema) })
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone]   = useState<{ message: string; devUrl?: string } | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function onSubmit(values: Values) {
    setError(null)
    setSubmitting(true)
    try {
      const res = await forgotPassword(values.email)
      setDone({ message: res.message, devUrl: res._devResetUrl })
    } catch (err) {
      setError(ApiError.is(err) ? err.message : 'Não deu pra processar agora')
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
            <h1 className="text-lg font-bold text-ink">Recuperar acesso</h1>
          </div>
        </div>

        {done ? (
          <div className="space-y-4">
            <div className="flex items-start gap-2 rounded-md border border-success/30 bg-success/5 p-3 text-sm text-success">
              <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" />
              <p>{done.message}</p>
            </div>
            {done.devUrl && (
              <div className="rounded-md border border-warning/30 bg-warning/5 p-3 text-xs">
                <p className="font-semibold text-warning">[modo desenvolvimento]</p>
                <p className="mt-1 text-ink-2">Em prod o link vai por email. Aqui usa este pra testar:</p>
                <a href={done.devUrl} className="mt-2 block break-all font-mono text-xs text-primary-700 underline">
                  {done.devUrl}
                </a>
              </div>
            )}
            <Link href="/login" className="inline-flex items-center gap-1 text-sm text-primary-700 hover:underline">
              <ArrowLeft className="h-4 w-4" /> Voltar pro login
            </Link>
          </div>
        ) : (
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4" noValidate>
            <p className="text-sm text-ink-3">
              Põe o email cadastrado e a gente manda um link pra criar uma nova senha.
            </p>
            <div>
              <label className="block text-sm font-medium text-ink-2">Email</label>
              <Input type="email" autoComplete="email" autoFocus
                {...form.register('email')}
                error={form.formState.errors.email?.message}
                className="mt-1" />
            </div>

            {error && (
              <div className="flex items-start gap-2 rounded-md border border-error/30 bg-error/5 px-3 py-2 text-sm text-error">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" /> <span>{error}</span>
              </div>
            )}

            <Button type="submit" fullWidth size="lg" loading={submitting}>
              Mandar link
            </Button>

            <Link href="/login" className="block text-center text-sm text-ink-3 hover:text-primary-700">
              Voltar pro login
            </Link>
          </form>
        )}
      </div>
    </div>
  )
}
