'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useQuery, useMutation } from '@tanstack/react-query'
import { ArrowLeft, Plus, Trash2, Save } from 'lucide-react'
import { adminProducts, refs } from '@/services/admin'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { ApiError } from '@/lib/api-error'

type VariationDraft = {
  sku: string; size: string; color: string; colorHex: string; stock: string; priceOverride: string;
}
type ImageDraft = { url: string; alt: string; isPrimary: boolean }

const INITIAL_VAR: VariationDraft = { sku: '', size: '', color: '', colorHex: '', stock: '0', priceOverride: '' }

function slugify(s: string): string {
  return s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
}

export default function NewProductPage() {
  const router = useRouter()
  const brandsQ = useQuery({ queryKey: ['brands'],     queryFn: () => refs.brands() })
  const catsQ   = useQuery({ queryKey: ['categories'], queryFn: () => refs.categories() })

  const [form, setForm] = useState({
    name: '', slug: '', description: '',
    basePrice: '', comparePrice: '',
    brandId: '', categoryId: '',
    isActive: true, isFeatured: false,
  })
  const [variations, setVariations] = useState<VariationDraft[]>([{ ...INITIAL_VAR }])
  const [images, setImages] = useState<ImageDraft[]>([])
  const [error, setError] = useState<string | null>(null)

  const create = useMutation({
    mutationFn: (body: unknown) => adminProducts.create(body),
    onSuccess: (res) => router.push(`/products/${res.id}`),
    onError: (err) => setError(ApiError.is(err) ? err.message : 'Erro ao criar'),
  })

  function submit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (!form.brandId || !form.categoryId) {
      setError('Selecione marca e categoria')
      return
    }
    if (variations.some(v => !v.sku || !v.size || !v.color)) {
      setError('Toda variação precisa de SKU, tamanho e cor')
      return
    }

    create.mutate({
      slug: form.slug || slugify(form.name),
      name: form.name,
      description: form.description,
      basePrice: Number(form.basePrice),
      comparePrice: form.comparePrice ? Number(form.comparePrice) : undefined,
      brandId: form.brandId,
      categoryId: form.categoryId,
      isActive: form.isActive,
      isFeatured: form.isFeatured,
      variations: variations.map(v => ({
        sku: v.sku, size: v.size, color: v.color,
        colorHex: v.colorHex || undefined,
        stock: Number(v.stock),
        priceOverride: v.priceOverride ? Number(v.priceOverride) : undefined,
      })),
      images: images.filter(i => i.url).map((i, idx) => ({
        url: i.url,
        alt: i.alt || undefined,
        sortOrder: idx,
        isPrimary: i.isPrimary,
      })),
    })
  }

  return (
    <form onSubmit={submit} className="space-y-6 max-w-4xl">
      <Link href="/products" className="inline-flex items-center gap-1 text-sm text-ink-3 hover:text-ink">
        <ArrowLeft className="h-4 w-4" /> Voltar
      </Link>

      <header>
        <h1 className="text-2xl font-bold text-ink">Novo produto</h1>
        <p className="text-sm text-ink-3">Cria com pelo menos uma variação. Imagens são opcionais agora, dá pra adicionar depois.</p>
      </header>

      {/* Dados básicos */}
      <section className="space-y-4 rounded-lg border border-border bg-white p-5 shadow-sm">
        <h2 className="text-sm font-bold text-ink">Dados básicos</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Nome">
            <Input
              value={form.name}
              onChange={e => {
                const name = e.target.value
                setForm(s => ({ ...s, name, slug: s.slug || slugify(name) }))
              }}
              required
            />
          </Field>
          <Field label="Slug (URL)">
            <Input value={form.slug} onChange={e => setForm({ ...form, slug: slugify(e.target.value) })} required />
          </Field>
          <Field label="Marca">
            <select className={SELECT_CLS} value={form.brandId} onChange={e => setForm({ ...form, brandId: e.target.value })} required>
              <option value="">Selecione…</option>
              {brandsQ.data?.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
            </select>
          </Field>
          <Field label="Categoria">
            <select className={SELECT_CLS} value={form.categoryId} onChange={e => setForm({ ...form, categoryId: e.target.value })} required>
              <option value="">Selecione…</option>
              {catsQ.data?.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </Field>
          <Field label="Preço base (R$)">
            <Input type="number" step="0.01" min="0" value={form.basePrice} onChange={e => setForm({ ...form, basePrice: e.target.value })} required />
          </Field>
          <Field label="Preço comparação (R$)">
            <Input type="number" step="0.01" min="0" value={form.comparePrice} onChange={e => setForm({ ...form, comparePrice: e.target.value })} />
          </Field>
        </div>
        <Field label="Descrição">
          <textarea rows={5} className={SELECT_CLS} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
        </Field>
        <div className="flex flex-wrap gap-4">
          <label className="inline-flex items-center gap-2 text-sm">
            <input type="checkbox" className="h-4 w-4 accent-primary-700" checked={form.isActive} onChange={e => setForm({ ...form, isActive: e.target.checked })} />
            Ativo
          </label>
          <label className="inline-flex items-center gap-2 text-sm">
            <input type="checkbox" className="h-4 w-4 accent-primary-700" checked={form.isFeatured} onChange={e => setForm({ ...form, isFeatured: e.target.checked })} />
            Destaque
          </label>
        </div>
      </section>

      {/* Variações */}
      <section className="space-y-3 rounded-lg border border-border bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-ink">Variações ({variations.length})</h2>
          <Button type="button" size="sm" variant="secondary" onClick={() => setVariations(v => [...v, { ...INITIAL_VAR }])} leftIcon={<Plus className="h-4 w-4" />}>
            Adicionar
          </Button>
        </div>
        <div className="space-y-3">
          {variations.map((v, idx) => (
            <div key={idx} className="grid grid-cols-2 gap-2 rounded-md border border-border bg-surface-2/50 p-3 sm:grid-cols-7">
              <Input placeholder="SKU" value={v.sku} onChange={e => updateVar(idx, { sku: e.target.value })} />
              <Input placeholder="Tamanho" value={v.size} onChange={e => updateVar(idx, { size: e.target.value })} />
              <Input placeholder="Cor" value={v.color} onChange={e => updateVar(idx, { color: e.target.value })} />
              <Input placeholder="#FFFFFF" value={v.colorHex} onChange={e => updateVar(idx, { colorHex: e.target.value })} />
              <Input type="number" min="0" placeholder="Estoque" value={v.stock} onChange={e => updateVar(idx, { stock: e.target.value })} />
              <Input type="number" step="0.01" placeholder="Preço override" value={v.priceOverride} onChange={e => updateVar(idx, { priceOverride: e.target.value })} />
              <Button type="button" size="sm" variant="ghost" disabled={variations.length === 1} onClick={() => setVariations(vs => vs.filter((_, i) => i !== idx))} leftIcon={<Trash2 className="h-4 w-4" />}>
                Remover
              </Button>
            </div>
          ))}
        </div>
      </section>

      {/* Imagens */}
      <section className="space-y-3 rounded-lg border border-border bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-ink">Imagens ({images.length})</h2>
          <Button type="button" size="sm" variant="secondary" onClick={() => setImages(is => [...is, { url: '', alt: '', isPrimary: is.length === 0 }])} leftIcon={<Plus className="h-4 w-4" />}>
            Adicionar
          </Button>
        </div>
        {images.length === 0 ? (
          <p className="text-sm text-ink-3">Sem imagens. Use caminho relativo (ex: <code className="rounded bg-surface-2 px-1">/products/foto.jpg</code>) ou URL absoluta.</p>
        ) : (
          <div className="space-y-3">
            {images.map((img, idx) => (
              <div key={idx} className="grid grid-cols-1 gap-2 rounded-md border border-border bg-surface-2/50 p-3 sm:grid-cols-6">
                <div className="sm:col-span-3"><Input placeholder="URL ou /products/foo.jpg" value={img.url} onChange={e => updateImg(idx, { url: e.target.value })} /></div>
                <div className="sm:col-span-2"><Input placeholder="Alt text" value={img.alt} onChange={e => updateImg(idx, { alt: e.target.value })} /></div>
                <label className="inline-flex items-center gap-2 text-xs">
                  <input type="checkbox" className="h-4 w-4 accent-primary-700" checked={img.isPrimary} onChange={e => updateImg(idx, { isPrimary: e.target.checked })} />
                  Principal
                </label>
              </div>
            ))}
          </div>
        )}
      </section>

      {error && (
        <div className="rounded-md border border-error/30 bg-error/5 px-3 py-2 text-sm text-error">{error}</div>
      )}

      <div className="flex gap-2">
        <Button type="submit" loading={create.isPending} leftIcon={<Save className="h-4 w-4" />}>
          Criar produto
        </Button>
        <Link href="/products"><Button type="button" variant="ghost">Cancelar</Button></Link>
      </div>
    </form>
  )

  function updateVar(idx: number, patch: Partial<VariationDraft>) {
    setVariations(vs => vs.map((v, i) => i === idx ? { ...v, ...patch } : v))
  }
  function updateImg(idx: number, patch: Partial<ImageDraft>) {
    setImages(is => is.map((img, i) => i === idx
      ? { ...img, ...patch }
      : (patch.isPrimary ? { ...img, isPrimary: false } : img)),
    )
  }
}

const SELECT_CLS = 'w-full rounded-md border border-border bg-white px-3 py-2 text-sm focus:border-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-700/20'

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="block text-xs font-medium text-ink-2">{label}</span>
      <div className="mt-1">{children}</div>
    </label>
  )
}
