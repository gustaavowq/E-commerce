'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Eye, EyeOff, Mail, Lock, User as UserIcon, Phone } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { useToast } from '@/components/ui/Toast'
import { register as registerUser } from '@/services/auth'
import { useAuth } from '@/stores/auth'
import { ApiError } from '@/lib/api-error'

const schema = z
  .object({
    name: z.string().min(2, 'Informe seu nome completo').max(120),
    email: z.string().min(1, 'Informe seu email').email('Email invalido'),
    phone: z
      .string()
      .optional()
      .refine((v) => !v || v.replace(/\D/g, '').length >= 10, 'Telefone deve ter DDD + numero'),
    password: z.string().min(8, 'Senha precisa ter pelo menos 8 caracteres'),
    confirm: z.string().min(1, 'Confirme a senha'),
  })
  .refine((d) => d.password === d.confirm, { message: 'As senhas nao coincidem', path: ['confirm'] })

type FormData = z.infer<typeof schema>

export function RegisterForm() {
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
    defaultValues: { name: '', email: '', phone: '', password: '', confirm: '' },
  })

  async function onSubmit(values: FormData) {
    setSubmitting(true)
    try {
      const res = await registerUser({
        name: values.name.trim(),
        email: values.email.trim(),
        password: values.password,
        phone: values.phone ? values.phone.replace(/\D/g, '') : undefined,
      })
      setUser(res.user)
      toast.push({ variant: 'success', message: 'Conta criada. Bem-vindo a Kore Tech.' })
      const redirect = params.get('redirect')
      router.push(redirect || '/account')
    } catch (err) {
      const msg = ApiError.is(err) ? err.message : 'Nao foi possivel criar a conta. Tente de novo.'
      toast.push({ variant: 'danger', title: 'Falha no cadastro', message: msg })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      <Input
        label="Nome completo"
        autoComplete="name"
        placeholder="Como voce quer ser chamado"
        leftIcon={<UserIcon className="h-4 w-4" />}
        error={errors.name?.message}
        {...register('name')}
      />

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

      <Input
        label="Telefone (opcional)"
        type="tel"
        autoComplete="tel"
        inputMode="tel"
        placeholder="(11) 99999-9999"
        leftIcon={<Phone className="h-4 w-4" />}
        hint="Usamos pra avisar de lista de espera por WhatsApp."
        error={errors.phone?.message}
        {...register('phone')}
      />

      <Input
        label="Senha"
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
        label="Confirmar senha"
        type={showPwd ? 'text' : 'password'}
        autoComplete="new-password"
        placeholder="Repita a senha"
        leftIcon={<Lock className="h-4 w-4" />}
        error={errors.confirm?.message}
        {...register('confirm')}
      />

      <Button type="submit" loading={submitting} size="lg" className="w-full cta-glow">
        Criar conta
      </Button>

      <p className="text-center text-xs text-text-muted">
        Ao criar conta, voce aceita nossos termos e politica de privacidade.
      </p>
    </form>
  )
}
