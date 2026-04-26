// Valida e calcula desconto de cupom.
import type { Coupon } from '@prisma/client'
import { prisma } from './prisma.js'
import { errors } from './api-response.js'

export type CouponResolution = {
  coupon:   Coupon
  discount: number
  freeShipping: boolean
}

export async function resolveCoupon(opts: {
  code:     string
  userId:   string
  subtotal: number
}): Promise<CouponResolution> {
  const code = opts.code.trim().toUpperCase()
  const coupon = await prisma.coupon.findUnique({ where: { code } })
  if (!coupon || !coupon.isActive) throw errors.notFound('Cupom inválido')

  const now = new Date()
  if (coupon.validFrom > now) throw errors.badRequest('Cupom ainda não vigente')
  if (coupon.validUntil && coupon.validUntil < now) throw errors.badRequest('Cupom expirado')
  if (coupon.maxUses && coupon.usedCount >= coupon.maxUses) throw errors.badRequest('Cupom esgotado')

  if (coupon.minOrderValue && opts.subtotal < Number(coupon.minOrderValue)) {
    throw errors.badRequest(`Pedido mínimo de R$ ${Number(coupon.minOrderValue).toFixed(2)} pra usar este cupom`)
  }

  const used = await prisma.order.count({
    where: { userId: opts.userId, couponId: coupon.id, status: { not: 'CANCELLED' } },
  })
  if (used >= coupon.perUserLimit) throw errors.badRequest('Você já usou este cupom')

  let discount = 0
  let freeShipping = false
  if (coupon.type === 'PERCENT') {
    discount = +(opts.subtotal * (Number(coupon.value ?? 0) / 100)).toFixed(2)
  } else if (coupon.type === 'FIXED') {
    discount = Math.min(Number(coupon.value ?? 0), opts.subtotal)
  } else if (coupon.type === 'FREE_SHIPPING') {
    freeShipping = true
  }

  return { coupon, discount, freeShipping }
}
