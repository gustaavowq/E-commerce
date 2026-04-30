'use client'

import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { post } from '@/lib/api'
import { microcopy } from '@/lib/microcopy'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'

// Schema espelha o backend (resetPasswordSchema): mínimo 8 chars + confirma.
// Backend ainda valida senha-comum/blocklist; o erro volta como mensagem.
const schema = z
  .object({
    password: z.string().min(8, 'Senha precisa ter pelo menos 8 caracteres'),
    confirmPassword: z.string().min(8, 'Confirme a senha'),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: 'As senhas não coincidem',
    path: ['confirmPassword'],
  })

type FormData = z.infer<typeof schema>

export function ResetForm() {
  const params = useSearchParams()
  const router = useRouter()
  const token = params.get('token')

  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  useEffect(() => {
    if (!token) setError('Link inválido ou expirado. Solicite um novo link.')
  }, [token])

  const onSubmit = async (data: FormData) => {
    setError(null)
    if (!token) {
      setError('Link inválido ou expirado. Solicite um novo link.')
      return
    }
    try {
      await post(
        '/api/auth/reset-password',
        { token, password: data.password },
        { withAuth: false },
      )
      setSuccess(true)
    } catch (err) {
      setError((err as Error).message || microcopy.erros.rede)
    }
  }

  if (success) {
    return (
      <div>
        <h1 className="font-display text-display-md text-ink mb-3">
          {microcopy.auth.redefinir_titulo}
        </h1>
        <p className="text-body text-ash mb-8">
          Senha redefinida. Você já pode entrar com a nova senha.
        </p>
        <Button onClick={() => router.push('/auth/login')} className="w-full">
          {microcopy.auth.entrar}
        </Button>
      </div>
    )
  }

  return (
    <div>
      <h1 className="font-display text-display-md text-ink mb-3">
        {microcopy.auth.redefinir_titulo}
      </h1>
      <p className="text-body text-ash mb-8">Defina sua nova senha abaixo.</p>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
        <Input
          label={microcopy.auth.senha}
          type="password"
          autoComplete="new-password"
          {...register('password')}
          error={errors.password?.message}
        />
        <Input
          label={microcopy.auth.senha_repetir}
          type="password"
          autoComplete="new-password"
          {...register('confirmPassword')}
          error={errors.confirmPassword?.message}
        />
        {error && (
          <p className="text-caption text-red-600 bg-red-50 border border-red-100 px-3 py-2">
            {error}
          </p>
        )}
        <Button type="submit" loading={isSubmitting} disabled={!token} className="w-full">
          {microcopy.auth.redefinir_enviar}
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
