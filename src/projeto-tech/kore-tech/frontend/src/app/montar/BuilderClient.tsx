'use client'

import { useEffect, useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ShoppingCart, Save, Trash2, Cpu, X } from 'lucide-react'
import { BuilderCategoryPicker } from '@/components/builder/BuilderCategoryPicker'
import { BuilderCompatibilityBar } from '@/components/builder/BuilderCompatibilityBar'
import { BuilderPSURecommendation } from '@/components/builder/BuilderPSURecommendation'
import { BuilderProductCard } from '@/components/builder/BuilderProductCard'
import { Button } from '@/components/ui/Button'
import { useBuilder, BUILDER_SLOTS, slotToCategory, type BuilderCategorySlot } from '@/stores/builder'
import { useCart } from '@/stores/cart'
import { useAuth } from '@/stores/auth'
import { listByCategory } from '@/services/products'
import { checkCompatibility, recommendPsu, saveBuild } from '@/services/builder'
import { ApiError } from '@/lib/api-error'
import { formatBRL } from '@/lib/format'
import type { ProductListItem } from '@/services/types'

export function BuilderClient() {
  const router = useRouter()
  const user = useAuth((s) => s.user)
  const addManyItems = useCart((s) => s.addManyItems)

  const selections = useBuilder((s) => s.selections)
  const activeCategory = useBuilder((s) => s.activeCategory)
  const setActive = useBuilder((s) => s.setActive)
  const pickPartFromProduct = useBuilder((s) => s.pickPartFromProduct)
  const removePart = useBuilder((s) => s.removePart)
  const clear = useBuilder((s) => s.clear)
  const setComputed = useBuilder((s) => s.setComputed)
  const issues = useBuilder((s) => s.issues)
  const totalPrice = useBuilder((s) => s.totalPrice())
  const totalWattage = useBuilder((s) => s.totalWattage)
  const recommendedPsuW = useBuilder((s) => s.recommendedPsuW)
  const isValid = useBuilder((s) => s.isValid)
  const pickedCount = useBuilder((s) => s.pickedCount())

  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [savedSlug, setSavedSlug] = useState<string | null>(null)

  // Lista de produtos da categoria ativa
  const productsQuery = useQuery({
    queryKey: ['products-by-cat', activeCategory],
    queryFn: () => listByCategory(slotToCategory(activeCategory), 24),
    staleTime: 60_000,
  })

  // Parts no formato esperado pelo backend
  const partsForApi = useMemo(
    () =>
      Object.entries(selections)
        .filter(([, v]) => !!v)
        .map(([cat, sel]) => ({ category: slotToCategory(cat as BuilderCategorySlot), productId: sel!.productId })),
    [selections],
  )

  // Roda check + recommend toda vez que selections mudar (debounce intrínseco do tanstack query)
  const checkQuery = useQuery({
    queryKey: ['builder-check', partsForApi],
    queryFn: async () => {
      if (partsForApi.length === 0) return null
      const [check, psu] = await Promise.all([
        checkCompatibility(partsForApi).catch(() => null),
        recommendPsu(partsForApi).catch(() => null),
      ])
      return { check, psu }
    },
    enabled: partsForApi.length > 0,
    refetchOnMount: false,
  })

  // Reflete checkQuery no store
  useEffect(() => {
    if (!checkQuery.data) {
      if (partsForApi.length === 0) {
        setComputed({ totalWattage: 0, recommendedPsuW: 0, isValid: true, issues: [] })
      }
      return
    }
    const { check, psu } = checkQuery.data
    setComputed({
      totalWattage: check?.totalWattage ?? 0,
      recommendedPsuW: psu?.recommendedWattage ?? 0,
      isValid: check?.isValid ?? true,
      issues: check?.issues ?? [],
    })
  }, [checkQuery.data, partsForApi.length, setComputed])

  // Resolve mapa: productId -> incompativel? (com base nos issues do backend, sopa basica)
  const incompatMap = useMemo(() => {
    const map = new Map<string, string>()
    for (const issue of issues) {
      if (issue.level === 'danger' && issue.fixSuggestion?.productId) {
        map.set(issue.fixSuggestion.productId, issue.message)
      }
    }
    return map
  }, [issues])

  function handlePick(p: ProductListItem) {
    pickPartFromProduct(activeCategory, p)
    // pula automaticamente pra proxima nao escolhida
    const idx = BUILDER_SLOTS.findIndex((s) => s.slot === activeCategory)
    const next = BUILDER_SLOTS.slice(idx + 1).find((s) => !selections[s.slot])
    if (next) setActive(next.slot)
  }

  function handleAddAllToCart() {
    if (pickedCount === 0) return
    const items = Object.values(selections)
      .filter((sel) => !!sel)
      .map((sel) => ({
        productId: sel!.productId,
        variationId: sel!.productId, // builder considera o produto base
        productSlug: sel!.productSlug,
        productName: sel!.productName,
        variationLabel: 'Builder',
        unitPrice: sel!.price,
        imageUrl: sel!.imageUrl,
        maxStock: 99,
        quantity: 1,
      }))
    // Marca o carrinho como originado do builder (cupom BUILDER10 valida no backend).
    addManyItems(items, { source: 'builder' })
    router.push('/cart')
  }

  async function handleSaveBuild() {
    if (!user) {
      router.push('/auth/login?next=' + encodeURIComponent('/montar'))
      return
    }
    setSaving(true)
    setSaveError(null)
    try {
      const res = await saveBuild({ name: 'Meu build Kore Tech', parts: partsForApi, isPublic: true })
      setSavedSlug(res.shareSlug ?? res.id)
    } catch (err) {
      setSaveError(ApiError.is(err) ? err.message : 'Nao deu pra salvar agora.')
    } finally {
      setSaving(false)
    }
  }

  const items = productsQuery.data?.data ?? []
  const filteredItems = items.filter((p) => p.totalStock >= 0) // tudo, mas marcado se incompativel

  return (
    <main className="container-app py-6 sm:py-10">
      <header className="mb-6">
        <p className="font-specs text-xs font-bold uppercase tracking-widest text-primary">PC Builder</p>
        <h1 className="mt-2 font-display text-2xl font-bold text-text sm:text-3xl">
          Monte seu PC com checagem automatica
        </h1>
        <p className="mt-1 text-sm text-text-secondary">
          A cada peca escolhida, a gente filtra so o que e compativel e calcula a fonte ideal. Em qualquer momento voce pode salvar e voltar depois.
        </p>
      </header>

      <div className="grid gap-6 lg:grid-cols-[300px_1fr]">
        {/* Sidebar com categorias */}
        <aside className="space-y-4 lg:sticky lg:top-20 lg:self-start">
          <BuilderCategoryPicker />

          {/* Acoes */}
          <div className="rounded-lg border border-border bg-surface p-3">
            <button
              type="button"
              onClick={() => clear()}
              className="flex w-full items-center justify-center gap-1.5 rounded-md border border-danger/40 bg-danger/5 px-3 py-2 text-xs font-semibold text-danger transition hover:bg-danger/10"
            >
              <Trash2 className="h-3.5 w-3.5" /> Resetar montagem
            </button>
          </div>
        </aside>

        {/* Conteudo central */}
        <section className="min-w-0 space-y-5 pb-32">
          {/* Header da categoria */}
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-text-secondary">
                Etapa {BUILDER_SLOTS.findIndex((s) => s.slot === activeCategory) + 1} de {BUILDER_SLOTS.length}
              </p>
              <h2 className="text-lg font-bold text-text">
                Escolha {BUILDER_SLOTS.find((s) => s.slot === activeCategory)?.label}
              </h2>
            </div>
            {selections[activeCategory] && (
              <button
                type="button"
                onClick={() => removePart(activeCategory)}
                className="inline-flex items-center gap-1 text-xs font-semibold text-danger hover:underline"
              >
                <X className="h-3 w-3" /> Remover selecao
              </button>
            )}
          </div>

          <BuilderCompatibilityBar />
          <BuilderPSURecommendation
            recommendation={
              checkQuery.data?.psu?.product
                ? {
                    productId: checkQuery.data.psu.product.id,
                    productSlug: checkQuery.data.psu.product.slug,
                    productName: checkQuery.data.psu.product.name,
                    price: checkQuery.data.psu.product.price,
                    wattage: checkQuery.data.psu.product.wattage,
                    certification: checkQuery.data.psu.product.certification,
                    imageUrl: checkQuery.data.psu.product.imageUrl,
                  }
                : null
            }
            onPick={() => {
              const p = checkQuery.data?.psu?.product
              if (!p) return
              pickPartFromProduct('psu', {
                id: p.id,
                slug: p.slug,
                name: p.name,
                buildType: 'componente',
                category: 'psu',
                persona: null,
                brand: { id: '', slug: '', name: '' },
                basePrice: p.price,
                comparePrice: null,
                isFeatured: false,
                primaryImage: p.imageUrl ? { url: p.imageUrl, alt: p.name } : null,
                totalStock: 1,
                benchmarkFps: null,
              } as unknown as ProductListItem)
            }}
          />

          {/* Lista de produtos */}
          {productsQuery.isLoading && (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-40 animate-pulse-soft rounded-lg border border-border bg-surface/60" />
              ))}
            </div>
          )}

          {productsQuery.isError && (
            <div className="rounded-lg border border-danger/40 bg-danger/5 p-6 text-sm text-danger">
              Nao deu pra carregar produtos dessa categoria. Verifique se o backend esta rodando.
            </div>
          )}

          {!productsQuery.isLoading && !productsQuery.isError && filteredItems.length === 0 && (
            <div className="rounded-lg border border-dashed border-border bg-surface/40 p-10 text-center">
              <Cpu className="mx-auto h-10 w-10 text-text-muted" />
              <p className="mt-3 text-sm text-text-secondary">
                Sem produtos cadastrados nessa categoria. Pode pular pro proximo passo.
              </p>
            </div>
          )}

          {filteredItems.length > 0 && (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {filteredItems.map((p) => (
                <BuilderProductCard
                  key={p.id}
                  product={p}
                  selected={selections[activeCategory]?.productId === p.id}
                  incompatible={incompatMap.has(p.id)}
                  incompatibilityReason={incompatMap.get(p.id)}
                  onPick={handlePick}
                />
              ))}
            </div>
          )}
        </section>
      </div>

      {/* Footer fixo: total + acoes */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border-strong bg-surface/95 backdrop-blur shadow-lg">
        <div className="container-app flex flex-col gap-3 py-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-5">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wide text-text-muted">Total da build</p>
              <p className="font-specs text-xl font-bold text-text">{formatBRL(totalPrice)}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wide text-text-muted">Consumo</p>
              <p className="font-specs text-base text-primary">{totalWattage} W</p>
            </div>
            {recommendedPsuW > 0 && (
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wide text-text-muted">Fonte sugerida</p>
                <p className="font-specs text-base text-text">{recommendedPsuW} W</p>
              </div>
            )}
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wide text-text-muted">Pecas</p>
              <p className="font-specs text-base text-text">
                {pickedCount}/{BUILDER_SLOTS.length}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {savedSlug && (
              <Link
                href={`/builds/share/${savedSlug}`}
                className="inline-flex items-center gap-1 rounded-md border border-success/40 bg-success/10 px-3 py-2 text-xs font-semibold text-success"
              >
                Build salvo · ver
              </Link>
            )}
            {saveError && <span className="text-xs text-danger">{saveError}</span>}

            <Button onClick={handleSaveBuild} loading={saving} variant="secondary" size="md">
              <Save className="h-4 w-4" /> Salvar build
            </Button>
            <Button
              onClick={handleAddAllToCart}
              disabled={pickedCount === 0 || !isValid}
              variant="primary"
              size="md"
              className="cta-glow"
            >
              <ShoppingCart className="h-4 w-4" /> Comprar tudo ({pickedCount})
            </Button>
          </div>
        </div>
      </div>
    </main>
  )
}
