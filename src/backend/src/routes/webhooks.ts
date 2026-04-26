// Webhook do MercadoPago. Idempotente via webhookEventId UNIQUE no Payment.
//
// MP envia POST com body { action, type, data: { id } } pra notificar mudança
// de status. Buscamos o pagamento via API, atualizamos status e order.
//
// IMPORTANTE: webhook é PÚBLICO (sem auth), então TODA validação de origem é
// via consulta direta ao MP (não confia no body). Se passar a usar assinatura
// HMAC do MP, validar aqui antes de qualquer DB write.
import { Router } from 'express'
import crypto from 'node:crypto'
import { prisma } from '../lib/prisma.js'
import { ok } from '../lib/api-response.js'
import { getPaymentStatus } from '../lib/mercadopago.js'

export const webhooksRouter: Router = Router()

webhooksRouter.post('/mercadopago', async (req, res, next) => {
  try {
    const eventId = req.header('x-request-id') ?? req.header('x-idempotency-key') ?? crypto.randomUUID()
    const body = req.body as { type?: string; action?: string; data?: { id?: string | number } }
    const gatewayId = body?.data?.id ? String(body.data.id) : null

    // Sempre 200 — MP entende como ack. Erros de processamento ficam só no log.
    if (!gatewayId) {
      console.warn('[webhook/mp] payload sem data.id', body)
      return ok(res, { received: true })
    }

    // Idempotência: se já processamos este eventId, sai.
    const already = await prisma.payment.findFirst({ where: { webhookEventId: eventId } })
    if (already) {
      return ok(res, { received: true, idempotent: true })
    }

    // Busca pagamento no nosso banco (foi criado quando geramos o Pix)
    const payment = await prisma.payment.findFirst({ where: { gatewayId } })
    if (!payment) {
      console.warn('[webhook/mp] payment não encontrado', gatewayId)
      return ok(res, { received: true, unknown: true })
    }

    // Confirma status direto no MP (não confia no body)
    const status = await getPaymentStatus(gatewayId)
    const now = new Date()

    await prisma.$transaction(async (tx) => {
      await tx.payment.update({
        where: { id: payment.id },
        data: {
          status,
          webhookEventId: eventId,
          approvedAt: status === 'APPROVED' ? now : payment.approvedAt,
          rejectedAt: status === 'REJECTED' ? now : payment.rejectedAt,
        },
      })

      if (status === 'APPROVED') {
        await tx.order.update({
          where: { id: payment.orderId },
          data:  { status: 'PAID' },
        })
      } else if (status === 'REJECTED' || status === 'EXPIRED') {
        // Devolve estoque do pedido se ainda não foi devolvido
        const order = await tx.order.findUnique({
          where: { id: payment.orderId },
          include: { items: true },
        })
        if (order && order.status === 'PENDING_PAYMENT') {
          for (const it of order.items) {
            await tx.productVariation.update({
              where: { id: it.variationId },
              data:  { stock: { increment: it.quantity } },
            })
          }
          await tx.order.update({
            where: { id: order.id },
            data:  { status: 'CANCELLED', cancelledAt: now },
          })
        }
      }
    })

    return ok(res, { received: true, status })
  } catch (err) { next(err) }
})
