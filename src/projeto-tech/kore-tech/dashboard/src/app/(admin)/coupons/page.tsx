// =============================================================================
// Kore Tech — Painel admin > Cupons
//
// Lista + CRUD inline. BUILDER10 destacado (cupom do PC Builder, anti-paper-launch).
// =============================================================================

'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Plus, Trash2, Copy, Edit3, Tag, Calendar, Hash, Wrench,
} from 'lucide-react'
import { adminCoupons } from '@/services/admin'
import type { Coupon, CouponInput, CouponType } from '@/services/types'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Label } from '@/components/ui/Label'
import { DataTable, type DataTableColumn } from '@/components/DataTable'
import { EmptyState } from '@/components/Skeleton'
import { ConfirmDialog } from '@/components/ConfirmDialog'
import { useToast } from '@/components/Toast'
import { formatBRL, formatDate } from '@/lib/format'
import { cn } from '@/lib/utils'

const COUPON_TYPES: Array<{ value: CouponType; label: string }> = [
  { value: 'PERCENT',       label: 'Percentual (%)' },
  { value: 'FIXED',         label: 'Valor fixo (R$)' },
  { value: 'FREE_SHIPPING', label: 'Frete grátis' },
]

type EditingState =
  | { mode: 'create' }
  | { mode: 'edit'; coupon: Coupon }
  | null

