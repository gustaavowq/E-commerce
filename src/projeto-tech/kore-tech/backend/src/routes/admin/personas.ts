// CRUD de personas pelo admin. Personas = uso/jogo alvo (Valorant 240fps, etc).
import { Router } from 'express'
import { Prisma } from '@prisma/client'
import { prisma } from '../../lib/prisma.js'
import { ok, created, errors, noContent } from '../../lib/api-response.js'
import { personaCreateSchema, personaUpdateSchema } from '../../validators/persona.js'

export const adminPersonasRouter: Router = Router()

adminPersonasRouter.get('/', async (_req, res, next) => {
  try {
    const personas = await prisma.persona.findMany({
      orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
      include: { _count: { select: { products: true } } },
    })
    return ok(res, personas.map(p => ({
      id:           p.id,
      slug:         p.slug,
      name:         p.name,
      headline:     p.headline,
      iconEmoji:    p.iconEmoji,
      isActive:     p.isActive,
      sortOrder:    p.sortOrder,
      productCount: p._count.products,
      createdAt:    p.createdAt,
    })))
  } catch (err) { next(err) }
})

adminPersonasRouter.get('/:id', async (req, res, next) => {
  try {
    const persona = await prisma.persona.findUnique({
      where: { id: req.params.id },
      include: { products: { select: { id: true, slug: true, name: true, isActive: true } } },
    })
    if (!persona) throw errors.notFound('Persona não encontrada')
    return ok(res, persona)
  } catch (err) { next(err) }
})

adminPersonasRouter.post('/', async (req, res, next) => {
  try {
    const body = personaCreateSchema.parse(req.body)
    try {
      const p = await prisma.persona.create({
        data: {
          slug:        body.slug,
          name:        body.name,
          headline:    body.headline,
          subheadline: body.subheadline,
          description: body.description,
          targetGames: (body.targetGames ?? Prisma.JsonNull) as Prisma.InputJsonValue,
          targetFps:   (body.targetFps   ?? Prisma.JsonNull) as Prisma.InputJsonValue,
          heroImage:   body.heroImage,
          iconEmoji:   body.iconEmoji,
          isActive:    body.isActive,
          sortOrder:   body.sortOrder,
          metaTitle:   body.metaTitle,
          metaDesc:    body.metaDesc,
        },
      })
      return created(res, p)
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002') {
        throw errors.conflict(`Já existe persona com slug "${body.slug}"`)
      }
      throw e
    }
  } catch (err) { next(err) }
})

adminPersonasRouter.patch('/:id', async (req, res, next) => {
  try {
    const body = personaUpdateSchema.parse(req.body)
    const exists = await prisma.persona.findUnique({ where: { id: req.params.id } })
    if (!exists) throw errors.notFound('Persona não encontrada')

    const { targetGames, targetFps, ...rest } = body
    const data: Prisma.PersonaUpdateInput = { ...rest }
    if (targetGames !== undefined) {
      data.targetGames = (targetGames ?? Prisma.JsonNull) as Prisma.InputJsonValue
    }
    if (targetFps !== undefined) {
      data.targetFps = (targetFps ?? Prisma.JsonNull) as Prisma.InputJsonValue
    }

    const updated = await prisma.persona.update({ where: { id: exists.id }, data })
    return ok(res, updated)
  } catch (err) { next(err) }
})

adminPersonasRouter.delete('/:id', async (req, res, next) => {
  try {
    const exists = await prisma.persona.findUnique({ where: { id: req.params.id } })
    if (!exists) throw errors.notFound('Persona não encontrada')
    // Soft delete: vira inativa (preserva relação com produtos PCs montados)
    await prisma.persona.update({ where: { id: exists.id }, data: { isActive: false } })
    return noContent(res)
  } catch (err) { next(err) }
})
