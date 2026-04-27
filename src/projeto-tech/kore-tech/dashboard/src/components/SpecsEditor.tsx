'use client'

// Editor key-value de specs técnicas (RAM size, MHz, latência, etc).
// Mantém ordem de inserção pra manter "Marca / Modelo / Socket" no topo.
// O backend grava como SpecsMap (Record<string, string|number|boolean|null>).

import { useState } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import { Input } from './ui/Input'
import { Button } from './ui/Button'
import type { SpecsMap } from '@/services/types'

type Props = {
  value:    SpecsMap
  onChange: (next: SpecsMap) => void
  // Lista de campos sugeridos por categoria (ex CPU: socket, tdp, cores)
  suggestions?: string[]
}

type Row = { key: string; value: string }

function mapToRows(value: SpecsMap): Row[] {
  return Object.entries(value).map(([key, v]) => ({ key, value: v == null ? '' : String(v) }))
}
function rowsToMap(rows: Row[]): SpecsMap {
  const out: SpecsMap = {}
  for (const { key, value } of rows) {
    const k = key.trim()
    if (!k) continue
    // Tenta inferir number; se NaN, mantém string
    const n = Number(value)
    out[k] = value === '' ? null : Number.isFinite(n) && value.trim() !== '' && /^-?\d+(\.\d+)?$/.test(value.trim()) ? n : value
  }
  return out
}

export function SpecsEditor({ value, onChange, suggestions = [] }: Props) {
  const [rows, setRows] = useState<Row[]>(() => {
    const initial = mapToRows(value)
    return initial.length > 0 ? initial : [{ key: '', value: '' }]
  })

  function update(next: Row[]) {
    setRows(next)
    onChange(rowsToMap(next))
  }
  function addRow(suggestedKey?: string) {
    update([...rows, { key: suggestedKey ?? '', value: '' }])
  }
  function removeRow(idx: number) {
    update(rows.filter((_, i) => i !== idx))
  }
  function setRow(idx: number, patch: Partial<Row>) {
    update(rows.map((r, i) => i === idx ? { ...r, ...patch } : r))
  }

  return (
    <div className="space-y-2">
      <div className="overflow-hidden rounded-md border border-border">
        <table className="w-full">
          <thead>
            <tr className="bg-surface-2 text-left text-[11px] font-semibold uppercase tracking-wide text-text-secondary">
              <th className="px-3 py-2 w-2/5">Atributo</th>
              <th className="px-3 py-2">Valor</th>
              <th className="w-12 px-2 py-2" />
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {rows.map((row, i) => (
              <tr key={i}>
                <td className="px-3 py-2">
                  <Input
                    value={row.key}
                    onChange={e => setRow(i, { key: e.target.value })}
                    placeholder="ex: socket, tdp_w, cores"
                    className="h-9"
                  />
                </td>
                <td className="px-3 py-2">
                  <Input
                    value={row.value}
                    onChange={e => setRow(i, { value: e.target.value })}
                    placeholder="ex: AM5, 105, 8"
                    className="h-9"
                    mono
                  />
                </td>
                <td className="px-2 py-2 text-center">
                  <button
                    type="button"
                    onClick={() => removeRow(i)}
                    aria-label="Remover linha"
                    className="rounded p-1.5 text-text-muted transition-colors hover:bg-danger-soft hover:text-danger"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Button type="button" size="sm" variant="secondary" leftIcon={<Plus className="h-3.5 w-3.5" />} onClick={() => addRow()}>
          Adicionar linha
        </Button>
        {suggestions.length > 0 && (
          <>
            <span className="text-[11px] text-text-muted">Sugestões:</span>
            {suggestions.map(s => (
              <button
                key={s}
                type="button"
                onClick={() => addRow(s)}
                className="rounded-pill border border-border bg-surface px-2.5 py-0.5 text-[11px] text-text-secondary hover:border-primary/40 hover:text-primary"
              >
                + {s}
              </button>
            ))}
          </>
        )}
      </div>
    </div>
  )
}
