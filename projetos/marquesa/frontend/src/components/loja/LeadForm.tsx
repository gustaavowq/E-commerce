'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { post } from '@/lib/api'
import { microcopy } from '@/lib/microcopy'
import { Input, Textarea } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'

const schema = z.object({
  nome: z.string().min(2, 'Mínimo 2 caracteres'),
  email: z.string().email('Email inválido'),
  telefone: z.string().min(10, 'Telefone com DDD'),
  mensagem: z.string().optional(),
  consentimento: z.literal(true, {
    errorMap: () => ({ message: 'Aceite para continuar.' }),
  }),
})

type FormData = z.infer<typeof schema>

interface LeadFormProps {
  imovelId: string
  onSuccess?: () => void
}

export function LeadForm({ imovelId, onSuccess }: LeadFormProps) {
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
      await post('/api/leads', {
        imovelId,
        nome: data.nome,
        email: data.email,
        telefone: data.telefone,
        mensagem: data.mensagem || undefined,
      })
      setSent(true)
      onSuccess?.()
    } catch (err) {
      setError((err as Error).message || microcopy.erros.rede)
    }
  }

  if (sent) {
    return (
      <div className="text-center py-8">
        <h3 className="font-display text-heading-lg text-ink mb-3">
          {microcopy.lead.sucesso_titulo}
        </h3>
        <p className="text-body text-ash">{microcopy.lead.sucesso_descricao}</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
      <Input
        label={microcopy.lead.nome}
        {...register('nome')}
        error={errors.nome?.message}
        autoComplete="name"
      />
      <Input
        label={microcopy.lead.email}
        type="email"
        {...register('email')}
        error={errors.email?.message}
        autoComplete="email"
      />
      <Input
        label={microcopy.lead.telefone}
        type="tel"
        placeholder="(11) 90000-0000"
        {...register('telefone')}
        error={errors.telefone?.message}
        autoComplete="tel"
      />
      <Textarea
        label={microcopy.lead.mensagem}
        placeholder={microcopy.lead.mensagem_placeholder}
        {...register('mensagem')}
      />
      <label className="flex items-start gap-3 text-body-sm text-ash cursor-pointer">
        <input
          type="checkbox"
          {...register('consentimento')}
          className="mt-1 accent-moss"
        />
        <span>{microcopy.lead.consentimento}</span>
      </label>
      {errors.consentimento && (
        <span className="text-caption text-red-600 -mt-3">{errors.consentimento.message}</span>
      )}
      {error && (
        <p className="text-caption text-red-600 bg-red-50 border border-red-100 px-3 py-2">
          {error}
        </p>
      )}
      <Button type="submit" loading={isSubmitting}>
        {microcopy.lead.enviar}
      </Button>
    </form>
  )
}
