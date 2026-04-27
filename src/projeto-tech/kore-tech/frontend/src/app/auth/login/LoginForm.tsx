'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Eye, EyeOff, Mail, Lock } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { useToast } from '@/components/ui/Toast'
import { login } from '@/services/auth'
import { useAuth } from '@/stores/auth'
import { ApiError } from '@/lib/api-error'

const schema = z.object({
  email: z.string().min(1, 'Informe seu email').email('Email invalido'),
  password: z.string().min(1, 'Informe sua senha'),
})

type FormData = z.infer<typeof schema>

export function LoginForm() {
  const router = useRouter()
  const params = useSearchParams()
  const setUser = useAuth((s) => s.setUser)
  const toast = useToast()
  const [showPwd, setShowPwd] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { email: '', password: '' },
  })

  async function onSubmit(values: FormData) {
    setSubmitting(true)
    try {
      const res = await login(values)
      setUser(res.user)
      toast.push({ variant: 'success', message: `Bem-vindo de volta, ${res.user.name.split(' ')[0]}.` })
      const redirect = params.get('redirect')
      // Admin pode ir pro painel se nao houver redirect
      if (redirect) router.push(redirect)
      else router.push('/account')
    } catch (err) {
      const msg = ApiError.is(err) ? err.message : 'Nao foi possivel entrar. Tente de novo.'
      toast.push({ variant: 'danger', title: 'Falha ao entrar', message: msg })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      <Input
        label="Email"
        type="email"
        autoComplete="email"
        inputMode="email"
        placeholder="seu@email.com"
        leftIcon={<Mail className="h-4 w-4" />}
        error={errors.email?.message}
        {...register('email')}
      />

      <div>
        <Input
          label="Senha"
          type={showPwd ? 'text' : 'password'}
          autoComplete="current-password"
          placeholder="Sua senha"
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
        <div className="mt-2 flex justify-end">
          <Link href="/auth/forgot" className="text-xs font-medium text-primary hover:underline">
            Esqueci a senha
          </Link>
        </div>
      </div>

      <Button type="submit" loading={submitting} size="lg" className="w-full cta-glow">
        Entrar
      </Button>

      <p className="text-center text-xs text-text-muted">
        Ao entrar, voce concorda com os{' '}
        <Link href="/policies/termos" className="text-text-secondary hover:text-primary">
          termos de uso
        </Link>{' '}
        e{' '}
        <Link href="/policies/privacidade" className="text-text-secondary hover:text-primary">
          politica de privacidade
        </Link>
        .
      </p>
    </form>
  )
}
