// LineChart de receita diária. Recharts + cyan elétrico no Kore Tech tema.
'use client'

import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid,
} from 'recharts'
import { formatBRL, formatDate } from '@/lib/format'
import type { RevenuePoint } from '@/services/types'

export function RevenueChart({ data }: { data: RevenuePoint[] | undefined }) {
  if (!data || data.length === 0 || !data.some(d => d.total > 0)) {
    return (
      <div className="flex h-72 items-center justify-center text-sm text-text-muted">
        Nenhum pedido pago no período
      </div>
    )
  }

  return (
    <div className="h-72">
      <ResponsiveContainer>
        <LineChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1E2530" />
          <XAxis
            dataKey="date"
            tickFormatter={(d: string) => d.slice(5)}
            fontSize={11}
            stroke="#5A6573"
          />
          <YAxis
            tickFormatter={(v: number) => v >= 1000 ? `R$${(v / 1000).toFixed(0)}k` : `R$${v}`}
            fontSize={11}
            stroke="#5A6573"
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#1B2230',
              border: '1px solid #2A3240',
              borderRadius: 8,
              color: '#E8EEF5',
            }}
            formatter={(v: number, name: string) =>
              name === 'total' ? [formatBRL(v), 'Receita'] : [v, 'Pedidos']
            }
            labelFormatter={(l: string) => formatDate(l)}
          />
          <Line
            type="monotone"
            dataKey="total"
            stroke="#00E5FF"
            strokeWidth={2}
            dot={{ r: 3, fill: '#00E5FF' }}
            activeDot={{ r: 5, fill: '#00E5FF' }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
