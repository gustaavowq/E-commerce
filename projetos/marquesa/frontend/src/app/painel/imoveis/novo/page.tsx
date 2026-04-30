'use client'

import { useRouter } from 'next/navigation'
import { post } from '@/lib/api'
import { ImovelForm } from '@/components/painel/ImovelForm'
import type { ImovelDetail, ImovelWritePayload } from '@/types/api'

export default function NovoImovelPage() {
  const router = useRouter()

  const handleSubmit = async (payload: ImovelWritePayload) => {
    const res = await post<ImovelDetail>('/api/admin/imoveis', payload, { withAuth: true })
    router.push(`/painel/imoveis/${res.id}`)
    router.refresh()
  }

  return (
    <div className="flex flex-col gap-8 max-w-3xl">
      <header>
        <p className="text-eyebrow uppercase tracking-[0.16em] text-ash mb-3">Painel</p>
        <h1 className="font-display text-display-lg text-ink">Novo imóvel</h1>
      </header>
      <ImovelForm onSubmit={handleSubmit} submitLabel="Criar imóvel" />
    </div>
  )
}
