'use client'

import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import { CheckCircle2, Info, AlertCircle, X } from 'lucide-react'
import { cn } from '@/lib/utils'

export type ToastTone = 'success' | 'info' | 'warning' | 'error'

type ToastItem = {
  id:    string
  title: string
  body?: string
  tone:  ToastTone
}

type Ctx = {
  push: (t: Omit<ToastItem, 'id'>) => void
}

const ToastCtx = createContext<Ctx | null>(null)

export function useToast() {
  const ctx = useContext(ToastCtx)
  if (!ctx) throw new Error('useToast precisa do ToastProvider')
  return ctx
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([])

  const push = useCallback<Ctx['push']>((t) => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
    setToasts(curr => [...curr, { ...t, id }])
  }, [])

  const dismiss = useCallback((id: string) => {
    setToasts(curr => curr.filter(t => t.id !== id))
  }, [])

  return (
    <ToastCtx.Provider value={{ push }}>
      {children}
      <div className="pointer-events-none fixed bottom-4 right-4 z-[60] flex w-full max-w-sm flex-col gap-2">
        {toasts.map(t => (
          <ToastCard key={t.id} toast={t} onClose={() => dismiss(t.id)} />
        ))}
      </div>
    </ToastCtx.Provider>
  )
}

function ToastCard({ toast, onClose }: { toast: ToastItem; onClose: () => void }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 6000)
    return () => clearTimeout(timer)
  }, [onClose])

  const Icon = toast.tone === 'success' ? CheckCircle2
            : toast.tone === 'warning' ? AlertCircle
            : toast.tone === 'error'   ? AlertCircle
            : Info

  const tone = toast.tone === 'success' ? 'border-success/40 bg-white text-success'
            : toast.tone === 'warning' ? 'border-warning/40 bg-white text-warning'
            : toast.tone === 'error'   ? 'border-error/40 bg-white text-error'
            : 'border-primary-700/30 bg-white text-primary-700'

  return (
    <div
      role="status"
      className={cn(
        'pointer-events-auto flex items-start gap-3 rounded-lg border px-4 py-3 shadow-lg',
        'animate-fade-up',
        tone,
      )}
    >
      <Icon className="mt-0.5 h-5 w-5 shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-ink">{toast.title}</p>
        {toast.body && <p className="mt-0.5 text-xs text-ink-2">{toast.body}</p>}
      </div>
      <button
        onClick={onClose}
        aria-label="Fechar"
        className="shrink-0 rounded-md p-1 text-ink-3 transition hover:bg-surface-2 hover:text-ink"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  )
}
