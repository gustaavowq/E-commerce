'use client'

// Captura de newsletter no Footer.
// Backend de Lead exige imovelId — buscamos 1 imóvel destaque na hora do submit
// e mandamos com mensagem prefixada [NEWSLETTER]. Trade-off documentado em mensagem
// pro tech-lead; se virar volume, vale uma rota /api/newsletter dedicada.

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { apiList, post } from '@/lib/api'
import type { ImovelListItem } from '@/types/api'
import { microcopy } from '@/lib/microcopy'
import { cn } from '@/lib/format'

const schema = z.object({
  email: z.string().email('Email inválido'),
  consentimento: z.literal(true, {
    errorMap: () => ({ message: 'Aceite para continuar.' }),
  }),
})

type FormData = z.infer<typeof schema>

async function pickAnchorImovelId(): Promise<string | null> {
  // Tenta destaque primeiro (mais durável); se não houver, pega qualquer disponível.
  try {
    const res = await apiList<ImovelListItem>('/api/imoveis', {
      query: { destaque: 'true', limit: 1 },
      withAuth: false,
    })
    if (res.data[0]?.id) return res.data[0].id
  } catch {
    /* ignore — tenta fallback */
  }
  try {
    const res = await apiList<ImovelListItem>('/api/imoveis', {
      query: { limit: 1 },
      withAuth: false,
    })
    return res.data[0]?.id ?? null
  } catch {
    return null
  }
}

export function NewsletterCapture() {
  const c = microcopy.footer
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { consentimento: false as unknown as true },
  })

  const onSubmit = async (data: FormData) => {
    setError(null)
    try {
      const imovelId = await pickAnchorImovelId()
      if (!imovelId) {
        setError(microcopy.erros.rede)
        return
      }
      await post('/api/leads', {
        imovelId,
        nome: 'Newsletter',
        email: data.email,
        mensagem:
          '[NEWSLETTER] Inscrição na curadoria mensal. Consentimento LGPD aceito.',
      })
      setSent(true)
      reset()
    } catch (err) {
      setError((err as Error).message || microcopy.erros.rede)
    }
  }

  if (sent) {
    return (
      <div className="text-paper">
        <p className="text-eyebrow uppercase tracking-[0.16em] text-paper/50 mb-3">
          {c.newsletter_titulo}
        </p>
        <p className="text-body-sm text-paper/80">{c.newsletter_sucesso}</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="text-paper">
      <p className="text-eyebrow uppercase tracking-[0.16em] text-paper/50 mb-3">
        {c.newsletter_titulo}
      </p>
      <p className="text-body-sm text-paper/60 mb-5 leading-relaxed">
        {c.newsletter_subtitulo}
      </p>

      <div className="flex flex-col sm:flex-row gap-3">
        <label className="flex-1">
          <span className="sr-only">{c.newsletter_email}</span>
          <input
            type="email"
            placeholder={c.newsletter_email}
            {...register('email')}
            className={cn(
              'w-full bg-transparent border border-paper/30 px-4 py-3 text-body-sm text-paper',
              'placeholder:text-paper/40',
              'focus:border-paper/80 focus:outline-none',
              'transition-colors duration-fast',
              errors.email && 'border-red-400',
            )}
            autoComplete="email"
          />
        </label>
        <button
          type="submit"
          disabled={isSubmitting}
          className={cn(
            'inline-flex items-center justify-center px-6 py-3',
            'bg-paper text-graphite font-sans text-body-sm uppercase tracking-[0.04em]',
            'hover:bg-paper-warm transition-colors duration-fast',
            'disabled:opacity-50 disabled:cursor-not-allowed',
          )}
        >
          {isSubmitting ? microcopy.enviando : c.newsletter_enviar}
        </button>
      </div>

      <label className="mt-4 flex items-start gap-2 cursor-pointer">
        <input
          type="checkbox"
          {...register('consentimento')}
          className="mt-1 accent-moss"
        />
        <span className="text-caption text-paper/60 leading-relaxed">
          Autorizo a Marquesa a enviar comunicações por email conforme a{' '}
          <a
            href="/policies/privacidade"
            className="underline underline-offset-2 hover:text-paper"
          >
            política de privacidade
          </a>
          .
        </span>
      </label>

      {errors.email && (
        <p className="mt-2 text-caption text-red-300">{errors.email.message}</p>
      )}
      {errors.consentimento && (
        <p className="mt-2 text-caption text-red-300">{errors.consentimento.message}</p>
      )}
      {error && <p className="mt-2 text-caption text-red-300">{error}</p>}
    </form>
  )
}
