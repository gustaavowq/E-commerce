'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import Link from 'next/link'
import { Eye, EyeOff, Lock, AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { useToast } from '@/components/ui/Toast'
import { resetPassword } from '@/services/auth'
import { ApiError } from '@/lib/api-error'

const schema = z
  .object({
    password: z.string().min(8, 'Senha precisa ter pelo menos 8 caracteres'),
    confirm: z.string().min(1, 'Confirme a senha'),
  })
  .refine((d) => d.password === d.confirm, { message: 'As senhas nao coincidem', path: ['confirm'] })

type FormData = z.infer<typeof schema>

export function ResetForm() {
  const router = useRouter()
  const params = useSearchParams()
  const token = params.get('token') ?? ''
  const toast = useToast()
  const [submitting, setSubmitting] = useState(false)
  const [showPwd, setShowPwd] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema), defaultValues: { password: '', confirm: '' } })

  if (!token) {
    return (
      <div className="rounded-md border border-danger/40 bg-danger/5 p-6">
        <div className="flex items-start gap-3">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-danger" />
          <div>
            <p className="font-semibold text-text">Link invalido ou expirado.</p>
            <p className="mt-1 text-sm text-text-secondary">
              Volte pra tela de recuperacao e gere um novo link.
            </p>
            <Link href="/auth/forgot" className="mt-4 inline-block text-sm font-semibold text-primary hover:underline">
              Recuperar senha
            </Link>
          </div>
        </div>
      </div>
    )
  }

  async function onSubmit(values: FormData) {
    setSubmitting(true)
    try {
      await resetPassword({ token, password: values.password })
      toast.push({ variant: 'success', message: 'Senha trocada. Faca login com a nova senha.' })
      router.push('/auth/login')
    } catch (err) {
      const msg = ApiError.is(err) ? err.message : 'Nao foi possivel atualizar a senha.'
      toast.push({ variant: 'danger', title: 'Falha ao redefinir', message: msg })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      <Input
        label="Nova senha"
        type={showPwd ? 'text' : 'password'}
        autoComplete="new-password"
        placeholder="Pelo menos 8 caracteres"
        leftIcon={<Lock className="h-4 w-4" />}
        rightSlot={
          <button
            type="button"
            onClick={() => setShowPwd((v) => !v)}
            aria-label={showPwd ? 'Ocultar senha' : 'Mostrar senha'}
            className="flex h-9 w-9 items-center justify-center rounded text-text-muted hover:text-text"
          >
            {showPwd ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        }
        error={errors.password?.message}
        {...register('password')}
      />

      <Input
        label="Confirmar nova senha"
        type={showPwd ? 'text' : 'password'}
        autoComplete="new-password"
        placeholder="Repita a senha"
        leftIcon={<Lock className="h-4 w-4" />}
        error={errors.confirm?.message}
        {...register('confirm')}
      />

      <Button type="submit" loading={submitting} size="lg" className="w-full cta-glow">
        Salvar nova senha
      </Button>
    </form>
  )
}
