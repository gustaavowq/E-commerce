'use client'

import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { microcopy } from '@/lib/microcopy'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'

const schema = z
  .object({
    name: z.string().min(2, 'Mínimo 2 caracteres'),
    email: z.string().email(microcopy.erros.email_invalido),
    phone: z.string().optional(),
    password: z.string().min(8, microcopy.erros.senha_curta),
    confirm: z.string(),
  })
  .refine((d) => d.password === d.confirm, {
    message: microcopy.erros.senha_diferente,
    path: ['confirm'],
  })

type FormData = z.infer<typeof schema>

export function RegisterForm() {
  const params = useSearchParams()
  const redirect = params.get('redirect')
  const { register: registerUser } = useAuth()
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
      await registerUser({
        name: data.name,
        email: data.email,
        phone: data.phone || undefined,
        password: data.password,
      })
    } catch (err) {
      setError((err as Error).message || microcopy.erros.rede)
    }
  }

  return (
    <div>
      <h1 className="font-display text-display-md text-ink mb-3">
        {microcopy.auth.registro_titulo}
      </h1>
      <p className="text-body text-ash mb-8">{microcopy.auth.registro_subtitulo}</p>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
        <Input
          label="Nome completo"
          autoComplete="name"
          {...register('name')}
          error={errors.name?.message}
        />
        <Input
          label={microcopy.auth.email}
          type="email"
          autoComplete="email"
          {...register('email')}
          error={errors.email?.message}
        />
        <Input
          label="Telefone (opcional)"
          type="tel"
          placeholder="(11) 90000-0000"
          autoComplete="tel"
          {...register('phone')}
          error={errors.phone?.message}
        />
        <Input
          label={microcopy.auth.senha}
          type="password"
          autoComplete="new-password"
          {...register('password')}
          error={errors.password?.message}
          hint="Mínimo 8 caracteres"
        />
        <Input
          label={microcopy.auth.senha_repetir}
          type="password"
          autoComplete="new-password"
          {...register('confirm')}
          error={errors.confirm?.message}
        />
        {error && (
          <p className="text-caption text-red-600 bg-red-50 border border-red-100 px-3 py-2">
            {error}
          </p>
        )}
        <Button type="submit" loading={isSubmitting} className="w-full">
          {microcopy.auth.criar_conta}
        </Button>
      </form>

      <p className="mt-8 text-body-sm text-ash">
        {microcopy.auth.ja_tem_conta}{' '}
        <Link
          href={`/auth/login${redirect ? `?redirect=${encodeURIComponent(redirect)}` : ''}`}
          className="text-ink hover:underline underline-offset-4"
        >
          {microcopy.auth.entrar}
        </Link>
      </p>
    </div>
  )
}
