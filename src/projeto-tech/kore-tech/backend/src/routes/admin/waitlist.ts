// Admin: gerenciar e notificar lista de espera.
// POST /api/admin/waitlist/notify/:productId — admin dispara notificação
//   pra todos os subscribers ainda não notificados desse produto.
import { Router } from 'express'
import { prisma } from '../../lib/prisma.js'
import { ok, errors } from '../../lib/api-response.js'
import { waitlistNotifySchema } from '../../validators/waitlist.js'

export const adminWaitlistRouter: Router = Router()

// GET /api/admin/waitlist — lista todas as inscrições, agrupando por produto
adminWaitlistRouter.get('/', async (req, res, next) => {
  try {
    const onlyActive = req.query.active === 'true'

    const subs = await prisma.waitlistSubscription.findMany({
      where: onlyActive ? { notifiedAt: null } : {},
      orderBy: { createdAt: 'desc' },
      include: {
        product: {
          select: {
            id: true, slug: true, name: true,
            variations: { select: { stock: true } },
          },
        },
      },
    })

    // Agrupa por produto pra UI mostrar "Produto X: 23 pessoas esperando"
    const byProduct = new Map<string, {
      productId: string
      productSlug: string
      productName: string
      totalStock: number
      subscribers: Array<{ id: string; email: string; createdAt: Date; notifiedAt: Date | null; note: string | null }>
    }>()

    for (const s of subs) {
      const stock = s.product.variations.reduce((acc, v) => acc + v.stock, 0)
      const entry = byProduct.get(s.product.id) ?? {
        productId:   s.product.id,
        productSlug: s.product.slug,
        productName: s.product.name,
        totalStock:  stock,
        subscribers: [],
      }
      entry.subscribers.push({
        id:         s.id,
        email:      s.email,
        createdAt:  s.createdAt,
        notifiedAt: s.notifiedAt,
        note:       s.note,
      })
      byProduct.set(s.product.id, entry)
    }

    return ok(res, Array.from(byProduct.values()).sort(
      (a, b) => b.subscribers.length - a.subscribers.length,
    ))
  } catch (err) { next(err) }
})

// GET /api/admin/waitlist/top — top N produtos com mais lista de espera
adminWaitlistRouter.get('/top', async (req, res, next) => {
  try {
    const limit = Math.min(50, Math.max(1, Number(req.query.limit ?? 10)))

    const grouped = await prisma.waitlistSubscription.groupBy({
      by: ['productId'],
      where: { notifiedAt: null },
      _count: true,
      orderBy: { _count: { productId: 'desc' } },
      take: limit,
    })

    const productIds = grouped.map(g => g.productId)
    const products = await prisma.product.findMany({
      where: { id: { in: productIds } },
      select: {
        id: true, slug: true, name: true,
        variations: { select: { stock: true } },
      },
    })
    const byId = new Map(products.map(p => [p.id, p]))

    return ok(res, grouped.map(g => {
      const p = byId.get(g.productId)
      return {
        productId:   g.productId,
        productSlug: p?.slug ?? '—',
        productName: p?.name ?? '—',
        waitingCount: g._count,
        totalStock:  p?.variations.reduce((acc, v) => acc + v.stock, 0) ?? 0,
      }
    }))
  } catch (err) { next(err) }
})

// POST /api/admin/waitlist/notify/:productId
//   Marca subscribers como notified + (futuro: dispara email Resend).
//   No MVP só marca o notifiedAt — DevOps liga Resend quando integrar.
adminWaitlistRouter.post('/notify/:productId', async (req, res, next) => {
  try {
    const productId = String(req.params.productId)
    const body = waitlistNotifySchema.parse(req.body ?? {})

    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: { id: true, name: true, slug: true },
    })
    if (!product) throw errors.notFound('Produto não encontrado')

    const where = body.subscriptionIds && body.subscriptionIds.length > 0
      ? { id: { in: body.subscriptionIds }, productId, notifiedAt: null }
      : { productId, notifiedAt: null }

    const subs = await prisma.waitlistSubscription.findMany({ where })

    if (subs.length === 0) {
      return ok(res, { notified: 0, message: 'Ninguém pra notificar (todos já avisados)' })
    }

    const now = new Date()
    await prisma.waitlistSubscription.updateMany({
      where: { id: { in: subs.map(s => s.id) } },
      data:  { notifiedAt: now },
    })

    // TODO(resend): dispara email pra cada sub.email com:
    //   "produto X voltou ao estoque! reserva por 24h: link"
    //   No MVP apenas log.
    if (process.env.NODE_ENV !== 'production') {
      console.log(`[waitlist] Notificaria ${subs.length} pessoas sobre "${product.name}":`)
      for (const s of subs) console.log(`  → ${s.email}`)
    }

    return ok(res, {
      notified: subs.length,
      product: { id: product.id, name: product.name, slug: product.slug },
      message: body.message ?? `${product.name} disponível em estoque novamente. Reserva por 24h.`,
    })
  } catch (err) { next(err) }
})

// DELETE /api/admin/waitlist/:id — remove inscrição (cliente cancelou via support)
adminWaitlistRouter.delete('/:id', async (req, res, next) => {
  try {
    const sub = await prisma.waitlistSubscription.findUnique({ where: { id: req.params.id } })
    if (!sub) throw errors.notFound('Inscrição não encontrada')
    await prisma.waitlistSubscription.delete({ where: { id: sub.id } })
    return ok(res, { deleted: true })
  } catch (err) { next(err) }
})
