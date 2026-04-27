'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  MessageCircle,
  Mail,
  Phone,
  Clock,
  Send,
  CheckCircle2,
  User as UserIcon,
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { useToast } from '@/components/ui/Toast'

const schema = z.object({
  name: z.string().min(2, 'Informe seu nome'),
  email: z.string().min(1, 'Informe seu email').email('Email invalido'),
  topic: z.string().min(1, 'Escolha um assunto'),
  message: z.string().min(10, 'Pelo menos 10 caracteres').max(2000),
})

type FormData = z.infer<typeof schema>

const TOPICS = [
  'Duvida antes da compra',
  'Status de pedido',
  'Defeito / DOA',
  'Troca / devolucao',
  'Lista de espera',
  'Builder de PC',
  'Outro',
]

export function ContatoClient() {
  const toast = useToast()
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)
  const wpp = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? '5511999999999'
  const wppMsg = process.env.NEXT_PUBLIC_WHATSAPP_DEFAULT_MESSAGE ?? 'Quero tirar uma duvida sobre um build.'

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { name: '', email: '', topic: '', message: '' },
  })

  async function onSubmit(_values: FormData) {
    setSubmitting(true)
    try {
      // Backend nao tem endpoint /contact ainda. MVP: simulamos sucesso e direcionamos pra WhatsApp como atalho.
      await new Promise((r) => setTimeout(r, 600))
      setDone(true)
      reset()
      toast.push({ variant: 'success', message: 'Mensagem enviada. Respondemos em ate 1 dia util.' })
    } catch {
      toast.push({ variant: 'danger', message: 'Falha ao enviar. Tente WhatsApp ou email.' })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main className="container-app py-8 sm:py-12">
      <header className="mb-6">
        <p className="font-specs text-xs font-bold uppercase tracking-widest text-primary">Contato</p>
        <h1 className="mt-1 font-display text-2xl font-bold text-text sm:text-3xl">Como podemos ajudar?</h1>
        <p className="mt-1 text-sm text-text-secondary">
          Resposta em ate 1 dia util. Pra urgencia, WhatsApp e o caminho mais rapido.
        </p>
      </header>

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <section className="rounded-lg border border-border bg-surface p-5 sm:p-6">
          {done ? (
            <div className="rounded-md border border-success/40 bg-success/5 p-6 text-center">
              <CheckCircle2 className="mx-auto h-10 w-10 text-success" />
              <p className="mt-3 text-base font-semibold text-text">Mensagem recebida</p>
              <p className="mt-1 text-sm text-text-secondary">
                Vamos responder no email cadastrado em ate 1 dia util. Pra urgencia, abre o WhatsApp aqui do lado.
              </p>
              <Button variant="ghost" className="mt-4" onClick={() => setDone(false)}>
                Enviar outra mensagem
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
              <div className="grid gap-4 sm:grid-cols-2">
                <Input
                  label="Seu nome"
                  autoComplete="name"
                  leftIcon={<UserIcon className="h-4 w-4" />}
                  error={errors.name?.message}
                  {...register('name')}
                />
                <Input
                  label="Email"
                  type="email"
                  autoComplete="email"
                  inputMode="email"
                  leftIcon={<Mail className="h-4 w-4" />}
                  error={errors.email?.message}
                  {...register('email')}
                />
              </div>

              <Select label="Assunto" error={errors.topic?.message} {...register('topic')}>
                <option value="">Escolha o assunto</option>
                {TOPICS.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </Select>

              <div>
                <label htmlFor="message" className="mb-1.5 block text-sm font-medium text-text">
                  Mensagem
                </label>
                <textarea
                  id="message"
                  rows={6}
                  placeholder="Conta o que voce precisa. Numero de pedido ajuda muito."
                  aria-invalid={!!errors.message}
                  className="w-full rounded-md border border-border bg-surface px-4 py-3 text-base text-text placeholder:text-text-muted focus:border-primary focus:outline-none focus:shadow-[0_0_0_3px_rgba(0,229,255,0.20)]"
                  {...register('message')}
                />
                {errors.message?.message && (
                  <p className="mt-1 text-xs text-danger">{errors.message.message}</p>
                )}
              </div>

              <Button type="submit" loading={submitting} size="lg" className="w-full sm:w-auto cta-glow">
                <Send className="h-4 w-4" /> Enviar mensagem
              </Button>
            </form>
          )}
        </section>

        <aside className="space-y-3">
          <a
            href={`https://wa.me/${wpp}?text=${encodeURIComponent(wppMsg)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="block rounded-lg border border-border bg-surface p-5 transition hover:border-whatsapp"
          >
            <div className="flex items-start gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-whatsapp/10 text-whatsapp">
                <MessageCircle className="h-5 w-5" />
              </span>
              <div>
                <p className="text-sm font-bold text-text">WhatsApp</p>
                <p className="text-xs text-text-secondary">Mais rapido pra duvidas tecnicas e status de pedido.</p>
                <p className="mt-1 font-specs text-xs text-primary">+{wpp.slice(0, 2)} {wpp.slice(2)}</p>
              </div>
            </div>
          </a>

          <a
            href="mailto:contato@koretech.com.br"
            className="block rounded-lg border border-border bg-surface p-5 transition hover:border-primary/40"
          >
            <div className="flex items-start gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-primary-soft text-primary">
                <Mail className="h-5 w-5" />
              </span>
              <div>
                <p className="text-sm font-bold text-text">Email</p>
                <p className="text-xs text-text-secondary">Pedidos complexos, devolucao, garantia.</p>
                <p className="mt-1 font-specs text-xs text-primary">contato@koretech.com.br</p>
              </div>
            </div>
          </a>

          <div className="rounded-lg border border-border bg-surface p-5">
            <div className="flex items-start gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-primary-soft text-primary">
                <Clock className="h-5 w-5" />
              </span>
              <div>
                <p className="text-sm font-bold text-text">Horario</p>
                <p className="text-xs text-text-secondary">Segunda a sexta, 09h as 18h. Sabado 10h as 14h.</p>
                <p className="mt-1 text-xs text-text-muted">Resposta em ate 1 dia util.</p>
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-border bg-surface p-5">
            <div className="flex items-start gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-primary-soft text-primary">
                <Phone className="h-5 w-5" />
              </span>
              <div>
                <p className="text-sm font-bold text-text">Telefone</p>
                <p className="text-xs text-text-secondary">So pra emergencia em pedido em transito.</p>
                <p className="mt-1 font-specs text-xs text-primary">(11) 0000-0000</p>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </main>
  )
}
