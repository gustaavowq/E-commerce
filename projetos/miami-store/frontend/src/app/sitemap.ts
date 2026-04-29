import type { MetadataRoute } from 'next'
import { listProducts } from '@/services/products'
import { listCategories } from '@/services/categories'
import { listBrands } from '@/services/brands'

const SITE = process.env.NEXT_PUBLIC_SITE_URL || 'http://miami.test'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date()

  // Páginas estáticas
  const staticPages: MetadataRoute.Sitemap = [
    { url: `${SITE}/`,                  lastModified: now, changeFrequency: 'daily',   priority: 1.0 },
    { url: `${SITE}/products`,          lastModified: now, changeFrequency: 'daily',   priority: 0.9 },
    { url: `${SITE}/favoritos`,         lastModified: now, changeFrequency: 'monthly', priority: 0.3 },
    { url: `${SITE}/policies/about`,    lastModified: now, changeFrequency: 'monthly', priority: 0.4 },
    { url: `${SITE}/policies/privacy`,  lastModified: now, changeFrequency: 'monthly', priority: 0.3 },
    { url: `${SITE}/policies/terms`,    lastModified: now, changeFrequency: 'monthly', priority: 0.3 },
    { url: `${SITE}/policies/exchange`, lastModified: now, changeFrequency: 'monthly', priority: 0.3 },
    { url: `${SITE}/policies/shipping`, lastModified: now, changeFrequency: 'monthly', priority: 0.3 },
  ]

  // Produtos, categorias, marcas — try/catch pra não quebrar se API offline
  try {
    const [products, categories, brands] = await Promise.all([
      listProducts({ limit: 100 }),
      listCategories(),
      listBrands(),
    ])

    const productPages: MetadataRoute.Sitemap = products.data.map(p => ({
      url: `${SITE}/products/${p.slug}`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.8,
    }))

    const categoryPages: MetadataRoute.Sitemap = categories.map(c => ({
      url: `${SITE}/products?category=${c.slug}`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.7,
    }))

    const brandPages: MetadataRoute.Sitemap = brands.map(b => ({
      url: `${SITE}/products?brand=${b.slug}`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.7,
    }))

    return [...staticPages, ...productPages, ...categoryPages, ...brandPages]
  } catch {
    return staticPages
  }
}
