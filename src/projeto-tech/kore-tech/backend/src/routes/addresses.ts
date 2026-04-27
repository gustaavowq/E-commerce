import { Router } from 'express'
import { prisma } from '../lib/prisma.js'
import { ok, created, noContent, errors } from '../lib/api-response.js'
import { requireAuth } from '../middleware/auth.js'
import { addressCreateSchema, addressUpdateSchema } from '../validators/address.js'

export const addressesRouter: Router = Router()

addressesRouter.use(requireAuth)

addressesRouter.get('/', async (req, res, next) => {
  try {
    const list = await prisma.address.findMany({
      where:   { userId: req.user!.id },
      orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
    })
    return ok(res, list)
  } catch (err) { next(err) }
})

addressesRouter.post('/', async (req, res, next) => {
  try {
    const body = addressCreateSchema.parse(req.body)
    const userId = req.user!.id

    const result = await prisma.$transaction(async (tx) => {
      if (body.isDefault) {
        await tx.address.updateMany({ where: { userId, isDefault: true }, data: { isDefault: false } })
      }
      const count = await tx.address.count({ where: { userId } })
      return tx.address.create({
        data: { ...body, userId, isDefault: body.isDefault || count === 0 },
      })
    })
    return created(res, result)
  } catch (err) { next(err) }
})

addressesRouter.patch('/:id', async (req, res, next) => {
  try {
    const body = addressUpdateSchema.parse(req.body)
    const existing = await prisma.address.findUnique({ where: { id: req.params.id } })
    if (!existing || existing.userId !== req.user!.id) throw errors.notFound('Endereço não encontrado')

    const result = await prisma.$transaction(async (tx) => {
      if (body.isDefault) {
        await tx.address.updateMany({
          where: { userId: req.user!.id, isDefault: true, id: { not: existing.id } },
          data:  { isDefault: false },
        })
      }
      return tx.address.update({ where: { id: existing.id }, data: body })
    })
    return ok(res, result)
  } catch (err) { next(err) }
})

addressesRouter.delete('/:id', async (req, res, next) => {
  try {
    const existing = await prisma.address.findUnique({ where: { id: req.params.id } })
    if (!existing || existing.userId !== req.user!.id) throw errors.notFound('Endereço não encontrado')
    await prisma.address.delete({ where: { id: existing.id } })
    return noContent(res)
  } catch (err) { next(err) }
})
