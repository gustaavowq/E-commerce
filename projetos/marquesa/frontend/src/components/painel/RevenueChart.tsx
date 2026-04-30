'use client'

// RevenueChart — área SVG puro com gradient + tooltip on hover.
// Aceita série de pontos {day, valor}. Eixo Y formatado em R$, eixo X com datas.
// Sem libs. Renderiza estado vazio se data.length === 0.

import { useState } from 'react'
import { formatBRL, cn } from '@/lib/format'

interface Point {
  day: string  // YYYY-MM-DD
  valor: number
}

interface RevenueChartProps {
  data: Point[]
  title?: string
  eyebrow?: string
  className?: string
  height?: number
  emptyMessage?: string
}

export function RevenueChart({
  data,
  title = 'Receita por dia',
  eyebrow = 'Últimos 30 dias',
  className,
  height = 280,
  emptyMessage = 'Sem receita confirmada no período. Os dados aparecem quando o primeiro sinal for pago.',
}: RevenueChartProps) {
  const [hover, setHover] = useState<number | null>(null)

  const total = data.reduce((acc, p) => acc + p.valor, 0)
  const hasData = data.some(p => p.valor > 0)
  const max = Math.max(...data.map(p => p.valor), 1)

  // Layout
  const W = 800
  const H = height
  const padL = 56
  const padR = 24
  const padT = 16
  const padB = 32
  const innerW = W - padL - padR
  const innerH = H - padT - padB

  const stepX = data.length > 1 ? innerW / (data.length - 1) : innerW

  const points = data.map((p, i) => {
    const x = padL + i * stepX
    const y = padT + innerH - (p.valor / max) * innerH
    return { x, y, ...p }
  })

  const linePath = points
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(2)} ${p.y.toFixed(2)}`)
    .join(' ')

  const areaPath = points.length
    ? `${linePath} L ${points[points.length - 1].x.toFixed(2)} ${padT + innerH} L ${points[0].x.toFixed(2)} ${padT + innerH} Z`
    : ''

  // Y-axis ticks: 4 níveis
  const yTicks = [0, 0.25, 0.5, 0.75, 1].map(t => ({
    v:    max * t,
    y:    padT + innerH - t * innerH,
  }))

  // X labels: primeiro, meio, último
  const xLabelsIdx = data.length >= 3
    ? [0, Math.floor(data.length / 2), data.length - 1]
    : data.map((_, i) => i)

  return (
    <div className={cn('border border-bone bg-paper p-8 flex flex-col gap-6', className)}>
      <header className="flex items-baseline justify-between gap-4 flex-wrap">
        <div>
          <p className="text-eyebrow uppercase tracking-[0.16em] text-ash">{eyebrow}</p>
          <h3 className="font-display text-heading-lg text-ink mt-1">{title}</h3>
        </div>
        <p className="text-body-sm text-ash tnum">
          Total <span className="text-ink font-medium">{formatBRL(total)}</span>
        </p>
      </header>

      {!hasData ? (
        <div className="border border-dashed border-bone py-16 px-6 text-center">
          <p className="text-body-sm text-ash">{emptyMessage}</p>
        </div>
      ) : (
        <div className="relative">
          <svg
            viewBox={`0 0 ${W} ${H}`}
            preserveAspectRatio="none"
            className="w-full"
            style={{ height: `${H}px` }}
            onMouseLeave={() => setHover(null)}
          >
            <defs>
              <linearGradient id="rev-grad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%"   stopColor="var(--moss)" stopOpacity="0.20" />
                <stop offset="100%" stopColor="var(--moss)" stopOpacity="0" />
              </linearGradient>
            </defs>

            {/* Y grid + labels */}
            {yTicks.map((t, i) => (
              <g key={i}>
                <line
                  x1={padL} y1={t.y} x2={W - padR} y2={t.y}
                  stroke="var(--bone)" strokeWidth={1}
                  strokeDasharray={i === 0 ? '0' : '2 4'}
                />
                <text
                  x={padL - 8} y={t.y + 4}
                  textAnchor="end"
                  fontSize="10"
                  fill="var(--ash)"
                  className="tnum"
                >
                  {compactBRL(t.v)}
                </text>
              </g>
            ))}

            {/* Área + linha */}
            <path d={areaPath} fill="url(#rev-grad)" />
            <path
              d={linePath}
              stroke="var(--moss)"
              strokeWidth={1.75}
              fill="none"
              strokeLinejoin="round"
              strokeLinecap="round"
            />

            {/* Hover hit-areas (uma faixa por ponto) */}
            {points.map((p, i) => {
              const hitW = stepX
              const hitX = p.x - hitW / 2
              return (
                <rect
                  key={i}
                  x={Math.max(padL, hitX)}
                  y={padT}
                  width={Math.min(hitW, W - padR - Math.max(padL, hitX))}
                  height={innerH}
                  fill="transparent"
                  onMouseEnter={() => setHover(i)}
                />
              )
            })}

            {/* Hover dot + linha vertical */}
            {hover != null && points[hover] && (
              <g>
                <line
                  x1={points[hover].x} y1={padT}
                  x2={points[hover].x} y2={padT + innerH}
                  stroke="var(--ash-soft)" strokeWidth={1} strokeDasharray="2 3"
                />
                <circle
                  cx={points[hover].x} cy={points[hover].y} r={3.5}
                  fill="var(--paper)" stroke="var(--moss)" strokeWidth={1.5}
                />
              </g>
            )}

            {/* X labels */}
            {xLabelsIdx.map((i) => (
              <text
                key={i}
                x={points[i]?.x}
                y={H - 10}
                textAnchor={i === 0 ? 'start' : i === data.length - 1 ? 'end' : 'middle'}
                fontSize="10"
                fill="var(--ash)"
              >
                {formatDay(data[i]?.day)}
              </text>
            ))}
          </svg>

          {/* Tooltip flutuante */}
          {hover != null && points[hover] && (
            <div
              className="pointer-events-none absolute -translate-x-1/2 -translate-y-full bg-graphite text-paper px-3 py-2 text-caption whitespace-nowrap"
              style={{
                left: `${(points[hover].x / W) * 100}%`,
                top:  `${(points[hover].y / H) * 100}%`,
                marginTop: '-8px',
              }}
            >
              <div className="text-paper/60 mb-0.5">{formatDayLong(data[hover].day)}</div>
              <div className="tnum">{formatBRL(data[hover].valor)}</div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function compactBRL(n: number): string {
  if (n >= 1_000_000) return `R$ ${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000)     return `R$ ${(n / 1_000).toFixed(0)}k`
  return `R$ ${n.toFixed(0)}`
}

function formatDay(iso?: string): string {
  if (!iso) return ''
  const d = new Date(iso + 'T00:00:00')
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
}

function formatDayLong(iso?: string): string {
  if (!iso) return ''
  const d = new Date(iso + 'T00:00:00')
  return d.toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: 'short' })
}
