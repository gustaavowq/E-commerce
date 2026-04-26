'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { CheckCircle2, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { forgotPassword } from '@/services/auth'
import { ApiError } from '@/lib/api-error'

const schema = z.object({ email: z.string().email('Email inválido') })
type Values = z.infer<typeof schema>

export function ForgotForm() {
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
      setError(ApiError.is(err) ? err.message : 'Não deu pra processar agora, tenta de novo')
    } finally {
      setSubmitting(false)
    }
  }

  if (done) {
    return (
      <div className="space-y-4">
        <div className="flex items-start gap-2 rounded-md border border-success/30 bg-success/5 p-3 text-sm text-success">
          <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" />
          <p>{done.message}</p>
        </div>
        {done.devUrl && (
          <div className="rounded-md border border-warning/30 bg-warning/5 p-3 text-xs">
            <p className="font-semibold text-warning">[modo desenvolvimento]</p>
            <p className="mt-1 text-ink-2">Em prod o link vai por email. Aqui, usa este pra testar:</p>
            <a href={done.devUrl} className="mt-2 block break-all font-mono text-xs text-primary-700 underline">
              {done.devUrl}
            </a>
          </div>
        )}
        <Link href="/auth/login" className="block text-center text-sm text-primary-700 hover:underline">
          Voltar pro login
        </Link>
      </div>
    )
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4" noValidate>
      <div>
        <label className="block text-sm font-medium text-ink-2">Email</label>
        <input
          type="email"
          autoComplete="email"
          autoFocus
          {...form.register('email')}
          className="mt-1 w-full rounded-md border border-border px-3 py-2.5 text-base focus:border-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-700/20"
        />
        {form.formState.errors.email && (
          <p className="mt-1 text-xs text-error">{form.formState.errors.email.message}</p>
        )}
      </div>

      {error && (
        <div className="flex items-start gap-2 rounded-md border border-error/30 bg-error/5 px-3 py-2 text-sm text-error">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" /> <span>{error}</span>
        </div>
      )}

      <Button type="submit" fullWidth size="lg" loading={submitting}>
        Mandar link
      </Button>

      <Link href="/auth/login" className="block text-center text-sm text-ink-3 hover:text-primary-700">
        Lembrou? Voltar pro login
      </Link>
    </form>
  )
}
