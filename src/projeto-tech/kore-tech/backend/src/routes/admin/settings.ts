// PATCH /api/admin/settings — atualiza qualquer campo do StoreSettings.
import { Router } from 'express'
import { z } from 'zod'
import { Prisma } from '@prisma/client'
import { prisma } from '../../lib/prisma.js'
import { ok } from '../../lib/api-response.js'

export const adminSettingsRouter: Router = Router()

const settingsUpdateSchema = z.object({
  storeName:       z.string().min(1).max(80).optional(),
  storeTagline:    z.string().max(200).nullable().optional(),
  logoUrl:         z.string().nullable().optional(),
  faviconUrl:      z.string().nullable().optional(),
  whatsappNumber:  z.string().regex(/^\d{10,15}$/, 'Use só dígitos com DDI+DDD').nullable().optional(),
  whatsappMessage: z.string().max(500).nullable().optional(),
  instagramHandle: z.string().max(60).nullable().optional(),
  email:           z.string().email().nullable().optional(),
  phone:           z.string().max(30).nullable().optional(),
  cnpj:            z.string().max(20).nullable().optional(),
  legalName:       z.string().max(160).nullable().optional(),
  address:         z.string().max(300).nullable().optional(),
  privacyPolicy:   z.string().max(20000).nullable().optional(),
  termsOfUse:      z.string().max(20000).nullable().optional(),
  exchangePolicy:  z.string().max(20000).nullable().optional(),
  shippingPolicy:  z.string().max(20000).nullable().optional(),
  warrantyPolicy:  z.string().max(20000).nullable().optional(),
  aboutUs:         z.string().max(20000).nullable().optional(),
  pixDiscountPercent:   z.coerce.number().int().min(0).max(50).optional(),
  shippingFlatRate:     z.coerce.number().min(0).max(1000).optional(),
  freeShippingMinValue: z.coerce.number().min(0).max(100000).nullable().optional(),
}).strict()

adminSettingsRouter.get('/', async (_req, res, next) => {
  try {
    const s = await prisma.storeSettings.upsert({
      where:  { id: 'default' },
      update: {},
      create: { id: 'default' },
    })
    return ok(res, {
      ...s,
      shippingFlatRate:     Number(s.shippingFlatRate),
      freeShippingMinValue: s.freeShippingMinValue == null ? null : Number(s.freeShippingMinValue),
    })
  } catch (err) { next(err) }
})

adminSettingsRouter.patch('/', async (req, res, next) => {
  try {
    const body = settingsUpdateSchema.parse(req.body)
    const { shippingFlatRate, freeShippingMinValue, ...rest } = body
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const data: Record<string, any> = { ...rest }
    if (shippingFlatRate !== undefined) {
      data.shippingFlatRate = new Prisma.Decimal(shippingFlatRate)
    }
    if (freeShippingMinValue !== undefined) {
      data.freeShippingMinValue = freeShippingMinValue == null
        ? null
        : new Prisma.Decimal(freeShippingMinValue)
    }

    const updated = await prisma.storeSettings.upsert({
      where:  { id: 'default' },
      update: data,
      create: { id: 'default', ...data },
    })
    return ok(res, {
      ...updated,
      shippingFlatRate:     Number(updated.shippingFlatRate),
      freeShippingMinValue: updated.freeShippingMinValue == null ? null : Number(updated.freeShippingMinValue),
    })
  } catch (err) { next(err) }
})
