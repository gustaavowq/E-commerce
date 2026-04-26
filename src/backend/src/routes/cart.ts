// Carrinho. Logado → vinculado ao userId. Visitante → vinculado ao sessionId via cookie.
// Sempre devolve o cart completo, hidratado (com produto/variação/preço atual).
import { Router } from 'express'
import { prisma } from '../lib/prisma.js'
import { ok, errors } from '../lib/api-response.js'
import { getOrCreateGuestSession } from '../lib/session.js'
import { cartItemAddSchema, cartItemUpdateSchema } from '../validators/cart.js'

export const cartRouter: Router = Router()

// -----------------------------------------------------------------------------
// Helpers
// -----------------------------------------------------------------------------
type CartScope = { userId: string } | { sessionId: string }

function scopeFor(req: Parameters<typeof getOrCreateGuestSession>[0], res: Parameters<typeof getOrCreateGuestSession>[1]): CartScope {
  if (req.user) return { userId: req.user.id }
  return { sessionId: getOrCreateGuestSession(req, res) }
}

async function findOrCreateActiveCart(scope: CartScope) {
  const where = 'userId' in scope
    ? { userId: scope.userId, status: 'active' }
    : { sessionId: scope.sessionId, status: 'active' }

  const existing = await prisma.cart.findFirst({ where, orderBy: { updatedAt: 'desc' } })
  if (existing) return existing
  return prisma.cart.create({ data: { ...scope, status: 'active' } })
}

async function loadCart(cartId: string) {
  const cart = await prisma.cart.findUnique({
    where: { id: cartId },
    include: {
      items: {
        include: {
          variation: { select: { id: true, sku: true, size: true, color: true, colorHex: true, stock: true, priceOverride: true } },
          product: {
            select: {
              id: true, slug: true, name: true, basePrice: true,
              brand: { select: { name: true, slug: true } },
              images: { where: { isPrimary: true }, take: 1, select: { url: true, alt: true } },
            },
          },
        },
        orderBy: { createdAt: 'asc' },
      },
    },
  })
  if (!cart) return null

  const items = cart.items.map(it => {
    const unitPrice = Number(it.variation.priceOverride ?? it.product.basePrice)
    return {
      id:           it.id,
      productId:    it.productId,
      variationId:  it.variationId,
      quantity:     it.quantity,
      unitPrice,
      subtotal:     +(unitPrice * it.quantity).toFixed(2),
      maxStock:     it.variation.stock,
      product: {
        id:    it.product.id,
        slug:  it.product.slug,
        name:  it.product.name,
        brand: it.product.brand,
        image: it.product.images[0] ?? null,
      },
      variation: {
        id:    it.variation.id,
        sku:   it.variation.sku,
        size:  it.variation.size,
        color: it.variation.color,
        colorHex: it.variation.colorHex,
        stock: it.variation.stock,
      },
    }
  })

  const subtotal = +items.reduce((acc, it) => acc + it.subtotal, 0).toFixed(2)
  const itemCount = items.reduce((acc, it) => acc + it.quantity, 0)

  return {
    id:        cart.id,
    items,
    subtotal,
    itemCount,
    updatedAt: cart.updatedAt,
  }
}

// -----------------------------------------------------------------------------
// GET /api/cart — devolve o cart ativo (cria se não existir)
// -----------------------------------------------------------------------------
cartRouter.get('/', async (req, res, next) => {
  try {
    const cart = await findOrCreateActiveCart(scopeFor(req, res))
    const hydrated = await loadCart(cart.id)
    return ok(res, hydrated)
  } catch (err) { next(err) }
})

