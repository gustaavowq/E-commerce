// Tabela de variações com stock baixo + velocity (vendas/dia).
// Ordenado por velocity desc → produto que sai rápido prioriza compra.
import Link from 'next/link'
import { AlertTriangle } from 'lucide-react'
import { formatNum } from '@/lib/format'
import type { EstoqueAlertaRow } from '@/services/types'

export function EstoqueAlertaTable({ rows }: { rows: EstoqueAlertaRow[] | undefined }) {
  if (!rows || rows.length === 0) {
    return (
      <div className="flex items-center gap-2 rounded-md bg-success-soft px-4 py-3 text-sm text-success">
        <AlertTriangle className="h-4 w-4" />
        Nenhum produto abaixo do limite. Estoque saudável.
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-border">
        <thead className="bg-surface-2 text-left text-xs font-semibold uppercase tracking-wide text-text-secondary">
          <tr>
            <th className="px-4 py-2">SKU / Produto</th>
            <th className="px-4 py-2">Categoria</th>
            <th className="px-4 py-2 text-right">Estoque</th>
            <th className="px-4 py-2 text-right">Vendas/dia (7d)</th>
            <th className="px-4 py-2 text-right">Dias restantes</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border bg-surface">
          {rows.map((r) => {
            const critical = r.daysUntilOut !== null && r.daysUntilOut < 3
            return (
              <tr key={r.variationId} className="hover:bg-surface-2">
                <td className="px-4 py-3">
                  <Link href={`/products/${r.product.id}`} className="font-medium text-text hover:text-primary">
                    {r.product.name}
                  </Link>
                  <div className="font-mono text-xs text-text-muted">{r.sku} · {r.size}{r.color ? ` · ${r.color}` : ''}</div>
                </td>
                <td className="px-4 py-3">
                  <span className="rounded-pill bg-surface-2 px-2 py-0.5 text-xs font-mono uppercase text-text-secondary">
                    {r.product.hardwareCategory}
                  </span>
                </td>
                <td className="px-4 py-3 text-right font-mono">
                  <span className={r.stock === 0 ? 'text-danger font-semibold' : r.stock < 3 ? 'text-warning font-semibold' : 'text-text'}>
                    {formatNum(r.stock)}
                  </span>
                </td>
                <td className="px-4 py-3 text-right font-mono text-text-secondary">
                  {r.dailyVelocity.toFixed(1)}
                </td>
                <td className="px-4 py-3 text-right font-mono">
                  {r.daysUntilOut === null ? (
                    <span className="text-text-muted">sem vendas</span>
                  ) : (
                    <span className={critical ? 'text-danger font-semibold' : 'text-text-secondary'}>
                      {r.daysUntilOut.toFixed(1)} d
                    </span>
                  )}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
