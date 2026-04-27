// Pedidos. Tudo logado.
//
// Decremento de estoque é OPTIMISTIC: a query de UPDATE filtra por stock >= qty,
// se afetar 0 linhas, sabemos que outro request roubou estoque e cancelamos.
import { Router } from 'express'
import { Prisma } from '@prisma/client'
import { prisma } from '../lib/prisma.js'
import { ok, created, errors } from '../lib/api-response.js'
import { requireAuth } from '../middleware/auth.js'
import { orderCreateSchema } from '../validators/order.js'
import { nextOrderNumber } from '../lib/order-number.js'
import { resolveCoupon } from '../lib/coupon.js'
import { createPixPayment } from '../lib/mercadopago.js'
import { env } from '../config/env.js'

export const ordersRouter: Router = Router()

ordersRouter.use(requireAuth)

ordersRouter.post('/', async (req, res, next) => {
  try {
    const body = orderCreateSchema.parse(req.body)
    const userId = req.user!.id

    // Resolve variação: tenta por variationId primeiro, senão pega a 1ª variação do produto.
    // Isso permite carrinho local (frontend Zustand) onde variationId pode ser o productId.
    async function resolveVariation(productId: string, variationId?: string) {
      if (variationId) {
        const byVarId = await prisma.productVariation.findUnique({
          where: { id: variationId },
          include: { product: { select: { id: true, name: true, basePrice: true, hardwareCategory: true, isActive: true } } },
        })
        if (byVarId) return byVarId
      }
      // Fallback: 1ª variação ativa do produto (cobre produtos sem variação e builder)
      return prisma.productVariation.findFirst({
        where: { productId, product: { isActive: true } },
        orderBy: { id: 'asc' },
        include: { product: { select: { id: true, name: true, basePrice: true, hardwareCategory: true, isActive: true } } },
      })
    }

    // Prioriza itens do body (carrinho local); fallback pro server cart legado
    let rawItems: Array<{ productId: string; variationId?: string; quantity: number }>
    let cartSourceValue: string | null = body.cartSource ?? null

    if (body.items && body.items.length > 0) {
      rawItems = body.items
    } else {
      const cart = await prisma.cart.findFirst({
        where: { userId, status: 'active' },
        include: {
          items: {
            include: {
              variation: { select: { id: true, sku: true, size: true, color: true, stock: true, priceOverride: true } },
              product:   { select: { id: true, name: true, basePrice: true, hardwareCategory: true } },
            },
          },
        },
        orderBy: { updatedAt: 'desc' },
      })
      if (!cart || cart.items.length === 0) throw errors.badRequest('Carrinho vazio')
      rawItems = cart.items.map(it => ({ productId: it.productId, variationId: it.variationId, quantity: it.quantity }))
      cartSourceValue = cart.source
    }

    const resolvedVariations = await Promise.all(
      rawItems.map(async it => {
        const v = await resolveVariation(it.productId, it.variationId)
        if (!v || !v.product.isActive) throw errors.notFound(`Produto não disponível: ${it.productId}`)
        return { ...it, variation: v }
      }),
    )

    const cartCategories = Array.from(new Set(resolvedVariations.map(it => it.variation.product.hardwareCategory)))

    const address = await prisma.address.findUnique({ where: { id: body.addressId } })
    if (!address || address.userId !== userId) throw errors.notFound('Endereço inválido')

    const itemsForOrder = resolvedVariations.map(it => {
      const unitPrice = Number(it.variation.priceOverride ?? it.variation.product.basePrice)
      const variationLabel = it.variation.color
        ? `${it.variation.size} / ${it.variation.color}`
        : (it.variation.size ?? 'Padrao')
      return {
        productId:      it.variation.product.id,
        variationId:    it.variation.id,
        productName:    it.variation.product.name,
        variationLabel,
        unitPrice,
        quantity:       it.quantity,
        subtotal:       +(unitPrice * it.quantity).toFixed(2),
      }
    })
    const subtotal = +itemsForOrder.reduce((acc, it) => acc + it.subtotal, 0).toFixed(2)

    const user = await prisma.user.findUnique({ where: { id: userId }, select: { email: true, name: true, cpf: true } })
    if (!user) throw errors.notFound('Usuário não encontrado')

    let discount = 0
    let couponId: string | null = null
    let couponCode: string | null = null
    let freeShipping = false
    if (body.couponCode) {
      const resolved = await resolveCoupon({
        code:           body.couponCode,
        userId,
        subtotal,
        cartSource:     cartSourceValue,
        paymentMethod:  body.paymentMethod,
        cartCategories,
      })
      discount     = resolved.discount
      couponId     = resolved.coupon.id
      couponCode   = resolved.coupon.code
      freeShipping = resolved.freeShipping
    }
    const shippingCost = freeShipping ? 0 : env.SHIPPING_FLAT_RATE
    const total = +(subtotal - discount + shippingCost).toFixed(2)
    if (total <= 0) throw errors.badRequest('Total inválido')

    // Captura cartId caso seja server cart (pra marcar como convertido na transaction)
    let serverCartId: string | null = null
    if (!body.items) {
      const sc = await prisma.cart.findFirst({ where: { userId, status: 'active' }, select: { id: true }, orderBy: { updatedAt: 'desc' } })
      serverCartId = sc?.id ?? null
    }

    const orderNumber = await nextOrderNumber()
    const order = await prisma.$transaction(async (tx) => {
      for (const it of resolvedVariations) {
        const updated = await tx.productVariation.updateMany({
          where: { id: it.variation.id, stock: { gte: it.quantity } },
          data:  { stock: { decrement: it.quantity } },
        })
        if (updated.count === 0) {
          throw errors.conflict(`Estoque acabou pra ${it.variation.product.name}`)
        }
      }

      const newOrder = await tx.order.create({
        data: {
          orderNumber,
          userId,
          status:       'PENDING_PAYMENT',
          addressId:    address.id,
          subtotal:     new Prisma.Decimal(subtotal),
          shippingCost: new Prisma.Decimal(shippingCost),
          discount:     new Prisma.Decimal(discount),
          total:        new Prisma.Decimal(total),
          couponId,
          notes:        body.notes,
          items: {
            create: itemsForOrder.map(it => ({
              productId:      it.productId,
              variationId:    it.variationId,
              productName:    it.productName,
              variationLabel: it.variationLabel,
              unitPrice:      new Prisma.Decimal(it.unitPrice),
              quantity:       it.quantity,
              subtotal:       new Prisma.Decimal(it.subtotal),
            })),
          },
          payments: {
            create: {
              method:   body.paymentMethod,
              status:   'PENDING',
              amount:   new Prisma.Decimal(total),
            },
          },
        },
        include: { payments: true },
      })

      if (serverCartId) {
        await tx.cart.update({
          where: { id: serverCartId },
          data:  { status: 'converted', convertedAt: new Date() },
        })
      }

      if (couponId && couponCode) {
        await tx.coupon.update({ where: { id: couponId }, data: { usedCount: { increment: 1 } } })
        // Sprint 2 — auditoria de uso (CAC/ROI por cupom + checagem de limite por user)
        await tx.orderCouponUsage.create({
          data: {
            orderId:          newOrder.id,
            couponId,
            couponCode,
            userId,
            email:            user.email,
            discountValueBRL: new Prisma.Decimal(discount),
          },
        })
      }
      return newOrder
    }, { isolationLevel: 'Serializable' })

    const payment = order.payments[0]!
    try {
      const pix = await createPixPayment({
        orderNumber:  order.orderNumber,
        amount:       Number(order.total),
        payerEmail:   user.email,
        payerName:    user.name ?? 'Cliente Kore Tech',
        payerCpf:     user.cpf ?? undefined,
        description:  `Pedido ${order.orderNumber} - Kore Tech`,
      })
      await prisma.payment.update({
        where: { id: payment.id },
        data: {
          gatewayId:    pix.gatewayId,
          pixQrCode:    pix.qrCode,
          pixCopyPaste: pix.copyPaste,
          pixExpiresAt: pix.expiresAt,
        },
      })
    } catch (mpErr) {
      console.error('[orders] falha ao gerar Pix', mpErr)
    }

    return created(res, await loadOrder(order.id))
  } catch (err) { next(err) }
})

