// Personas. Catálogo organizado por uso ("Valorant 240fps", "Edição 4K").
// Cada persona = landing page SEO indexável /builds/[slug].
import { Router } from 'express'
import { prisma } from '../lib/prisma.js'
import { ok, errors } from '../lib/api-response.js'

export const personasRouter: Router = Router()

// GET /api/personas — lista todas as ativas
personasRouter.get('/', async (_req, res, next) => {
  try {
    const personas = await prisma.persona.findMany({
      where: { isActive: true },
      orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
      select: {
        id: true, slug: true, name: true,
        headline: true, subheadline: true,
        targetGames: true, targetFps: true,
        heroImage: true, iconEmoji: true,
        _count: { select: { products: { where: { isActive: true } } } },
      },
    })
    return ok(res, personas.map(p => ({
      id:           p.id,
      slug:         p.slug,
      name:         p.name,
      headline:     p.headline,
      subheadline:  p.subheadline,
      targetGames:  p.targetGames,
      targetFps:    p.targetFps,
      heroImage:    p.heroImage,
      iconEmoji:    p.iconEmoji,
      productCount: p._count.products,
    })))
  } catch (err) { next(err) }
})

// GET /api/personas/:slug — detalhes (full)
personasRouter.get('/:slug', async (req, res, next) => {
  try {
    const persona = await prisma.persona.findUnique({
      where: { slug: req.params.slug },
      select: {
        id: true, slug: true, name: true,
        headline: true, subheadline: true, description: true,
        targetGames: true, targetFps: true,
        heroImage: true, iconEmoji: true,
        metaTitle: true, metaDesc: true, isActive: true,
        _count: { select: { products: { where: { isActive: true } } } },
      },
    })
    if (!persona || !persona.isActive) throw errors.notFound('Persona não encontrada')

    return ok(res, {
      id:           persona.id,
      slug:         persona.slug,
      name:         persona.name,
      headline:     persona.headline,
      subheadline:  persona.subheadline,
      description:  persona.description,
      targetGames:  persona.targetGames,
      targetFps:    persona.targetFps,
      heroImage:    persona.heroImage,
      iconEmoji:    persona.iconEmoji,
      metaTitle:    persona.metaTitle,
      metaDesc:     persona.metaDesc,
      productCount: persona._count.products,
    })
  } catch (err) { next(err) }
})
