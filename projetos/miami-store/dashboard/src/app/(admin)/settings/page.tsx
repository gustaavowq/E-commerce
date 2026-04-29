'use client'

import { useEffect, useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Save, Store, MessageCircle, FileText, DollarSign } from 'lucide-react'
import { adminSettings } from '@/services/admin'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { ApiError } from '@/lib/api-error'
import type { StoreSettings } from '@/services/types'

export default function SettingsPage() {
  const qc = useQueryClient()
  const q = useQuery({ queryKey: ['admin', 'settings'], queryFn: () => adminSettings.get() })
  const [form, setForm] = useState<Partial<StoreSettings>>({})
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => { if (q.data) setForm(q.data) }, [q.data])
  useEffect(() => { if (saved) { const t = setTimeout(() => setSaved(false), 2500); return () => clearTimeout(t) } }, [saved])

  const update = useMutation({
    mutationFn: (body: Partial<StoreSettings>) => adminSettings.update(body),
    onSuccess: (data) => {
      setForm(data); setSaved(true); setError(null)
      qc.invalidateQueries({ queryKey: ['admin', 'settings'] })
    },
    onError: (err) => setError(ApiError.is(err) ? err.message : 'Erro ao salvar'),
  })

  function set<K extends keyof StoreSettings>(key: K, value: StoreSettings[K] | null) {
    setForm(f => ({ ...f, [key]: value }))
  }

  function submit(e: React.FormEvent) {
    e.preventDefault()
    update.mutate(form)
  }

  if (q.isLoading) return <p className="text-sm text-ink-3">Carregando configurações…</p>

  return (
    <form onSubmit={submit} className="max-w-4xl space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-ink">Configurações da loja</h1>
          <p className="text-sm text-ink-3">Tudo aqui aparece no site público pro cliente.</p>
        </div>
        <div className="flex items-center gap-3">
          {saved && <span className="text-sm text-success animate-fade-in">Salvo!</span>}
          <Button type="submit" loading={update.isPending} leftIcon={<Save className="h-4 w-4" />}>
            Salvar
          </Button>
        </div>
      </header>

      {error && (
        <div className="rounded-md border border-error/30 bg-error/5 px-3 py-2 text-sm text-error">{error}</div>
      )}

      {/* Identidade */}
      <Section icon={<Store className="h-4 w-4" />} title="Identidade da loja">
        <Field label="Nome da loja">
          <Input value={form.storeName ?? ''} onChange={e => set('storeName', e.target.value)} />
        </Field>
        <Field label="Slogan / Tagline">
          <Input value={form.storeTagline ?? ''} onChange={e => set('storeTagline', e.target.value || null)} placeholder="Original, com preço que cabe" />
        </Field>
        <Field label="URL do logo">
          <Input value={form.logoUrl ?? ''} onChange={e => set('logoUrl', e.target.value || null)} placeholder="https://..." />
        </Field>
        <Field label="URL do favicon">
          <Input value={form.faviconUrl ?? ''} onChange={e => set('faviconUrl', e.target.value || null)} placeholder="https://..." />
        </Field>
      </Section>

      {/* Contato */}
      <Section icon={<MessageCircle className="h-4 w-4" />} title="Contato e redes">
        <Field label="WhatsApp (só dígitos com DDI+DDD)" hint="Ex: 5511999999999">
          <Input value={form.whatsappNumber ?? ''} onChange={e => set('whatsappNumber', e.target.value || null)} placeholder="5511999999999" />
        </Field>
        <Field label="Mensagem padrão do WhatsApp">
          <textarea
            value={form.whatsappMessage ?? ''}
            onChange={e => set('whatsappMessage', e.target.value || null)}
            rows={2}
            className="w-full rounded-md border border-border bg-white px-3 py-2 text-sm focus:border-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-700/20"
          />
        </Field>
        <Field label="Instagram (handle, sem @)">
          <Input value={form.instagramHandle ?? ''} onChange={e => set('instagramHandle', e.target.value || null)} placeholder="miamii_storee" />
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Email"><Input type="email" value={form.email ?? ''} onChange={e => set('email', e.target.value || null)} /></Field>
          <Field label="Telefone fixo"><Input value={form.phone ?? ''} onChange={e => set('phone', e.target.value || null)} /></Field>
        </div>
      </Section>

      {/* Empresa */}
      <Section icon={<FileText className="h-4 w-4" />} title="Dados da empresa (rodapé)">
        <Field label="Razão social"><Input value={form.legalName ?? ''} onChange={e => set('legalName', e.target.value || null)} /></Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="CNPJ"><Input value={form.cnpj ?? ''} onChange={e => set('cnpj', e.target.value || null)} placeholder="00.000.000/0001-00" /></Field>
          <Field label="Endereço"><Input value={form.address ?? ''} onChange={e => set('address', e.target.value || null)} /></Field>
        </div>
      </Section>

      {/* Comercial */}
      <Section icon={<DollarSign className="h-4 w-4" />} title="Regras comerciais">
        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="Desconto Pix (%)" hint="0 desativa">
            <Input type="number" min="0" max="50" value={form.pixDiscountPercent ?? 0} onChange={e => set('pixDiscountPercent', Number(e.target.value))} />
          </Field>
          <Field label="Frete fixo (R$)">
            <Input type="number" step="0.01" min="0" value={form.shippingFlatRate ?? 15} onChange={e => set('shippingFlatRate', Number(e.target.value))} />
          </Field>
          <Field label="Frete grátis acima de (R$)" hint="Vazio = nunca">
            <Input type="number" step="0.01" min="0" value={form.freeShippingMinValue ?? ''} onChange={e => set('freeShippingMinValue', e.target.value ? Number(e.target.value) : null)} />
          </Field>
        </div>
      </Section>

      {/* Conteúdo legal */}
      <Section icon={<FileText className="h-4 w-4" />} title="Páginas legais (markdown)">
        <Field label="Sobre nós" hint="Aparece em /policies/about">
          <textarea rows={6} value={form.aboutUs ?? ''} onChange={e => set('aboutUs', e.target.value || null)} className={TEXTAREA} />
        </Field>
        <Field label="Política de privacidade">
          <textarea rows={6} value={form.privacyPolicy ?? ''} onChange={e => set('privacyPolicy', e.target.value || null)} className={TEXTAREA} />
        </Field>
        <Field label="Termos de uso">
          <textarea rows={6} value={form.termsOfUse ?? ''} onChange={e => set('termsOfUse', e.target.value || null)} className={TEXTAREA} />
        </Field>
        <Field label="Trocas e devoluções">
          <textarea rows={6} value={form.exchangePolicy ?? ''} onChange={e => set('exchangePolicy', e.target.value || null)} className={TEXTAREA} />
        </Field>
        <Field label="Política de envio">
          <textarea rows={6} value={form.shippingPolicy ?? ''} onChange={e => set('shippingPolicy', e.target.value || null)} className={TEXTAREA} />
        </Field>
      </Section>

      <Button type="submit" loading={update.isPending} leftIcon={<Save className="h-4 w-4" />} fullWidth size="lg">
        Salvar todas as alterações
      </Button>
    </form>
  )
}

const TEXTAREA = 'w-full rounded-md border border-border bg-white px-3 py-2 text-sm font-mono focus:border-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-700/20'

function Section({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-4 rounded-lg border border-border bg-white p-5 shadow-sm">
      <h2 className="flex items-center gap-2 text-sm font-bold text-ink">
        <span className="text-primary-700">{icon}</span> {title}
      </h2>
      <div className="space-y-4">{children}</div>
    </section>
  )
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="block text-xs font-semibold text-ink-2">{label}</span>
      {hint && <span className="block text-[10px] text-ink-4 mb-1">{hint}</span>}
      <div className="mt-1">{children}</div>
    </label>
  )
}
