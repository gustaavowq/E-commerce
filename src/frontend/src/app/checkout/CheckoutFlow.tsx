'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { ChevronRight, MapPin, Plus, ShieldCheck, Truck, Zap, Loader2, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { useAuth } from '@/stores/auth'
import { useCart } from '@/stores/cart'
import { listAddresses, createAddress } from '@/services/addresses'
import { calculateShipping } from '@/services/shipping'
import { addCartItem, clearServerCart } from '@/services/cart'
import { createOrder } from '@/services/orders'
import { formatBRL, pixPrice } from '@/lib/format'
import { ApiError } from '@/lib/api-error'
import type { Address, ShippingQuote } from '@/services/types'

type Step = 'address' | 'review'

export function CheckoutFlow() {
  const router  = useRouter()
  const user    = useAuth(s => s.user)
  const hydAuth = useAuth(s => s.hydrated)
  const items   = useCart(s => s.items)
  const subtotal = useCart(s => s.subtotal())
  const clearLocal = useCart(s => s.clear)

  const [hydCart, setHydCart] = useState(false)
  useEffect(() => setHydCart(true), [])

  const [step, setStep] = useState<Step>('address')

  const [addresses, setAddresses] = useState<Address[]>([])
  const [loadingAddrs, setLoadingAddrs] = useState(true)
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null)
  const [showNewAddress, setShowNewAddress] = useState(false)

  const [quote, setQuote] = useState<ShippingQuote | null>(null)
  const [quoteLoading, setQuoteLoading] = useState(false)

  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Auth gate
  useEffect(() => {
    if (hydAuth && !user) router.replace('/auth/login?next=/checkout')
  }, [hydAuth, user, router])

  // Carrega endereços
  useEffect(() => {
    if (!user) return
    let cancelled = false
    setLoadingAddrs(true)
    listAddresses()
      .then(list => {
        if (cancelled) return
        setAddresses(list)
        const def = list.find(a => a.isDefault) ?? list[0]
        if (def) setSelectedAddressId(def.id)
        if (list.length === 0) setShowNewAddress(true)
      })
      .catch(err => !cancelled && setError(ApiError.is(err) ? err.message : 'Erro ao carregar endereços'))
      .finally(() => !cancelled && setLoadingAddrs(false))
    return () => { cancelled = true }
  }, [user])

  // Recalcula frete quando muda endereço
  const selected = addresses.find(a => a.id === selectedAddressId) ?? null
  useEffect(() => {
    if (!selected) { setQuote(null); return }
    let cancelled = false
    setQuoteLoading(true)
    calculateShipping(selected.zipcode)
      .then(q => !cancelled && setQuote(q))
      .catch(() => !cancelled && setQuote(null))
      .finally(() => !cancelled && setQuoteLoading(false))
    return () => { cancelled = true }
  }, [selected])

  const shippingCost = quote?.shipping[0]?.cost ?? 15
  const total = useMemo(() => +(subtotal + shippingCost).toFixed(2), [subtotal, shippingCost])
  const pixTotal = pixPrice(total)

  // Vazio
  if (!hydCart || !hydAuth) {
    return <div className="py-12 text-center text-ink-3">Carregando…</div>
  }
  if (!user) return null
  if (items.length === 0) {
    return (
      <div className="rounded-lg border border-border bg-white p-8 text-center">
        <h1 className="font-display text-2xl text-ink">Carrinho vazio</h1>
        <p className="mt-2 text-sm text-ink-3">Adiciona uma peça antes de fechar a compra.</p>
        <Link href="/products" className="mt-4 inline-block text-primary-700 hover:underline">Ver produtos</Link>
      </div>
    )
  }

  async function onConfirmAddress() {
    setError(null)
    if (!selectedAddressId) { setError('Selecione um endereço'); return }
    setStep('review')
  }

  async function onPlaceOrder() {
    setError(null)
    if (!selectedAddressId) { setError('Endereço inválido'); return }
    setSubmitting(true)
    try {
      // Sincroniza carrinho local com servidor (limpa primeiro pra evitar duplicar)
      await clearServerCart()
      for (const it of items) {
        await addCartItem({ variationId: it.variationId, quantity: it.quantity })
      }
      const order = await createOrder({
        addressId:     selectedAddressId,
        paymentMethod: 'PIX',
      })
      clearLocal()
      router.push(`/orders/${order.id}`)
    } catch (err) {
      setError(ApiError.is(err) ? err.message : 'Não deu pra finalizar agora, tenta de novo')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
      <div>
        <h1 className="font-display text-2xl text-ink sm:text-3xl">Checkout</h1>
        <Steps step={step} />

        {step === 'address' && (
          <section className="mt-6 space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-ink">Pra onde a gente envia?</h2>
              {!showNewAddress && (
                <button onClick={() => setShowNewAddress(true)} className="inline-flex items-center gap-1 text-sm text-primary-700 hover:underline">
                  <Plus className="h-4 w-4" /> Novo endereço
                </button>
              )}
            </div>

            {loadingAddrs ? (
              <p className="text-sm text-ink-3">Carregando endereços…</p>
            ) : (
              <ul className="space-y-2">
                {addresses.map(a => (
                  <li key={a.id}>
                    <label className={`flex cursor-pointer gap-3 rounded-lg border p-4 transition ${selectedAddressId === a.id ? 'border-primary-700 ring-1 ring-primary-700 bg-primary-50/40' : 'border-border bg-white hover:border-ink-3'}`}>
                      <input type="radio" name="address" checked={selectedAddressId === a.id} onChange={() => setSelectedAddressId(a.id)} className="mt-1 h-4 w-4 accent-primary-700" />
                      <div className="flex-1 text-sm">
                        <p className="font-semibold text-ink">{a.label ?? 'Endereço'} {a.isDefault && <span className="ml-2 rounded-sm bg-primary-700 px-1.5 py-0.5 text-[10px] font-bold uppercase text-white">Padrão</span>}</p>
                        <p className="text-ink-2">{a.recipient}</p>
                        <p className="text-ink-3">{a.street}, {a.number}{a.complement ? ` — ${a.complement}` : ''}</p>
                        <p className="text-ink-3">{a.district} · {a.city}/{a.state} · {a.zipcode}</p>
                      </div>
                    </label>
                  </li>
                ))}
              </ul>
            )}

            {showNewAddress && (
              <NewAddressForm
                onCancel={() => setShowNewAddress(false)}
                onCreated={(addr) => {
                  setAddresses(s => [addr, ...s])
                  setSelectedAddressId(addr.id)
                  setShowNewAddress(false)
                }}
              />
            )}

            {error && <p className="text-sm text-error">{error}</p>}

            <div className="pt-2">
              <Button size="lg" onClick={onConfirmAddress} disabled={!selectedAddressId} rightIcon={<ChevronRight className="h-5 w-5" />}>
                Continuar
              </Button>
            </div>
          </section>
        )}

        {step === 'review' && (
          <section className="mt-6 space-y-4">
            <h2 className="text-base font-bold text-ink">Confere antes de fechar</h2>

            {selected && (
              <div className="rounded-lg border border-border bg-white p-4 text-sm">
                <div className="mb-2 flex items-center gap-2 font-semibold text-ink">
                  <MapPin className="h-4 w-4 text-primary-700" /> Endereço
                </div>
                <p className="text-ink-2">{selected.recipient}</p>
                <p className="text-ink-3">{selected.street}, {selected.number}{selected.complement ? ` — ${selected.complement}` : ''}</p>
                <p className="text-ink-3">{selected.district} · {selected.city}/{selected.state} · {selected.zipcode}</p>
                <button onClick={() => setStep('address')} className="mt-2 text-xs text-primary-700 hover:underline">Trocar</button>
              </div>
            )}

            <div className="rounded-lg border border-border bg-white p-4">
              <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-ink">
                <ShieldCheck className="h-4 w-4 text-primary-700" /> Itens
              </div>
              <ul className="space-y-3">
                {items.map(it => (
                  <li key={it.variationId} className="flex gap-3">
                    {it.imageUrl && (
                      <div className="relative h-14 w-12 shrink-0 overflow-hidden rounded bg-surface-2">
                        <Image src={it.imageUrl} alt={it.productName} fill sizes="48px" className="object-cover" unoptimized />
                      </div>
                    )}
                    <div className="flex flex-1 items-start justify-between gap-2 text-sm">
                      <div>
                        <p className="font-medium text-ink line-clamp-1">{it.productName}</p>
                        <p className="text-xs text-ink-3">{it.variationLabel} · {it.quantity}x</p>
                      </div>
                      <p className="font-semibold text-ink">{formatBRL(it.unitPrice * it.quantity)}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-lg border border-primary-700 bg-primary-50 p-4">
              <div className="flex items-center gap-2 text-sm font-bold text-primary-700">
                <Zap className="h-4 w-4" /> Pagamento via Pix
              </div>
              <p className="mt-1 text-xs text-ink-2">Você recebe o QR Code na próxima tela. 5% de desconto já aplicado.</p>
            </div>

            {error && <p className="text-sm text-error">{error}</p>}

            <Button size="lg" fullWidth onClick={onPlaceOrder} loading={submitting} leftIcon={!submitting ? <CheckCircle2 className="h-5 w-5" /> : null}>
              Gerar Pix e finalizar
            </Button>
            <p className="text-center text-xs text-ink-3">
              Ao confirmar você concorda com nossos <Link href="/policies/terms" className="underline">termos</Link>.
            </p>
          </section>
        )}
      </div>

      {/* Resumo lateral */}
      <aside className="lg:sticky lg:top-20 lg:self-start">
        <div className="rounded-lg border border-border bg-white p-4 sm:p-6">
          <h2 className="text-base font-bold text-ink">Resumo</h2>
          <dl className="mt-4 space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-ink-3">Subtotal ({items.length} {items.length === 1 ? 'item' : 'itens'})</dt>
              <dd className="font-medium">{formatBRL(subtotal)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-ink-3 inline-flex items-center gap-1"><Truck className="h-3.5 w-3.5" /> Frete</dt>
              <dd className="font-medium">
                {quoteLoading ? <Loader2 className="h-4 w-4 animate-spin text-ink-3" /> : formatBRL(shippingCost)}
              </dd>
            </div>
            <div className="my-3 border-t border-border" />
            <div className="flex justify-between text-base">
              <dt className="font-bold text-ink">Total</dt>
              <dd className="font-bold text-ink">{formatBRL(total)}</dd>
            </div>
          </dl>

          <div className="mt-4 flex items-center gap-2 rounded-md border border-primary-700 bg-primary-50 px-3 py-2">
            <Zap className="h-4 w-4 text-primary-700" />
            <div className="flex-1">
              <p className="text-xs text-ink-3">À vista no Pix</p>
              <p className="text-sm font-bold text-primary-700">{formatBRL(pixTotal)}</p>
            </div>
            <span className="rounded-sm bg-primary-700 px-2 py-0.5 text-xs font-bold text-white">5% OFF</span>
          </div>

          {quote && (
            <p className="mt-3 text-xs text-ink-3">
              Entrega estimada em {quote.shipping[0]?.estimatedDays} dia(s) úteis pra {quote.city}/{quote.state}.
            </p>
          )}
        </div>
      </aside>
    </div>
  )
}

function Steps({ step }: { step: Step }) {
  const stages: Array<{ id: Step; label: string }> = [
    { id: 'address', label: 'Endereço' },
    { id: 'review',  label: 'Revisar e pagar' },
  ]
  const idx = stages.findIndex(s => s.id === step)
  return (
    <ol className="mt-3 flex items-center gap-2 text-xs text-ink-3">
      {stages.map((s, i) => (
        <li key={s.id} className="flex items-center gap-2">
          <span className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold ${i <= idx ? 'bg-primary-700 text-white' : 'bg-surface-2 text-ink-3'}`}>{i + 1}</span>
          <span className={i === idx ? 'font-semibold text-ink' : ''}>{s.label}</span>
          {i < stages.length - 1 && <ChevronRight className="h-3 w-3 text-ink-4" />}
        </li>
      ))}
    </ol>
  )
}

function NewAddressForm({ onCreated, onCancel }: { onCreated: (a: Address) => void; onCancel: () => void }) {
  const [form, setForm] = useState({
    label: '', recipient: '', zipcode: '', street: '', number: '', complement: '',
    district: '', city: '', state: '', phone: '', isDefault: false,
  })
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState<string | null>(null)

  async function fillFromCep() {
    if (form.zipcode.replace(/\D/g, '').length !== 8) return
    try {
      const q = await calculateShipping(form.zipcode)
      setForm(s => ({ ...s, city: q.city, state: q.state, district: q.district || s.district, street: q.street || s.street }))
    } catch (e) {
      setErr(ApiError.is(e) ? e.message : 'CEP inválido')
    }
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setErr(null)
    setBusy(true)
    try {
      const created = await createAddress({
        label: form.label || undefined,
        recipient: form.recipient,
        zipcode: form.zipcode,
        street: form.street,
        number: form.number,
        complement: form.complement || undefined,
        district: form.district,
        city: form.city,
        state: form.state,
        phone: form.phone || undefined,
        isDefault: form.isDefault,
      })
      onCreated(created)
    } catch (e) {
      setErr(ApiError.is(e) ? e.message : 'Erro ao salvar endereço')
    } finally {
      setBusy(false)
    }
  }

  const inp = 'w-full rounded-md border border-border px-3 py-2 text-base focus:border-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-700/20'

  return (
    <form onSubmit={submit} className="rounded-lg border border-border bg-white p-4 space-y-3">
      <p className="text-sm font-semibold text-ink">Novo endereço</p>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block">
          <span className="text-xs font-medium text-ink-2">Apelido <span className="text-ink-4">(opcional)</span></span>
          <input className={inp} value={form.label} onChange={e => setForm({ ...form, label: e.target.value })} placeholder="Casa, Trabalho…" />
        </label>
        <label className="block">
          <span className="text-xs font-medium text-ink-2">Recebedor</span>
          <input required className={inp} value={form.recipient} onChange={e => setForm({ ...form, recipient: e.target.value })} />
        </label>
        <label className="block">
          <span className="text-xs font-medium text-ink-2">CEP</span>
          <input required className={inp} value={form.zipcode} onBlur={fillFromCep} onChange={e => setForm({ ...form, zipcode: e.target.value })} placeholder="00000-000" />
        </label>
        <label className="block">
          <span className="text-xs font-medium text-ink-2">Telefone</span>
          <input className={inp} value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="(11) 99999-9999" />
        </label>
        <label className="block sm:col-span-2">
          <span className="text-xs font-medium text-ink-2">Rua</span>
          <input required className={inp} value={form.street} onChange={e => setForm({ ...form, street: e.target.value })} />
        </label>
        <label className="block">
          <span className="text-xs font-medium text-ink-2">Número</span>
          <input required className={inp} value={form.number} onChange={e => setForm({ ...form, number: e.target.value })} />
        </label>
        <label className="block">
          <span className="text-xs font-medium text-ink-2">Complemento</span>
          <input className={inp} value={form.complement} onChange={e => setForm({ ...form, complement: e.target.value })} />
        </label>
        <label className="block">
          <span className="text-xs font-medium text-ink-2">Bairro</span>
          <input required className={inp} value={form.district} onChange={e => setForm({ ...form, district: e.target.value })} />
        </label>
        <label className="block">
          <span className="text-xs font-medium text-ink-2">Cidade</span>
          <input required className={inp} value={form.city} onChange={e => setForm({ ...form, city: e.target.value })} />
        </label>
        <label className="block">
          <span className="text-xs font-medium text-ink-2">UF</span>
          <input required maxLength={2} className={inp} value={form.state} onChange={e => setForm({ ...form, state: e.target.value.toUpperCase() })} />
        </label>
      </div>
      <label className="inline-flex items-center gap-2 text-sm text-ink-2">
        <input type="checkbox" className="h-4 w-4 accent-primary-700" checked={form.isDefault} onChange={e => setForm({ ...form, isDefault: e.target.checked })} />
        Definir como padrão
      </label>

      {err && <p className="text-sm text-error">{err}</p>}

      <div className="flex gap-2">
        <Button type="submit" loading={busy}>Salvar endereço</Button>
        <Button type="button" variant="ghost" onClick={onCancel} disabled={busy}>Cancelar</Button>
      </div>
    </form>
  )
}
