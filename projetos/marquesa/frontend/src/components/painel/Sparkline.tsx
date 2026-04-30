// Sparkline SVG puro — sem dep extra. 60×20px default.
// Renderiza linha + área-fill sutil. Usado em KpiCard.

interface SparklineProps {
  data: number[]
  width?: number
  height?: number
  stroke?: string  // tailwind class é externo; aqui fica color literal pra SVG
  fill?: string    // gradient-friendly: usa linearGradient inline
  className?: string
}

export function Sparkline({
  data,
  width = 64,
  height = 20,
  stroke = 'var(--moss)',
  fill = 'var(--moss)',
  className,
}: SparklineProps) {
  if (!data.length) {
    return (
      <svg width={width} height={height} className={className} aria-hidden="true">
        <line
          x1={0} y1={height / 2} x2={width} y2={height / 2}
          stroke="var(--bone)" strokeWidth={1} strokeDasharray="2 2"
        />
      </svg>
    )
  }

  const max = Math.max(...data, 1)
  const min = Math.min(...data, 0)
  const range = Math.max(max - min, 1)
  const stepX = data.length > 1 ? width / (data.length - 1) : width
  const padY = 2

  const points = data.map((v, i) => {
    const x = i * stepX
    const y = height - padY - ((v - min) / range) * (height - padY * 2)
    return [x, y] as const
  })

  const linePath = points
    .map(([x, y], i) => `${i === 0 ? 'M' : 'L'} ${x.toFixed(2)} ${y.toFixed(2)}`)
    .join(' ')

  const areaPath =
    `${linePath} L ${width.toFixed(2)} ${height} L 0 ${height} Z`

  // gradient id único por instância (data hash simples)
  const gid = `spark-grad-${data.length}-${Math.round((data[0] ?? 0) * 100)}`

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className={className}
      aria-hidden="true"
      preserveAspectRatio="none"
    >
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={fill} stopOpacity="0.25" />
          <stop offset="100%" stopColor={fill} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={areaPath} fill={`url(#${gid})`} />
      <path d={linePath} stroke={stroke} strokeWidth={1.25} fill="none"
            strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  )
}