ordersRouter.get('/', async (req, res, next) => {
  try {
    const orders = await prisma.order.findMany({
      where: { userId: req.user!.id },
      orderBy: { createdAt: 'desc' },
      include: {
        items:    { take: 3, select: { productName: true, quantity: true } },
        payments: { select: { method: true, status: true } },
      },
    })
    return ok(res, orders.map(o => ({
      id:           o.id,
      orderNumber:  o.orderNumber,
      status:       o.status,
      total:        Number(o.total),
      paymentStatus: o.payments[0]?.status ?? null,
      itemPreview:  o.items.map(i => `${i.quantity}× ${i.productName}`),
      createdAt:    o.createdAt,
    })))
  } catch (err) { next(err) }
})

ordersRouter.get('/:id', async (req, res, next) => {
  try {
    const order = await loadOrder(req.params.id, req.user!.id)
    if (!order) throw errors.notFound('Pedido não encontrado')
    return ok(res, order)
  } catch (err) { next(err) }
})

ordersRouter.post('/:id/cancel', async (req, res, next) => {
  try {
    const userId = req.user!.id
    const order = await prisma.order.findUnique({
      where: { id: req.params.id },
      include: { items: true, payments: true },
    })
    if (!order || order.userId !== userId) throw errors.notFound('Pedido não encontrado')
    if (order.status !== 'PENDING_PAYMENT') {
      throw errors.badRequest(`Não dá pra cancelar pedido com status ${order.status}`)
    }

    await prisma.$transaction(async (tx) => {
      for (const it of order.items) {
        await tx.productVariation.update({
          where: { id: it.variationId },
          data:  { stock: { increment: it.quantity } },
        })
      }
      await tx.order.update({
        where: { id: order.id },
        data:  { status: 'CANCELLED', cancelledAt: new Date() },
      })
      await tx.payment.updateMany({
        where: { orderId: order.id, status: 'PENDING' },
        data:  { status: 'CANCELLED' },
      })
    })

    return ok(res, await loadOrder(order.id, userId))
  } catch (err) { next(err) }
})

