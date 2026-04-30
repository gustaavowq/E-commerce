'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { apiList, patch } from '@/lib/api'
import { formatBRL, formatDate, diasRestantes } from '@/lib/format'
import { StatusBadge } from '@/components/ui/StatusBadge'
import type { Reserva } from '@/types/api'

export default function PainelReservasPage() {
  const [status, setStatus] = useState<string>('')
  const qc = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['admin-reservas', status],
    queryFn: () =>
      apiList<Reserva>('/api/admin/reservas', {
        withAuth: true,
        query: { status: status || undefined, limit: 50 },
      }),
    staleTime: 0,
  })

  // Backend espera { status: 'CANCELADA'|'CONVERTIDA' } ou { extenderDias: number }
  // (validators/reserva.ts:adminPatchReservaSchema). Não usamos `action: '...'`.
  type ReservaPatch =
    | { status: 'CANCELADA' | 'CONVERTIDA' }
    | { extenderDias: number }

  const action = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: ReservaPatch }) =>
      patch(`/api/admin/reservas/${id}`, payload, { withAuth: true }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-reservas'] }),
  })

  return (
    <div className="flex flex-col gap-8">
      <header>
        <p className="text-eyebrow uppercase tracking-[0.16em] text-ash mb-3">Painel</p>
        <h1 className="font-display text-display-lg text-ink">Reservas</h1>
      </header>

      <label className="flex flex-col gap-2 max-w-xs">
        <span className="text-eyebrow uppercase tracking-[0.16em] text-ash">Status</span>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="bg-paper border border-bone px-3 py-2 text-body-sm text-ink focus:outline-none focus:ring-1 focus:ring-moss"
        >
          <option value="">Todas</option>
          <option value="ATIVA">Ativas</option>
          <option value="EXPIRADA">Expiradas</option>
          <option value="CANCELADA">Canceladas</option>
          <option value="CONVERTIDA">Convertidas</option>
        </select>
      </label>

      <div className="border border-bone bg-paper overflow-x-auto">
        {isLoading ? (
          <p className="p-12 text-center text-ash">Carregando…</p>
        ) : data?.data.length === 0 ? (
          <p className="p-12 text-center text-ash">Nenhuma reserva encontrada.</p>
        ) : (
          <table className="w-full text-body-sm">
            <thead className="bg-paper-warm border-b border-bone">
              <tr>
                <Th>Imóvel</Th>
                <Th>Cliente</Th>
                <Th className="text-right">Sinal</Th>
                <Th>Status</Th>
                <Th>Pagamento</Th>
                <Th>Expira em</Th>
                <Th>Ações</Th>
              </tr>
            </thead>
            <tbody>
              {(data?.data || []).map((r) => {
                const dias = diasRestantes(r.expiraEm)
                return (
                  <tr key={r.id} className="border-b border-bone last:border-b-0 hover:bg-paper-warm/50">
                    <Td>
                      <p className="text-ink font-medium">{r.imovel?.titulo ?? '—'}</p>
                      <p className="text-caption text-ash">{r.imovel?.bairro}</p>
                    </Td>
                    <Td>
                      <p className="text-ink">{r.user?.name ?? '—'}</p>
                      <p className="text-caption text-ash">{r.user?.email}</p>
                    </Td>
                    <Td className="text-right tnum">{formatBRL(r.valorSinal)}</Td>
                    <Td>
                      <StatusBadge status={r.status} />
                    </Td>
                    <Td>
                      <StatusBadge status={r.pagamentoStatus} />
                    </Td>
                    <Td className="tnum text-ash">
                      {formatDate(r.expiraEm)}
                      {r.status === 'ATIVA' && (
                        <span className="block text-caption">{dias} dias restantes</span>
                      )}
                    </Td>
                    <Td>
                      {r.status === 'ATIVA' && (
                        <div className="flex flex-col gap-1">
                          <button
                            onClick={() =>
                              action.mutate({ id: r.id, payload: { extenderDias: 10 } })
                            }
                            className="text-moss hover:underline underline-offset-4 text-left"
                          >
                            Estender
                          </button>
                          <button
                            onClick={() =>
                              action.mutate({ id: r.id, payload: { status: 'CONVERTIDA' } })
                            }
                            className="text-ink hover:underline underline-offset-4 text-left"
                          >
                            Marcar vendido
                          </button>
                          <button
                            onClick={() =>
                              action.mutate({ id: r.id, payload: { status: 'CANCELADA' } })
                            }
                            className="text-red-600 hover:underline underline-offset-4 text-left"
                          >
                            Cancelar
                          </button>
                        </div>
                      )}
                    </Td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}

function Th({ children, className = '' }: { children?: React.ReactNode; className?: string }) {
  return (
    <th className={`text-left text-eyebrow uppercase tracking-[0.16em] text-ash font-medium px-4 py-3 ${className}`}>
      {children}
    </th>
  )
}
function Td({ children, className = '' }: { children?: React.ReactNode; className?: string }) {
  return <td className={`px-4 py-3 align-top ${className}`}>{children}</td>
}