export default function CouponsPage() {
  const qc    = useQueryClient()
  const toast = useToast()

  const couponsQ = useQuery({
    queryKey: ['admin', 'coupons'],
    queryFn:  () => adminCoupons.list(),
  })

  const [editing, setEditing] = useState<EditingState>(null)
  const [confirmDelete, setConfirmDelete] = useState<Coupon | null>(null)

  const createOrUpdate = useMutation({
    mutationFn: async (body: CouponInput & { id?: string }) => {
      if (body.id) {
        const { id, ...rest } = body
        return adminCoupons.update(id, rest)
      }
      return adminCoupons.create(body)
    },
    onSuccess: () => {
      toast.push({ tone: 'success', title: editing?.mode === 'edit' ? 'Cupom atualizado' : 'Cupom criado' })
      qc.invalidateQueries({ queryKey: ['admin', 'coupons'] })
      setEditing(null)
    },
    onError: (err: unknown) => {
      toast.push({ tone: 'error', title: 'Não foi possível salvar', body: err instanceof Error ? err.message : '' })
    },
  })

  const remove = useMutation({
    mutationFn: (id: string) => adminCoupons.remove(id),
    onSuccess: () => {
      toast.push({ tone: 'success', title: 'Cupom removido' })
      qc.invalidateQueries({ queryKey: ['admin', 'coupons'] })
      setConfirmDelete(null)
    },
    onError: (err: unknown) => {
      toast.push({ tone: 'error', title: 'Não foi possível remover', body: err instanceof Error ? err.message : '' })
    },
  })

  const duplicate = useMutation({
    mutationFn: (id: string) => adminCoupons.duplicate(id),
    onSuccess: () => {
      toast.push({ tone: 'success', title: 'Cupom duplicado' })
      qc.invalidateQueries({ queryKey: ['admin', 'coupons'] })
    },
    onError: (err: unknown) => {
      toast.push({ tone: 'error', title: 'Não consegui duplicar', body: err instanceof Error ? err.message : '' })
    },
  })

  const rows = couponsQ.data?.data ?? []

  const columns: DataTableColumn<Coupon>[] = [
    {
      key: 'code',
      header: 'Código',
      render: row => (
        <div className="flex items-center gap-2">
          <code className={cn(
            'font-mono text-sm font-bold',
            row.code === 'BUILDER10' ? 'text-primary' : 'text-text',
          )}>
            {row.code}
          </code>
          {row.code === 'BUILDER10' && (
            <span className="inline-flex items-center gap-1 rounded-pill bg-primary-soft px-2 py-0.5 text-[10px] font-bold uppercase text-primary">
              <Wrench className="h-3 w-3" /> Builder
            </span>
          )}
        </div>
      ),
    },
    {
      key: 'type',
      header: 'Tipo',
      render: row => <span className="text-xs text-text-secondary">{COUPON_TYPES.find(t => t.value === row.type)?.label}</span>,
    },
    {
      key: 'value',
      header: 'Valor',
      align: 'right',
      render: row => (
        <span className="font-mono text-sm text-text">
          {row.type === 'FREE_SHIPPING' ? '-' : row.type === 'PERCENT' ? `${row.value}%` : formatBRL(row.value ?? 0)}
        </span>
      ),
    },
    {
      key: 'minOrder',
      header: 'Pedido mín.',
      align: 'right',
      hideOnMobile: true,
      render: row => <span className="font-mono text-xs text-text-secondary">{row.minOrderValue ? formatBRL(row.minOrderValue) : '-'}</span>,
    },
    {
      key: 'usage',
      header: 'Usos',
      align: 'center',
      hideOnMobile: true,
      render: row => (
        <span className="font-mono text-xs text-text">
          {row.usedCount}{row.maxUses ? ` / ${row.maxUses}` : ''}
        </span>
      ),
    },
    {
      key: 'validity',
      header: 'Validade',
      hideOnMobile: true,
      render: row => (
        <span className="text-xs text-text-secondary">
          {row.validUntil ? `Até ${formatDate(row.validUntil)}` : 'Sem expiração'}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      align: 'center',
      render: row => row.isActive
        ? <span className="inline-flex rounded-pill bg-success-soft px-2 py-0.5 text-[10px] font-bold uppercase text-success">Ativo</span>
        : <span className="inline-flex rounded-pill bg-surface-2 px-2 py-0.5 text-[10px] font-bold uppercase text-text-muted">Inativo</span>,
    },
    {
      key: 'actions',
      header: '',
      align: 'right',
      render: row => (
        <div className="flex items-center justify-end gap-1">
          <button
            onClick={() => setEditing({ mode: 'edit', coupon: row })}
            className="rounded p-1.5 text-text-secondary hover:bg-surface-3 hover:text-primary"
            aria-label="Editar"
          >
            <Edit3 className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={() => duplicate.mutate(row.id)}
            disabled={duplicate.isPending}
            className="rounded p-1.5 text-text-secondary hover:bg-surface-3 hover:text-primary disabled:opacity-50"
            aria-label="Duplicar"
          >
            <Copy className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={() => setConfirmDelete(row)}
            className="rounded p-1.5 text-text-secondary hover:bg-danger-soft hover:text-danger"
            aria-label="Remover"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-5">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-text">Cupons</h1>
          <p className="text-sm text-text-secondary">
            BEMVINDO5, PIXFIRST, BUILDER10, COMBO15, FRETE15. BUILDER10 funciona só no checkout vindo do PC Builder.
          </p>
        </div>
        <Button leftIcon={<Plus className="h-4 w-4" />} onClick={() => setEditing({ mode: 'create' })}>
          Novo cupom
        </Button>
      </header>

      {!couponsQ.isLoading && rows.length === 0 ? (
        <EmptyState
          icon={<Tag className="h-5 w-5" />}
          title="Nenhum cupom criado"
          description="Crie cupons pra acelerar conversão (BEMVINDO5 captura email, BUILDER10 dá 10% pra quem usa o builder)."
          action={<Button leftIcon={<Plus className="h-4 w-4" />} onClick={() => setEditing({ mode: 'create' })}>Novo cupom</Button>}
        />
      ) : (
        <DataTable
          loading={couponsQ.isLoading}
          columns={columns}
          rows={rows}
          rowKey={r => r.id}
        />
      )}

      {editing && (
        <CouponEditor
          initial={editing.mode === 'edit' ? editing.coupon : undefined}
          submitting={createOrUpdate.isPending}
          onSubmit={body => createOrUpdate.mutate({
            ...body,
            ...(editing.mode === 'edit' ? { id: editing.coupon.id } : {}),
          })}
          onClose={() => setEditing(null)}
        />
      )}

      <ConfirmDialog
        open={confirmDelete !== null}
        title={confirmDelete ? `Remover ${confirmDelete.code}?` : ''}
        description="Cupom removido não pode mais ser aplicado em novos pedidos. Pedidos antigos que usaram o cupom ficam preservados."
        destructive
        confirmLabel="Remover"
        loading={remove.isPending}
        onConfirm={() => confirmDelete && remove.mutate(confirmDelete.id)}
        onClose={() => setConfirmDelete(null)}
      />
    </div>
  )
}

// -----------------------------------------------------------------------------
// Editor inline (modal) — criar ou editar
// -----------------------------------------------------------------------------
function CouponEditor({
  initial, submitting, onSubmit, onClose,
}: {
  initial?:    Coupon
  submitting:  boolean
  onSubmit:    (body: CouponInput) => void
  onClose:     () => void
}) {
  const [form, setForm] = useState<CouponInput>({
    code:          initial?.code         ?? '',
    type:          initial?.type         ?? 'PERCENT',
    value:         initial?.value        ?? 10,
    minOrderValue: initial?.minOrderValue ?? null,
    maxUses:       initial?.maxUses      ?? null,
    perUserLimit:  initial?.perUserLimit ?? 1,
    validFrom:     initial?.validFrom?.slice(0, 10) ?? new Date().toISOString().slice(0, 10),
    validUntil:    initial?.validUntil?.slice(0, 10) ?? null,
    isActive:      initial?.isActive     ?? true,
  })

  function set<K extends keyof CouponInput>(key: K, value: CouponInput[K]) {
    setForm(prev => ({ ...prev, [key]: value }))
  }

  return (
    <div className="fixed inset-0 z-modal flex items-center justify-center p-4 animate-fade-in">
      <div className="absolute inset-0 bg-bg/70 backdrop-blur-sm" onClick={onClose} />
      <div role="dialog" aria-modal="true" className="relative w-full max-w-xl rounded-xl border border-border bg-surface p-6 shadow-xl animate-scale-in space-y-4">
        <h2 className="text-lg font-bold text-text">{initial ? 'Editar cupom' : 'Novo cupom'}</h2>

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <Label htmlFor="code">Código</Label>
            <Input
              id="code"
              mono
              value={form.code}
              onChange={e => set('code', e.target.value.toUpperCase().replace(/[^A-Z0-9_]/g, ''))}
              placeholder="BEMVINDO5"
            />
          </div>
          <div>
            <Label htmlFor="type">Tipo</Label>
            <Select id="type" value={form.type} onChange={e => set('type', e.target.value as CouponType)}>
              {COUPON_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
            </Select>
          </div>

          {form.type !== 'FREE_SHIPPING' && (
            <div>
              <Label htmlFor="value">{form.type === 'PERCENT' ? 'Percentual (%)' : 'Valor (R$)'}</Label>
              <Input
                id="value"
                type="number"
                step={form.type === 'PERCENT' ? '1' : '0.01'}
                mono
                value={form.value ?? 0}
                onChange={e => set('value', Number(e.target.value))}
              />
            </div>
          )}

          <div>
            <Label htmlFor="minOrder">
              <span className="inline-flex items-center gap-1.5"><Hash className="h-3 w-3" /> Pedido mínimo (R$)</span>
            </Label>
            <Input
              id="minOrder"
              type="number"
              step="0.01"
              mono
              value={form.minOrderValue ?? ''}
              onChange={e => set('minOrderValue', e.target.value ? Number(e.target.value) : null)}
              placeholder="opcional"
            />
          </div>

          <div>
            <Label htmlFor="maxUses">Usos totais (max)</Label>
            <Input
              id="maxUses"
              type="number"
              mono
              value={form.maxUses ?? ''}
              onChange={e => set('maxUses', e.target.value ? Number(e.target.value) : null)}
              placeholder="ilimitado"
            />
          </div>

          <div>
            <Label htmlFor="perUserLimit">Por usuário (max)</Label>
            <Input
              id="perUserLimit"
              type="number"
              mono
              value={form.perUserLimit ?? 1}
              onChange={e => set('perUserLimit', Number(e.target.value))}
            />
          </div>

          <div>
            <Label htmlFor="validFrom">
              <span className="inline-flex items-center gap-1.5"><Calendar className="h-3 w-3" /> Válido a partir de</span>
            </Label>
            <Input
              id="validFrom"
              type="date"
              value={form.validFrom?.slice(0, 10) ?? ''}
              onChange={e => set('validFrom', e.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="validUntil">Válido até</Label>
            <Input
              id="validUntil"
              type="date"
              value={form.validUntil?.slice(0, 10) ?? ''}
              onChange={e => set('validUntil', e.target.value || null)}
              placeholder="opcional"
            />
          </div>
        </div>

        {form.code === 'BUILDER10' && (
          <div className="rounded-md border border-primary/30 bg-primary-soft p-3 text-xs text-text">
            <p className="inline-flex items-center gap-1.5 font-semibold text-primary">
              <Wrench className="h-3.5 w-3.5" /> Cupom do Builder
            </p>
            <p className="mt-1 text-text-secondary">
              Backend valida no checkout: o cupom <code className="font-mono">BUILDER10</code> só aplica se o carrinho veio do PC Builder
              (flag <code className="font-mono">requiresBuilderOrigin</code> ativa por padrão).
            </p>
          </div>
        )}

        <div className="flex items-center gap-2">
          <input
            id="isActive"
            type="checkbox"
            checked={form.isActive ?? true}
            onChange={e => set('isActive', e.target.checked)}
            className="h-4 w-4 rounded border-border-strong bg-surface accent-primary"
          />
          <label htmlFor="isActive" className="text-sm text-text">Cupom ativo</label>
        </div>

        <div className="flex justify-end gap-2 border-t border-border pt-4">
          <Button variant="secondary" onClick={onClose} disabled={submitting}>Cancelar</Button>
          <Button onClick={() => onSubmit(form)} loading={submitting} disabled={!form.code}>
            {initial ? 'Salvar' : 'Criar cupom'}
          </Button>
        </div>
      </div>
    </div>
  )
}
