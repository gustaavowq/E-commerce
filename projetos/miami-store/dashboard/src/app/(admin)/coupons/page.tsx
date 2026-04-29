'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Tag, Trash2, Power, X } from 'lucide-react'
import { adminCoupons } from '@/services/admin'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { TableSkeleton, EmptyState } from '@/components/Skeleton'
import { formatBRL, formatDate } from '@/lib/format'
import { ApiError } from '@/lib/api-error'
import type { CouponInput, CouponType } from '@/services/types'

export default function CouponsPage() {
  const qc = useQueryClient()
  const q = useQuery({ queryKey: ['admin', 'coupons'], queryFn: () => adminCoupons.list() })
  const [openForm, setOpenForm] = useState(false)

  const remove = useMutation({
    mutationFn: (id: string) => adminCoupons.remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'coupons'] }),
  })
  const toggleActive = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) => adminCoupons.update(id, { isActive }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'coupons'] }),
  })

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-ink">Cupons</h1>
          <p className="text-sm text-ink-3">{q.data?.meta?.total ?? 0} cupons cadastrados</p>
        </div>
        <Button leftIcon={<Plus className="h-4 w-4" />} onClick={() => setOpenForm(true)}>
          Novo cupom
        </Button>
      </header>

      {openForm && <CouponForm onClose={() => setOpenForm(false)} onCreated={() => qc.invalidateQueries({ queryKey: ['admin', 'coupons'] })} />}

      {q.isLoading ? (
        <TableSkeleton rows={5} cols={7} />
      ) : q.data && q.data.data.length > 0 ? (
        <div className="overflow-x-auto rounded-lg border border-border bg-white shadow-sm">
          <table className="min-w-full divide-y divide-border">
            <thead className="bg-surface-2 text-left text-[11px] font-semibold uppercase tracking-wider text-ink-3">
              <tr>
                <th className="px-4 py-2">Código</th>
                <th className="px-4 py-2">Tipo</th>
                <th className="px-4 py-2 text-right">Valor</th>
                <th className="px-4 py-2 text-right">Pedido mín</th>
                <th className="px-4 py-2 text-right">Usos</th>
                <th className="px-4 py-2">Validade</th>
                <th className="px-4 py-2 text-center">Status</th>
                <th className="px-4 py-2"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {q.data.data.map(c => (
                <tr key={c.id} className="transition hover:bg-primary-50/40">
                  <td className="table-cell-base font-mono font-bold text-primary-700">{c.code}</td>
                  <td className="table-cell-base text-xs text-ink-2">{TYPE_LABEL[c.type]}</td>
                  <td className="table-cell-base text-right font-mono">
                    {c.type === 'PERCENT' ? `${c.value}%`
                      : c.type === 'FIXED' ? formatBRL(c.value ?? 0)
                      : '—'}
                  </td>
                  <td className="table-cell-base text-right font-mono text-ink-3">
                    {c.minOrderValue ? formatBRL(c.minOrderValue) : '—'}
                  </td>
                  <td className="table-cell-base text-right font-mono">
                    {c.usedCount}{c.maxUses ? ` / ${c.maxUses}` : ''}
                  </td>
                  <td className="table-cell-base text-xs text-ink-3">
                    {c.validUntil ? `até ${formatDate(c.validUntil)}` : 'sem validade'}
                  </td>
                  <td className="table-cell-base text-center">
                    {c.isActive
                      ? <span className="inline-flex rounded-full bg-success/10 px-2 py-0.5 text-xs font-semibold text-success">Ativo</span>
                      : <span className="inline-flex rounded-full bg-ink-3/10 px-2 py-0.5 text-xs font-semibold text-ink-3">Inativo</span>}
                  </td>
                  <td className="table-cell-base text-right">
                    <button
                      onClick={() => toggleActive.mutate({ id: c.id, isActive: !c.isActive })}
                      className="text-ink-3 hover:text-primary-700 mr-2"
                      aria-label={c.isActive ? 'Desativar' : 'Ativar'}
                      title={c.isActive ? 'Desativar' : 'Ativar'}
                    >
                      <Power className="h-4 w-4" />
                    </button>
                    {c.isActive && (
                      <button
                        onClick={() => { if (confirm(`Apagar cupom "${c.code}"? Histórico de uso fica preservado.`)) remove.mutate(c.id) }}
                        className="text-ink-3 hover:text-error"
                        aria-label="Apagar"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <EmptyState
          icon={<Tag className="h-6 w-6" />}
          title="Nenhum cupom criado"
          description="Crie cupons pra dar desconto em datas especiais ou pra primeira compra."
          action={<Button leftIcon={<Plus className="h-4 w-4" />} onClick={() => setOpenForm(true)}>Criar primeiro cupom</Button>}
        />
      )}
    </div>
  )
}

const TYPE_LABEL: Record<CouponType, string> = {
  PERCENT:       'Percentual',
  FIXED:         'Valor fixo',
  FREE_SHIPPING: 'Frete grátis',
}

function CouponForm({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const [form, setForm] = useState<CouponInput>({
    code: '', type: 'PERCENT', value: 10,
    minOrderValue: null, maxUses: null, perUserLimit: 1, isActive: true,
  })
  const [error, setError] = useState<string | null>(null)

  const create = useMutation({
    mutationFn: () => adminCoupons.create({
      ...form,
      code: form.code.trim().toUpperCase(),
      value: form.type === 'FREE_SHIPPING' ? null : Number(form.value),
      validUntil: form.validUntil || null,
    }),
    onSuccess: () => { onCreated(); onClose() },
    onError: (err) => setError(ApiError.is(err) ? err.message : 'Erro ao criar'),
  })

  return (
    <div className="rounded-lg border border-border bg-white p-5 shadow-sm animate-fade-up">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-bold text-ink">Novo cupom</h2>
        <button onClick={onClose} className="flex h-8 w-8 items-center justify-center rounded-md hover:bg-surface-2"><X className="h-4 w-4" /></button>
      </div>

      <form onSubmit={(e) => { e.preventDefault(); setError(null); create.mutate() }} className="mt-4 space-y-3">
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="block">
            <span className="block text-xs font-medium text-ink-2 mb-1">Código (vai pra UPPERCASE)</span>
            <Input value={form.code} onChange={e => setForm({ ...form, code: e.target.value })} placeholder="PIXFIRST" required />
          </label>
          <label className="block">
            <span className="block text-xs font-medium text-ink-2 mb-1">Tipo</span>
            <select
              value={form.type}
              onChange={e => setForm({ ...form, type: e.target.value as CouponType })}
              className="w-full rounded-md border border-border bg-white px-3 py-2 text-sm focus:border-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-700/20"
            >
              <option value="PERCENT">Percentual (%)</option>
              <option value="FIXED">Valor fixo (R$)</option>
              <option value="FREE_SHIPPING">Frete grátis</option>
            </select>
          </label>
          {form.type !== 'FREE_SHIPPING' && (
            <label className="block">
              <span className="block text-xs font-medium text-ink-2 mb-1">{form.type === 'PERCENT' ? 'Percentual (%)' : 'Valor (R$)'}</span>
              <Input type="number" min="0" step={form.type === 'FIXED' ? '0.01' : '1'} value={form.value ?? ''} onChange={e => setForm({ ...form, value: Number(e.target.value) })} required />
            </label>
          )}
          <label className="block">
            <span className="block text-xs font-medium text-ink-2 mb-1">Pedido mínimo (R$)</span>
            <Input type="number" min="0" step="0.01" value={form.minOrderValue ?? ''} onChange={e => setForm({ ...form, minOrderValue: e.target.value ? Number(e.target.value) : null })} />
          </label>
          <label className="block">
            <span className="block text-xs font-medium text-ink-2 mb-1">Máx total de usos</span>
            <Input type="number" min="1" value={form.maxUses ?? ''} onChange={e => setForm({ ...form, maxUses: e.target.value ? Number(e.target.value) : null })} />
          </label>
          <label className="block">
            <span className="block text-xs font-medium text-ink-2 mb-1">Máx por cliente</span>
            <Input type="number" min="1" value={form.perUserLimit} onChange={e => setForm({ ...form, perUserLimit: Number(e.target.value) })} />
          </label>
          <label className="block">
            <span className="block text-xs font-medium text-ink-2 mb-1">Validade até <span className="text-ink-4">(opcional)</span></span>
            <Input type="datetime-local" value={form.validUntil ? form.validUntil.slice(0, 16) : ''} onChange={e => setForm({ ...form, validUntil: e.target.value ? new Date(e.target.value).toISOString() : null })} />
          </label>
        </div>

        {error && <div className="rounded-md border border-error/30 bg-error/5 px-3 py-2 text-sm text-error">{error}</div>}

        <div className="flex gap-2">
          <Button type="submit" loading={create.isPending}>Criar cupom</Button>
          <Button type="button" variant="ghost" onClick={onClose}>Cancelar</Button>
        </div>
      </form>
    </div>
  )
}
