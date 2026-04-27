'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import Link from 'next/link'
import { Mail, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { useToast } from '@/components/ui/Toast'
import { forgotPassword } from '@/services/auth'
import { ApiError } from '@/lib/api-error'

const schema = z.object({
  email: z.string().min(1, 'Informe seu email').email('Email invalido'),
})

type FormData = z.infer<typeof schema>

export function ForgotForm() {
  const toast = useToast()
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)
  const [devLink, setDevLink] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema), defaultValues: { email: '' } })

  async function onSubmit(values: FormData) {
    setSubmitting(true)
    try {
      const res = await forgotPassword(values.email.trim())
      setDone(true)
      setDevLink(res._devResetUrl ?? null)
    } catch (err) {
      // Backend retorna 200 mesmo sem email, mas nao confiamos.
      const msg = ApiError.is(err) ? err.message : 'Nao foi possivel enviar o email. Tente de novo.'
      toast.push({ variant: 'danger', message: msg })
    } finally {
      setSubmitting(false)
    }
  }

  if (done) {
    return (
      <div className="rounded-md border border-success/40 bg-success/5 p-6">
        <div className="flex items-start gap-3">
          <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-success" />
          <div>
            <p className="font-semibold text-text">Email enviado.</p>
            <p className="mt-1 text-sm text-text-secondary">
              Se o endereco existir na nossa base, voce vai receber um link em ate 5 minutos. Cheque tambem a caixa
              de spam.
            </p>
            {devLink && (
              <p className="mt-3 break-all rounded border border-warning/40 bg-warning/5 p-2 text-xs text-warning">
                <strong>Dev only:</strong> <a href={devLink} className="underline">{devLink}</a>
              </p>
            )}
            <Link href="/auth/login" className="mt-4 inline-block text-sm font-semibold text-primary hover:underline">
              Voltar pro login
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      <Input
        label="Email cadastrado"
        type="email"
        autoComplete="email"
        inputMode="email"
        placeholder="seu@email.com"
        leftIcon={<Mail className="h-4 w-4" />}
        error={errors.email?.message}
        {...register('email')}
      />

      <Button type="submit" loading={submitting} size="lg" className="w-full cta-glow">
        Enviar link
      </Button>
    </form>
  )
}
