'use client'

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react'
import { CheckCircle2, AlertTriangle, XCircle, Info, X } from 'lucide-react'
import { cn } from '@/lib/utils'

type ToastVariant = 'success' | 'warning' | 'danger' | 'info'

type ToastInput = {
  title?: string
  message: string
  variant?: ToastVariant
  duration?: number
}

type ToastEntry = ToastInput & { id: string }

type ToastContext = {
  push: (toast: ToastInput) => void
}

const ToastCtx = createContext<ToastContext | null>(null)

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastEntry[]>([])

  const push = useCallback((t: ToastInput) => {
    const id = `t-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
    setToasts((prev) => [...prev, { ...t, id, variant: t.variant ?? 'info' }])
  }, [])

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  return (
    <ToastCtx.Provider value={{ push }}>
      {children}
      <div
        aria-live="polite"
        aria-atomic="true"
        className="pointer-events-none fixed bottom-4 left-4 right-4 z-[400] flex flex-col items-end gap-2 sm:bottom-auto sm:left-auto sm:right-4 sm:top-4"
      >
        {toasts.map((t) => (
          <ToastCard key={t.id} entry={t} onDismiss={() => dismiss(t.id)} />
        ))}
      </div>
    </ToastCtx.Provider>
  )
}

const ICON: Record<ToastVariant, React.ComponentType<{ className?: string }>> = {
  success: CheckCircle2,
  warning: AlertTriangle,
  danger: XCircle,
  info: Info,
}

const ACCENT: Record<ToastVariant, string> = {
  success: 'border-success/40 border-l-success text-success',
  warning: 'border-warning/40 border-l-warning text-warning',
  danger: 'border-danger/40 border-l-danger text-danger',
  info: 'border-primary/40 border-l-primary text-primary',
}

function ToastCard({ entry, onDismiss }: { entry: ToastEntry; onDismiss: () => void }) {
  const variant = entry.variant ?? 'info'
  const Icon = ICON[variant]
  const duration = entry.duration ?? 5000

  useEffect(() => {
    if (!duration) return
    const t = setTimeout(onDismiss, duration)
    return () => clearTimeout(t)
  }, [duration, onDismiss])

  return (
    <div
      role="status"
      className={cn(
        'pointer-events-auto w-full max-w-sm rounded-md border border-l-4 bg-surface-2 p-4 shadow-lg animate-fade-up',
        ACCENT[variant],
      )}
    >
      <div className="flex items-start gap-3">
        <Icon className="mt-0.5 h-4 w-4 shrink-0" />
        <div className="flex-1 text-text">
          {entry.title && <p className="text-sm font-semibold">{entry.title}</p>}
          <p className="text-sm text-text-secondary">{entry.message}</p>
        </div>
        <button
          type="button"
          onClick={onDismiss}
          aria-label="Fechar notificacao"
          className="-mr-1 -mt-1 flex h-6 w-6 items-center justify-center rounded text-text-muted hover:text-text"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  )
}

export function useToast() {
  const ctx = useContext(ToastCtx)
  if (!ctx) {
    // No-op fallback (sem provider em SSR / testes). Loga.
    return {
      push: (t: ToastInput) => {
        if (typeof console !== 'undefined') console.warn('[Toast] sem provider:', t.message)
      },
    }
  }
  return ctx
}
