// robots.txt dinâmico Marquesa.
// Bloqueia área autenticada (painel) e API; libera o resto.

import type { MetadataRoute } from 'next'

const BASE = (
  process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
).replace(/\/+$/, '')

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/painel/', '/painel', '/auth/', '/auth'],
      },
    ],
    sitemap: `${BASE}/sitemap.xml`,
    host: BASE,
  }
}
