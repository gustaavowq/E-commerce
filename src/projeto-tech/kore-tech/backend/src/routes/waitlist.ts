// Lista de espera por produto sem estoque (anti-paper-launch).
//
// POST /api/waitlist/subscribe — público (e-mail + productId)
//   - Idempotente: re-subscribe mesmo email no mesmo produto = 200 sem duplicar
//   - Rate limited (anti-spam)
//
// Notify rota é admin (em routes/admin/waitlist.ts), não aqui.
import { Router } from 'express'
import rateLimit from 'express-rate-limit'
import { prisma } from '../lib/prisma.js'
import { ok, errors } from '../lib/api-response.js'
import { waitlistSubscribeSchema } from '../validators/waitlist.js'
import { extractUser } from '../middleware/auth.js'
import { env } from '../config/env.js'

export const waitlistRouter: Router = Router()

const subscribeLimiter = rateLimit({
  windowMs: 60 * 60_000,
  limit: env.WAITLIST_RATE_LIMIT_PER_HOUR,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: {
    success: false,
    error: { code: 'RATE_LIMITED', message: 'Muitas inscrições, espere um pouco' },
  },
})

waitlistRouter.post('/subscribe', subscribeLimiter, extractUser, async (req, res, next) => {
  try {
    const body = waitlistSubscribeSchema.parse(req.body)

    const product = await prisma.product.findUnique({
      where: { id: body.productId },
      select: { id: true, name: true, isActive: true },
    })
    if (!product || !product.isActive) throw errors.notFound('Produto não encontrado')

    // Idempotente por (productId, email). Se já existe e foi notificado,
    // recria a inscrição (cliente quer ser avisado da próxima reposição).
    const existing = await prisma.waitlistSubscription.findUnique({
      where: { productId_email: { productId: body.productId, email: body.email } },
    })

    if (existing && existing.notifiedAt === null) {
      // Já tá na lista, sem notificação ainda. Nada a fazer.
      return ok(res, {
        message: 'Você já tá na lista de espera deste produto. Avisamos quando voltar.',
        subscriptionId: existing.id,
      })
    }

    if (existing && existing.notifiedAt !== null) {
      // Re-inscrição após notificação anterior. Reseta o notifiedAt.
      const updated = await prisma.waitlistSubscription.update({
        where: { id: existing.id },
        data:  { notifiedAt: null, note: body.note ?? existing.note, userId: req.user?.id ?? existing.userId },
      })
      return ok(res, {
        message: 'Você tá de volta na lista de espera. Avisamos na próxima reposição.',
        subscriptionId: updated.id,
      })
    }

    const sub = await prisma.waitlistSubscription.create({
      data: {
        productId: body.productId,
        email:     body.email,
        userId:    req.user?.id ?? null,
        note:      body.note,
      },
    })

    return ok(res, {
      message: 'Pronto! Te avisamos por email quando o produto voltar ao estoque.',
      subscriptionId: sub.id,
    })
  } catch (err) { next(err) }
})

// GET /api/waitlist/me — lista inscrições do user logado (pra mostrar em /account)
waitlistRouter.get('/me', extractUser, async (req, res, next) => {
  try {
    if (!req.user) throw errors.unauthorized()

    const subs = await prisma.waitlistSubscription.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' },
      include: {
        product: {
          select: {
            id: true, slug: true, name: true,
            basePrice: true,
            images: { where: { isPrimary: true }, take: 1, select: { url: true } },
            variations: { select: { stock: true } },
          },
        },
      },
    })
    return ok(res, subs.map(s => ({
      id:         s.id,
      email:      s.email,
      note:       s.note,
      notifiedAt: s.notifiedAt,
      createdAt:  s.createdAt,
      product: {
        id:         s.product.id,
        slug:       s.product.slug,
        name:       s.product.name,
        basePrice:  Number(s.product.basePrice),
        primaryImage: s.product.images[0] ?? null,
        totalStock: s.product.variations.reduce((acc, v) => acc + v.stock, 0),
      },
    })))
  } catch (err) { next(err) }
})

// DELETE /api/waitlist/:id — cancela inscrição (próprio user OU email match)
waitlistRouter.delete('/:id', extractUser, async (req, res, next) => {
  try {
    const id = String(req.params.id ?? '')
    const sub = await prisma.waitlistSubscription.findUnique({
      where: { id },
    })
    if (!sub) throw errors.notFound('Inscrição não encontrada')

    // Owner check: ou é o user logado, ou cliente passa email no body pra desinscrever
    // (futuro: link tokenizado no email "cancelar inscrição").
    const ownsByUser  = req.user?.id && sub.userId === req.user.id
    const emailParam  = String(req.query.email ?? '').toLowerCase().trim()
    const ownsByEmail = emailParam && emailParam === sub.email.toLowerCase()
    if (!ownsByUser && !ownsByEmail) throw errors.forbidden()

    await prisma.waitlistSubscription.delete({ where: { id: sub.id } })
    return ok(res, { message: 'Inscrição cancelada' })
  } catch (err) { next(err) }
})
