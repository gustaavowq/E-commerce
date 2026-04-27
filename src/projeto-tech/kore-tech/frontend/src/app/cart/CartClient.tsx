'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Minus, Plus, Trash2, ShoppingCart, ArrowRight, Tag, ShieldCheck, Truck } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { useToast } from '@/components/ui/Toast'
import { ProductImage } from '@/components/ProductImage'
import { useCart } from '@/stores/cart'
import { formatBRL, pixPrice, installmentLabel } from '@/lib/format'

const COUPONS: Record<string, { type: 'percent' | 'flat'; value: number; min?: number; label: string }> = {
  BEMVINDO5: { type: 'percent', value: 5, label: 'BEMVINDO5: 5% off (boas-vindas)' },
  PIXFIRST: { type: 'percent', value: 5, label: 'PIXFIRST: 5% off no Pix' },
  BUILDER10: { type: 'percent', value: 10, min: 5000, label: 'BUILDER10: 10% off em PCs montados acima de R$ 5.000' },
  COMBO15: { type: 'percent', value: 15, min: 7500, label: 'COMBO15: 15% off acima de R$ 7.500' },
  FRETE15: { type: 'flat', value: 15, label: 'FRETE15: R$ 15 off no frete' },
}

export function CartClient() {
  const router = useRouter()
  const toast = useToast()
  const items = useCart((s) => s.items)
  const cartSource = useCart((s) => s.source)
  const subtotal = useCart((s) => s.subtotal())
  const updateQty = useCart((s) => s.updateQty)
  const removeItem = useCart((s) => s.removeItem)
  const clear = useCart((s) => s.clear)

  const [coupon, setCoupon] = useState('')
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; discount: number; label: string } | null>(null)
  const [showCoupon, setShowCoupon] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  function applyCoupon() {
    const code = coupon.trim().toUpperCase()
    if (!code) return
    const def = COUPONS[code]
    if (!def) {
      toast.push({ variant: 'danger', message: `Cupom "${code}" invalido ou expirado.` })
      return
    }
    if (code === 'BUILDER10' && cartSource !== 'builder') {
      toast.push({ variant: 'warning', message: 'BUILDER10 e so pra carrinhos montados via builder. Monte seu PC em /montar.' })
      return
    }
    if (def.min && subtotal < def.min) {
      toast.push({
        variant: 'warning',
        message: `Cupom ${code} pede subtotal minimo de ${formatBRL(def.min)}.`,
      })
      return
    }
    const discount = def.type === 'percent' ? subtotal * (def.value / 100) : def.value
    setAppliedCoupon({ code, discount, label: def.label })
    toast.push({ variant: 'success', message: `Cupom ${code} aplicado.` })
  }

  function removeCoupon() {
    setAppliedCoupon(null)
    setCoupon('')
  }

  if (!mounted) {
    return (
      <main className="container-app py-12">
        <div className="h-64 animate-pulse-soft rounded-lg bg-surface/60" />
      </main>
    )
  }

  if (items.length === 0) {
    return (
      <main className="container-app py-16">
        <div className="mx-auto max-w-md rounded-lg border border-dashed border-border bg-surface/40 p-10 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-pill bg-primary-soft">
            <ShoppingCart className="h-8 w-8 text-primary" />
          </div>
          <h1 className="mt-4 font-display text-2xl font-bold text-text">Carrinho vazio</h1>
          <p className="mt-2 text-sm text-text-secondary">
            Comece pelos builds prontos por uso ou monte do zero com checagem automatica.
          </p>
          <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-center">
            <Link href="/builds">
              <Button variant="outline">Ver builds prontos</Button>
            </Link>
            <Link href="/montar">
              <Button>Abrir builder</Button>
            </Link>
          </div>
        </div>
      </main>
    )
  }

  const discount = appliedCoupon?.discount ?? 0
  const total = Math.max(0, subtotal - discount)
  const totalPix = pixPrice(total)

  return (
    <main className="container-app py-8 sm:py-12">
      <header className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="font-specs text-xs font-bold uppercase tracking-widest text-primary">Carrinho</p>
          <h1 className="mt-1 font-display text-2xl font-bold text-text sm:text-3xl">
            {items.length} {items.length === 1 ? 'item' : 'itens'} no carrinho
          </h1>
        </div>
        <button
          type="button"
          onClick={() => {
            if (confirm('Esvaziar o carrinho?')) {
              clear()
              toast.push({ variant: 'info', message: 'Carrinho esvaziado.' })
            }
          }}
          className="text-xs text-text-secondary hover:text-danger"
        >
          Esvaziar carrinho
        </button>
      </header>

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <ul className="space-y-3">
          {items.map((item) => (
            <li
              key={item.variationId}
              className="grid grid-cols-[88px_1fr] gap-3 rounded-lg border border-border bg-surface p-3 sm:grid-cols-[120px_1fr_auto] sm:p-4"
            >
              <Link
                href={`/produtos/${item.productSlug}`}
                className="relative aspect-square overflow-hidden rounded-md border border-border bg-bg"
              >
                <ProductImage
                  src={item.imageUrl ?? undefined}
                  alt={item.productName}
                  fallbackLabel={item.productName}
                  sizes="120px"
                />
              </Link>

              <div className="min-w-0 flex flex-col gap-1.5">
                <Link
                  href={`/produtos/${item.productSlug}`}
                  className="line-clamp-2 text-sm font-semibold text-text hover:text-primary sm:text-base"
                >
                  {item.productName}
                </Link>
                {item.variationLabel && item.variationLabel !== 'Padrao' && (
                  <p className="text-xs text-text-secondary">Versao: {item.variationLabel}</p>
                )}
                <p className="font-specs text-sm text-text">{formatBRL(item.unitPrice)} cada</p>

                <div className="mt-auto flex flex-wrap items-center gap-3 pt-1 sm:hidden">
                  <QtyStepper item={item} onChange={updateQty} />
                  <button
                    type="button"
                    onClick={() => removeItem(item.variationId)}
                    aria-label={`Remover ${item.productName}`}
                    className="ml-auto inline-flex items-center gap-1 text-xs text-text-secondary hover:text-danger"
                  >
                    <Trash2 className="h-3.5 w-3.5" /> Remover
                  </button>
                </div>
              </div>

              <div className="hidden flex-col items-end justify-between sm:flex">
                <button
                  type="button"
                  onClick={() => removeItem(item.variationId)}
                  aria-label={`Remover ${item.productName}`}
                  className="inline-flex items-center gap-1 text-xs text-text-secondary hover:text-danger"
                >
                  <Trash2 className="h-3.5 w-3.5" /> Remover
                </button>
                <QtyStepper item={item} onChange={updateQty} />
                <p className="font-specs text-base font-bold text-text">
                  {formatBRL(item.unitPrice * item.quantity)}
                </p>
              </div>
            </li>
          ))}
        </ul>

        <aside className="lg:sticky lg:top-20 lg:self-start">
          <div className="rounded-lg border border-border bg-surface p-5">
            <h2 className="text-sm font-bold uppercase tracking-wide text-text">Resumo</h2>

            <div className="mt-4 space-y-2 text-sm text-text-secondary">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-specs text-text">{formatBRL(subtotal)}</span>
              </div>
              {appliedCoupon && (
                <div className="flex justify-between text-success">
                  <span className="inline-flex items-center gap-1">
                    <Tag className="h-3.5 w-3.5" /> {appliedCoupon.code}
                  </span>
                  <span className="font-specs">-{formatBRL(appliedCoupon.discount)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Frete</span>
                <span className="text-xs text-text-muted">Calculado no checkout</span>
              </div>
            </div>

            <div className="my-4 border-t border-border" />

            <div className="flex items-end justify-between">
              <span className="text-sm text-text-secondary">Total</span>
              <div className="text-right">
                <p className="font-specs text-2xl font-bold text-text">{formatBRL(total)}</p>
                <p className="text-xs text-primary">
                  Pix: <span className="font-specs">{formatBRL(totalPix)}</span> (5% off)
                </p>
                <p className="text-xs text-text-secondary">{installmentLabel(total)}</p>
              </div>
            </div>

            <Button
              size="lg"
              className="mt-5 w-full cta-glow"
              onClick={() => {
                if (appliedCoupon) {
                  try {
                    sessionStorage.setItem('kore-coupon', appliedCoupon.code)
                  } catch {}
                }
                router.push('/checkout')
              }}
            >
              Ir pro checkout <ArrowRight className="h-4 w-4" />
            </Button>

            <div className="mt-4">
              {!showCoupon ? (
                <button
                  type="button"
                  onClick={() => setShowCoupon(true)}
                  className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
                >
                  <Tag className="h-3.5 w-3.5" /> Tem cupom?
                </button>
              ) : appliedCoupon ? (
                <div className="rounded-md border border-success/40 bg-success/5 p-3 text-xs">
                  <p className="font-medium text-success">{appliedCoupon.label}</p>
                  <button
                    type="button"
                    onClick={removeCoupon}
                    className="mt-1 text-text-secondary hover:text-danger"
                  >
                    Remover cupom
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  <Input
                    name="coupon"
                    placeholder="Codigo do cupom"
                    value={coupon}
                    onChange={(e) => setCoupon(e.target.value.toUpperCase())}
                    className="uppercase"
                  />
                  <div className="flex gap-2">
                    <Button type="button" variant="outline" size="sm" onClick={applyCoupon} className="flex-1">
                      Aplicar
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setShowCoupon(false)
                        setCoupon('')
                      }}
                    >
                      Cancelar
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>

          <ul className="mt-4 space-y-2 text-xs text-text-secondary">
            <li className="flex items-center gap-2">
              <ShieldCheck className="h-3.5 w-3.5 text-primary" /> Compra segura, dados criptografados
            </li>
            <li className="flex items-center gap-2">
              <Truck className="h-3.5 w-3.5 text-primary" /> Frete calculado por CEP no checkout
            </li>
            <li className="flex items-center gap-2">
              <Tag className="h-3.5 w-3.5 text-primary" /> Pix da 5% off automatico
            </li>
          </ul>
        </aside>
      </div>
    </main>
  )
}

type StepProps = {
  item: { variationId: string; quantity: number; maxStock: number }
  onChange: (id: string, qty: number) => void
}

function QtyStepper({ item, onChange }: StepProps) {
  return (
    <div className="inline-flex items-center rounded-md border border-border bg-surface-2">
      <button
        type="button"
        onClick={() => onChange(item.variationId, item.quantity - 1)}
        aria-label="Diminuir quantidade"
        disabled={item.quantity <= 1}
        className="flex h-9 w-9 items-center justify-center text-text-secondary hover:text-text disabled:opacity-40"
      >
        <Minus className="h-4 w-4" />
      </button>
      <span className="w-10 text-center font-specs text-sm">{item.quantity}</span>
      <button
        type="button"
        onClick={() => onChange(item.variationId, item.quantity + 1)}
        aria-label="Aumentar quantidade"
        disabled={item.quantity >= item.maxStock}
        className="flex h-9 w-9 items-center justify-center text-text-secondary hover:text-text disabled:opacity-40"
      >
        <Plus className="h-4 w-4" />
      </button>
    </div>
  )
}
