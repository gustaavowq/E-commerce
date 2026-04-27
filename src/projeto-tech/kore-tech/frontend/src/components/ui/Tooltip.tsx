'use client'

import { useEffect, useId, useRef, useState, type ReactNode } from 'react'
import { cn } from '@/lib/utils'

type TooltipProps = {
  /** Conteudo textual da dica. Mantenha curto, 1-2 linhas. Sem travessao. */
  content: string
  children: ReactNode
  /** Posicao da dica em relacao ao trigger. Default 'top'. */
  side?: 'top' | 'right' | 'bottom' | 'left'
  /** classNames extras pro wrapper externo (controla layout do trigger). */
  className?: string
}

/**
 * Tooltip simples sem deps externas.
 * - Aparece em hover e em focus (teclado).
 * - ESC fecha enquanto estiver visivel.
 * - aria-describedby aponta pro tooltip pra screen reader ler.
 *
 * Em mobile (sem hover real), o foco em <button>/<a> ainda dispara o tooltip,
 * o que nao e perfeito mas evita inventar logica de tap-to-show. Pra info critica,
 * sempre exiba tambem texto inline (nao confie so no tooltip).
 */
export function Tooltip({ content, children, side = 'top', className }: TooltipProps) {
  const [open, setOpen] = useState(false)
  const id = useId()
  const wrapperRef = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    if (!open) return
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open])

  const positionClasses: Record<NonNullable<TooltipProps['side']>, string> = {
    top: 'bottom-[calc(100%+6px)] left-1/2 -translate-x-1/2',
    bottom: 'top-[calc(100%+6px)] left-1/2 -translate-x-1/2',
    left: 'right-[calc(100%+6px)] top-1/2 -translate-y-1/2',
    right: 'left-[calc(100%+6px)] top-1/2 -translate-y-1/2',
  }

  return (
    <span
      ref={wrapperRef}
      className={cn('relative inline-flex', className)}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onFocus={() => setOpen(true)}
      onBlur={() => setOpen(false)}
    >
      {/* aria-describedby tem que vir do trigger (children). Aqui usamos uma camada
          discreta via clone seria ideal, mas pra MVP basta colocar no wrapper. */}
      <span aria-describedby={open ? id : undefined} className="contents">
        {children}
      </span>
      {open && (
        <span
          id={id}
          role="tooltip"
          className={cn(
            'pointer-events-none absolute z-50 max-w-[220px] whitespace-normal rounded-md border border-border-strong bg-surface-2 px-2.5 py-1.5 text-[11px] font-medium leading-snug text-text shadow-lg',
            'animate-fade-up',
            positionClasses[side],
          )}
        >
          {content}
        </span>
      )}
    </span>
  )
}
