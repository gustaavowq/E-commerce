'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { resetPassword } from '@/services/auth'
import { useAuth } from '@/stores/auth'
import { ApiError } from '@/lib/api-error'

const schema = z.object({
  password: z.string()
              .min(8, 'Mínimo 8 caracteres')
              .regex(/[A-Za-z]/, 'Precisa de letra')
              .regex(/[0-9]/, 'Precisa de número'),
  confirm:  z.string(),
}).refine(d => d.password === d.confirm, {
  message: 'As senhas não batem',
  path: ['confirm'],
})

type Values = z.infer<typeof schema>

export function ResetForm() {
  const router = useRouter()
  const params = useSearchParams()
  const setUser = useAuth(s => s.setUser)
  const token = params.get('token')

  const form = useForm<Values>({ resolver: zodResolver(schema) })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (!token) {
    return (
      <div className="rounded-md border border-error/30 bg-error/5 p-4 text-sm text-error">
        Link inválido. Solicita um novo em <Link href="/auth/forgot" className="underline">recuperar senha</Link>.
      </div>
    )
  }

  async function onSubmit(values: Values) {
    setError(null)
    setSubmitting(true)
    try {
      const res = await resetPassword({ token: token!, password: values.password })
      setUser(res.user)
      router.replace(res.user.role === 'ADMIN' ? '/' : '/account')
      router.refresh()
    } catch (err) {
      setError(ApiError.is(err) ? err.message : 'Não deu pra trocar a senha agora')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4" noValidate>
      <div>
        <label className="block text-sm font-medium text-ink-2">Nova senha</label>
        <input
          type="password"
          autoComplete="new-password"
          autoFocus
          {...form.register('password')}
          className="mt-1 w-full rounded-md border border-border px-3 py-2.5 text-base focus:border-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-700/20"
        />
        {form.formState.errors.password && (
          <p className="mt-1 text-xs text-error">{form.formState.errors.password.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-ink-2">Confirma a nova senha</label>
        <input
          type="password"
          autoComplete="new-password"
          {...form.register('confirm')}
          className="mt-1 w-full rounded-md border border-border px-3 py-2.5 text-base focus:border-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-700/20"
        />
        {form.formState.errors.confirm && (
          <p className="mt-1 text-xs text-error">{form.formState.errors.confirm.message}</p>
        )}
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
