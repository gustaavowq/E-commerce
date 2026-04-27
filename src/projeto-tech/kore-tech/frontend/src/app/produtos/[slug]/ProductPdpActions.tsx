'use client'

import { useState } from 'react'
import { Minus, Plus, ShoppingCart, Check, MessageCircle, Copy } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { useCart } from '@/stores/cart'
import type { ProductDetail } from '@/services/types'

type Props = { product: ProductDetail }

/**
 * Bloco de acoes da PDP: variation picker (se houver), quantidade, add carrinho.
 * Tambem cobre share WhatsApp / Copiar link.
 */
export function ProductPdpActions({ product }: Props) {
  const variations = product.variations ?? []
  const [selectedVarId, setSelectedVarId] = useState<string | null>(variations[0]?.id ?? null)
  const [qty, setQty] = useState(1)
  const [added, setAdded] = useState(false)
  const [copied, setCopied] = useState(false)
  const addItem = useCart((s) => s.addItem)

  const sel = variations.find((v) => v.id === selectedVarId) ?? variations[0]
  const maxStock = sel?.stock ?? product.totalStock
  const unitPrice = sel?.priceOverride ?? product.basePrice
  const wpp = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? '5511999999999'

  function add() {
    if (!sel) {
      // produto sem variation explicit — cria fake
      addItem(
        {
          productId: product.id,
          variationId: product.id,
          productSlug: product.slug,
          productName: product.name,
          variationLabel: 'Padrao',
          unitPrice: product.basePrice,
          imageUrl: product.images[0]?.url ?? null,
          maxStock: product.totalStock,
        },
        qty,
      )
    } else {
      addItem(
        {
          productId: product.id,
          variationId: sel.id,
          productSlug: product.slug,
          productName: product.name,
          variationLabel: sel.label,
          unitPrice,
          imageUrl: product.images[0]?.url ?? null,
          maxStock,
        },
        qty,
      )
    }
    setAdded(true)
    setTimeout(() => setAdded(false), 1800)
  }

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(window.location.href)
      setCopied(true)
      setTimeout(() => setCopied(false), 1800)
    } catch {
      // noop
    }
  }

  function shareWhatsApp() {
    const msg = `Da uma olhada nessa peca: ${product.name} - ${window.location.href}`
    const url = `https://wa.me/?text=${encodeURIComponent(msg)}`
    window.open(url, '_blank', 'noopener,noreferrer')
  }

  return (
    <div className="space-y-4">
      {variations.length > 1 && (
        <div>
          <p className="mb-2 text-xs font-bold uppercase tracking-wide text-text-secondary">Versao</p>
          <div className="flex flex-wrap gap-2">
            {variations.map((v) => (
              <button
                key={v.id}
                onClick={() => setSelectedVarId(v.id)}
                disabled={v.stock === 0}
                className={`rounded-md border px-3 py-2 text-xs transition ${selectedVarId === v.id ? 'border-primary bg-primary-soft text-primary font-semibold' : 'border-border text-text-secondary hover:border-primary/40'} ${v.stock === 0 ? 'opacity-40 cursor-not-allowed' : ''}`}
              >
                {v.label}
                {v.stock === 0 && <span className="ml-1 text-[10px]">(esgotado)</span>}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="flex items-center gap-3">
        <div className="flex items-center rounded-md border border-border bg-surface">
          <button
            type="button"
            onClick={() => setQty((q) => Math.max(1, q - 1))}
            aria-label="Diminuir quantidade"
            className="flex h-11 w-11 items-center justify-center text-text-secondary hover:text-text"
          >
            <Minus className="h-4 w-4" />
          </button>
          <span className="w-10 text-center font-specs text-sm">{qty}</span>
          <button
            type="button"
            onClick={() => setQty((q) => Math.min(maxStock, q + 1))}
            aria-label="Aumentar quantidade"
            className="flex h-11 w-11 items-center justify-center text-text-secondary hover:text-text"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>
        <Button onClick={add} className="flex-1 cta-glow touch-44" size="lg">
          {added ? <><Check className="h-4 w-4" /> Adicionado</> : <><ShoppingCart className="h-4 w-4" /> Adicionar ao carrinho</>}
        </Button>
      </div>

      <div className="flex flex-wrap gap-2 text-xs">
        <button
          type="button"
          onClick={shareWhatsApp}
          className="inline-flex items-center gap-1.5 rounded-md border border-border bg-surface px-3 py-2 text-text-secondary transition hover:border-whatsapp hover:text-whatsapp"
        >
          <MessageCircle className="h-3.5 w-3.5" /> Compartilhar no WhatsApp
        </button>
        <button
          type="button"
          onClick={copyLink}
          className="inline-flex items-center gap-1.5 rounded-md border border-border bg-surface px-3 py-2 text-text-secondary transition hover:border-primary hover:text-primary"
        >
          {copied ? <><Check className="h-3.5 w-3.5" /> Link copiado</> : <><Copy className="h-3.5 w-3.5" /> Copiar link</>}
        </button>
        <a
          href={`https://wa.me/${wpp}?text=${encodeURIComponent(`Quero tirar uma duvida sobre: ${product.name}`)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 rounded-md border border-border bg-surface px-3 py-2 text-text-secondary transition hover:border-whatsapp hover:text-whatsapp"
        >
          <MessageCircle className="h-3.5 w-3.5" /> Tirar duvida
        </a>
      </div>
    </div>
  )
}
