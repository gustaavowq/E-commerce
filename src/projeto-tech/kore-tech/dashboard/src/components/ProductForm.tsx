'use client'

// =============================================================================
// Form completo de produto (criar/editar) — usado em /products/new e /products/[id]
//
// Cobre TODOS os campos do schema do Kore Tech:
//   - Identidade: name, slug, description, brand, basePrice, comparePrice
//   - Hardware: buildType, category, persona, weightGrams, dimensionsMm, warrantyMonths
//   - JSON: specs (SpecsEditor), compatibility (CompatibilityEditor),
//           benchmarkFps (BenchmarkFpsEditor)
//   - Flags: isActive, isFeatured
//   - SEO: metaTitle, metaDesc
//
// react-hook-form + Zod. Tabs pra não dar overload visual em uma tela só.
// =============================================================================

import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useQuery } from '@tanstack/react-query'
import { Save, Tag, Cpu, Sparkles, Image as ImageIcon, Search } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { Select } from '@/components/ui/Select'
import { Label } from '@/components/ui/Label'
import { SpecsEditor } from '@/components/SpecsEditor'
import { CompatibilityEditor } from '@/components/CompatibilityEditor'
import { BenchmarkFpsEditor } from '@/components/BenchmarkFpsEditor'
import { adminPersonas, refs } from '@/services/admin'
import type {
  AdminProductDetail, BuildType, ProductCategory,
  SpecsMap, CompatibilityFields, BenchmarkFpsMap,
} from '@/services/types'
import { cn } from '@/lib/utils'

const BUILD_TYPES: Array<{ value: BuildType; label: string }> = [
  { value: 'componente', label: 'Componente' },
  { value: 'pc_pronto',  label: 'PC pronto (BTO)' },
  { value: 'periferico', label: 'Periférico' },
  { value: 'monitor',    label: 'Monitor' },
]

const CATEGORIES: Array<{ value: ProductCategory; label: string }> = [
  { value: 'cpu', label: 'CPU' },     { value: 'gpu', label: 'GPU' },
  { value: 'mobo', label: 'Placa-mãe' }, { value: 'ram', label: 'RAM' },
  { value: 'storage', label: 'Armazenamento' }, { value: 'psu', label: 'Fonte' },
  { value: 'case', label: 'Gabinete' }, { value: 'cooler', label: 'Cooler' },
  { value: 'pc_full', label: 'PC montado' }, { value: 'monitor', label: 'Monitor' },
  { value: 'mouse', label: 'Mouse' }, { value: 'teclado', label: 'Teclado' },
  { value: 'headset', label: 'Headset' }, { value: 'cadeira', label: 'Cadeira' },
  { value: 'fan', label: 'Ventoinha' }, { value: 'cabo', label: 'Cabos' },
  { value: 'outro', label: 'Outros' },
]

const SPEC_SUGGESTIONS: Partial<Record<ProductCategory, string[]>> = {
  cpu:     ['marca', 'modelo', 'socket', 'cores', 'threads', 'base_clock_ghz', 'boost_clock_ghz', 'cache_l3_mb', 'tdp_w'],
  gpu:     ['marca', 'modelo', 'memoria_gb', 'memoria_tipo', 'boost_clock_mhz', 'cuda_cores', 'tdp_w'],
  mobo:    ['marca', 'modelo', 'socket', 'chipset', 'form_factor', 'ram_slots', 'pcie_gen'],
  ram:     ['marca', 'modelo', 'tipo', 'capacidade_gb', 'velocidade_mhz', 'latencia_cl'],
  storage: ['marca', 'modelo', 'capacidade_gb', 'tipo', 'leitura_mb_s', 'gravacao_mb_s'],
  psu:     ['marca', 'modelo', 'wattagem', 'certificacao', 'modular'],
  case:    ['marca', 'modelo', 'form_factor', 'gpu_max_mm', 'cooler_max_mm'],
  cooler:  ['marca', 'modelo', 'tipo', 'altura_mm', 'tdp_max_w'],
  monitor: ['marca', 'modelo', 'tamanho_pol', 'resolucao', 'taxa_hz', 'painel', 'tempo_resposta_ms'],
  mouse:   ['marca', 'modelo', 'sensor', 'dpi_max', 'peso_g', 'conexao'],
  teclado: ['marca', 'modelo', 'tipo_switch', 'layout', 'iluminacao'],
}

