'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { Check, Truck, ShieldCheck, Zap, MessageCircle, Ruler, X, Minus, Plus, Share2, Link2 } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { AuthenticityBadge } from '@/components/AuthenticityBadge'
import { WishlistHeart } from '@/components/WishlistHeart'
import { ProductReviews } from '@/components/ProductReviews'
import { ProductImage } from '@/components/ProductImage'
import { ProductCard } from '@/components/ProductCard'
import { useCart } from '@/stores/cart'
import { getRelated } from '@/services/products'
import { formatBRL, discountPercent, installmentLabel, pixPrice } from '@/lib/format'
import type { ProductDetail, ProductVariation, StoreSettings, ProductListItem } from '@/services/types'
import { cn } from '@/lib/utils'

type Props = {
  product: ProductDetail
  settings?: StoreSettings | null
}

export function ProductDetailView({ product, settings }: Props) {
  const addToCart = useCart(s => s.addItem)

  // WhatsApp link contextual
  const waNumber  = settings?.whatsappNumber ?? '5511999999999'
  const waMessage = `Oi! Tô olhando aqui: ${product.brand.name} ${product.name}. Pode me ajudar?`
  const waUrl     = `https://wa.me/${waNumber}?text=${encodeURIComponent(waMessage)}`

  const colors = useMemo(() => Array.from(new Map(
    product.variations.map(v => [v.color, { color: v.color, hex: v.colorHex }] as const),
  ).values()), [product])

  const [selectedColor, setSelectedColor] = useState<string | null>(colors[0]?.color ?? null)
  const sizesForColor = useMemo(
    () => product.variations.filter(v => v.color === selectedColor),
    [product.variations, selectedColor],
  )
  const [selectedVariation, setSelectedVariation] = useState<ProductVariation | null>(sizesForColor[0] ?? null)
  const [activeImageIdx, setActiveImageIdx] = useState(0)
  const [added, setAdded] = useState(false)
  const [showSizeChart, setShowSizeChart] = useState(false)
  const [quantity, setQuantity] = useState(1)
  const [shareCopied, setShareCopied] = useState(false)

  const discount   = discountPercent(product.basePrice, product.comparePrice)
  const pixValue   = pixPrice(product.basePrice)

  // Multi-imagens por cor: prioriza imagens da cor selecionada, senão genéricas.
  // Se não houver imagens, retorna array com 1 entry com url null pra acionar o fallback do ProductImage.
  const images = useMemo(() => {
    const all = product.images.length
      ? product.images
      : [{ id: 'fallback', url: '', alt: product.name, sortOrder: 0, isPrimary: true, variationColor: null }]
    if (!selectedColor) return all
    const colorMatches = all.filter(i => i.variationColor === selectedColor)
    const generic      = all.filter(i => !i.variationColor)
    return colorMatches.length > 0 ? [...colorMatches, ...generic] : all
  }, [product.images, selectedColor, product.name])

  const onColorChange = (c: string) => {
    setSelectedColor(c)
    const first = product.variations.find(v => v.color === c)
    setSelectedVariation(first ?? null)
    setActiveImageIdx(0)  // reset gallery pra primeira foto da nova cor
  }

  const onAddToCart = () => {
    if (!selectedVariation) return
    const safeQty = Math.max(1, Math.min(quantity, selectedVariation.stock))
    addToCart({
      productId:    product.id,
      variationId:  selectedVariation.id,
      productSlug:  product.slug,
      productName:  product.name,
      variationLabel: `${selectedVariation.size} / ${selectedVariation.color}`,
      unitPrice:    selectedVariation.priceOverride ?? product.basePrice,
      imageUrl:     images[0]?.url ?? null,
      maxStock:     selectedVariation.stock,
    }, safeQty)
    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
  }

  function copyShareLink() {
    const url = typeof window !== 'undefined' ? window.location.href : ''
    if (!url) return
    navigator.clipboard.writeText(url).then(() => {
      setShareCopied(true)
      setTimeout(() => setShareCopied(false), 2000)
    }).catch(() => {})
  }

  return (
    <>
    <div className="grid gap-6 lg:grid-cols-[1fr_minmax(380px,420px)] lg:items-start lg:gap-10">
      {/* Galeria */}
      <div className="lg:sticky lg:top-20 lg:self-start">
        <div className="relative aspect-[4/5] w-full overflow-hidden rounded-lg bg-surface-2">
          <ProductImage
            src={images[activeImageIdx]?.url}
            alt={images[activeImageIdx]?.alt ?? product.name}
            fallbackLabel={product.name}
            sizes="(max-width: 1024px) 100vw, 60vw"
            priority
          />
          {discount && (
            <span className="absolute left-3 top-3 rounded-sm bg-accent px-2 py-1 text-xs font-black text-white animate-fade-in">
              -{discount}%
            </span>
          )}
          <div className="absolute right-3 top-3 flex flex-col items-end gap-2">
            <WishlistHeart productId={product.id} size="md" />
            <AuthenticityBadge />
          </div>
        </div>
        {images.length > 1 && (
          <div className="mt-3 grid grid-cols-5 gap-2">
            {images.map((img, idx) => (
              <button
                key={img.id}
                onClick={() => setActiveImageIdx(idx)}
                className={cn(
                  'relative aspect-square overflow-hidden rounded-md border-2 transition',
                  idx === activeImageIdx ? 'border-primary-700' : 'border-transparent hover:border-border-strong',
                )}
              >
                <ProductImage src={img.url} alt={img.alt ?? ''} fallbackLabel="" sizes="100px" />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Painel de compra */}
      <aside>
        <p className="text-sm font-bold uppercase tracking-wider text-primary-700">{product.brand.name}</p>
        <h1 className="mt-1 font-display text-2xl text-ink sm:text-3xl">{product.name}</h1>

        {/* Preço */}
        <div className="mt-4">
          {product.comparePrice && (
            <p className="text-sm text-ink-3 line-through">{formatBRL(product.comparePrice)}</p>
          )}
          <p className="text-3xl font-bold text-ink">{formatBRL(product.basePrice)}</p>
          <p className="mt-1 text-sm text-ink-3">{installmentLabel(product.basePrice)}</p>

          <div className="mt-3 flex items-center gap-2 rounded-md border border-primary-700 bg-primary-50 px-3 py-2">
            <Zap className="h-4 w-4 text-primary-700" />
            <span className="text-sm font-bold text-primary-700">
              {formatBRL(pixValue)} no Pix
            </span>
            <span className="ml-auto rounded-sm bg-primary-700 px-2 py-0.5 text-xs font-bold text-white">5% OFF</span>
          </div>
        </div>

        {/* Cor */}
        {colors.length > 0 && (
          <div className="mt-6">
            <h3 className="text-sm font-semibold text-ink">
              Cor: <span className="font-normal text-ink-2">{selectedColor}</span>
            </h3>
            <div className="mt-2 flex flex-wrap gap-2">
              {colors.map(c => (
                <button
                  key={c.color}
                  onClick={() => onColorChange(c.color)}
                  aria-label={c.color}
                  title={c.color}
                  className={cn(
                    'h-10 w-10 rounded-pill border-2 transition',
                    selectedColor === c.color
                      ? 'border-primary-700 ring-2 ring-primary-700 ring-offset-1'
                      : 'border-border hover:border-ink-3',
                  )}
                  style={{ backgroundColor: c.hex ?? '#ccc' }}
                />
              ))}
            </div>
          </div>
        )}

        {/* Tamanho */}
        <div className="mt-5">
          <h3 className="text-sm font-semibold text-ink flex items-center justify-between">
            <span>Tamanho</span>
            <button
              type="button"
              onClick={() => setShowSizeChart(true)}
              className="inline-flex items-center gap-1 text-xs font-medium text-primary-700 hover:underline"
            >
              <Ruler className="h-3 w-3" /> Tabela de medidas
            </button>
          </h3>
          <div className="mt-2 flex flex-wrap gap-2">
            {sizesForColor.map(v => {
              const isOut = v.stock === 0
              return (
                <button
                  key={v.id}
                  onClick={() => !isOut && setSelectedVariation(v)}
                  disabled={isOut}
                  className={cn(
                    'min-w-[3rem] rounded-md border-2 px-3 py-2 text-sm font-semibold transition',
                    selectedVariation?.id === v.id
                      ? 'border-primary-700 bg-primary-700 text-white'
                      : isOut
                        ? 'border-border bg-surface-2 text-ink-4 line-through cursor-not-allowed'
                        : 'border-border bg-white text-ink hover:border-ink-3',
                  )}
                >
                  {v.size}
                </button>
              )
            })}
          </div>
          {selectedVariation && (
            <p className="mt-2 text-xs text-ink-3">
              {selectedVariation.stock > 0
                ? selectedVariation.stock <= 3
                  ? <span className="text-warning font-semibold">Últimas {selectedVariation.stock} {selectedVariation.stock === 1 ? 'peça' : 'peças'}!</span>
                  : `${selectedVariation.stock} disponíveis`
                : <span className="text-error font-semibold">Sem estoque</span>}
            </p>
          )}
        </div>

        {/* CTAs */}
        <div className="mt-6 flex flex-col gap-2">
          {/* Quantidade + Adicionar */}
          <div className="flex gap-2">
            <div className="flex h-12 items-center rounded-md border border-border bg-white">
              <button
                type="button"
                onClick={() => setQuantity(q => Math.max(1, q - 1))}
                disabled={!selectedVariation || quantity <= 1}
                aria-label="Diminuir quantidade"
                className="flex h-12 w-10 items-center justify-center text-ink-2 transition hover:bg-surface-2 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Minus className="h-4 w-4" />
              </button>
              <span className="w-10 text-center text-base font-semibold text-ink">{quantity}</span>
              <button
                type="button"
                onClick={() => setQuantity(q => Math.min(selectedVariation?.stock ?? 1, q + 1))}
                disabled={!selectedVariation || quantity >= (selectedVariation?.stock ?? 1)}
                aria-label="Aumentar quantidade"
                className="flex h-12 w-10 items-center justify-center text-ink-2 transition hover:bg-surface-2 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
            <Button
              size="lg"
              fullWidth
              disabled={!selectedVariation || selectedVariation.stock === 0}
              onClick={onAddToCart}
              leftIcon={added ? <Check className="h-5 w-5" /> : null}
            >
              {added ? 'Pronto, no carrinho' : `Adicionar (${quantity})`}
            </Button>
          </div>
          <Link
            href="/cart"
            className="inline-flex h-12 items-center justify-center rounded-md border border-primary-700 px-6 text-base font-semibold text-primary-700 transition hover:bg-primary-50"
          >
            Ver carrinho
          </Link>

          {/* Compartilhar */}
          <div className="mt-1 flex gap-2">
            <a
              href={`https://wa.me/?text=${encodeURIComponent(`Vê esse aqui: ${product.name} — ${typeof window !== 'undefined' ? window.location.href : ''}`)}`}
              target="_blank" rel="noopener noreferrer"
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-md border border-whatsapp/40 bg-whatsapp/5 px-3 py-2 text-xs font-semibold text-whatsapp transition hover:bg-whatsapp/10"
            >
              <Share2 className="h-3.5 w-3.5" /> Compartilhar no Zap
            </a>
            <button
              type="button"
              onClick={copyShareLink}
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-md border border-border bg-white px-3 py-2 text-xs font-semibold text-ink-2 transition hover:bg-surface-2"
            >
              {shareCopied ? <Check className="h-3.5 w-3.5 text-success" /> : <Link2 className="h-3.5 w-3.5" />}
              {shareCopied ? 'Link copiado' : 'Copiar link'}
            </button>
          </div>
        </div>

        {/* Trust signals */}
        <ul className="mt-6 space-y-2 text-sm text-ink-2">
          <li className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-primary-700" /> 100% original, vem com a caixa da marca</li>
          <li className="flex items-center gap-2"><Truck className="h-4 w-4 text-primary-700" /> Frete fixo {settings ? formatBRL(settings.shippingFlatRate) : 'R$ 15'}, chega rápido</li>
          <li className="flex items-center gap-2">
            <MessageCircle className="h-4 w-4 text-whatsapp" />
            Dúvida? <a href={waUrl} target="_blank" rel="noopener noreferrer" className="font-semibold text-whatsapp hover:underline">Chama no Zap</a>
          </li>
        </ul>

      </aside>
    </div>

    {/* Descrição — full width abaixo do grid sticky pra não inflar o aside */}
    <section className="mt-10 rounded-lg border border-border bg-white p-5 sm:p-6">
      <h2 className="font-display text-xl text-ink sm:text-2xl">Descrição</h2>
      <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-ink-2 sm:text-base">{product.description}</p>
    </section>

    {/* Reviews — full width */}
    <ProductReviews productId={product.id} />

    {/* Cross-sell — quem viu também levou */}
    <RelatedProducts slug={product.slug} />

    {/* Modal: Tabela de medidas */}
    {showSizeChart && (
      <div
        className="fixed inset-0 z-[200] flex items-center justify-center bg-ink/50 p-4 backdrop-blur-sm animate-fade-in"
        onClick={() => setShowSizeChart(false)}
        role="dialog"
        aria-modal="true"
        aria-label="Tabela de medidas"
      >
        <div
          className="relative max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-lg bg-white p-6 shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            type="button"
            onClick={() => setShowSizeChart(false)}
            aria-label="Fechar"
            className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-md text-ink-3 hover:bg-surface-2"
          >
            <X className="h-5 w-5" />
          </button>
          <div className="flex items-center gap-2 text-primary-700">
            <Ruler className="h-5 w-5" />
            <h3 className="font-display text-xl text-ink">Tabela de medidas</h3>
          </div>
          <p className="mt-1 text-xs text-ink-3">
            Medidas em cm. Em caso de dúvida, fala com a gente no Zap.
          </p>

          {product.measureTable && Object.keys(product.measureTable).length > 0 ? (
            <div className="mt-4 overflow-x-auto">
              <table className="w-full min-w-[320px] border-collapse text-sm">
                <tbody>
                  {Object.entries(product.measureTable).map(([size, measures]) => (
                    <tr key={size} className="border-b border-border last:border-0">
                      <th className="bg-surface-2 px-3 py-2 text-left text-xs font-bold uppercase text-ink-2">
                        {size}
                      </th>
                      <td className="px-3 py-2 text-ink-2">
                        {typeof measures === 'object' && measures !== null
                          ? Object.entries(measures as Record<string, unknown>)
                              .map(([k, v]) => `${k}: ${String(v)}`)
                              .join(' · ')
                          : String(measures)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="mt-4 rounded-md bg-surface-2 px-4 py-6 text-center text-sm text-ink-3">
              Tabela de medidas em breve. Qualquer dúvida de tamanho, chama a gente no Zap.
            </p>
          )}
        </div>
      </div>
    )}
    </>
  )
}

// "Quem viu também levou" — busca cross-sell e renderiza cards. Silent fallback.
function RelatedProducts({ slug }: { slug: string }) {
  const [items, setItems] = useState<ProductListItem[] | null>(null)
  useEffect(() => {
    let cancelled = false
    getRelated(slug, 4)
      .then(list => { if (!cancelled) setItems(list) })
      .catch(() => { if (!cancelled) setItems([]) })
    return () => { cancelled = true }
  }, [slug])

  if (!items || items.length === 0) return null

  return (
    <section className="mt-12">
      <h2 className="font-display text-xl text-ink sm:text-2xl">Quem viu também levou</h2>
      <p className="mt-1 text-sm text-ink-3">Combinações que fazem sentido com essa peça</p>
      <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
        {items.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
      </div>
    </section>
  )
}
