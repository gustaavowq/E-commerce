// CRUD de cupons pelo painel admin.
import { Router } from 'express'
import { z } from 'zod'
import { Prisma } from '@prisma/client'
import { prisma } from '../../lib/prisma.js'
import { ok, created, errors, noContent } from '../../lib/api-response.js'

export const adminCouponsRouter: Router = Router()

const couponCreateSchema = z.object({
  code:           z.string().min(2).max(40).toUpperCase(),
  type:           z.enum(['PERCENT', 'FIXED', 'FREE_SHIPPING']),
  value:          z.coerce.number().nonnegative().nullable().optional(),
  minOrderValue:  z.coerce.number().nonnegative().nullable().optional(),
  maxUses:        z.coerce.number().int().positive().nullable().optional(),
  perUserLimit:   z.coerce.number().int().positive().default(1),
  validFrom:      z.string().datetime().optional(),
  validUntil:     z.string().datetime().nullable().optional(),
  isActive:       z.boolean().default(true),
}).strict()

const couponUpdateSchema = couponCreateSchema.partial()

adminCouponsRouter.get('/', async (req, res, next) => {
  try {
    const page  = Math.max(1, Number(req.query.page  ?? 1))
    const limit = Math.min(100, Math.max(1, Number(req.query.limit ?? 50)))

    const [total, coupons] = await Promise.all([
      prisma.coupon.count(),
      prisma.coupon.findMany({
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
    ])

    return ok(res, coupons.map(c => ({
      id: c.id,
      code: c.code,
      type: c.type,
      value: c.value == null ? null : Number(c.value),
      minOrderValue: c.minOrderValue == null ? null : Number(c.minOrderValue),
      maxUses: c.maxUses,
      usedCount: c.usedCount,
      perUserLimit: c.perUserLimit,
      validFrom: c.validFrom,
      validUntil: c.validUntil,
      isActive: c.isActive,
      createdAt: c.createdAt,
    })), { page, limit, total, totalPages: Math.ceil(total / limit) })
  } catch (err) { next(err) }
})

adminCouponsRouter.post('/', async (req, res, next) => {
  try {
    const body = couponCreateSchema.parse(req.body)
    if (body.type !== 'FREE_SHIPPING' && body.value == null) {
      throw errors.badRequest('Cupom PERCENT/FIXED precisa de "value"')
    }

    const data: Prisma.CouponCreateInput = {
      code: body.code,
      type: body.type,
      value: body.value == null ? null : new Prisma.Decimal(body.value),
      minOrderValue: body.minOrderValue == null ? null : new Prisma.Decimal(body.minOrderValue),
      maxUses: body.maxUses ?? null,
      perUserLimit: body.perUserLimit,
      validFrom: body.validFrom ? new Date(body.validFrom) : new Date(),
      validUntil: body.validUntil ? new Date(body.validUntil) : null,
      isActive: body.isActive,
    }

    try {
      const c = await prisma.coupon.create({ data })
      return created(res, c)
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002') {
        throw errors.conflict(`Já existe cupom com código "${body.code}"`)
      }
      throw e
    }
  } catch (err) { next(err) }
})

adminCouponsRouter.patch('/:id', async (req, res, next) => {
  try {
    const body = couponUpdateSchema.parse(req.body)
    const exists = await prisma.coupon.findUnique({ where: { id: req.params.id } })
    if (!exists) throw errors.notFound('Cupom não encontrado')

    const data: Prisma.CouponUpdateInput = {}
    if (body.code         !== undefined) data.code = body.code
    if (body.type         !== undefined) data.type = body.type
    if (body.value        !== undefined) data.value = body.value == null ? null : new Prisma.Decimal(body.value)
    if (body.minOrderValue !== undefined) data.minOrderValue = body.minOrderValue == null ? null : new Prisma.Decimal(body.minOrderValue)
    if (body.maxUses      !== undefined) data.maxUses = body.maxUses
    if (body.perUserLimit !== undefined) data.perUserLimit = body.perUserLimit
    if (body.validFrom    !== undefined) data.validFrom = new Date(body.validFrom)
    if (body.validUntil   !== undefined) data.validUntil = body.validUntil ? new Date(body.validUntil) : null
    if (body.isActive     !== undefined) data.isActive = body.isActive

    const updated = await prisma.coupon.update({ where: { id: exists.id }, data })
    return ok(res, updated)
  } catch (err) { next(err) }
})

adminCouponsRouter.delete('/:id', async (req, res, next) => {
  try {
    const exists = await prisma.coupon.findUnique({ where: { id: req.params.id } })
    if (!exists) throw errors.notFound('Cupom não encontrado')
    // Soft delete via isActive=false (preserva histórico de uso em orders)
    await prisma.coupon.update({ where: { id: exists.id }, data: { isActive: false } })
    return noContent(res)
  } catch (err) { next(err) }
})
