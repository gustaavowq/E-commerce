'use client'

import { useState } from 'react'
import { Send, Check } from 'lucide-react'
import { Button } from '@/components/ui/Button'

type Subject = 'duvida' | 'pedido' | 'troca' | 'parceria' | 'outros'

const SUBJECTS: Array<{ value: Subject; label: string }> = [
  { value: 'duvida',   label: 'Dúvida sobre produto' },
  { value: 'pedido',   label: 'Status do meu pedido' },
  { value: 'troca',    label: 'Troca / devolução' },
  { value: 'parceria', label: 'Parceria / influencer' },
  { value: 'outros',   label: 'Outro assunto' },
]

export function ContactForm({ whatsappNumber }: { whatsappNumber: string }) {
  const [name, setName]       = useState('')
  const [subject, setSubject] = useState<Subject>('duvida')
  const [message, setMessage] = useState('')
  const [opened, setOpened]   = useState(false)
  const [error, setError]     = useState<string | null>(null)

  function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (name.trim().length < 2) { setError('Coloca seu nome aí pra gente te chamar bonito.'); return }
    if (message.trim().length < 5) { setError('Conta um pouco mais o que aconteceu, valeu?'); return }

    const subjectLabel = SUBJECTS.find(s => s.value === subject)?.label ?? subject
    const text = `Oi, sou ${name.trim()}.\n*Assunto:* ${subjectLabel}\n\n${message.trim()}`
    const url  = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(text)}`

    window.open(url, '_blank', 'noopener,noreferrer')
    setOpened(true)
    setTimeout(() => setOpened(false), 4000)
  }

  return (
    <form onSubmit={onSubmit} className="mt-6 space-y-4">
      <div>
        <label htmlFor="contact-name" className="mb-1.5 block text-sm font-medium text-ink">Seu nome</label>
        <input
          id="contact-name"
          type="text"
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="Como podemos te chamar?"
          maxLength={80}
          className="w-full rounded-md border border-border bg-white px-3 py-2.5 text-sm text-ink placeholder:text-ink-4 focus:border-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-700/20 transition"
        />
      </div>

      <div>
        <label htmlFor="contact-subject" className="mb-1.5 block text-sm font-medium text-ink">Assunto</label>
        <select
          id="contact-subject"
          value={subject}
          onChange={e => setSubject(e.target.value as Subject)}
          className="w-full rounded-md border border-border bg-white px-3 py-2.5 text-sm text-ink focus:border-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-700/20 transition"
        >
          {SUBJECTS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
        </select>
      </div>

      <div>
        <label htmlFor="contact-message" className="mb-1.5 block text-sm font-medium text-ink">Sua mensagem</label>
        <textarea
          id="contact-message"
          value={message}
          onChange={e => setMessage(e.target.value)}
          placeholder="Conta o que aconteceu, número do pedido (se tiver), o que precisa..."
          rows={5}
          maxLength={1000}
          className="w-full resize-none rounded-md border border-border bg-white px-3 py-2.5 text-sm text-ink placeholder:text-ink-4 focus:border-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-700/20 transition"
        />
        <p className="mt-1 text-right text-xs text-ink-4">{message.length}/1000</p>
      </div>

      {error && (
        <p className="rounded-md bg-error/10 px-3 py-2 text-sm text-error animate-fade-up">{error}</p>
      )}

      <div className="flex flex-col gap-2 pt-2">
        <Button
          type="submit"
          size="lg"
          fullWidth
          leftIcon={opened ? <Check className="h-5 w-5" /> : <Send className="h-5 w-5" />}
        >
          {opened ? 'Pronto, abri o WhatsApp' : 'Enviar via WhatsApp'}
        </Button>
        <p className="text-center text-xs text-ink-3">
          A mensagem abre no WhatsApp já preenchida. Você só clica em enviar.
        </p>
      </div>
    </form>
  )
}
