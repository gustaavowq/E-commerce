'use client'

import { type ReactNode } from 'react'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { Skeleton } from './Skeleton'

export type DataTableColumn<T> = {
  key:       string
  header:    ReactNode
  render:    (row: T, index: number) => ReactNode
  align?:    'left' | 'right' | 'center'
  className?: string
  // Mostra só em desktop (esconde em md-)
  hideOnMobile?: boolean
}

type Props<T> = {
  columns:        DataTableColumn<T>[]
  rows:           T[]
  rowKey:         (row: T) => string
  loading?:       boolean
  // Linha clicável: vira <Link> envolvendo a linha (sem botão dentro de <a>)
  rowHref?:       (row: T) => string
  // Bulk select
  selectable?:    boolean
  selectedIds?:   string[]
  onSelectionChange?: (ids: string[]) => void
}

export function DataTable<T>({
  columns, rows, rowKey, loading, rowHref,
  selectable, selectedIds = [], onSelectionChange,
}: Props<T>) {
  const allSelected = rows.length > 0 && selectedIds.length === rows.length

  function toggleAll() {
    if (!onSelectionChange) return
    onSelectionChange(allSelected ? [] : rows.map(rowKey))
  }
  function toggleOne(id: string) {
    if (!onSelectionChange) return
    onSelectionChange(
      selectedIds.includes(id)
        ? selectedIds.filter(s => s !== id)
        : [...selectedIds, id],
    )
  }

  if (loading) {
    return (
      <div className="overflow-hidden rounded-lg border border-border bg-surface shadow-md">
        <div className="border-b border-border bg-surface-2 px-4 py-3">
          <div className="grid gap-3" style={{ gridTemplateColumns: `repeat(${columns.length + (selectable ? 1 : 0)}, 1fr)` }}>
            {Array.from({ length: columns.length + (selectable ? 1 : 0) }).map((_, i) => (
              <Skeleton key={i} className="h-3" />
            ))}
          </div>
        </div>
        <div className="divide-y divide-border">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="px-4 py-3">
              <div className="grid gap-3" style={{ gridTemplateColumns: `repeat(${columns.length + (selectable ? 1 : 0)}, 1fr)` }}>
                {Array.from({ length: columns.length + (selectable ? 1 : 0) }).map((_, j) => (
                  <Skeleton key={j} className={cn('h-4', j === 0 && 'w-3/4')} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-border bg-surface shadow-md">
      <table className="min-w-full divide-y divide-border">
        <thead className="bg-surface-2 text-left text-[11px] font-semibold uppercase tracking-wide text-text-secondary">
          <tr>
            {selectable && (
              <th className="w-10 px-4 py-2">
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={toggleAll}
                  aria-label="Selecionar todos"
                  className="h-4 w-4 rounded border-border-strong bg-surface accent-primary"
                />
              </th>
            )}
            {columns.map(c => (
              <th
                key={c.key}
                className={cn(
                  'px-4 py-2',
                  c.align === 'right'  && 'text-right',
                  c.align === 'center' && 'text-center',
                  c.hideOnMobile && 'hidden md:table-cell',
                  c.className,
                )}
              >
                {c.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {rows.map((row, i) => {
            const id = rowKey(row)
            const isSelected = selectedIds.includes(id)
            return (
              <tr
                key={id}
                className={cn(
                  'transition-colors',
                  isSelected ? 'bg-primary-soft' : 'hover:bg-surface-2',
                )}
              >
                {selectable && (
                  <td className="w-10 px-4 py-3 align-top">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleOne(id)}
                      aria-label={`Selecionar linha ${i + 1}`}
                      onClick={e => e.stopPropagation()}
                      className="h-4 w-4 rounded border-border-strong bg-surface accent-primary"
                    />
                  </td>
                )}
                {columns.map(c => {
                  const content = c.render(row, i)
                  const cellCls = cn(
                    'px-4 py-3 text-sm align-top',
                    c.align === 'right'  && 'text-right',
                    c.align === 'center' && 'text-center',
                    c.hideOnMobile && 'hidden md:table-cell',
                  )
                  if (rowHref && c.key === columns[0].key) {
                    return (
                      <td key={c.key} className={cellCls}>
                        <Link href={rowHref(row)} className="block hover:text-primary">
                          {content}
                        </Link>
                      </td>
                    )
                  }
                  return <td key={c.key} className={cellCls}>{content}</td>
                })}
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

export function BulkActionBar({ count, children, onClear }: { count: number; children: ReactNode; onClear: () => void }) {
  if (count === 0) return null
  return (
    <div className="sticky bottom-4 z-sticky mx-auto flex max-w-2xl items-center justify-between rounded-lg border border-primary/40 bg-surface-2 p-3 shadow-glow-primary animate-fade-up">
      <p className="text-sm font-semibold text-text">
        <span className="font-mono text-primary">{count}</span> {count === 1 ? 'selecionado' : 'selecionados'}
      </p>
      <div className="flex items-center gap-2">
        {children}
        <button
          onClick={onClear}
          className="rounded-md px-3 py-1.5 text-xs font-semibold text-text-secondary hover:bg-surface-3 hover:text-text"
        >
          Limpar
        </button>
      </div>
    </div>
  )
}
