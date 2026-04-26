// Orders pelo admin: listar, ver detalhe, atualizar status/tracking.
// PAID/CANCELLED são governados pelo gateway — admin só mexe nos passos
// pós-pagamento (PREPARING → SHIPPED → DELIVERED) e refund manual.
import { Router } from 'express'
import { Prisma, type OrderStatus } from '@prisma/client'
import { prisma } from '../../lib/prisma.js'
import { ok, errors } from '../../lib/api-response.js'
import { orderStatusUpdateSchema } from '../../validators/admin-order.js'

export const adminOrdersRouter: Router = Router()

const ALLOWED_STATUS_VALUES = ['PENDING_PAYMENT', 'PAID', 'PREPARING', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'REFUNDED'] as const

// GET /api/admin/orders — lista paginada com filtros
adminOrdersRouter.get('/', async (req, res, next) => {
  try {
    const page  = Math.max(1, Number(req.query.page  ?? 1))
    const limit = Math.min(100, Math.max(1, Number(req.query.limit ?? 25)))
    const status = typeof req.query.status === 'string' ? req.query.status : undefined
    const search = typeof req.query.search === 'string' ? req.query.search : undefined

    const where: Prisma.OrderWhereInput = {}
    if (status && (ALLOWED_STATUS_VALUES as readonly string[]).includes(status)) {
      where.status = status as OrderStatus
    }
    if (search) {
      where.OR = [
        { orderNumber: { contains: search, mode: 'insensitive' } },
        { user: { email: { contains: search, mode: 'insensitive' } } },
        { user: { name:  { contains: search, mode: 'insensitive' } } },
      ]
    }

    const [total, orders] = await Promise.all([
      prisma.order.count({ where }),
      prisma.order.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          user:     { select: { id: true, email: true, name: true } },
          payments: { select: { method: true, status: true } },
          _count:   { select: { items: true } },
        },
      }),
    ])

    return ok(res, orders.map(o => ({
      id:           o.id,
      orderNumber:  o.orderNumber,
      status:       o.status,
      total:        Number(o.total),
      itemCount:    o._count.items,
      paymentStatus: o.payments[0]?.status ?? null,
      paymentMethod: o.payments[0]?.method ?? null,
      trackingCode: o.trackingCode,
      customer: {
        id:    o.user.id,
        email: o.user.email,
        name:  o.user.name,
      },
      createdAt: o.createdAt,
    })), { page, limit, total, totalPages: Math.ceil(total / limit) })
  } catch (err) { next(err) }
})

// GET /api/admin/orders/:id — detalhe completo
adminOrdersRouter.get('/:id', async (req, res, next) => {
  try {
    const order = await prisma.order.findUnique({
      where: { id: req.params.id },
      include: {
        user:     { select: { id: true, email: true, name: true, phone: true, cpf: true, createdAt: true } },
        address:  true,
        items:    { orderBy: { createdAt: 'asc' } },
        payments: { orderBy: { createdAt: 'desc' } },
        coupon:   { select: { code: true, type: true, value: true } },
      },
    })
    if (!order) throw errors.notFound('Pedido não encontrado')

    return ok(res, {
      id:           order.id,
      orderNumber:  order.orderNumber,
      status:       order.status,
      subtotal:     Number(order.subtotal),
      shippingCost: Number(order.shippingCost),
      discount:     Number(order.discount),
      total:        Number(order.total),
      notes:        order.notes,
      trackingCode: order.trackingCode,
      shippedAt:    order.shippedAt,
      deliveredAt:  order.deliveredAt,
      cancelledAt:  order.cancelledAt,
      createdAt:    order.createdAt,
      updatedAt:    order.updatedAt,
      customer:     order.user,
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
      payments: order.payments.map(p => ({
        id:           p.id,
        method:       p.method,
        status:       p.status,
        amount:       Number(p.amount),
        gatewayId:    p.gatewayId,
        approvedAt:   p.approvedAt,
        rejectedAt:   p.rejectedAt,
        pixExpiresAt: p.pixExpiresAt,
        createdAt:    p.createdAt,
      })),
    })
  } catch (err) { next(err) }
})

// PATCH /api/admin/orders/:id — atualiza status/tracking
adminOrdersRouter.patch('/:id', async (req, res, next) => {
  try {
    const body = orderStatusUpdateSchema.parse(req.body)
    const order = await prisma.order.findUnique({ where: { id: req.params.id } })
    if (!order) throw errors.notFound('Pedido não encontrado')

    const data: Prisma.OrderUpdateInput = {}
    if (body.trackingCode !== undefined) data.trackingCode = body.trackingCode

    if (body.status) {
      // Não permite admin avançar status enquanto pagamento está pendente — gateway controla
      if (order.status === 'PENDING_PAYMENT') {
        throw errors.badRequest('Pedido ainda não foi pago — aguarde confirmação do gateway')
      }
      data.status = body.status
      const now = new Date()
      if (body.status === 'SHIPPED'   && !order.shippedAt)   data.shippedAt = now
      if (body.status === 'DELIVERED' && !order.deliveredAt) data.deliveredAt = now
      if (body.status === 'REFUNDED'  && !order.cancelledAt) data.cancelledAt = now
    }

    const updated = await prisma.order.update({
      where: { id: order.id },
      data,
      select: {
        id: true, orderNumber: true, status: true,
        trackingCode: true, shippedAt: true, deliveredAt: true,
      },
    })
    return ok(res, updated)
  } catch (err) { next(err) }
})
