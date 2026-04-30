// Sitemap dinâmico Marquesa.
// Server component — Next gera /sitemap.xml a partir deste array.
// Lista rotas estáticas + 1 entry por imóvel ativo do catálogo.
// BASE vem de NEXT_PUBLIC_SITE_URL (fallback localhost), NUNCA hardcoded.

import type { MetadataRoute } from 'next'
import { apiList } from '@/lib/api'
import type { ImovelListItem } from '@/types/api'

// Fonte da verdade do domínio público — sem hardcoding.
const BASE = (
  process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
).replace(/\/+$/, '')

// Revalida a cada 1h em produção.
export const revalidate = 3600

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  let imoveis: ImovelListItem[] = []
  try {
    // Pega até 500 imóveis do catálogo público (apiList já trata wrapper success).
    const res = await apiList<ImovelListItem>('/api/imoveis', {
      query: { limit: 500 },
      withAuth: false,
      next: { revalidate: 3600 } as never,
    })
    imoveis = res.data
  } catch {
    // Sitemap funciona mesmo se API estiver fora — retorna só rotas estáticas.
    imoveis = []
  }

  const now = new Date()

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${BASE}/`,                       lastModified: now, changeFrequency: 'weekly',  priority: 1.0 },
    { url: `${BASE}/imoveis`,                lastModified: now, changeFrequency: 'daily',   priority: 0.9 },
    { url: `${BASE}/sobre`,                  lastModified: now, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${BASE}/contato`,                lastModified: now, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${BASE}/policies/reserva`,       lastModified: now, changeFrequency: 'yearly',  priority: 0.3 },
    { url: `${BASE}/policies/privacidade`,   lastModified: now, changeFrequency: 'yearly',  priority: 0.3 },
  ]

  const imovelRoutes: MetadataRoute.Sitemap = imoveis
    .filter((i) => i.status !== 'INATIVO' && i.status !== 'VENDIDO')
    .map((i) => ({
      url: `${BASE}/imoveis/${i.slug}`,
      // ImovelListItem não retorna updatedAt — usa createdAt como proxy razoável.
      lastModified: i.createdAt ? new Date(i.createdAt) : now,
      changeFrequency: 'weekly' as const,
      priority: i.destaque ? 0.8 : 0.6,
    }))

  return [...staticRoutes, ...imovelRoutes]
}
