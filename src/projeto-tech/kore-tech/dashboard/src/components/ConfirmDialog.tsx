'use client'

import { useEffect } from 'react'
import { AlertTriangle, X } from 'lucide-react'
import { Button } from './ui/Button'

type Props = {
  open:        boolean
  title:       string
  description: string
  confirmLabel?: string
  cancelLabel?:  string
  destructive?:  boolean
  loading?:      boolean
  onConfirm:   () => void
  onClose:     () => void
}

export function ConfirmDialog({
  open, title, description, confirmLabel = 'Confirmar', cancelLabel = 'Cancelar',
  destructive, loading, onConfirm, onClose,
}: Props) {
  useEffect(() => {
    if (!open) return
    function onEsc(e: KeyboardEvent) { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onEsc)
    return () => document.removeEventListener('keydown', onEsc)
  }, [open, onClose])

  if (!open) return null
  return (
    <div className="fixed inset-0 z-modal flex items-center justify-center p-4 animate-fade-in">
      <div className="absolute inset-0 bg-bg/70 backdrop-blur-sm" onClick={onClose} />
      <div role="dialog" aria-modal="true" aria-labelledby="confirm-title" className="relative w-full max-w-md rounded-xl border border-border bg-surface p-6 shadow-xl animate-scale-in">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-md p-1 text-text-secondary hover:bg-surface-2 hover:text-text"
          aria-label="Fechar"
        >
          <X className="h-4 w-4" />
        </button>
        <div className="flex items-start gap-3">
          {destructive && (
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-pill bg-danger-soft text-danger">
              <AlertTriangle className="h-5 w-5" />
            </span>
          )}
          <div className="flex-1">
            <h2 id="confirm-title" className="text-lg font-bold text-text">{title}</h2>
            <p className="mt-1 text-sm text-text-secondary">{description}</p>
          </div>
        </div>
        <div className="mt-5 flex justify-end gap-2">
          <Button variant="secondary" onClick={onClose} disabled={loading}>{cancelLabel}</Button>
          <Button variant={destructive ? 'danger' : 'primary'} onClick={onConfirm} loading={loading}>{confirmLabel}</Button>
        </div>
      </div>
    </div>
  )
}
