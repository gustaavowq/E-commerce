'use client'

import Link from 'next/link'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { post } from '@/lib/api'
import { microcopy } from '@/lib/microcopy'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'

const schema = z.object({
  email: z.string().email(microcopy.erros.email_invalido),
})

type FormData = z.infer<typeof schema>

export default function ForgotPasswordPage() {
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  const onSubmit = async (data: FormData) => {
    setError(null)
    try {
      await post('/api/auth/forgot-password', { email: data.email }, { withAuth: false })
      setSent(true)
    } catch (err) {
      setError((err as Error).message || microcopy.erros.rede)
    }
  }

  if (sent) {
    return (
      <div>
        <h1 className="font-display text-display-md text-ink mb-3">
          {microcopy.auth.esqueci_titulo}
        </h1>
        <p className="text-body text-ash">{microcopy.auth.esqueci_sucesso}</p>
        <Link
          href="/auth/login"
          className="mt-8 inline-block text-body-sm text-ink hover:underline underline-offset-4"
        >
          ← Voltar ao login
        </Link>
      </div>
    )
  }

  return (
    <div>
      <h1 className="font-display text-display-md text-ink mb-3">
        {microcopy.auth.esqueci_titulo}
      </h1>
      <p className="text-body text-ash mb-8">{microcopy.auth.esqueci_subtitulo}</p>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
        <Input
          label={microcopy.auth.email}
          type="email"
          autoComplete="email"
          {...register('email')}
          error={errors.email?.message}
        />
        {error && (
          <p className="text-caption text-red-600 bg-red-50 border border-red-100 px-3 py-2">
            {error}
          </p>
        )}
        <Button type="submit" loading={isSubmitting} className="w-full">
          {microcopy.auth.esqueci_enviar}
        </Button>
      </form>

      <Link
        href="/auth/login"
        className="mt-8 inline-block text-body-sm text-ash hover:text-ink hover:underline underline-offset-4"
      >
        ← Voltar ao login
      </Link>
    </div>
  )
}
