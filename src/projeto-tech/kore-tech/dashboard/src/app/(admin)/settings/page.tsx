// =============================================================================
// Kore Tech — Painel admin > Configurações
//
// Edita StoreSettings (loja, contato, identidade fiscal, frete, políticas).
// Tabs pra não dar overload visual em uma tela só.
// =============================================================================

'use client'

import { useEffect, useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Save, Settings as SettingsIcon, Phone, FileText, Truck,
} from 'lucide-react'
import { adminSettings } from '@/services/admin'
import type { StoreSettings } from '@/services/types'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { Label } from '@/components/ui/Label'
import { Skeleton } from '@/components/Skeleton'
import { useToast } from '@/components/Toast'
import { cn } from '@/lib/utils'

type TabId = 'store' | 'contact' | 'shipping' | 'policies'

const TABS: Array<{ id: TabId; label: string; icon: React.ReactNode }> = [
  { id: 'store',    label: 'Loja',         icon: <SettingsIcon className="h-3.5 w-3.5" /> },
  { id: 'contact',  label: 'Contato',      icon: <Phone        className="h-3.5 w-3.5" /> },
  { id: 'shipping', label: 'Frete & Pix',  icon: <Truck        className="h-3.5 w-3.5" /> },
  { id: 'policies', label: 'Políticas',    icon: <FileText     className="h-3.5 w-3.5" /> },
]

