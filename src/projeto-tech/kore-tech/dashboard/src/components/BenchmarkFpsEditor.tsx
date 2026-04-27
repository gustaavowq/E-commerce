'use client'

// Editor de FPS estimado por jogo+config. Só faz sentido pra PC montado
// (buildType === 'pc_pronto'). Backend grava como BenchmarkFpsMap.
//
// Sugestões de chave seguem o jargão do nicho — ex: 'valorant_1080p_high'.
// Cliente novato lê 'Valorant 1080p high · 240 FPS' na PDP, fica claro.

import { useState } from 'react'
import { Plus, Trash2, Gauge } from 'lucide-react'
import { Input } from './ui/Input'
import { Select } from './ui/Select'
import { Button } from './ui/Button'
import type { BenchmarkFpsMap } from '@/services/types'

type Props = {
  value:    BenchmarkFpsMap | null
  onChange: (next: BenchmarkFpsMap) => void
}

const GAME_PRESETS = [
  'Valorant',
  'CS2',
  'Fortnite',
  'League of Legends',
  'Dota 2',
  'Cyberpunk 2077',
  'Baldur\'s Gate 3',
  'Starfield',
  'GTA V',
  'Apex Legends',
  'Call of Duty: Warzone',
  'Edição vídeo 4K (Premiere)',
  'Render Blender',
  'IA Local Llama 7B',
  'IA Local Llama 70B',
]
const RESOLUTION_PRESETS = ['1080p', '1440p', '4K']
const QUALITY_PRESETS    = ['low', 'medium', 'high', 'ultra', 'competitivo', 'epic']

type Row = { game: string; res: string; quality: string; fps: string }

function mapToRows(value: BenchmarkFpsMap | null): Row[] {
  if (!value) return []
  return Object.entries(value).map(([key, fps]) => {
    // Tenta parsear "valorant_1080p_high" → game=Valorant res=1080p quality=high
    const parts = key.split('_')
    return { game: parts[0] || key, res: parts[1] ?? '', quality: parts.slice(2).join('_'), fps: String(fps) }
  })
}
function rowsToMap(rows: Row[]): BenchmarkFpsMap {
  const out: BenchmarkFpsMap = {}
  for (const r of rows) {
    if (!r.game.trim()) continue
    const fps = Number(r.fps)
    if (!Number.isFinite(fps) || fps <= 0) continue
    const slug = [r.game.trim().toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, ''), r.res, r.quality]
      .filter(Boolean)
      .join('_')
    out[slug] = fps
  }
  return out
}

export function BenchmarkFpsEditor({ value, onChange }: Props) {
  const [rows, setRows] = useState<Row[]>(() => {
    const initial = mapToRows(value)
    return initial.length > 0 ? initial : []
  })

  function update(next: Row[]) {
    setRows(next)
    onChange(rowsToMap(next))
  }
  function addRow(presetGame?: string) {
    update([...rows, { game: presetGame ?? '', res: '1080p', quality: 'high', fps: '' }])
  }
  function setRow(idx: number, patch: Partial<Row>) {
    update(rows.map((r, i) => i === idx ? { ...r, ...patch } : r))
  }
  function removeRow(idx: number) { update(rows.filter((_, i) => i !== idx)) }

  return (
    <div className="space-y-3">
      <div className="rounded-md border border-primary/30 bg-primary-soft p-3 text-xs text-text">
        <p className="font-semibold text-primary inline-flex items-center gap-1.5"><Gauge className="h-3.5 w-3.5" /> FPS estimado</p>
        <p className="mt-1 text-text-secondary">
          Aparece em destaque no card do PC (font mono cyan). Curado manualmente pra MVP. Cliente lê <code className="font-mono text-text">Valorant 1080p high · 240 FPS</code>.
        </p>
      </div>

      {rows.length > 0 && (
        <div className="overflow-hidden rounded-md border border-border">
          <table className="w-full">
            <thead>
              <tr className="bg-surface-2 text-left text-[11px] font-semibold uppercase tracking-wide text-text-secondary">
                <th className="px-3 py-2">Jogo</th>
                <th className="px-3 py-2 w-24">Resolução</th>
                <th className="px-3 py-2 w-32">Qualidade</th>
                <th className="px-3 py-2 w-24 text-right">FPS</th>
                <th className="w-12 px-2 py-2" />
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {rows.map((row, i) => (
                <tr key={i}>
                  <td className="px-3 py-2">
                    <Input value={row.game} onChange={e => setRow(i, { game: e.target.value })} placeholder="Jogo" className="h-9" />
                  </td>
                  <td className="px-3 py-2">
                    <Select value={row.res} onChange={e => setRow(i, { res: e.target.value })} className="h-9">
                      <option value="">—</option>
                      {RESOLUTION_PRESETS.map(r => <option key={r} value={r}>{r}</option>)}
                    </Select>
                  </td>
                  <td className="px-3 py-2">
                    <Select value={row.quality} onChange={e => setRow(i, { quality: e.target.value })} className="h-9">
                      <option value="">—</option>
                      {QUALITY_PRESETS.map(q => <option key={q} value={q}>{q}</option>)}
                    </Select>
                  </td>
                  <td className="px-3 py-2">
                    <Input
                      type="number" min={1} max={1000}
                      value={row.fps}
                      onChange={e => setRow(i, { fps: e.target.value })}
                      placeholder="240"
                      className="h-9 text-right"
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
      )}

      <div className="flex flex-wrap items-center gap-2">
        <Button type="button" size="sm" variant="secondary" leftIcon={<Plus className="h-3.5 w-3.5" />} onClick={() => addRow()}>
          Adicionar jogo
        </Button>
        <span className="text-[11px] text-text-muted">Sugestões:</span>
        {GAME_PRESETS.slice(0, 8).map(g => (
          <button
            key={g}
            type="button"
            onClick={() => addRow(g)}
            className="rounded-pill border border-border bg-surface px-2.5 py-0.5 text-[11px] text-text-secondary hover:border-primary/40 hover:text-primary"
          >
            + {g}
          </button>
        ))}
      </div>
    </div>
  )
}
