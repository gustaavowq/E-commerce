'use client'

import { useRouter, useParams } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import Link from 'next/link'
import { get, patch, del } from '@/lib/api'
import { ImovelForm } from '@/components/painel/ImovelForm'
import { Button } from '@/components/ui/Button'
import type { ImovelDetail, ImovelWritePayload } from '@/types/api'

export default function EditarImovelPage() {
  const router = useRouter()
  const params = useParams<{ id: string }>()
  const id = params.id

  const { data, isLoading, error } = useQuery({
    queryKey: ['admin-imovel', id],
    queryFn: () => get<ImovelDetail>(`/api/admin/imoveis/${id}`, { withAuth: true }),
    enabled: !!id,
  })

  const handleSubmit = async (payload: ImovelWritePayload) => {
    await patch(`/api/admin/imoveis/${id}`, payload, { withAuth: true })
    router.refresh()
  }

  const handleDelete = async () => {
    if (!confirm('Excluir este imóvel? Vai virar INATIVO (soft delete).')) return
    await del(`/api/admin/imoveis/${id}`, { withAuth: true })
    router.push('/painel/imoveis')
    router.refresh()
  }

  if (isLoading) {
    return <p className="text-body text-ash">Carregando…</p>
  }
  if (error || !data) {
    return (
      <div>
        <p className="text-body text-ash mb-4">Imóvel não encontrado.</p>
        <Link href="/painel/imoveis" className="text-moss hover:underline underline-offset-4">
          ← Voltar
        </Link>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-8 max-w-3xl">
      <header className="flex items-end justify-between gap-4 flex-wrap">
        <div>
          <p className="text-eyebrow uppercase tracking-[0.16em] text-ash mb-3">Painel</p>
          <h1 className="font-display text-display-lg text-ink">Editar imóvel</h1>
          <p className="text-body-sm text-ash mt-2">/{data.slug}</p>
        </div>
        <Link href={`/imoveis/${data.slug}`} target="_blank" rel="noopener">
          <Button variant="secondary" type="button">
            Ver na loja
          </Button>
        </Link>
      </header>

      <ImovelForm initial={data} onSubmit={handleSubmit} submitLabel="Salvar alterações" />

      <div className="pt-8 border-t border-bone">
        <button
          onClick={handleDelete}
          className="text-body-sm text-red-600 hover:underline underline-offset-4"
        >
          Excluir imóvel
        </button>
      </div>
    </div>
  )
}
