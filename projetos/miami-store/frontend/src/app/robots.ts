import type { MetadataRoute } from 'next'

const SITE = process.env.NEXT_PUBLIC_SITE_URL || 'http://miami.test'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: ['/'],
        // Não indexar carrinho, checkout, conta, painel admin
        disallow: ['/cart', '/checkout', '/account', '/auth/', '/orders/', '/favoritos'],
      },
    ],
    sitemap: `${SITE}/sitemap.xml`,
  }
}
