// GET /api/settings — público, leitura. Tudo que é "branding" da loja.
// Cacheável agressivamente porque muda raramente.
import { Router } from 'express'
import { prisma } from '../lib/prisma.js'
import { ok } from '../lib/api-response.js'

export const settingsRouter: Router = Router()

settingsRouter.get('/', async (_req, res, next) => {
  try {
    let s = await prisma.storeSettings.findUnique({ where: { id: 'default' } })
    if (!s) {
      // Bootstrap: cria com defaults na primeira chamada
      s = await prisma.storeSettings.create({ data: { id: 'default' } })
    }
    return ok(res, {
      storeName:        s.storeName,
      storeTagline:     s.storeTagline,
      logoUrl:          s.logoUrl,
      faviconUrl:       s.faviconUrl,
      whatsappNumber:   s.whatsappNumber,
      whatsappMessage:  s.whatsappMessage,
      instagramHandle:  s.instagramHandle,
      email:            s.email,
      phone:            s.phone,
      cnpj:             s.cnpj,
      legalName:        s.legalName,
      address:          s.address,
      privacyPolicy:    s.privacyPolicy,
      termsOfUse:       s.termsOfUse,
      exchangePolicy:   s.exchangePolicy,
      shippingPolicy:   s.shippingPolicy,
      warrantyPolicy:   s.warrantyPolicy,
      aboutUs:          s.aboutUs,
      pixDiscountPercent:   s.pixDiscountPercent,
      shippingFlatRate:     Number(s.shippingFlatRate),
      freeShippingMinValue: s.freeShippingMinValue == null ? null : Number(s.freeShippingMinValue),
    })
  } catch (err) { next(err) }
})