const schema = z.object({
  name:           z.string().min(2, 'Mínimo 2 caracteres'),
  slug:           z.string().min(2, 'Mínimo 2 caracteres').regex(/^[a-z0-9-]+$/, 'Só letras minúsculas, números e hífen'),
  description:    z.string().min(10, 'Mínimo 10 caracteres'),
  brandId:        z.string().nullable().optional(),
  basePrice:      z.coerce.number().min(0, 'Preço inválido'),
  comparePrice:   z.coerce.number().min(0).nullable().optional(),
  buildType:      z.enum(['componente', 'pc_pronto', 'periferico', 'monitor']).nullable(),
  category:       z.enum([
    'cpu','gpu','mobo','ram','storage','psu','case','cooler',
    'pc_full','monitor','mouse','teclado','headset','cadeira','fan','cabo','outro',
  ]).nullable(),
  persona:        z.string().nullable().optional(),
  weightGrams:    z.coerce.number().min(0).nullable().optional(),
  warrantyMonths: z.coerce.number().int().min(0),
  dimLength:      z.coerce.number().min(0).nullable().optional(),
  dimWidth:       z.coerce.number().min(0).nullable().optional(),
  dimHeight:      z.coerce.number().min(0).nullable().optional(),
  isActive:       z.boolean(),
  isFeatured:     z.boolean(),
  metaTitle:      z.string().max(70).nullable().optional(),
  metaDesc:       z.string().max(160).nullable().optional(),
})

export type ProductFormValues = z.infer<typeof schema>

export type ProductFormPayload = {
  values:        ProductFormValues
  specs:         SpecsMap
  compatibility: CompatibilityFields | null
  benchmarkFps:  BenchmarkFpsMap | null
}

type Props = {
  initial?:    Partial<AdminProductDetail>
  submitting?: boolean
  onSubmit:    (payload: ProductFormPayload) => void
  // Slot pra renderizar ImagesManager (só faz sentido em produto já criado)
  imagesSlot?: React.ReactNode
}

type TabId = 'identity' | 'hardware' | 'specs' | 'fps' | 'seo'

const TABS: Array<{ id: TabId; label: string; icon: React.ReactNode }> = [
  { id: 'identity', label: 'Identidade',     icon: <Tag    className="h-3.5 w-3.5" /> },
  { id: 'hardware', label: 'Hardware',       icon: <Cpu    className="h-3.5 w-3.5" /> },
  { id: 'specs',    label: 'Specs',          icon: <ImageIcon className="h-3.5 w-3.5" /> },
  { id: 'fps',      label: 'FPS estimado',   icon: <Sparkles className="h-3.5 w-3.5" /> },
  { id: 'seo',      label: 'SEO',            icon: <Search  className="h-3.5 w-3.5" /> },
]

