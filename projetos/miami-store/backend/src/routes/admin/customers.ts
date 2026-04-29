// Lista de customers pro painel admin.
import { Router } from 'express'
import { Prisma } from '@prisma/client'
import { prisma } from '../../lib/prisma.js'
import { ok, errors } from '../../lib/api-response.js'

export const adminCustomersRouter: Router = Router()

// GET /api/admin/customers
adminCustomersRouter.get('/', async (req, res, next) => {
  try {
    const page   = Math.max(1, Number(req.query.page  ?? 1))
    const limit  = Math.min(100, Math.max(1, Number(req.query.limit ?? 25)))
    const search = typeof req.query.search === 'string' ? req.query.search : undefined

    const where: Prisma.UserWhereInput = { role: 'CUSTOMER' }
    if (search) {
      where.OR = [
        { email: { contains: search, mode: 'insensitive' } },
        { name:  { contains: search, mode: 'insensitive' } },
      ]
    }

    const [total, customers] = await Promise.all([
      prisma.user.count({ where }),
      prisma.user.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        select: {
          id: true, email: true, name: true, phone: true,
          emailVerifiedAt: true, createdAt: true,
          _count: { select: { orders: true, addresses: true } },
        },
      }),
    ])

    // Pega total gasto (soma de orders PAID) por customer — uma query agregada
    const ids = customers.map(c => c.id)
    const spent = ids.length === 0
      ? new Map<string, number>()
      : new Map(
          (await prisma.order.groupBy({
            by:    ['userId'],
            where: { userId: { in: ids }, status: { in: ['PAID', 'PREPARING', 'SHIPPED', 'DELIVERED'] } },
            _sum:  { total: true },
          })).map(g => [g.userId, Number(g._sum.total ?? 0)]),
        )

    return ok(res, customers.map(c => ({
      id:           c.id,
      email:        c.email,
      name:         c.name,
      phone:        c.phone,
      emailVerifiedAt: c.emailVerifiedAt,
      createdAt:    c.createdAt,
      orderCount:   c._count.orders,
      addressCount: c._count.addresses,
      totalSpent:   spent.get(c.id) ?? 0,
    })), { page, limit, total, totalPages: Math.ceil(total / limit) })
  } catch (err) { next(err) }
})

// GET /api/admin/customers/:id — detalhe + últimos pedidos
adminCustomersRouter.get('/:id', async (req, res, next) => {
  try {
    const customer = await prisma.user.findUnique({
      where: { id: req.params.id },
      select: {
        id: true, email: true, name: true, phone: true, cpf: true, role: true,
        emailVerifiedAt: true, createdAt: true,
        addresses: { orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }] },
        orders: {
          orderBy: { createdAt: 'desc' },
          take: 20,
          select: {
            id: true, orderNumber: true, status: true,
            total: true, createdAt: true,
            payments: { select: { status: true }, take: 1 },
          },
        },
      },
    })
    if (!customer) throw errors.notFound('Cliente não encontrado')

    return ok(res, {
      ...customer,
      orders: customer.orders.map(o => ({
        id: o.id, orderNumber: o.orderNumber, status: o.status,
        total: Number(o.total), createdAt: o.createdAt,
        paymentStatus: o.payments[0]?.status ?? null,
      })),
    })
  } catch (err) { next(err) }
})
