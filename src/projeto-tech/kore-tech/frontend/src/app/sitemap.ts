import type { MetadataRoute } from 'next'

const PERSONAS = [
  'valorant-240fps',
  'fortnite-competitivo',
  'cs2-high-tier',
  'edicao-4k',
  'streaming',
  'ia-local',
  'workstation-3d',
  'entry-gamer',
]

export default function sitemap(): MetadataRoute.Sitemap {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3001'
  const now = new Date()

  const staticPages: MetadataRoute.Sitemap = [
    { url: `${base}/`, lastModified: now, changeFrequency: 'daily', priority: 1.0 },
    { url: `${base}/produtos`, lastModified: now, changeFrequency: 'daily', priority: 0.9 },
    { url: `${base}/montar`, lastModified: now, changeFrequency: 'weekly', priority: 0.95 },
    { url: `${base}/builds`, lastModified: now, changeFrequency: 'weekly', priority: 0.85 },
    { url: `${base}/sobre`, lastModified: now, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${base}/contato`, lastModified: now, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${base}/policies/garantia`, lastModified: now, changeFrequency: 'monthly', priority: 0.4 },
    { url: `${base}/policies/troca`, lastModified: now, changeFrequency: 'monthly', priority: 0.4 },
    { url: `${base}/policies/envio`, lastModified: now, changeFrequency: 'monthly', priority: 0.4 },
    { url: `${base}/policies/privacidade`, lastModified: now, changeFrequency: 'monthly', priority: 0.4 },
    { url: `${base}/policies/termos`, lastModified: now, changeFrequency: 'monthly', priority: 0.4 },
  ]

  const personaPages: MetadataRoute.Sitemap = PERSONAS.map((p) => ({
    url: `${base}/builds/${p}`,
    lastModified: now,
    changeFrequency: 'weekly',
    priority: 0.9,
  }))

  return [...staticPages, ...personaPages]
}