export default function SettingsPage() {
  const qc    = useQueryClient()
  const toast = useToast()
  const [tab,  setTab]  = useState<TabId>('store')
  const [form, setForm] = useState<Partial<StoreSettings>>({})

  const settingsQ = useQuery({
    queryKey: ['admin', 'settings'],
    queryFn:  () => adminSettings.get(),
  })

  useEffect(() => {
    if (settingsQ.data) setForm(settingsQ.data)
  }, [settingsQ.data])

  const update = useMutation({
    mutationFn: (body: Partial<StoreSettings>) => adminSettings.update(body),
    onSuccess: () => {
      toast.push({ tone: 'success', title: 'Configurações salvas' })
      qc.invalidateQueries({ queryKey: ['admin', 'settings'] })
    },
    onError: (err: unknown) => {
      toast.push({ tone: 'error', title: 'Não foi possível salvar', body: err instanceof Error ? err.message : '' })
    },
  })

  function set<K extends keyof StoreSettings>(key: K, value: StoreSettings[K]) {
    setForm(prev => ({ ...prev, [key]: value }))
  }

  if (settingsQ.isLoading) {
    return (
      <div className="space-y-5">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-72 w-full" />
      </div>
    )
  }

  return (
    <div className="space-y-5">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-text">Configurações</h1>
          <p className="text-sm text-text-secondary">
            Identidade da loja, contato, frete, Pix, políticas. Mudanças aplicam imediatamente na loja pública.
          </p>
        </div>
        <Button
          leftIcon={<Save className="h-4 w-4" />}
          loading={update.isPending}
          onClick={() => update.mutate(form)}
        >
          Salvar
        </Button>
      </header>

      <div className="flex flex-wrap gap-1 rounded-md border border-border bg-surface-2 p-1">
        {TABS.map(t => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={cn(
              'inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold transition-colors',
              tab === t.id ? 'bg-primary text-text-on-primary' : 'text-text-secondary hover:bg-surface-3 hover:text-text',
            )}
          >
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      <section className="rounded-lg border border-border bg-surface p-5 shadow-md space-y-4">
        {tab === 'store' && (
          <>
            <div>
              <Label htmlFor="storeName">Nome da loja</Label>
              <Input id="storeName" value={form.storeName ?? ''} onChange={e => set('storeName', e.target.value)} />
            </div>
            <div>
              <Label htmlFor="storeTagline">Tagline</Label>
              <Input id="storeTagline" value={form.storeTagline ?? ''} onChange={e => set('storeTagline', e.target.value)} placeholder="Monte certo. Jogue alto." />
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="logoUrl">URL do logo</Label>
                <Input id="logoUrl" mono value={form.logoUrl ?? ''} onChange={e => set('logoUrl', e.target.value || null)} placeholder="https://res.cloudinary.com/..." />
              </div>
              <div>
                <Label htmlFor="faviconUrl">URL do favicon</Label>
                <Input id="faviconUrl" mono value={form.faviconUrl ?? ''} onChange={e => set('faviconUrl', e.target.value || null)} placeholder="https://..." />
              </div>
            </div>
            <div>
              <Label htmlFor="aboutUs">Sobre nós</Label>
              <Textarea id="aboutUs" rows={5} value={form.aboutUs ?? ''} onChange={e => set('aboutUs', e.target.value || null)} placeholder="Quem é a Kore Tech, missão, time…" />
            </div>
          </>
        )}

        {tab === 'contact' && (
          <>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="email">Email de contato</Label>
                <Input id="email" type="email" value={form.email ?? ''} onChange={e => set('email', e.target.value || null)} placeholder="atendimento@kore.tech" />
              </div>
              <div>
                <Label htmlFor="phone">Telefone</Label>
                <Input id="phone" mono value={form.phone ?? ''} onChange={e => set('phone', e.target.value || null)} placeholder="(11) 99999-9999" />
              </div>
              <div>
                <Label htmlFor="whatsappNumber">WhatsApp</Label>
                <Input id="whatsappNumber" mono value={form.whatsappNumber ?? ''} onChange={e => set('whatsappNumber', e.target.value || null)} placeholder="5511999999999" />
                <p className="mt-1 text-[11px] text-text-muted">Só números, com DDI 55. Aparece no botão flutuante da loja.</p>
              </div>
              <div>
                <Label htmlFor="instagramHandle">Instagram</Label>
                <Input id="instagramHandle" mono value={form.instagramHandle ?? ''} onChange={e => set('instagramHandle', e.target.value || null)} placeholder="@kore.tech" />
              </div>
            </div>
            <div>
              <Label htmlFor="whatsappMessage">Mensagem padrão WhatsApp</Label>
              <Textarea id="whatsappMessage" rows={2} value={form.whatsappMessage ?? ''} onChange={e => set('whatsappMessage', e.target.value || null)} placeholder="Oi! Vi um produto na Kore Tech e queria tirar uma dúvida." />
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              <div>
                <Label htmlFor="cnpj">CNPJ</Label>
                <Input id="cnpj" mono value={form.cnpj ?? ''} onChange={e => set('cnpj', e.target.value || null)} placeholder="00.000.000/0001-00" />
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="legalName">Razão social</Label>
                <Input id="legalName" value={form.legalName ?? ''} onChange={e => set('legalName', e.target.value || null)} />
              </div>
              <div className="md:col-span-3">
                <Label htmlFor="address">Endereço</Label>
                <Textarea id="address" rows={2} value={form.address ?? ''} onChange={e => set('address', e.target.value || null)} placeholder="Rua, número, bairro, cidade/UF, CEP" />
              </div>
            </div>
          </>
        )}

        {tab === 'shipping' && (
          <>
            <div className="grid gap-4 md:grid-cols-3">
              <div>
                <Label htmlFor="pixDiscountPercent">Desconto Pix (%)</Label>
                <Input id="pixDiscountPercent" type="number" mono min={0} max={20} step={0.5}
                  value={form.pixDiscountPercent ?? 5}
                  onChange={e => set('pixDiscountPercent', Number(e.target.value))} />
                <p className="mt-1 text-[11px] text-text-muted">Padrão Kore Tech: 5%. Aparece em destaque (PromoStrip + checkout).</p>
              </div>
              <div>
                <Label htmlFor="shippingFlatRate">Frete fixo (R$)</Label>
                <Input id="shippingFlatRate" type="number" mono min={0} step={0.01}
                  value={form.shippingFlatRate ?? 0}
                  onChange={e => set('shippingFlatRate', Number(e.target.value))} />
              </div>
              <div>
                <Label htmlFor="freeShippingMinValue">Frete grátis a partir de (R$)</Label>
                <Input id="freeShippingMinValue" type="number" mono min={0} step={0.01}
                  value={form.freeShippingMinValue ?? ''}
                  onChange={e => set('freeShippingMinValue', e.target.value ? Number(e.target.value) : null)} />
              </div>
            </div>
            <p className="rounded-md border border-border bg-surface-2 p-3 text-xs text-text-secondary">
              Bar de frete grátis aparece na loja só se este valor estiver definido. Em hardware pesado (PC montado), considere R$ 1.500+ pra evitar prejuízo no frete.
            </p>
          </>
        )}

        {tab === 'policies' && (
          <>
            <PolicyField label="Política de privacidade"   value={form.privacyPolicy}  onChange={v => set('privacyPolicy', v)} />
            <PolicyField label="Termos de uso"             value={form.termsOfUse}     onChange={v => set('termsOfUse', v)} />
            <PolicyField label="Política de troca"         value={form.exchangePolicy} onChange={v => set('exchangePolicy', v)} />
            <PolicyField label="Política de envio"         value={form.shippingPolicy} onChange={v => set('shippingPolicy', v)} />
            <PolicyField label="Política de garantia"      value={form.warrantyPolicy} onChange={v => set('warrantyPolicy', v)} />
          </>
        )}
      </section>
    </div>
  )
}

function PolicyField({ label, value, onChange }: { label: string; value: string | null | undefined; onChange: (v: string | null) => void }) {
  return (
    <div>
      <Label>{label}</Label>
      <Textarea
        rows={5}
        value={value ?? ''}
        onChange={e => onChange(e.target.value || null)}
        placeholder="Aceita Markdown. Aparece em /policies/[slug]."
      />
    </div>
  )
}
