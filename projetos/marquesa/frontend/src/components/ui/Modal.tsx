'use client'

import { useEffect, type ReactNode } from 'react'
import { cn } from '@/lib/format'

interface ModalProps {
  open: boolean
  onClose: () => void
  title?: string
  children: ReactNode
  size?: 'sm' | 'md' | 'lg'
}

const sizeClass = {
  sm: 'max-w-md',
  md: 'max-w-2xl',
  lg: 'max-w-4xl',
}

export function Modal({ open, onClose, title, children, size = 'md' }: ModalProps) {
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [open, onClose])

  if (!open) return null

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={title}
      className="fixed inset-0 z-50 flex items-center justify-center px-4"
    >
      <div
        className="absolute inset-0 bg-ink/60 animate-fade-in"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        className={cn(
          'relative w-full bg-paper shadow-modal animate-fade-in max-h-[90vh] overflow-auto',
          sizeClass[size],
        )}
      >
        {title && (
          <header className="px-8 py-6 border-b border-bone flex items-center justify-between">
            <h2 className="font-display text-heading-lg text-ink">{title}</h2>
            <button
              onClick={onClose}
              aria-label="Fechar"
              className="text-ash hover:text-ink transition-colors duration-fast text-2xl leading-none"
            >
              ×
            </button>
          </header>
        )}
        <div className="px-8 py-6">{children}</div>
      </div>
    </div>
  )
}
