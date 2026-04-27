// =============================================================================
// Kore Tech — Painel admin > Editar produto
//
// Form completo (mesma fonte do new) + ImagesManager + ações destrutivas
// (excluir, arquivar). PATCH preserva campos não enviados no backend.
// =============================================================================

'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter, useParams } from 'next/navigation'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ChevronLeft, Trash2, ExternalLink } from 'lucide-react'
import { adminProducts } from '@/services/admin'
import { ProductForm, type ProductFormPayload } from '@/components/ProductForm'
import { ImagesManager } from '@/components/ImagesManager'
import { ConfirmDialog } from '@/components/ConfirmDialog'
import { Button } from '@/components/ui/Button'
import { Skeleton } from '@/components/Skeleton'
import { useToast } from '@/components/Toast'
import type { AdminProductImage } from '@/services/types'

export default function EditProductPage() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const qc     = useQueryClient()
  const toast  = useToast()
  const [confirmDelete, setConfirmDelete] = useState(false)

  const productQ = useQuery({
    queryKey: ['admin', 'products', 'detail', params.id],
    queryFn:  () => adminProducts.get(params.id),
  })

  const update = useMutation({
    mutationFn: ({ values, specs, compatibility, benchmarkFps }: ProductFormPayload) =>
      adminProducts.update(params.id, {
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
        isActive:    values.isActive,
        isFeatured:  values.isFeatured,
        metaTitle:   values.metaTitle ?? null,
        metaDesc:    values.metaDesc  ?? null,
        specs,
        compatibility,
        benchmarkFps,
        ...(values.brandId ? { brand: { id: values.brandId, name: '', slug: '' } } : {}),
      }),
    onSuccess: () => {
      toast.push({ tone: 'success', title: 'Produto atualizado' })
      qc.invalidateQueries({ queryKey: ['admin', 'products'] })
    },
    onError: (err: unknown) => {
      toast.push({
        tone: 'error',
        title: 'Não foi possível salvar',
        body:  err instanceof Error ? err.message : 'Tenta de novo.',
      })
    },
  })

  const remove = useMutation({
    mutationFn: () => adminProducts.remove(params.id),
    onSuccess: () => {
      toast.push({ tone: 'success', title: 'Produto excluído' })
      qc.invalidateQueries({ queryKey: ['admin', 'products'] })
      router.replace('/products')
    },
    onError: (err: unknown) => {
      toast.push({
        tone: 'error',
        title: 'Não foi possível excluir',
        body:  err instanceof Error ? err.message : 'Pode haver pedidos referenciando esse produto.',
      })
    },
  })

  const product = productQ.data

  function onImagesChange(next: AdminProductImage[]) {
    if (!product) return
    qc.setQueryData(['admin', 'products', 'detail', params.id], { ...product, images: next })
  }

  const storeUrl = process.env.NEXT_PUBLIC_STORE_URL

  if (productQ.isLoading) {
    return (
      <div className="space-y-5">
        <Skeleton className="h-6 w-40" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-72 w-full" />
      </div>
    )
  }

  if (!product) {
    return (
      <div className="rounded-lg border border-border bg-surface p-8 text-center text-sm text-text-secondary">
        Produto não encontrado.
        <div className="mt-4">
          <Link href="/products" className="text-primary hover:text-primary-hover">Voltar pra lista</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-2 text-sm text-text-secondary">
        <Link href="/products" className="inline-flex items-center gap-1 hover:text-primary">
          <ChevronLeft className="h-4 w-4" /> Produtos
        </Link>
        <span className="text-text-muted">/</span>
        <span className="text-text truncate">{product.name}</span>
      </div>

      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-text">{product.name}</h1>
          <p className="text-sm text-text-secondary font-mono">{product.slug}</p>
        </div>
        <div className="flex items-center gap-2">
          {storeUrl && (
            <a
              href={`${storeUrl.replace(/\/$/, '')}/produtos/${product.slug}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button variant="secondary" leftIcon={<ExternalLink className="h-4 w-4" />}>Ver na loja</Button>
            </a>
          )}
          <Button variant="danger" leftIcon={<Trash2 className="h-4 w-4" />} onClick={() => setConfirmDelete(true)}>
            Excluir
          </Button>
        </div>
      </header>

      <ProductForm
        initial={product}
        submitting={update.isPending}
        onSubmit={payload => update.mutate(payload)}
        imagesSlot={
          <div className="rounded-lg border border-border bg-surface-2 p-4">
            <ImagesManager
              productId={product.id}
              images={product.images}
              onChange={onImagesChange}
            />
          </div>
        }
      />

      <ConfirmDialog
        open={confirmDelete}
        title={`Excluir ${product.name}?`}
        description="Essa ação é permanente. Pedidos antigos referenciando esse produto continuam preservados como histórico, mas o produto some da loja e do painel."
        destructive
        confirmLabel="Excluir"
        loading={remove.isPending}
        onConfirm={() => remove.mutate()}
        onClose={() => setConfirmDelete(false)}
      />
    </div>
  )
}
