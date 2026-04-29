// Webhook do MercadoPago. Idempotente via webhookEventId UNIQUE no Payment.
//
// MP envia POST com body { action, type, data: { id } } pra notificar mudança
// de status. Buscamos o pagamento via API, atualizamos status e order.
//
// SEGURANÇA: além de re-consultar o MP (não confia no body), validamos
// assinatura HMAC-SHA256 vinda nos headers `x-signature` / `x-request-id`
// (formato MP: "ts=...,v1=hash_hex"). Hash é
//   HMAC_SHA256(secret, `id:<data.id>;request-id:<x-request-id>;ts:<ts>;`).
// Se MERCADOPAGO_WEBHOOK_SECRET vazio, aceita com warning (compat dev).
import { Router } from 'express'
import crypto from 'node:crypto'
import { prisma } from '../lib/prisma.js'
import { ok } from '../lib/api-response.js'
import { getPaymentStatus } from '../lib/mercadopago.js'
import { env } from '../config/env.js'

export const webhooksRouter: Router = Router()

// Parseia "ts=1696...,v1=abc123" em { ts, v1 }
function parseMpSignature(header: string | undefined): { ts?: string; v1?: string } {
  if (!header) return {}
  const out: Record<string, string> = {}
  for (const part of header.split(',')) {
    const [k, v] = part.split('=').map(s => s?.trim())
    if (k && v) out[k] = v
  }
  return { ts: out.ts, v1: out.v1 }
}

// Valida assinatura HMAC do webhook MP. Retorna true se OK ou se secret não
// estiver configurado (dev). Retorna false se secret existe e assinatura
// não bate (em prod, webhook deve ser rejeitado com 401).
function verifyMpSignature(opts: {
  secret:    string | undefined
  signature: string | undefined
  requestId: string | undefined
  resourceId: string | null
}): { valid: boolean; reason?: string } {
  if (!opts.secret) {
    console.warn('[webhook/mp] MERCADOPAGO_WEBHOOK_SECRET vazio — assinatura NÃO verificada (ok em dev, NÃO usar em prod)')
    return { valid: true }
  }
  const { ts, v1 } = parseMpSignature(opts.signature)
  if (!ts || !v1 || !opts.requestId || !opts.resourceId) {
    return { valid: false, reason: 'headers/payload incompletos' }
  }
  const manifest = `id:${opts.resourceId};request-id:${opts.requestId};ts:${ts};`
  const expected = crypto.createHmac('sha256', opts.secret).update(manifest).digest('hex')
  // timingSafeEqual exige buffers do mesmo tamanho — se hex inválido, falha
  let ok = false
  try {
    const a = Buffer.from(expected, 'hex')
    const b = Buffer.from(v1, 'hex')
    ok = a.length === b.length && crypto.timingSafeEqual(a, b)
  } catch {
    ok = false
  }
  return ok ? { valid: true } : { valid: false, reason: 'hash não bate' }
}

webhooksRouter.post('/mercadopago', async (req, res, next) => {
  try {
    const requestId = req.header('x-request-id') ?? req.header('x-idempotency-key') ?? undefined
    const eventId = requestId ?? crypto.randomUUID()
    const body = req.body as { type?: string; action?: string; data?: { id?: string | number } }
    const gatewayId = body?.data?.id ? String(body.data.id) : null

    // Validação HMAC ANTES de qualquer trabalho (DB write, query externa).
    const sigCheck = verifyMpSignature({
      secret:     env.MERCADOPAGO_WEBHOOK_SECRET,
      signature:  req.header('x-signature'),
      requestId,
      resourceId: gatewayId,
    })
    if (!sigCheck.valid) {
      console.warn('[webhook/mp] assinatura inválida:', sigCheck.reason)
      return res.status(401).json({
        success: false,
        error: { code: 'INVALID_SIGNATURE', message: 'Assinatura do webhook inválida' },
      })
    }

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
