import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3001'
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/account', '/orders', '/auth', '/checkout'],
      },
    ],
    sitemap: `${base}/sitemap.xml`,
  }
}
