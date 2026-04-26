'use client'

import { useEffect, useState } from 'react'
import { MessageCircle } from 'lucide-react'
import { getStoreSettings } from '@/services/settings'

// Botão flutuante. Pega número/mensagem do StoreSettings (com fallback de env).
export function WhatsAppButton() {
  const [number, setNumber] = useState(process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '5511999999999')
  const [message, setMessage] = useState(
    process.env.NEXT_PUBLIC_WHATSAPP_DEFAULT_MESSAGE || 'Olá! Vi a Miami Store no Insta e quero tirar uma dúvida.'
  )

  useEffect(() => {
    getStoreSettings()
      .then(s => {
        if (s.whatsappNumber)  setNumber(s.whatsappNumber)
        if (s.whatsappMessage) setMessage(s.whatsappMessage)
      })
      .catch(() => {})
  }, [])

  const href = `https://wa.me/${number}?text=${encodeURIComponent(message)}`

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Falar com a loja no WhatsApp"
      className="fixed bottom-4 right-4 z-[150] flex h-14 w-14 items-center justify-center rounded-pill bg-whatsapp text-white shadow-lg transition-transform hover:scale-110 animate-pulse-soft"
    >
      <MessageCircle className="h-7 w-7" />
    </a>
  )
}
