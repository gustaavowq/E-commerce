// Carrinho. Logado → vinculado ao userId. Visitante → vinculado ao sessionId via cookie.
import { Router } from 'express'
import { prisma } from '../lib/prisma.js'
import { ok, errors } from '../lib/api-response.js'
import { getOrCreateGuestSession } from '../lib/session.js'
import { cartItemAddSchema, cartItemUpdateSchema, cartUpdateSchema } from '../validators/cart.js'

export const cartRouter: Router = Router()

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
              buildType: true, hardwareCategory: true,
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
        buildType:        it.product.buildType,
        hardwareCategory: it.product.hardwareCategory,
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
    source:    cart.source,
    items,
    subtotal,
    itemCount,
    updatedAt: cart.updatedAt,
  }
}

cartRouter.get('/', async (req, res, next) => {
  try {
    const cart = await findOrCreateActiveCart(scopeFor(req, res))
    const hydrated = await loadCart(cart.id)
    return ok(res, hydrated)
  } catch (err) { next(err) }
})

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
    // Sprint 2 — propagar source quando vier do builder. Não sobrescreve
    // source existente com null (ex: usuário abre PDP e clica "comprar" — não
    // queremos descaracterizar um cart que já era builder).
    const sourcePatch = body.source ? { source: body.source } : {}
    await prisma.cart.update({
      where: { id: cart.id },
      data:  { updatedAt: new Date(), ...sourcePatch },
    })

    const hydrated = await loadCart(cart.id)
    return ok(res, hydrated)
  } catch (err) { next(err) }
})

// Sprint 2 — PUT /api/cart pra setar/atualizar source (frontend marca origem
// builder explicitamente após concluir build no /montar). Whitelisted via Zod.
cartRouter.put('/', async (req, res, next) => {
  try {
    const body = cartUpdateSchema.parse(req.body)
    const cart = await findOrCreateActiveCart(scopeFor(req, res))
    await prisma.cart.update({
      where: { id: cart.id },
      data:  { source: body.source ?? null, updatedAt: new Date() },
    })
    const hydrated = await loadCart(cart.id)
    return ok(res, hydrated)
  } catch (err) { next(err) }
})

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
    await resetSourceIfEmpty(item.cartId)

    const hydrated = await loadCart(item.cartId)
    return ok(res, hydrated)
  } catch (err) { next(err) }
})

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
    await resetSourceIfEmpty(item.cartId)

    const hydrated = await loadCart(item.cartId)
    return ok(res, hydrated)
  } catch (err) { next(err) }
})

cartRouter.delete('/', async (req, res, next) => {
  try {
    const cart = await findOrCreateActiveCart(scopeFor(req, res))
    await prisma.cartItem.deleteMany({ where: { cartId: cart.id } })
    // Sprint 2 — anti-fraude BUILDER10: limpar carrinho zera origem
    await prisma.cart.update({ where: { id: cart.id }, data: { source: null } })
    const hydrated = await loadCart(cart.id)
    return ok(res, hydrated)
  } catch (err) { next(err) }
})

// Anti-fraude BUILDER10 — quando o último item é removido, limpamos
// `cart.source` pra evitar que cliente esvazie carrinho do builder e adicione
// produtos manualmente preservando o cupom. Ver projetos/.../growth/CUPONS.md.
async function resetSourceIfEmpty(cartId: string): Promise<void> {
  const remaining = await prisma.cartItem.count({ where: { cartId } })
  if (remaining === 0) {
    await prisma.cart.update({ where: { id: cartId }, data: { source: null } })
  }
}
