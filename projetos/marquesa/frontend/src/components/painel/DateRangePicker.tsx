'use client'

// DateRangePicker — presets simples (7d/30d/90d/12m). Estado local; refetch a cargo do parent.

import { useEffect, useRef, useState } from 'react'
import { cn } from '@/lib/format'

export type RangePreset = '7d' | '30d' | '90d' | '12m'

interface DateRangePickerProps {
  value: RangePreset
  onChange: (next: RangePreset) => void
  className?: string
}

const PRESETS: Array<{ key: RangePreset; label: string; days: number }> = [
  { key: '7d',  label: '7 dias',   days: 7   },
  { key: '30d', label: '30 dias',  days: 30  },
  { key: '90d', label: '90 dias',  days: 90  },
  { key: '12m', label: '12 meses', days: 365 },
]

export function DateRangePicker({ value, onChange, className }: DateRangePickerProps) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (open && ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onClick)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onClick)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  const current = PRESETS.find(p => p.key === value) ?? PRESETS[1]

  return (
    <div ref={ref} className={cn('relative', className)}>
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="inline-flex items-center gap-2 border border-bone bg-paper px-4 py-2 text-body-sm text-ink hover:border-ash-soft transition-colors duration-fast"
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span className="text-ash text-caption uppercase tracking-[0.04em]">Período</span>
        <span className="font-medium">{current.label}</span>
        <svg
          width="12" height="12" viewBox="0 0 12 12"
          className={cn('transition-transform duration-fast', open && 'rotate-180')}
          aria-hidden="true"
        >
          <path d="M2 4 L6 8 L10 4" stroke="currentColor" strokeWidth="1.25" fill="none" strokeLinejoin="round" />
        </svg>
      </button>

      {open && (
        <ul
          role="listbox"
          className="absolute right-0 top-full mt-1 z-10 min-w-full bg-paper border border-bone shadow-sticky"
        >
          {PRESETS.map(p => (
            <li key={p.key}>
              <button
                type="button"
                role="option"
                aria-selected={p.key === value}
                onClick={() => { onChange(p.key); setOpen(false) }}
                className={cn(
                  'w-full text-left px-4 py-2 text-body-sm whitespace-nowrap transition-colors duration-fast',
                  p.key === value
                    ? 'bg-paper-warm text-ink font-medium'
                    : 'text-ash hover:bg-paper-warm hover:text-ink',
                )}
              >
                {p.label}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
