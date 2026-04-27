'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import {
  CreditCard,
  Banknote,
  QrCode,
  Loader2,
  Check,
  MapPin,
  ShieldCheck,
  Tag,
  Lock,
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { useToast } from '@/components/ui/Toast'
import { useCart } from '@/stores/cart'
import { useAuth } from '@/stores/auth'
import { listAddresses, createAddress, type AddressInput } from '@/services/addresses'
import { createOrder } from '@/services/orders'
import { formatBRL, pixPrice } from '@/lib/format'
import { ApiError } from '@/lib/api-error'
import type { Address } from '@/services/types'

type PaymentMethod = 'PIX' | 'CREDIT_CARD' | 'BOLETO'

const STATES = [
  'AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS','MG','PA','PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC','SP','SE','TO',
]

export function CheckoutClient() {
  const router = useRouter()
  const toast = useToast()
  const items = useCart((s) => s.items)
  const cartSource = useCart((s) => s.source)
  const subtotal = useCart((s) => s.subtotal())
  const clearCart = useCart((s) => s.clear)
  const user = useAuth((s) => s.user)
  const hydrated = useAuth((s) => s.hydrated)

  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null)
  const [showNewAddress, setShowNewAddress] = useState(false)
  const [savingAddress, setSavingAddress] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('PIX')
  const [installments, setInstallments] = useState(1)
  const [coupon, setCoupon] = useState<string>('')
  const [notes, setNotes] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [mounted, setMounted] = useState(false)

  // address form state
  const [zip, setZip] = useState('')
  const [zipLoading, setZipLoading] = useState(false)
  const [addr, setAddr] = useState<Partial<AddressInput>>({})

  useEffect(() => {
    setMounted(true)
    try {
      const c = sessionStorage.getItem('kore-coupon')
      if (c) setCoupon(c)
    } catch {}
  }, [])

  // Redirect: nao tem login → manda pra login com redirect
  useEffect(() => {
    if (mounted && hydrated && !user) {
      router.replace(`/auth/login?redirect=${encodeURIComponent('/checkout')}`)
    }
  }, [mounted, hydrated, user, router])

  // Carrinho vazio → cart
  useEffect(() => {
    if (mounted && items.length === 0) {
      router.replace('/cart')
    }
  }, [mounted, items.length, router])

  const addressesQuery = useQuery({
    queryKey: ['addresses'],
    queryFn: listAddresses,
    enabled: !!user,
  })

  useEffect(() => {
    const list = addressesQuery.data
    if (!list || selectedAddressId) return
    const def = list.find((a) => a.isDefault) ?? list[0]
    if (def) setSelectedAddressId(def.id)
    else setShowNewAddress(true)
  }, [addressesQuery.data, selectedAddressId])

  const couponDiscount = useMemo(() => {
    if (!coupon) return 0
    const map: Record<string, number> = {
      BEMVINDO5: 0.05,
      PIXFIRST: 0.05,
      BUILDER10: subtotal >= 5000 ? 0.10 : 0,
      COMBO15: subtotal >= 7500 ? 0.15 : 0,
    }
    return Math.round(subtotal * (map[coupon] ?? 0))
  }, [coupon, subtotal])

  const shipping = subtotal > 5000 ? 0 : 49.9
  const total = Math.max(0, subtotal - couponDiscount + shipping)
  const totalToPay = paymentMethod === 'PIX' ? pixPrice(total) : total
  const installmentValue = installments > 0 ? total / installments : total

  async function lookupZip(value: string) {
    const cleaned = value.replace(/\D/g, '')
    if (cleaned.length !== 8) return
    setZipLoading(true)
    try {
      const res = await fetch(`https://viacep.com.br/ws/${cleaned}/json/`)
      if (!res.ok) {
        throw new Error(`viacep status ${res.status}`)
      }
      const data = await res.json()
      if (data?.erro) {
        toast.push({ variant: 'danger', message: 'CEP nao encontrado. Verifique e tente de novo.' })
        return
      }
      setAddr((a) => ({
        ...a,
        street: data.logradouro || a.street || '',
        district: data.bairro || a.district || '',
        city: data.localidade || a.city || '',
        state: data.uf || a.state || '',
      }))
    } catch {
      toast.push({ variant: 'danger', message: 'CEP nao encontrado. Verifique e tente de novo.' })
    } finally {
      setZipLoading(false)
    }
  }

  async function saveNewAddress(e: React.FormEvent) {
    e.preventDefault()
    if (!addr.recipient || !addr.street || !addr.number || !addr.district || !addr.city || !addr.state || !zip) {
      toast.push({ variant: 'warning', message: 'Preencha todos os campos obrigatorios do endereco.' })
      return
    }
    setSavingAddress(true)
    try {
      const created = await createAddress({
        recipient: addr.recipient,
        zipcode: zip.replace(/\D/g, ''),
        street: addr.street,
        number: addr.number,
        complement: addr.complement,
        district: addr.district,
        city: addr.city,
        state: addr.state,
        phone: addr.phone,
        isDefault: addr.isDefault ?? false,
        label: addr.label,
      })
      toast.push({ variant: 'success', message: 'Endereco salvo.' })
      setSelectedAddressId(created.id)
      setShowNewAddress(false)
      addressesQuery.refetch()
    } catch (err) {
      toast.push({
        variant: 'danger',
        title: 'Falha ao salvar endereco',
        message: ApiError.is(err) ? err.message : 'Tente de novo.',
      })
    } finally {
      setSavingAddress(false)
    }
  }

  async function placeOrder() {
    if (!selectedAddressId) {
      toast.push({ variant: 'warning', message: 'Selecione ou cadastre um endereco de entrega.' })
      return
    }
    setSubmitting(true)
    try {
      const order = await createOrder({
        addressId: selectedAddressId,
        paymentMethod,
        installments: paymentMethod === 'CREDIT_CARD' ? installments : undefined,
        couponCode: coupon || undefined,
        notes: notes || undefined,
        items: items.map(i => ({ productId: i.productId, variationId: i.variationId, quantity: i.quantity })),
        cartSource,
      })
      try {
        sessionStorage.removeItem('kore-coupon')
      } catch {}
      clearCart()
      toast.push({ variant: 'success', message: `Pedido ${order.orderNumber} criado.` })
      router.push(`/orders/${order.id}`)
    } catch (err) {
      toast.push({
        variant: 'danger',
        title: 'Falha ao criar pedido',
        message: ApiError.is(err) ? err.message : 'Tente de novo em alguns segundos.',
      })
    } finally {
      setSubmitting(false)
    }
  }

  if (!mounted || !hydrated || !user || items.length === 0) {
    return (
      <main className="container-app py-16">
        <div className="mx-auto h-8 w-8 animate-spin">
          <Loader2 className="h-8 w-8 text-primary" />
        </div>
      </main>
    )
  }

  return (
    <main className="container-app py-8 sm:py-12">
      <header className="mb-6">
        <p className="font-specs text-xs font-bold uppercase tracking-widest text-primary">Checkout</p>
        <h1 className="mt-1 font-display text-2xl font-bold text-text sm:text-3xl">Finalizar pedido</h1>
        <p className="mt-1 text-sm text-text-secondary">Endereco, pagamento e revisao. Tudo em uma tela.</p>
      </header>

      <div className="grid gap-6 lg:grid-cols-[1fr_400px]">
        <div className="space-y-6">
          <section className="rounded-lg border border-border bg-surface p-5">
            <header className="mb-4 flex items-center gap-2">
              <MapPin className="h-4 w-4 text-primary" />
              <h2 className="text-sm font-bold uppercase tracking-wide text-text">Endereco de entrega</h2>
            </header>

            {addressesQuery.isLoading && <p className="text-sm text-text-secondary">Carregando...</p>}

            {!addressesQuery.isLoading && (addressesQuery.data?.length ?? 0) > 0 && !showNewAddress && (
              <div className="space-y-2">
                {addressesQuery.data!.map((a) => (
                  <AddressOption
                    key={a.id}
                    address={a}
                    selected={a.id === selectedAddressId}
                    onSelect={() => setSelectedAddressId(a.id)}
                  />
                ))}
                <button
                  type="button"
                  onClick={() => setShowNewAddress(true)}
                  className="text-xs font-medium text-primary hover:underline"
                >
                  + Novo endereco
                </button>
              </div>
            )}

            {(showNewAddress || (addressesQuery.data?.length ?? 0) === 0) && (
              <form onSubmit={saveNewAddress} className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <Input
                  name="recipient"
                  label="Destinatario"
                  placeholder="Quem vai receber"
                  className="sm:col-span-2"
                  value={addr.recipient ?? ''}
                  onChange={(e) => setAddr((a) => ({ ...a, recipient: e.target.value }))}
                />
                <Input
                  name="zip"
                  label="CEP"
                  placeholder="00000-000"
                  inputMode="numeric"
                  maxLength={9}
                  value={zip}
                  onChange={(e) => {
                    const v = e.target.value
                    setZip(v)
                    if (v.replace(/\D/g, '').length === 8) lookupZip(v)
                  }}
                  rightSlot={zipLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin text-primary" /> : null}
                  hint="Buscamos automatico no ViaCEP"
                />
                <Input
                  name="phone"
                  label="Telefone"
                  type="tel"
                  inputMode="tel"
                  placeholder="(11) 99999-9999"
                  value={addr.phone ?? ''}
                  onChange={(e) => setAddr((a) => ({ ...a, phone: e.target.value }))}
                />
                <Input
                  name="street"
                  label="Rua / Logradouro"
                  className="sm:col-span-2"
                  value={addr.street ?? ''}
                  onChange={(e) => setAddr((a) => ({ ...a, street: e.target.value }))}
                />
                <Input
                  name="number"
                  label="Numero"
                  inputMode="numeric"
                  value={addr.number ?? ''}
                  onChange={(e) => setAddr((a) => ({ ...a, number: e.target.value }))}
                />
                <Input
                  name="complement"
                  label="Complemento (opcional)"
                  value={addr.complement ?? ''}
                  onChange={(e) => setAddr((a) => ({ ...a, complement: e.target.value }))}
                />
                <Input
                  name="district"
                  label="Bairro"
                  value={addr.district ?? ''}
                  onChange={(e) => setAddr((a) => ({ ...a, district: e.target.value }))}
                />
                <Input
                  name="city"
                  label="Cidade"
                  value={addr.city ?? ''}
                  onChange={(e) => setAddr((a) => ({ ...a, city: e.target.value }))}
                />
                <Select
                  name="state"
                  label="Estado"
                  value={addr.state ?? ''}
                  onChange={(e) => setAddr((a) => ({ ...a, state: e.target.value }))}
                >
                  <option value="">UF</option>
                  {STATES.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </Select>

                <label className="flex items-center gap-2 text-xs text-text-secondary sm:col-span-2">
                  <input
                    type="checkbox"
                    checked={addr.isDefault ?? false}
                    onChange={(e) => setAddr((a) => ({ ...a, isDefault: e.target.checked }))}
                    className="h-4 w-4 rounded border-border bg-surface accent-primary"
                  />
                  Salvar como endereco padrao
                </label>

                <div className="flex gap-2 sm:col-span-2">
                  <Button type="submit" loading={savingAddress}>
                    Salvar endereco
                  </Button>
                  {(addressesQuery.data?.length ?? 0) > 0 && (
                    <Button type="button" variant="ghost" onClick={() => setShowNewAddress(false)}>
                      Cancelar
                    </Button>
                  )}
                </div>
              </form>
            )}
          </section>

          <section className="rounded-lg border border-border bg-surface p-5">
            <header className="mb-4 flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-primary" />
              <h2 className="text-sm font-bold uppercase tracking-wide text-text">Pagamento</h2>
            </header>

            <div className="space-y-2">
              <PaymentOption
                method="PIX"
                label="Pix"
                description={`5% off automatico. Voce paga ${formatBRL(pixPrice(total))} se finalizar agora.`}
                icon={<QrCode className="h-5 w-5" />}
                selected={paymentMethod === 'PIX'}
                onSelect={() => setPaymentMethod('PIX')}
                badge="5% off"
              />
              <PaymentOption
                method="CREDIT_CARD"
                label="Cartao de credito"
                description={`Parcele em ate 12x. ${installments}x ${formatBRL(installmentValue)} sem juros.`}
                icon={<CreditCard className="h-5 w-5" />}
                selected={paymentMethod === 'CREDIT_CARD'}
                onSelect={() => setPaymentMethod('CREDIT_CARD')}
              />
              <PaymentOption
                method="BOLETO"
                label="Boleto"
                description="Compensa em 1 a 2 dias uteis. Sem desconto."
                icon={<Banknote className="h-5 w-5" />}
                selected={paymentMethod === 'BOLETO'}
                onSelect={() => setPaymentMethod('BOLETO')}
              />
            </div>

            {paymentMethod === 'CREDIT_CARD' && (
              <div className="mt-4">
                <Select
                  name="installments"
                  label="Parcelamento"
                  value={installments}
                  onChange={(e) => setInstallments(Number(e.target.value))}
                >
                  {Array.from({ length: 12 }).map((_, i) => {
                    const n = i + 1
                    const v = total / n
                    return (
                      <option key={n} value={n}>
                        {n}x de {formatBRL(v)} sem juros
                      </option>
                    )
                  })}
                </Select>
                <p className="mt-2 text-xs text-text-muted">
                  <Lock className="mr-1 inline h-3 w-3" /> Os dados do cartao sao processados pelo MercadoPago na proxima
                  tela. A Kore Tech nao armazena cartao.
                </p>
              </div>
            )}
          </section>

          <section className="rounded-lg border border-border bg-surface p-5">
            <header className="mb-3">
              <h2 className="text-sm font-bold uppercase tracking-wide text-text">Observacoes (opcional)</h2>
            </header>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Algum detalhe pra entrega? Ex: 'apto 304, deixar com porteiro'"
              rows={3}
              maxLength={400}
              className="w-full rounded-md border border-border bg-surface px-4 py-3 text-sm text-text placeholder:text-text-muted focus:border-primary focus:outline-none focus:shadow-[0_0_0_3px_rgba(0,229,255,0.20)]"
            />
            <p className="mt-1 text-right text-xs text-text-muted">{notes.length}/400</p>
          </section>
        </div>

        <aside className="lg:sticky lg:top-20 lg:self-start">
          <div className="rounded-lg border border-border bg-surface p-5">
            <h2 className="text-sm font-bold uppercase tracking-wide text-text">Seu pedido</h2>

            <ul className="mt-4 space-y-3 max-h-72 overflow-y-auto pr-1">
              {items.map((it) => (
                <li key={it.variationId} className="flex items-start gap-3 text-sm">
                  <span className="font-specs text-xs text-text-muted">{it.quantity}x</span>
                  <p className="flex-1 line-clamp-2 text-text">{it.productName}</p>
                  <span className="font-specs text-xs text-text">{formatBRL(it.unitPrice * it.quantity)}</span>
                </li>
              ))}
            </ul>

            <div className="my-4 border-t border-border" />

            <div className="space-y-1.5 text-sm text-text-secondary">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-specs text-text">{formatBRL(subtotal)}</span>
              </div>
              {couponDiscount > 0 && (
                <div className="flex justify-between text-success">
                  <span className="inline-flex items-center gap-1">
                    <Tag className="h-3.5 w-3.5" /> {coupon}
                  </span>
                  <span className="font-specs">-{formatBRL(couponDiscount)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Frete</span>
                <span className="font-specs text-text">{shipping === 0 ? 'Gratis' : formatBRL(shipping)}</span>
              </div>
            </div>

            <div className="my-4 border-t border-border" />

            <div className="flex items-end justify-between">
              <span className="text-sm text-text-secondary">
                {paymentMethod === 'PIX' ? 'Voce paga no Pix' : 'Total'}
              </span>
              <span className="font-specs text-2xl font-bold text-text">
                {formatBRL(totalToPay)}
              </span>
            </div>
            {paymentMethod === 'PIX' && (
              <p className="mt-1 text-right text-xs text-text-muted">
                no cartao seria {formatBRL(total)}
              </p>
            )}

            <Button size="lg" className="mt-5 w-full cta-glow" onClick={placeOrder} loading={submitting}>
              Criar pedido <Check className="h-4 w-4" />
            </Button>

            <p className="mt-3 text-center text-xs text-text-muted">
              <ShieldCheck className="mr-1 inline h-3 w-3 text-primary" /> Seguro. Dados criptografados.
            </p>
            <Link href="/cart" className="mt-3 block text-center text-xs text-text-secondary hover:text-primary">
              Voltar pro carrinho
            </Link>
          </div>
        </aside>
      </div>
    </main>
  )
}

function AddressOption({
  address,
  selected,
  onSelect,
}: {
  address: Address
  selected: boolean
  onSelect: () => void
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`flex w-full items-start gap-3 rounded-md border p-3 text-left transition ${selected ? 'border-primary bg-primary-soft' : 'border-border hover:border-primary/40'}`}
    >
      <span
        className={`mt-1 flex h-4 w-4 shrink-0 items-center justify-center rounded-pill border-2 ${selected ? 'border-primary' : 'border-border-strong'}`}
      >
        {selected && <span className="h-2 w-2 rounded-pill bg-primary" />}
      </span>
      <div className="text-sm">
        <p className="font-semibold text-text">
          {address.recipient}
          {address.isDefault && (
            <span className="ml-2 inline-flex items-center rounded-pill bg-bg/60 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-text-secondary">
              Padrao
            </span>
          )}
        </p>
        <p className="text-text-secondary">
          {address.street}, {address.number}
          {address.complement ? ` ${address.complement}` : ''}
        </p>
        <p className="text-xs text-text-muted">
          {address.district} · {address.city}/{address.state} · CEP {address.zipcode}
        </p>
      </div>
    </button>
  )
}

function PaymentOption({
  label,
  description,
  icon,
  selected,
  onSelect,
  badge,
}: {
  method: PaymentMethod
  label: string
  description: string
  icon: React.ReactNode
  selected: boolean
  onSelect: () => void
  badge?: string
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`flex w-full items-start gap-3 rounded-md border p-3 text-left transition ${selected ? 'border-primary bg-primary-soft' : 'border-border hover:border-primary/40'}`}
    >
      <span
        className={`mt-1 flex h-4 w-4 shrink-0 items-center justify-center rounded-pill border-2 ${selected ? 'border-primary' : 'border-border-strong'}`}
      >
        {selected && <span className="h-2 w-2 rounded-pill bg-primary" />}
      </span>
      <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-md ${selected ? 'bg-primary text-bg' : 'bg-surface-2 text-primary'}`}>
        {icon}
      </span>
      <div className="flex-1 text-sm">
        <p className="flex items-center gap-2 font-semibold text-text">
          {label}
          {badge && (
            <span className="inline-flex items-center rounded-pill border border-primary/40 bg-bg/60 px-2 py-0.5 text-[10px] font-mono font-bold text-primary">
              {badge}
            </span>
          )}
        </p>
        <p className="text-xs text-text-secondary">{description}</p>
      </div>
    </button>
  )
}
