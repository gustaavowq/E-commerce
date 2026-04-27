'use client'

// Gerenciador de imagens do produto.
//   - Cloudinary upload via /admin/upload (lê arquivo como base64, manda no body)
//   - Drag-drop reorder (HTML5 nativo, sem libs pesadas)
//   - Marca primária (estrela)
//   - Remove com confirmação inline
//
// Padrão testado no Miami; aqui adaptado pro tema dark do Kore Tech.

import { useState, useRef, type DragEvent } from 'react'
import Image from 'next/image'
import { Star, Trash2, Upload, Loader2, GripVertical } from 'lucide-react'
import { adminProducts, adminUpload } from '@/services/admin'
import { useToast } from './Toast'
import type { AdminProductImage } from '@/services/types'
import { cn } from '@/lib/utils'

type Props = {
  productId: string
  images:    AdminProductImage[]
  onChange:  (next: AdminProductImage[]) => void
}

export function ImagesManager({ productId, images, onChange }: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [draggingId, setDraggingId] = useState<string | null>(null)
  const toast = useToast()

  async function readAsBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload  = () => resolve(reader.result as string)
      reader.onerror = () => reject(reader.error)
      reader.readAsDataURL(file)
    })
  }

  async function uploadFiles(files: FileList) {
    setUploading(true)
    try {
      const next: AdminProductImage[] = [...images]
      for (const file of Array.from(files)) {
        if (file.size > 10 * 1024 * 1024) {
          toast.push({ tone: 'error', title: `${file.name} é muito grande`, body: 'Limite 10 MB por imagem.' })
          continue
        }
        const base64 = await readAsBase64(file)
        const uploaded = await adminUpload.image(base64, `kore-tech/products/${productId}`)
        const created  = await adminProducts.addImage(productId, {
          url: uploaded.url,
          alt: file.name.replace(/\.[^.]+$/, ''),
          sortOrder: next.length,
          isPrimary: next.length === 0,
        })
        next.push(created)
      }
      onChange(next)
      toast.push({ tone: 'success', title: 'Imagens adicionadas' })
    } catch (err) {
      toast.push({ tone: 'error', title: 'Falha no upload', body: err instanceof Error ? err.message : 'Tenta de novo' })
    } finally {
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  async function setPrimary(imageId: string) {
    try {
      await adminProducts.setPrimaryImage(productId, imageId)
      onChange(images.map(img => ({ ...img, isPrimary: img.id === imageId })))
    } catch (err) {
      toast.push({ tone: 'error', title: 'Não consegui marcar como principal' })
    }
  }

  async function remove(imageId: string) {
    if (!confirm('Remover essa imagem?')) return
    try {
      await adminProducts.removeImage(productId, imageId)
      onChange(images.filter(img => img.id !== imageId))
    } catch (err) {
      toast.push({ tone: 'error', title: 'Não consegui remover' })
    }
  }

  function onDragStart(id: string) { setDraggingId(id) }
  function onDragOver(e: DragEvent) { e.preventDefault() }
  async function onDrop(targetId: string) {
    if (!draggingId || draggingId === targetId) { setDraggingId(null); return }
    const fromIdx = images.findIndex(i => i.id === draggingId)
    const toIdx   = images.findIndex(i => i.id === targetId)
    if (fromIdx < 0 || toIdx < 0) { setDraggingId(null); return }
    const next = [...images]
    const [moved] = next.splice(fromIdx, 1)
    next.splice(toIdx, 0, moved)
    const reordered = next.map((img, i) => ({ ...img, sortOrder: i }))
    onChange(reordered)
    setDraggingId(null)
    try {
      await adminProducts.reorderImages(productId, reordered.map(i => i.id))
    } catch {
      toast.push({ tone: 'error', title: 'Reordem não persistiu', body: 'Recarrega a página.' })
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-wide text-text-secondary">
          Imagens <span className="font-mono text-text">({images.length})</span>
        </p>
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="inline-flex h-9 items-center gap-2 rounded-md border border-primary/40 bg-transparent px-3 text-xs font-semibold text-primary transition-colors hover:bg-primary-soft disabled:opacity-50"
        >
          {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
          {uploading ? 'Enviando…' : 'Adicionar imagens'}
        </button>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*"
          className="hidden"
          onChange={e => e.target.files && uploadFiles(e.target.files)}
        />
      </div>

      {images.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border-strong bg-surface-2 p-8 text-center text-sm text-text-secondary">
          Nenhuma imagem ainda. Clique em <strong>Adicionar imagens</strong> pra subir do seu computador.
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
          {images.map(img => (
            <div
              key={img.id}
              draggable
              onDragStart={() => onDragStart(img.id)}
              onDragOver={onDragOver}
              onDrop={() => onDrop(img.id)}
              className={cn(
                'group relative overflow-hidden rounded-lg border bg-surface-2 transition',
                img.isPrimary ? 'border-primary shadow-glow-primary' : 'border-border',
                draggingId === img.id && 'opacity-50',
              )}
            >
              <div className="absolute left-1 top-1 z-10 cursor-grab rounded bg-bg/60 p-1 text-text-secondary opacity-0 backdrop-blur-sm transition-opacity group-hover:opacity-100">
                <GripVertical className="h-3.5 w-3.5" />
              </div>
              <div className="aspect-square w-full bg-surface-2">
                <Image
                  src={img.url}
                  alt={img.alt ?? ''}
                  width={300}
                  height={300}
                  unoptimized
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-1 bg-bg/85 px-2 py-1.5 text-xs">
                <button
                  type="button"
                  onClick={() => setPrimary(img.id)}
                  className={cn(
                    'inline-flex items-center gap-1 rounded px-1.5 py-0.5 transition-colors',
                    img.isPrimary ? 'text-primary' : 'text-text-secondary hover:text-primary',
                  )}
                  title={img.isPrimary ? 'Imagem principal' : 'Marcar como principal'}
                >
                  <Star className={cn('h-3.5 w-3.5', img.isPrimary && 'fill-primary')} />
                  {img.isPrimary && 'Principal'}
                </button>
                <button
                  type="button"
                  onClick={() => remove(img.id)}
                  className="rounded p-1 text-text-secondary transition-colors hover:bg-danger-soft hover:text-danger"
                  title="Remover"
                  aria-label="Remover imagem"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
      <p className="text-[11px] text-text-muted">
        Arrasta pra reordenar. Primeira é a principal por padrão. Limite 10 MB por imagem.
      </p>
    </div>
  )
}
