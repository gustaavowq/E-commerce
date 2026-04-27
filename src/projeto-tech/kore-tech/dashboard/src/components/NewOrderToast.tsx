'use client'

import { ShoppingBag, X } from 'lucide-react'
import { useNewOrderNotification } from '@/hooks/useNewOrderNotification'

export function NewOrderToast() {
  const { toast, dismiss } = useNewOrderNotification()
  if (!toast) return null
  return (
    <div
      role="status"
      className="fixed bottom-4 right-4 z-toast flex max-w-sm items-start gap-3 rounded-lg border border-success/40 bg-surface p-4 shadow-xl animate-fade-up"
    >
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-pill bg-success-soft text-success">
        <ShoppingBag className="h-5 w-5" />
      </div>
      <div className="flex-1">
        <p className="text-sm font-bold text-text">
          {toast.count === 1 ? '1 pedido novo!' : `${toast.count} pedidos novos!`}
        </p>
        <p className="mt-0.5 text-xs text-text-secondary">Vai em Pedidos pra ver e processar.</p>
      </div>
      <button onClick={dismiss} aria-label="Fechar" className="text-text-secondary hover:text-text">
        <X className="h-4 w-4" />
      </button>
    </div>
  )
}
