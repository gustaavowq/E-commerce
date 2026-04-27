// Tabela de personas com revenue, orders e conversionRate (quando disponível).
// Quando BuilderEvent não está populado ainda, conversionRate vem null e
// renderizamos "—" + tooltip explicativo (sem ruído visual).
import { formatBRL, formatNum } from '@/lib/format'
import type { PersonaConversionRow } from '@/services/types'

export function PersonaConversionTable({ rows }: { rows: PersonaConversionRow[] | undefined }) {
  if (!rows || rows.length === 0) {
    return <p className="text-sm text-text-secondary">Nenhuma persona com vendas no período.</p>
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-border">
        <thead className="bg-surface-2 text-left text-xs font-semibold uppercase tracking-wide text-text-secondary">
          <tr>
            <th className="px-4 py-2">Persona</th>
            <th className="px-4 py-2 text-right">Visitas</th>
            <th className="px-4 py-2 text-right">Pedidos</th>
            <th className="px-4 py-2 text-right">Receita</th>
            <th className="px-4 py-2 text-right">Conversão</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border bg-surface">
          {rows.map((p) => (
            <tr key={p.slug} className="hover:bg-surface-2">
              <td className="px-4 py-3">
                <div className="flex items-center gap-2">
                  {p.iconEmoji && <span className="text-base">{p.iconEmoji}</span>}
                  <span className="font-medium text-text">{p.name}</span>
                </div>
              </td>
              <td className="px-4 py-3 text-right font-mono text-text-secondary">
                {p.visits === null ? <span title="Evento view_persona ainda não rastreado (ver KPIS.md)">—</span> : formatNum(p.visits)}
              </td>
              <td className="px-4 py-3 text-right font-mono text-text">{formatNum(p.orders)}</td>
              <td className="px-4 py-3 text-right font-mono font-semibold text-text">{formatBRL(p.revenue)}</td>
              <td className="px-4 py-3 text-right font-mono">
                {p.conversionRate === null ? (
                  <span className="text-text-muted">—</span>
                ) : (
                  <span className={p.conversionRate >= 1 ? 'text-success' : 'text-text-secondary'}>
                    {p.conversionRate.toFixed(2)}%
                  </span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
