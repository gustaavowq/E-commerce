'use client'

import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from './ui/Button'

type Props = {
  page:       number
  totalPages: number
  total?:     number
  onChange:   (page: number) => void
}

export function Pagination({ page, totalPages, total, onChange }: Props) {
  if (totalPages <= 1) return null
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-xs text-text-secondary">
        Página <span className="font-mono font-semibold text-text">{page}</span> de <span className="font-mono font-semibold text-text">{totalPages}</span>
        {typeof total === 'number' && <span className="ml-2 text-text-muted">· {total} itens</span>}
      </p>
      <div className="flex gap-1">
        <Button size="sm" variant="secondary" disabled={page <= 1} onClick={() => onChange(page - 1)} leftIcon={<ChevronLeft className="h-4 w-4" />}>
          Anterior
        </Button>
        <Button size="sm" variant="secondary" disabled={page >= totalPages} onClick={() => onChange(page + 1)} rightIcon={<ChevronRight className="h-4 w-4" />}>
          Próxima
        </Button>
      </div>
    </div>
  )
}
