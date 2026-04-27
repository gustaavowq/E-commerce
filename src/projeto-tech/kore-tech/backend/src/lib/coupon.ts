// =============================================================================
// Cupom — validação + cálculo de desconto.
//
// Sprint 2 (Backend): adiciona regras avançadas de cumulação documentadas em
// `projetos/projeto-tech/kore-tech/growth/CUPONS.md`. Os campos no model
// Coupon (Sprint 2 migration) habilitam:
//   - requiresCartSource          → BUILDER10 (cart.source === 'builder')
//   - requiresPaymentMethod       → PIXFIRST  (paymentMethod === 'PIX')
//   - requiresCategoryPresence    → COMBO15   (['pc_full','periferico'])
//   - blockOtherPercent           → bloqueia empilhar com outro %
//   - stacksWithFreeShipping      → empilha com FRETE15
//
// Limite por usuário: continua check via Order.couponId (legado). Sprint 2
// também grava em `OrderCouponUsage` no commit do pedido — em Sprint 3 vamos
// migrar a checagem pra tabela de auditoria (mais semântica).
//
// Erros: sempre PT-BR, sem stack. Frontend renderiza direto.
// =============================================================================
import type { Coupon, PaymentMethod } from '@prisma/client'
import { prisma } from './prisma.js'
import { errors } from './api-response.js'

export type CouponResolution = {
  coupon:       Coupon
  discount:     number
  freeShipping: boolean
}

/**
 * Categorias de "periférico" expandidas — quando um cupom pede
 * `requiresCategoryPresence: ['periferico']`, qualquer item cuja
 * `hardwareCategory` esteja neste set conta como presença.
 */
const PERIPHERAL_GROUP = new Set([
  'mouse', 'teclado', 'headset', 'mousepad', 'monitor', 'cadeira', 'periferico',
])

function categoryMatches(required: string, present: string[]): boolean {
  if (required === 'periferico') {
    return present.some(c => PERIPHERAL_GROUP.has(c))
  }
  return present.includes(required)
}

export type ResolveCouponCtx = {
  code:           string
  userId:         string
  subtotal:       number
  // Sprint 2 — opcionais pra cupons com regra avançada. Se não vier, valida
  // só as regras antigas (compat com chamadas legadas que não passam ctx novo).
  cartSource?:    string | null
  paymentMethod?: PaymentMethod | null
  cartCategories?: string[]   // hardwareCategory de cada item presente no carrinho
  // shippingCost pode ser passado pra retornar discount = shippingCost no FREE_SHIPPING
  shippingCost?:  number
}

export async function resolveCoupon(opts: ResolveCouponCtx): Promise<CouponResolution> {
  const code = opts.code.trim().toUpperCase()
  const coupon = await prisma.coupon.findUnique({ where: { code } })
  if (!coupon || !coupon.isActive) throw errors.notFound('Cupom inválido')

  const now = new Date()
  if (coupon.validFrom > now) throw errors.badRequest('Cupom ainda não vigente')
  if (coupon.validUntil && coupon.validUntil < now) throw errors.badRequest('Cupom expirado')
  if (coupon.maxUses && coupon.usedCount >= coupon.maxUses) throw errors.badRequest('Cupom esgotado')

  // Pedido mínimo (subtotal antes de descontos/frete)
  if (coupon.minOrderValue && opts.subtotal < Number(coupon.minOrderValue)) {
    throw errors.badRequest(
      `Pedido mínimo de R$ ${Number(coupon.minOrderValue).toFixed(2)} pra usar este cupom`,
    )
  }

  // Sprint 2 — regra: origem do carrinho (BUILDER10)
  if (coupon.requiresCartSource && opts.cartSource !== coupon.requiresCartSource) {
    if (coupon.requiresCartSource === 'builder') {
      throw errors.badRequest('Este cupom vale só pra carrinho montado no PC Builder.')
    }
    throw errors.badRequest('Cupom não vale pra esta origem de carrinho.')
  }

  // Sprint 2 — regra: método de pagamento (PIXFIRST)
  if (coupon.requiresPaymentMethod && opts.paymentMethod !== coupon.requiresPaymentMethod) {
    if (coupon.requiresPaymentMethod === 'PIX') {
      throw errors.badRequest('Este cupom vale só pagando com Pix.')
    }
    throw errors.badRequest('Cupom não vale pra este método de pagamento.')
  }

  // Sprint 2 — regra: presença de categorias (COMBO15)
  if (coupon.requiresCategoryPresence.length > 0) {
    const present = opts.cartCategories ?? []
    const missing = coupon.requiresCategoryPresence.filter(req => !categoryMatches(req, present))
    if (missing.length > 0) {
      // Mensagem amigável pra COMBO15
      if (
        coupon.requiresCategoryPresence.includes('pc_full') &&
        coupon.requiresCategoryPresence.includes('periferico')
      ) {
        throw errors.badRequest('COMBO15 vale com 1 PC montado + 1 periférico no carrinho.')
      }
      throw errors.badRequest(
        `Este cupom precisa de ${missing.join(', ')} no carrinho.`,
      )
    }
  }

  // Limite por usuário (legado — Order.couponId). Sprint 3 migra pra usages.
  const used = await prisma.order.count({
    where: {
      userId:   opts.userId,
      couponId: coupon.id,
      status:   { not: 'CANCELLED' },
    },
  })
  if (used >= coupon.perUserLimit) throw errors.badRequest('Você já usou este cupom')

  // Cálculo de desconto
  let discount = 0
  let freeShipping = false
  if (coupon.type === 'PERCENT') {
    discount = +(opts.subtotal * (Number(coupon.value ?? 0) / 100)).toFixed(2)
  } else if (coupon.type === 'FIXED') {
    discount = Math.min(Number(coupon.value ?? 0), opts.subtotal)
  } else if (coupon.type === 'FREE_SHIPPING') {
    freeShipping = true
    // Se chamador passou shippingCost, retornamos como discount também
    // (compat com /orders.ts que zera o frete via flag freeShipping).
    if (typeof opts.shippingCost === 'number') {
      discount = opts.shippingCost
    }
  }

  return { coupon, discount, freeShipping }
}
