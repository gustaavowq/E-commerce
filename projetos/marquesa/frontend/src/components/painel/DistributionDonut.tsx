'use client'

// DistributionDonut — donut SVG puro com tons monocromáticos da paleta Marquesa.
// Mostra fatias por tipo de imóvel (apartamento, casa, etc) com legenda à direita.
// Sem libs.

import { useState } from 'react'
import { cn, tipoLabel } from '@/lib/format'

interface Slice {
  label: string
  value: number
  color: string
}

interface DistributionDonutProps {
  data: Array<{ tipo: string; count: number }>
  title?: string
  eyebrow?: string
  className?: string
}

// Paleta monocromática derivada de moss + ash + ink. Sem cor decorativa nova.
const PALETTE = [
  'var(--moss)',
  'var(--moss-deep)',
  'var(--ink)',
  'var(--ash)',
  'var(--ash-soft)',
  'var(--bone-soft)',
]

export function DistributionDonut({
  data,
  title = 'Catálogo por tipo',
  eyebrow = 'Composição',
  className,
}: DistributionDonutProps) {
  const [hover, setHover] = useState<number | null>(null)

  const slices: Slice[] = data
    .filter(d => d.count > 0)
    .map((d, i) => ({
      label: tipoLabel(d.tipo),
      value: d.count,
      color: PALETTE[i % PALETTE.length],
    }))

  const total = slices.reduce((acc, s) => acc + s.value, 0)

  // Donut math
  const size = 200
  const radius = 80
  const stroke = 22
  const cx = size / 2
  const cy = size / 2
  const C = 2 * Math.PI * radius

  let acc = 0
  const arcs = slices.map((slice) => {
    const frac = total > 0 ? slice.value / total : 0
    const length = frac * C
    const dasharray = `${length} ${C - length}`
    const dashoffset = -acc
    acc += length
    return { ...slice, dasharray, dashoffset, frac }
  })

  return (
    <div className={cn('border border-bone bg-paper p-8 flex flex-col gap-6', className)}>
      <header>
        <p className="text-eyebrow uppercase tracking-[0.16em] text-ash">{eyebrow}</p>
        <h3 className="font-display text-heading-lg text-ink mt-1">{title}</h3>
      </header>

      {total === 0 ? (
        <div className="border border-dashed border-bone py-12 px-6 text-center">
          <p className="text-body-sm text-ash">Nenhum imóvel cadastrado.</p>
        </div>
      ) : (
        <div className="flex items-center gap-8 flex-wrap">
          <div className="relative flex-shrink-0" style={{ width: size, height: size }}>
            <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
              {/* Trilho */}
              <circle
                cx={cx} cy={cy} r={radius}
                fill="none" stroke="var(--bone-soft)" strokeWidth={stroke}
              />
              {/* Arcos */}
              {arcs.map((arc, i) => (
                <circle
                  key={i}
                  cx={cx} cy={cy} r={radius}
                  fill="none"
                  stroke={arc.color}
                  strokeWidth={hover === i ? stroke + 2 : stroke}
                  strokeDasharray={arc.dasharray}
                  strokeDashoffset={arc.dashoffset}
                  strokeLinecap="butt"
                  className="transition-[stroke-width] duration-fast"
                  onMouseEnter={() => setHover(i)}
                  onMouseLeave={() => setHover(null)}
                  style={{ cursor: 'pointer' }}
                />
              ))}
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="font-display text-display-md text-ink tnum leading-none">
                {hover != null ? slices[hover].value : total}
              </span>
              <span className="text-caption text-ash mt-1">
                {hover != null
                  ? `${(arcs[hover].frac * 100).toFixed(0)}%`
                  : 'imóveis'}
              </span>
            </div>
          </div>

          <ul className="flex flex-col gap-2 flex-1 min-w-[140px]">
            {arcs.map((arc, i) => (
              <li
                key={i}
                onMouseEnter={() => setHover(i)}
                onMouseLeave={() => setHover(null)}
                className={cn(
                  'flex items-center gap-3 text-body-sm transition-opacity duration-fast cursor-default',
                  hover != null && hover !== i && 'opacity-50',
                )}
              >
                <span
                  className="w-2.5 h-2.5 flex-shrink-0"
                  style={{ background: arc.color }}
                />
                <span className="text-ink truncate flex-1">{arc.label}</span>
                <span className="tnum text-ash">{arc.value}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
