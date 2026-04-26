'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Minus, Plus, Trash2, ShoppingBag, Zap, Truck } from 'lucide-react'
import { useCart } from '@/stores/cart'
import { formatBRL, pixPrice } from '@/lib/format'

export default function CartPage() {
  // Hydration: o store persiste no localStorage. Render só após mount pra evitar mismatch.
  const [hydrated, setHydrated] = useState(false)
  useEffect(() => setHydrated(true), [])

  const items     = useCart(s => s.items)
  const subtotal  = useCart(s => s.subtotal())
  const update    = useCart(s => s.updateQty)
  const remove    = useCart(s => s.removeItem)
  const clear     = useCart(s => s.clear)

  if (!hydrated) {
    return <div className="container-app py-12 text-center text-ink-3">Carregando…</div>
  }

  if (items.length === 0) {
    return (
      <div className="container-app py-16 text-center">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-pill bg-primary-50 text-primary-700">
          <ShoppingBag className="h-10 w-10" />
        </div>
        <h1 className="mt-6 font-display text-2xl text-ink sm:text-3xl">Carrinho vazio</h1>
        <p className="mt-2 text-sm text-ink-3">Vê o que tá rolando lá na vitrine.</p>
        <Link href="/products" className="mt-6 inline-flex items-center gap-2 rounded-md bg-primary-700 px-6 py-3 text-base font-semibold text-white transition hover:bg-primary-900">
          Ver produtos
        </Link>
      </div>
    )
  }

  const FLAT_FREIGHT = 15
  const totalWithShipping = subtotal + FLAT_FREIGHT
  const pixTotal = pixPrice(totalWithShipping)

  return (
    <div className="container-app py-6 sm:py-10">
      <h1 className="font-display text-2xl text-ink sm:text-3xl">Carrinho</h1>
      <p className="mt-1 text-sm text-ink-3">{items.length} {items.length === 1 ? 'item' : 'itens'} no seu carrinho</p>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_360px]">
        {/* Itens */}
        <div>
        <ul className="space-y-3">
          {items.map(item => (
            <li key={item.variationId} className="flex gap-3 rounded-lg border border-border bg-white p-3 sm:gap-4 sm:p-4">
              <Link href={`/products/${item.productSlug}`} className="relative h-24 w-20 shrink-0 overflow-hidden rounded-md bg-surface-2 sm:h-28 sm:w-24">
                {item.imageUrl && (
                  <Image src={item.imageUrl} alt={item.productName} fill sizes="100px" className="object-cover" unoptimized />
                )}
              </Link>
              <div className="flex flex-1 flex-col">
                <Link href={`/products/${item.productSlug}`} className="text-sm font-semibold text-ink line-clamp-2 hover:text-primary-700 sm:text-base">
                  {item.productName}
                </Link>
                <p className="mt-1 text-xs text-ink-3">{item.variationLabel}</p>

                <div className="mt-auto flex items-end justify-between">
                  <div className="flex items-center gap-1 rounded-md border border-border">
                    <button onClick={() => update(item.variationId, item.quantity - 1)} aria-label="Diminuir" className="flex h-9 w-9 items-center justify-center text-ink-2 hover:bg-surface-2">
                      <Minus className="h-4 w-4" />
                    </button>
                    <span className="w-8 text-center text-sm font-semibold">{item.quantity}</span>
                    <button onClick={() => update(item.variationId, item.quantity + 1)} disabled={item.quantity >= item.maxStock} aria-label="Aumentar" className="flex h-9 w-9 items-center justify-center text-ink-2 hover:bg-surface-2 disabled:opacity-40 disabled:cursor-not-allowed">
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="text-right">
                    <p className="text-base font-bold text-ink sm:text-lg">{formatBRL(item.unitPrice * item.quantity)}</p>
                    <button onClick={() => remove(item.variationId)} className="mt-1 inline-flex items-center gap-1 text-xs text-ink-3 hover:text-error">
                      <Trash2 className="h-3 w-3" /> Remover
                    </button>
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>

        <div className="pt-2 text-right">
          <button onClick={clear} className="text-xs text-ink-3 hover:text-error">Esvaziar carrinho</button>
        </div>
        </div>

        {/* Resumo */}
        <aside className="lg:sticky lg:top-20 lg:self-start">
          <div className="rounded-lg border border-border bg-white p-4 sm:p-6">
            <h2 className="text-base font-bold text-ink">Resumo do pedido</h2>
            <dl className="mt-4 space-y-2 text-sm">
              <div className="flex justify-between"><dt className="text-ink-3">Subtotal</dt><dd className="font-medium">{formatBRL(subtotal)}</dd></div>
              <div className="flex justify-between"><dt className="text-ink-3 inline-flex items-center gap-1"><Truck className="h-3.5 w-3.5" /> Frete</dt><dd className="font-medium">{formatBRL(FLAT_FREIGHT)}</dd></div>
              <div className="my-3 border-t border-border" />
              <div className="flex justify-between text-base"><dt className="font-bold text-ink">Total</dt><dd className="font-bold text-ink">{formatBRL(totalWithShipping)}</dd></div>
            </dl>

            <div className="mt-4 flex items-center gap-2 rounded-md border border-primary-700 bg-primary-50 px-3 py-2">
              <Zap className="h-4 w-4 text-primary-700" />
              <div className="flex-1">
                <p className="text-xs text-ink-3">À vista no Pix</p>
                <p className="text-sm font-bold text-primary-700">{formatBRL(pixTotal)}</p>
              </div>
              <span className="rounded-sm bg-primary-700 px-2 py-0.5 text-xs font-bold text-white">5% OFF</span>
            </div>

            <Link href="/checkout" className="mt-4 flex h-12 w-full items-center justify-center rounded-md bg-primary-700 px-6 text-base font-semibold text-white transition hover:bg-primary-900">
              Finalizar compra
            </Link>
            <p className="mt-2 text-center text-xs text-ink-3">Pagamento via Pix, com 5% de desconto.</p>
          </div>

          <Link href="/products" className="mt-4 block text-center text-sm text-primary-700 hover:underline">
            Voltar pras peças
          </Link>
        </aside>
      </div>
    </div>
  )
}