export function ProductForm({ initial, submitting, onSubmit, imagesSlot }: Props) {
  const [tab, setTab]                   = useState<TabId>('identity')
  const [specs, setSpecs]               = useState<SpecsMap>(initial?.specs ?? {})
  const [compatibility, setCompat]      = useState<CompatibilityFields | null>(initial?.compatibility ?? null)
  const [benchmarkFps, setBenchmarkFps] = useState<BenchmarkFpsMap | null>(initial?.benchmarkFps ?? null)

  const personasQ = useQuery({ queryKey: ['admin', 'personas'], queryFn: () => adminPersonas.list(), staleTime: 60_000 })
  const brandsQ   = useQuery({ queryKey: ['admin', 'brands'],   queryFn: () => refs.brands(),        staleTime: 5 * 60_000 })

  const { register, handleSubmit, watch, setValue, formState } = useForm<ProductFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name:           initial?.name           ?? '',
      slug:           initial?.slug           ?? '',
      description:    initial?.description    ?? '',
      brandId:        initial?.brand?.id      ?? null,
      basePrice:      initial?.basePrice      ?? 0,
      comparePrice:   initial?.comparePrice   ?? null,
      buildType:      initial?.buildType      ?? null,
      category:       initial?.category       ?? null,
      persona:        initial?.persona        ?? null,
      weightGrams:    initial?.weightGrams    ?? null,
      warrantyMonths: initial?.warrantyMonths ?? 12,
      dimLength:      initial?.dimensionsMm?.length ?? null,
      dimWidth:       initial?.dimensionsMm?.width  ?? null,
      dimHeight:      initial?.dimensionsMm?.height ?? null,
      isActive:       initial?.isActive   ?? true,
      isFeatured:     initial?.isFeatured ?? false,
      metaTitle:      initial?.metaTitle ?? null,
      metaDesc:       initial?.metaDesc  ?? null,
    },
  })

  const buildType = watch('buildType')
  const category  = watch('category')
  const name      = watch('name')

  // Auto slug pra produtos novos (sem initial.slug)
  useEffect(() => {
    if (!name || initial?.slug) return
    const slug = name.toLowerCase()
      .normalize('NFD').replace(/[̀-ͯ]/g, '')
      .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
    setValue('slug', slug, { shouldDirty: true })
  }, [name, initial?.slug, setValue])

  function submit(values: ProductFormValues) {
    onSubmit({ values, specs, compatibility, benchmarkFps })
  }

  return (
    <form onSubmit={handleSubmit(submit)} className="space-y-5">
      {/* Tabs */}
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

      {/* Identidade */}
      {tab === 'identity' && (
        <section className="grid gap-4 md:grid-cols-2">
          <div className="md:col-span-2">
            <Label htmlFor="name">Nome do produto</Label>
            <Input id="name" {...register('name')} error={formState.errors.name?.message} />
          </div>
          <div>
            <Label htmlFor="slug">Slug (URL)</Label>
            <Input id="slug" mono {...register('slug')} error={formState.errors.slug?.message} />
          </div>
          <div>
            <Label htmlFor="brand">Marca</Label>
            <Select id="brand" {...register('brandId')}>
              <option value="">—</option>
              {brandsQ.data?.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
            </Select>
          </div>
          <div className="md:col-span-2">
            <Label htmlFor="description">Descrição</Label>
            <Textarea id="description" rows={6} {...register('description')} error={formState.errors.description?.message} />
            <p className="mt-1 text-[11px] text-text-muted">Voz Kore Tech: técnica, direta, sem jargão pomposo. Deixa os números falarem.</p>
          </div>
          <div>
            <Label htmlFor="basePrice">Preço base (R$)</Label>
            <Input id="basePrice" type="number" step="0.01" mono {...register('basePrice')} error={formState.errors.basePrice?.message} />
          </div>
          <div>
            <Label htmlFor="comparePrice">Preço de tabela (R$) <span className="text-text-muted normal-case">opcional</span></Label>
            <Input id="comparePrice" type="number" step="0.01" mono {...register('comparePrice')} />
          </div>
          <div className="md:col-span-2 flex items-center gap-6">
            <label className="inline-flex cursor-pointer items-center gap-2 text-sm text-text">
              <input type="checkbox" {...register('isActive')} className="h-4 w-4 rounded border-border-strong bg-surface accent-primary" />
              Produto ativo (visível na loja)
            </label>
            <label className="inline-flex cursor-pointer items-center gap-2 text-sm text-text">
              <input type="checkbox" {...register('isFeatured')} className="h-4 w-4 rounded border-border-strong bg-surface accent-primary" />
              Destaque na home
            </label>
          </div>

          {imagesSlot && <div className="md:col-span-2">{imagesSlot}</div>}
        </section>
      )}

      {/* Hardware */}
      {tab === 'hardware' && (
        <section className="grid gap-4 md:grid-cols-3">
          <div>
            <Label htmlFor="buildType">Tipo</Label>
            <Select id="buildType" {...register('buildType')}>
              <option value="">—</option>
              {BUILD_TYPES.map(b => <option key={b.value} value={b.value}>{b.label}</option>)}
            </Select>
          </div>
          <div>
            <Label htmlFor="category">Categoria</Label>
            <Select id="category" {...register('category')}>
              <option value="">—</option>
              {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
            </Select>
          </div>
          <div>
            <Label htmlFor="persona">Persona <span className="text-text-muted normal-case">só pra PC pronto</span></Label>
            <Select id="persona" {...register('persona')} disabled={buildType !== 'pc_pronto'}>
              <option value="">—</option>
              {personasQ.data?.map(p => <option key={p.slug} value={p.slug}>{p.name}</option>)}
            </Select>
          </div>

          <div>
            <Label htmlFor="weightGrams">Peso (g)</Label>
            <Input id="weightGrams" type="number" mono {...register('weightGrams')} />
          </div>
          <div>
            <Label htmlFor="warrantyMonths">Garantia (meses)</Label>
            <Input id="warrantyMonths" type="number" mono {...register('warrantyMonths')} error={formState.errors.warrantyMonths?.message} />
          </div>

          <div className="md:col-span-3">
            <Label>Dimensões da caixa (mm)</Label>
            <div className="mt-1 grid grid-cols-3 gap-2">
              <Input type="number" mono placeholder="comprimento" {...register('dimLength')} />
              <Input type="number" mono placeholder="largura"     {...register('dimWidth')}  />
              <Input type="number" mono placeholder="altura"      {...register('dimHeight')} />
            </div>
            <p className="mt-1 text-[11px] text-text-muted">Usado pra cálculo de frete. Se não souber, deixa em branco.</p>
          </div>

          {/* Compatibility (só faz sentido pra componente) */}
          {buildType === 'componente' && (
            <div className="md:col-span-3 mt-2 rounded-lg border border-border bg-surface-2 p-4">
              <h3 className="mb-3 text-sm font-bold text-text">Compatibilidade (PC Builder)</h3>
              <CompatibilityEditor category={category} value={compatibility} onChange={setCompat} />
            </div>
          )}
        </section>
      )}

      {/* Specs */}
      {tab === 'specs' && (
        <section className="space-y-3">
          <p className="text-sm text-text-secondary">
            Specs técnicas do produto. Aparecem como tabela na PDP. Use chave-valor.
          </p>
          <SpecsEditor
            value={specs}
            onChange={setSpecs}
            suggestions={category ? SPEC_SUGGESTIONS[category] ?? [] : []}
          />
        </section>
      )}

      {/* FPS */}
      {tab === 'fps' && (
        <section className="space-y-3">
          {buildType === 'pc_pronto' ? (
            <BenchmarkFpsEditor value={benchmarkFps} onChange={setBenchmarkFps} />
          ) : (
            <p className="rounded-md border border-dashed border-border bg-surface-2 p-4 text-sm text-text-muted">
              FPS estimado é só pra PC pronto. Mude o tipo do produto pra <strong className="text-text">PC pronto (BTO)</strong> na aba Hardware pra preencher.
            </p>
          )}
        </section>
      )}

      {/* SEO */}
      {tab === 'seo' && (
        <section className="grid gap-4">
          <div>
            <Label htmlFor="metaTitle">Meta title <span className="text-text-muted normal-case">máx 70 caracteres</span></Label>
            <Input id="metaTitle" {...register('metaTitle')} error={formState.errors.metaTitle?.message} />
          </div>
          <div>
            <Label htmlFor="metaDesc">Meta description <span className="text-text-muted normal-case">máx 160 caracteres</span></Label>
            <Textarea id="metaDesc" rows={3} {...register('metaDesc')} error={formState.errors.metaDesc?.message} />
          </div>
          <p className="text-[11px] text-text-muted">
            Se vazio, a loja usa nome + descrição automaticamente. Preenche aqui só se quer copy específica de search.
          </p>
        </section>
      )}

      {/* Submit bar */}
      <div className="sticky bottom-0 -mx-4 sm:-mx-6 lg:-mx-8 border-t border-border bg-surface/95 backdrop-blur-sm px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-end gap-2">
        <Button type="submit" loading={submitting} leftIcon={<Save className="h-4 w-4" />}>
          {initial?.id ? 'Salvar alterações' : 'Criar produto'}
        </Button>
      </div>
    </form>
  )
}
