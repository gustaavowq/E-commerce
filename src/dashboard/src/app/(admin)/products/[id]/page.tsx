'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ArrowLeft, Save, Eye, EyeOff, Star, Package } from 'lucide-react'
import { adminProducts, refs } from '@/services/admin'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { formatBRL, formatDateTime } from '@/lib/format'
import { ApiError } from '@/lib/api-error'
import type { AdminProductDetail, AdminVariation } from '@/services/types'

export default function ProductEditPage({ params }: { params: { id: string } }) {
  const qc = useQueryClient()
  const productQ = useQuery({ queryKey: ['admin', 'product', params.id], queryFn: () => adminProducts.get(params.id) })
  const brandsQ  = useQuery({ queryKey: ['brands'],     queryFn: () => refs.brands() })
  const catsQ    = useQuery({ queryKey: ['categories'], queryFn: () => refs.categories() })

  const product = productQ.data

  if (productQ.isLoading) return <p className="text-sm text-ink-3">Carregando produto…</p>
  if (!product)            return <p className="text-sm text-error">Produto não encontrado.</p>

  return (
    <div className="space-y-6">
      <Link href="/products" className="inline-flex items-center gap-1 text-sm text-ink-3 hover:text-ink">
        <ArrowLeft className="h-4 w-4" /> Voltar
      </Link>

      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-ink-3">Editar produto</p>
          <h1 className="text-2xl font-bold text-ink">{product.name}</h1>
          <p className="text-xs text-ink-4">Atualizado {formatDateTime(product.updatedAt)}</p>
        </div>
      </header>

      <ProductCoreForm product={product} brands={brandsQ.data ?? []} categories={catsQ.data ?? []} />

      <VariationsTable productId={product.id} variations={product.variations} onUpdated={() => qc.invalidateQueries({ queryKey: ['admin', 'product', product.id] })} />

      {product.images.length > 0 && (
        <section className="rounded-lg border border-border bg-white p-5 shadow-sm">
          <h2 className="mb-3 text-sm font-bold text-ink">Imagens</h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 md:grid-cols-6">
            {product.images.map(img => (
              <div key={img.id} className="relative aspect-square overflow-hidden rounded-md border border-border bg-surface-2">
                <Image src={img.url} alt={img.alt ?? ''} fill sizes="200px" className="object-cover" unoptimized />
                {img.isPrimary && (
                  <span className="absolute left-1 top-1 rounded bg-primary-700 px-1.5 py-0.5 text-[9px] font-bold uppercase text-white">
                    Principal
                  </span>
                )}
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}

// -----------------------------------------------------------------------------
// Form do "miolo" do produto
// -----------------------------------------------------------------------------
function ProductCoreForm({
  product, brands, categories,
}: {
  product: AdminProductDetail
  brands: { id: string; name: string }[]
  categories: { id: string; name: string }[]
}) {
  const qc = useQueryClient()
  const [form, setForm] = useState({
    name:         product.name,
    slug:         product.slug,
    description:  product.description,
    basePrice:    String(product.basePrice),
    comparePrice: product.comparePrice == null ? '' : String(product.comparePrice),
    brandId:      product.brand.id,
    categoryId:   product.category.id,
    isActive:     product.isActive,
    isFeatured:   product.isFeatured,
  })
  const [error, setError] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    if (saved) {
      const t = setTimeout(() => setSaved(false), 2000)
      return () => clearTimeout(t)
    }
  }, [saved])

  const update = useMutation({
    mutationFn: (body: unknown) => adminProducts.update(product.id, body as Partial<AdminProductDetail>),
    onSuccess: () => {
      setError(null)
      setSaved(true)
      qc.invalidateQueries({ queryKey: ['admin', 'product', product.id] })
      qc.invalidateQueries({ queryKey: ['admin', 'products'] })
    },
    onError: (err) => setError(ApiError.is(err) ? err.message : 'Erro ao salvar'),
  })

  function submit(e: React.FormEvent) {
    e.preventDefault()
    update.mutate({
      name:         form.name,
      slug:         form.slug,
      description:  form.description,
      basePrice:    Number(form.basePrice),
      comparePrice: form.comparePrice ? Number(form.comparePrice) : null,
      brandId:      form.brandId,
      categoryId:   form.categoryId,
      isActive:     form.isActive,
      isFeatured:   form.isFeatured,
    })
  }

  return (
    <form onSubmit={submit} className="space-y-5 rounded-lg border border-border bg-white p-5 shadow-sm">
      <h2 className="text-sm font-bold text-ink">Dados do produto</h2>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Nome">
          <Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
        </Field>
        <Field label="Slug (URL)">
          <Input value={form.slug} onChange={e => setForm({ ...form, slug: e.target.value })} required />
        </Field>
        <Field label="Marca">
          <select className={SELECT_CLS} value={form.brandId} onChange={e => setForm({ ...form, brandId: e.target.value })}>
            {brands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
          </select>
        </Field>
        <Field label="Categoria">
          <select className={SELECT_CLS} value={form.categoryId} onChange={e => setForm({ ...form, categoryId: e.target.value })}>
            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </Field>
        <Field label="Preço base (R$)">
          <Input type="number" step="0.01" min="0" value={form.basePrice} onChange={e => setForm({ ...form, basePrice: e.target.value })} required />
        </Field>
        <Field label="Preço de comparação (R$)">
          <Input type="number" step="0.01" min="0" value={form.comparePrice} onChange={e => setForm({ ...form, comparePrice: e.target.value })} />
        </Field>
      </div>

      <Field label="Descrição">
        <textarea
          rows={6}
          className={SELECT_CLS}
          value={form.description}
          onChange={e => setForm({ ...form, description: e.target.value })}
        />
      </Field>

      <div className="flex flex-wrap gap-4">
        <label className="inline-flex items-center gap-2 text-sm">
          <input type="checkbox" className="h-4 w-4 accent-primary-700" checked={form.isActive} onChange={e => setForm({ ...form, isActive: e.target.checked })} />
          {form.isActive ? <Eye className="h-4 w-4 text-success" /> : <EyeOff className="h-4 w-4 text-ink-3" />}
          Ativo
        </label>
        <label className="inline-flex items-center gap-2 text-sm">
          <input type="checkbox" className="h-4 w-4 accent-primary-700" checked={form.isFeatured} onChange={e => setForm({ ...form, isFeatured: e.target.checked })} />
          <Star className={'h-4 w-4 ' + (form.isFeatured ? 'text-warning' : 'text-ink-4')} />
          Destaque
        </label>
      </div>

      {error && <p className="text-sm text-error">{error}</p>}

      <div className="flex items-center gap-3">
        <Button type="submit" loading={update.isPending} leftIcon={<Save className="h-4 w-4" />}>
          Salvar alterações
        </Button>
        {saved && <span className="text-sm text-success">Salvo!</span>}
      </div>
    </form>
  )
}

// -----------------------------------------------------------------------------
// Tabela editável de variações (estoque + preço override + ativo)
// -----------------------------------------------------------------------------
function VariationsTable({
  productId, variations, onUpdated,
}: {
  productId: string
  variations: AdminVariation[]
  onUpdated: () => void
}) {
  return (
    <section className="rounded-lg border border-border bg-white shadow-sm">
      <h2 className="border-b border-border px-5 py-3 text-sm font-bold text-ink flex items-center gap-2">
        <Package className="h-4 w-4 text-primary-700" /> Variações ({variations.length})
      </h2>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-border">
          <thead className="bg-surface-2 text-left text-[11px] font-semibold uppercase tracking-wider text-ink-3">
            <tr>
              <th className="px-4 py-2">SKU</th>
              <th className="px-4 py-2">Tamanho</th>
              <th className="px-4 py-2">Cor</th>
              <th className="px-4 py-2 text-right">Estoque</th>
              <th className="px-4 py-2 text-right">Preço override</th>
              <th className="px-4 py-2 text-center">Ativo</th>
              <th className="px-4 py-2"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {variations.map(v => (
              <VariationRow key={v.id} productId={productId} variation={v} onUpdated={onUpdated} />
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}

function VariationRow({ productId, variation, onUpdated }: {
  productId: string
  variation: AdminVariation
  onUpdated: () => void
}) {
  const [stock, setStock] = useState(String(variation.stock))
  const [priceOverride, setPriceOverride] = useState(variation.priceOverride == null ? '' : String(variation.priceOverride))
  const [isActive, setIsActive] = useState(variation.isActive)

  const update = useMutation({
    mutationFn: () => adminProducts.updateVariation(productId, variation.id, {
      stock: Number(stock),
      priceOverride: priceOverride ? Number(priceOverride) : null,
      isActive,
    }),
    onSuccess: onUpdated,
  })

  const dirty =
    Number(stock) !== variation.stock ||
    (priceOverride === '' ? variation.priceOverride !== null : Number(priceOverride) !== variation.priceOverride) ||
    isActive !== variation.isActive

  return (
    <tr className="hover:bg-surface-2/50">
      <td className="table-cell-base font-mono text-xs">{variation.sku}</td>
      <td className="table-cell-base">{variation.size}</td>
      <td className="table-cell-base">
        <span className="inline-flex items-center gap-1.5">
          {variation.colorHex && <span className="h-3 w-3 rounded-full border border-border" style={{ backgroundColor: variation.colorHex }} />}
          {variation.color}
        </span>
      </td>
      <td className="table-cell-base text-right">
        <Input
          type="number"
          min="0"
          value={stock}
          onChange={e => setStock(e.target.value)}
          className="w-24 text-right font-mono"
        />
      </td>
      <td className="table-cell-base text-right">
        <Input
          type="number"
          step="0.01"
          min="0"
          value={priceOverride}
          onChange={e => setPriceOverride(e.target.value)}
          placeholder="—"
          className="w-28 text-right font-mono"
        />
      </td>
      <td className="table-cell-base text-center">
        <input type="checkbox" className="h-4 w-4 accent-primary-700" checked={isActive} onChange={e => setIsActive(e.target.checked)} />
      </td>
      <td className="table-cell-base text-right">
        <Button size="sm" variant="secondary" disabled={!dirty} loading={update.isPending} onClick={() => update.mutate()}>
          Salvar
        </Button>
        {variation.priceOverride !== null && (
          <p className="mt-1 text-[10px] text-ink-4">{formatBRL(variation.priceOverride)}</p>
        )}
      </td>
    </tr>
  )
}

// -----------------------------------------------------------------------------
const SELECT_CLS = 'w-full rounded-md border border-border bg-white px-3 py-2 text-sm focus:border-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-700/20'

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="block text-xs font-medium text-ink-2">{label}</span>
      <div className="mt-1">{children}</div>
    </label>
  )
}
