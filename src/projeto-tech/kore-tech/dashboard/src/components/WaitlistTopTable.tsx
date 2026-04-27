// Top N produtos com mais subscribers ativos na waitlist.
// Cor: vermelho > 14 dias, amarelo > 7 dias, neutro < 7 dias.
import Link from 'next/link'
import { Bell, Clock } from 'lucide-react'
import { formatNum } from '@/lib/format'
import type { WaitlistTopRow } from '@/services/types'

export function WaitlistTopTable({ rows }: { rows: WaitlistTopRow[] | undefined }) {
  if (!rows || rows.length === 0) {
    return (
      <div className="flex items-center gap-2 rounded-md bg-info-soft px-4 py-3 text-sm text-info">
        <Bell className="h-4 w-4" />
        Nenhum cliente esperando produto fora de estoque.
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-border">
        <thead className="bg-surface-2 text-left text-xs font-semibold uppercase tracking-wide text-text-secondary">
          <tr>
            <th className="px-4 py-2">Produto</th>
            <th className="px-4 py-2">Categoria</th>
            <th className="px-4 py-2 text-right">Esperando</th>
            <th className="px-4 py-2 text-right">
              <span className="inline-flex items-center gap-1">
                <Clock className="h-3 w-3" />
                + antigo
              </span>
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border bg-surface">
          {rows.map((r) => {
            const stale = r.daysWaiting > 14
            const aging = r.daysWaiting > 7
            return (
              <tr key={r.product.id} className="hover:bg-surface-2">
                <td className="px-4 py-3">
                  <Link href={`/products/${r.product.id}`} className="font-medium text-text hover:text-primary">
                    {r.product.name}
                  </Link>
                </td>
                <td className="px-4 py-3">
                  <span className="rounded-pill bg-surface-2 px-2 py-0.5 text-xs font-mono uppercase text-text-secondary">
                    {r.product.hardwareCategory}
                  </span>
                </td>
                <td className="px-4 py-3 text-right font-mono font-semibold text-text">
                  {formatNum(r.waitingCount)}
                </td>
                <td className="px-4 py-3 text-right font-mono">
                  <span className={stale ? 'text-danger font-semibold' : aging ? 'text-warning' : 'text-text-secondary'}>
                    {Math.round(r.daysWaiting)} d
                  </span>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