async function loadOrder(id: string, userId?: string) {
  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      address:  true,
      items:    true,
      payments: true,
      coupon:   { select: { code: true, type: true } },
    },
  })
  if (!order) return null
  if (userId && order.userId !== userId) return null

  return {
    id:           order.id,
    orderNumber:  order.orderNumber,
    status:       order.status,
    subtotal:     Number(order.subtotal),
    shippingCost: Number(order.shippingCost),
    discount:     Number(order.discount),
    total:        Number(order.total),
    notes:        order.notes,
    address:      order.address,
    coupon:       order.coupon,
    items: order.items.map(it => ({
      id:             it.id,
      productId:      it.productId,
      variationId:    it.variationId,
      productName:    it.productName,
      variationLabel: it.variationLabel,
      unitPrice:      Number(it.unitPrice),
      quantity:       it.quantity,
      subtotal:       Number(it.subtotal),
    })),
    payment: order.payments[0] ? {
      id:           order.payments[0].id,
      method:       order.payments[0].method,
      status:       order.payments[0].status,
      amount:       Number(order.payments[0].amount),
      pixQrCode:    order.payments[0].pixQrCode,
      pixCopyPaste: order.payments[0].pixCopyPaste,
      pixExpiresAt: order.payments[0].pixExpiresAt,
      approvedAt:   order.payments[0].approvedAt,
    } : null,
    createdAt: order.createdAt,
    updatedAt: order.updatedAt,
  }
}
