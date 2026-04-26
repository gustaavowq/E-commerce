// Pedidos. Tudo logado.
//
// POST /api/orders            ← cria order a partir do carrinho ativo (transação atômica)
// GET  /api/orders            ← lista do user
// GET  /api/orders/:id        ← detalhe (só dono)
// POST /api/orders/:id/cancel ← cancela (volta estoque) se ainda pendente
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

// -----------------------------------------------------------------------------
// POST /api/orders
// -----------------------------------------------------------------------------
ordersRouter.post('/', async (req, res, next) => {
  try {
    const body = orderCreateSchema.parse(req.body)
    const userId = req.user!.id

    // 1) Carrega carrinho ativo
    const cart = await prisma.cart.findFirst({
      where: { userId, status: 'active' },
      include: {
        items: {
          include: {
            variation: { select: { id: true, sku: true, size: true, color: true, stock: true, priceOverride: true } },
            product:   { select: { id: true, name: true, basePrice: true } },
          },
        },
      },
      orderBy: { updatedAt: 'desc' },
    })
    if (!cart || cart.items.length === 0) throw errors.badRequest('Carrinho vazio')

    // 2) Endereço
    const address = await prisma.address.findUnique({ where: { id: body.addressId } })
    if (!address || address.userId !== userId) throw errors.notFound('Endereço inválido')

    // 3) Subtotal (snapshot)
    const itemsForOrder = cart.items.map(it => {
      const unitPrice = Number(it.variation.priceOverride ?? it.product.basePrice)
      return {
        productId:      it.productId,
        variationId:    it.variationId,
        productName:    it.product.name,
        variationLabel: `${it.variation.size} / ${it.variation.color}`,
        unitPrice,
        quantity:       it.quantity,
        subtotal:       +(unitPrice * it.quantity).toFixed(2),
      }
    })
    const subtotal = +itemsForOrder.reduce((acc, it) => acc + it.subtotal, 0).toFixed(2)

    // 4) Cupom (opcional) + frete
    const user = await prisma.user.findUnique({ where: { id: userId }, select: { email: true, name: true, cpf: true } })
    if (!user) throw errors.notFound('Usuário não encontrado')

    let discount = 0
    let couponId: string | null = null
    let freeShipping = false
    if (body.couponCode) {
      const resolved = await resolveCoupon({ code: body.couponCode, userId, subtotal })
      discount = resolved.discount
      couponId = resolved.coupon.id
      freeShipping = resolved.freeShipping
    }
    const shippingCost = freeShipping ? 0 : env.SHIPPING_FLAT_RATE
    const total = +(subtotal - discount + shippingCost).toFixed(2)
    if (total <= 0) throw errors.badRequest('Total inválido')

    // 5) Transação: decrementa estoque atomicamente, cria order/items/payment
    const orderNumber = await nextOrderNumber()
    const order = await prisma.$transaction(async (tx) => {
      // Decremento atômico — uma query por variação, com guard de stock >= qty.
      // Se afetar 0 linhas → estoque virou. Aborta.
      for (const it of cart.items) {
        const updated = await tx.productVariation.updateMany({
          where: { id: it.variationId, stock: { gte: it.quantity } },
          data:  { stock: { decrement: it.quantity } },
        })
        if (updated.count === 0) {
          throw errors.conflict(`Estoque acabou pra ${it.product.name} (${it.variation.size}/${it.variation.color})`)
        }
      }

      // Cria order com items e payment "pending"
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

      // Marca cart como convertido
      await tx.cart.update({
        where: { id: cart.id },
        data:  { status: 'converted', convertedAt: new Date() },
      })

      // Incrementa usedCount do cupom
      if (couponId) {
        await tx.coupon.update({ where: { id: couponId }, data: { usedCount: { increment: 1 } } })
      }
      return newOrder
    }, { isolationLevel: 'Serializable' })

    // 6) Cria Pix no MP (fora da transação — chamada externa)
    const payment = order.payments[0]!
    try {
      const pix = await createPixPayment({
        orderNumber:  order.orderNumber,
        amount:       Number(order.total),
        payerEmail:   user.email,
        payerName:    user.name ?? 'Cliente Miami',
        payerCpf:     user.cpf ?? undefined,
        description:  `Pedido ${order.orderNumber} - Miami Store`,
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
      // mantém order como PENDING_PAYMENT — usuário pode tentar regenerar Pix
    }

    return created(res, await loadOrder(order.id))
  } catch (err) { next(err) }
})

// -----------------------------------------------------------------------------
// GET /api/orders
// -----------------------------------------------------------------------------
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

// -----------------------------------------------------------------------------
// GET /api/orders/:id
// -----------------------------------------------------------------------------
ordersRouter.get('/:id', async (req, res, next) => {
  try {
    const order = await loadOrder(req.params.id, req.user!.id)
    if (!order) throw errors.notFound('Pedido não encontrado')
    return ok(res, order)
  } catch (err) { next(err) }
})

// -----------------------------------------------------------------------------
// POST /api/orders/:id/cancel — devolve estoque se ainda PENDING_PAYMENT
// -----------------------------------------------------------------------------
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

// -----------------------------------------------------------------------------
// Helper
// -----------------------------------------------------------------------------
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
