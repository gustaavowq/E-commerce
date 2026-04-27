// =============================================================================
// Kore Tech — Painel admin > Novo produto
//
// Cria produto com TODOS os campos do schema (specs, compatibility,
// benchmarkFps, weight, dimensions, warranty). Após criar, redireciona pra
// /products/[id] pra subir imagens (não dá pra subir antes do id existir).
// =============================================================================

'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { ChevronLeft } from 'lucide-react'
import { adminProducts } from '@/services/admin'
import { ProductForm, type ProductFormPayload } from '@/components/ProductForm'
import { useToast } from '@/components/Toast'

export default function NewProductPage() {
  const router = useRouter()
  const qc     = useQueryClient()
  const toast  = useToast()

  const create = useMutation({
    mutationFn: ({ values, specs, compatibility, benchmarkFps }: ProductFormPayload) =>
      adminProducts.create({
        name:           values.name,
        slug:           values.slug,
        description:    values.description,
        basePrice:      values.basePrice,
        comparePrice:   values.comparePrice ?? null,
        buildType:      values.buildType,
        category:       values.category,
        persona:        values.persona ?? null,
        weightGrams:    values.weightGrams ?? null,
        warrantyMonths: values.warrantyMonths,
        dimensionsMm: (values.dimLength && values.dimWidth && values.dimHeight)
          ? { length: values.dimLength, width: values.dimWidth, height: values.dimHeight }
          : null,
        isActive:     values.isActive,
        isFeatured:   values.isFeatured,
        metaTitle:    values.metaTitle ?? null,
        metaDesc:     values.metaDesc  ?? null,
        specs,
        compatibility,
        benchmarkFps,
        // brand é referência — backend valida brandId no body
        ...(values.brandId ? { brand: { id: values.brandId, name: '', slug: '' } } : {}),
      }),
    onSuccess: (created) => {
      toast.push({ tone: 'success', title: 'Produto criado', body: 'Agora você pode adicionar imagens e variações.' })
      qc.invalidateQueries({ queryKey: ['admin', 'products'] })
      router.replace(`/products/${created.id}`)
    },
    onError: (err: unknown) => {
      toast.push({
        tone: 'error',
        title: 'Não foi possível criar o produto',
        body:  err instanceof Error ? err.message : 'Confere os campos e tenta de novo.',
      })
    },
  })

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-2 text-sm text-text-secondary">
        <Link href="/products" className="inline-flex items-center gap-1 hover:text-primary">
          <ChevronLeft className="h-4 w-4" /> Produtos
        </Link>
        <span className="text-text-muted">/</span>
        <span className="text-text">Novo produto</span>
      </div>

      <header>
        <h1 className="text-2xl font-bold text-text">Novo produto</h1>
        <p className="text-sm text-text-secondary">
          Cadastra os dados básicos. Imagens, variações e estoque você adiciona depois.
        </p>
      </header>

      <ProductForm
        submitting={create.isPending}
        onSubmit={payload => create.mutate(payload)}
      />
    </div>
  )
}
