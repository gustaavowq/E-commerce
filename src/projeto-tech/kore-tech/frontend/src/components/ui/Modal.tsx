'use client'

import { useEffect, useRef, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'

type Props = {
  open: boolean
  onClose: () => void
  title?: string
  children: ReactNode
  footer?: ReactNode
  size?: 'sm' | 'md' | 'lg'
  hideClose?: boolean
}

const SIZE: Record<NonNullable<Props['size']>, string> = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
}

/**
 * Modal padrao do Kore Tech (Designer COMPONENT-SPECS sec. 8).
 * - ESC fecha
 * - clique no overlay fecha
 * - role=dialog + aria-modal
 * - Foco trap simples (foco volta no fechamento)
 */
export function Modal({ open, onClose, title, children, footer, size = 'md', hideClose }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const previousFocusRef = useRef<HTMLElement | null>(null)

  useEffect(() => {
    if (!open) return
    previousFocusRef.current = document.activeElement as HTMLElement | null
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
      previousFocusRef.current?.focus?.()
    }
  }, [open, onClose])

  useEffect(() => {
    if (open && containerRef.current) {
      const target = containerRef.current.querySelector<HTMLElement>(
        'input, button, [tabindex]:not([tabindex="-1"])',
      )
      target?.focus()
    }
  }, [open])

  if (typeof document === 'undefined') return null
  if (!open) return null

  const titleId = title ? 'modal-title' : undefined

  return createPortal(
    <div
      role="presentation"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
      className="fixed inset-0 z-[300] flex items-center justify-center bg-bg/80 backdrop-blur-sm px-4 animate-fade-in"
    >
      <div
        ref={containerRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className={cn(
          'w-full overflow-hidden rounded-xl border border-border-strong bg-surface-2 shadow-xl animate-scale-in',
          SIZE[size],
        )}
      >
        {(title || !hideClose) && (
          <div className="flex items-start justify-between border-b border-border px-6 py-4">
            {title ? (
              <h2 id={titleId} className="text-lg font-semibold text-text">
                {title}
              </h2>
            ) : (
              <span />
            )}
            {!hideClose && (
              <button
                type="button"
                onClick={onClose}
                aria-label="Fechar"
                className="-mr-2 -mt-1 flex h-10 w-10 items-center justify-center rounded-md text-text-muted hover:bg-surface-3 hover:text-text"
              >
                <X className="h-5 w-5" />
              </button>
            )}
          </div>
        )}
        <div className="px-6 py-5">{children}</div>
        {footer && (
          <div className="flex items-center justify-end gap-3 border-t border-border px-6 py-4">
            {footer}
          </div>
        )}
      </div>
    </div>,
    document.body,
  )
}