// -----------------------------------------------------------------------------
// POST /api/cart/items — adiciona ou incrementa item
// -----------------------------------------------------------------------------
cartRouter.post('/items', async (req, res, next) => {
  try {
    const body = cartItemAddSchema.parse(req.body)

    const variation = await prisma.productVariation.findUnique({
      where: { id: body.variationId },
      include: { product: { select: { id: true, isActive: true } } },
    })
    if (!variation || !variation.product.isActive) throw errors.notFound('Variação não disponível')
    if (variation.stock < body.quantity) throw errors.unprocessable(`Estoque insuficiente (restam ${variation.stock})`)

    const cart = await findOrCreateActiveCart(scopeFor(req, res))

    // Upsert por (cartId, variationId) — incrementa se já existe
    const existing = await prisma.cartItem.findUnique({
      where: { cartId_variationId: { cartId: cart.id, variationId: variation.id } },
    })

    const targetQty = (existing?.quantity ?? 0) + body.quantity
    if (targetQty > variation.stock) throw errors.unprocessable(`Estoque insuficiente (restam ${variation.stock})`)

    if (existing) {
      await prisma.cartItem.update({
        where: { id: existing.id },
        data:  { quantity: targetQty },
      })
    } else {
      await prisma.cartItem.create({
        data: {
          cartId:      cart.id,
          productId:   variation.product.id,
          variationId: variation.id,
          quantity:    body.quantity,
        },
      })
    }
    await prisma.cart.update({ where: { id: cart.id }, data: { updatedAt: new Date() } })

    const hydrated = await loadCart(cart.id)
    return ok(res, hydrated)
  } catch (err) { next(err) }
})

// -----------------------------------------------------------------------------
// PATCH /api/cart/items/:itemId — atualiza quantidade (0 = remove)
// -----------------------------------------------------------------------------
cartRouter.patch('/items/:itemId', async (req, res, next) => {
  try {
    const body = cartItemUpdateSchema.parse(req.body)
    const item = await prisma.cartItem.findUnique({
      where: { id: req.params.itemId },
      include: { variation: { select: { stock: true } }, cart: true },
    })
    if (!item) throw errors.notFound('Item não encontrado')

    const ownsCart = req.user
      ? item.cart.userId === req.user.id
      : item.cart.sessionId === req.cookies?.guest_sid
    if (!ownsCart) throw errors.forbidden()

    if (body.quantity === 0) {
      await prisma.cartItem.delete({ where: { id: item.id } })
    } else {
      if (body.quantity > item.variation.stock) {
        throw errors.unprocessable(`Estoque insuficiente (restam ${item.variation.stock})`)
      }
      await prisma.cartItem.update({ where: { id: item.id }, data: { quantity: body.quantity } })
    }
    await prisma.cart.update({ where: { id: item.cartId }, data: { updatedAt: new Date() } })

    const hydrated = await loadCart(item.cartId)
    return ok(res, hydrated)
  } catch (err) { next(err) }
})

// -----------------------------------------------------------------------------
// DELETE /api/cart/items/:itemId — remove
// -----------------------------------------------------------------------------
cartRouter.delete('/items/:itemId', async (req, res, next) => {
  try {
    const item = await prisma.cartItem.findUnique({
      where: { id: req.params.itemId },
      include: { cart: true },
    })
    if (!item) throw errors.notFound('Item não encontrado')

    const ownsCart = req.user
      ? item.cart.userId === req.user.id
      : item.cart.sessionId === req.cookies?.guest_sid
    if (!ownsCart) throw errors.forbidden()

    await prisma.cartItem.delete({ where: { id: item.id } })
    await prisma.cart.update({ where: { id: item.cartId }, data: { updatedAt: new Date() } })

    const hydrated = await loadCart(item.cartId)
    return ok(res, hydrated)
  } catch (err) { next(err) }
})

// -----------------------------------------------------------------------------
// DELETE /api/cart — esvazia
// -----------------------------------------------------------------------------
cartRouter.delete('/', async (req, res, next) => {
  try {
    const cart = await findOrCreateActiveCart(scopeFor(req, res))
    await prisma.cartItem.deleteMany({ where: { cartId: cart.id } })
    const hydrated = await loadCart(cart.id)
    return ok(res, hydrated)
  } catch (err) { next(err) }
})
