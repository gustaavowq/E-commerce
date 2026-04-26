'use client'

import { MessageCircle } from 'lucide-react'

// Botão flutuante fixo no canto inferior direito. Sempre visível.
// Number e mensagem default vêm da env (NEXT_PUBLIC_WHATSAPP_NUMBER).
export function WhatsAppButton() {
  const number = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '5511999999999'
  const msg = encodeURIComponent(process.env.NEXT_PUBLIC_WHATSAPP_DEFAULT_MESSAGE
    || 'Olá! Vi a Miami Store no Insta e quero tirar uma dúvida.')
  const href = `https://wa.me/${number}?text=${msg}`

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Falar com Miami Store no WhatsApp"
      className="fixed bottom-4 right-4 z-[150] flex h-14 w-14 items-center justify-center rounded-pill bg-whatsapp text-white shadow-lg transition-transform hover:scale-110 animate-pulse-soft"
    >
      <MessageCircle className="h-7 w-7" />
    </a>
  )
}
