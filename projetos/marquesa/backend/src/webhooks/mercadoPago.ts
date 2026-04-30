// Webhook MercadoPago — fonte da verdade pra criar/expirar reservas.
//
// Idempotente via webhookEventId UNIQUE no Reserva.
// Re-consulta MP (não confia no body).
// Valida assinatura HMAC-SHA256 quando MERCADOPAGO_WEBHOOK_SECRET tá configurado.
import { Router } from 'express'
import crypto from 'node:crypto'
import { prisma } from '../lib/prisma.js'
import { ok } from '../lib/api-response.js'
import { getPaymentMetadata } from '../services/mercadoPago.js'
import { env } from '../config/env.js'
import { logger } from '../lib/logger.js'

export const mpWebhookRouter: Router = Router()

function parseMpSignature(header: string | undefined): { ts?: string; v1?: string } {
  if (!header) return {}
  const out: Record<string, string> = {}
  for (const part of header.split(',')) {
    const [k, v] = part.split('=').map(s => s?.trim())
    if (k && v) out[k] = v
  }
  return { ts: out.ts, v1: out.v1 }
}

function verifyMpSignature(opts: {
  secret:     string | undefined
  signature:  string | undefined
  requestId:  string | undefined
  resourceId: string | null
}): { valid: boolean; reason?: string } {
  if (!opts.secret) {
    logger.warn('[webhook/mp] MERCADOPAGO_WEBHOOK_SECRET vazio — assinatura NÃO verificada (ok em dev)')
    return { valid: true }
  }
  const { ts, v1 } = parseMpSignature(opts.signature)
  if (!ts || !v1 || !opts.requestId || !opts.resourceId) {
    return { valid: false, reason: 'headers/payload incompletos' }
  }
  const manifest = `id:${opts.resourceId};request-id:${opts.requestId};ts:${ts};`
  const expected = crypto.createHmac('sha256', opts.secret).update(manifest).digest('hex')
  let okSig = false
  try {
    const a = Buffer.from(expected, 'hex')
    const b = Buffer.from(v1, 'hex')
    okSig = a.length === b.length && crypto.timingSafeEqual(a, b)
  } catch {
    okSig = false
  }
  return okSig ? { valid: true } : { valid: false, reason: 'hash não bate' }
}

mpWebhookRouter.post('/mercadopago', async (req, res, next) => {
  try {
    const requestId = req.header('x-request-id') ?? req.header('x-idempotency-key') ?? undefined
    const eventId = requestId ?? crypto.randomUUID()
    const body = req.body as { type?: string; action?: string; data?: { id?: string | number } }
    const paymentId = body?.data?.id ? String(body.data.id) : null

    const sigCheck = verifyMpSignature({
      secret:     env.MERCADOPAGO_WEBHOOK_SECRET,
      signature:  req.header('x-signature'),
      requestId,
      resourceId: paymentId,
    })
    if (!sigCheck.valid) {
      logger.warn({ reason: sigCheck.reason }, '[webhook/mp] assinatura inválida')
      return res.status(401).json({
        success: false,
        error: { code: 'INVALID_SIGNATURE', message: 'Assinatura do webhook inválida' },
      })
    }

    if (!paymentId) {
      logger.warn({ body }, '[webhook/mp] payload sem data.id')
      return ok(res, { received: true })
    }

    // Só nos interessam notificações de pagamento (não merchant_order)
    if (body?.type && body.type !== 'payment') {
      return ok(res, { received: true, ignored: body.type })
    }

    // Idempotência: se já processamos este eventId, sai
    const already = await prisma.reserva.findFirst({ where: { webhookEventId: eventId } })
    if (already) {
      return ok(res, { received: true, idempotent: true })
    }

    // Busca metadata no MP (status real + external_reference = reservaId)
    const meta = await getPaymentMetadata(paymentId)
    if (!meta.externalReference) {
      logger.warn({ paymentId }, '[webhook/mp] sem external_reference')
      return ok(res, { received: true, unknown: true })
    }

    const reserva = await prisma.reserva.findUnique({
      where: { id: meta.externalReference },
      include: { imovel: { select: { id: true, status: true } } },
    })
    if (!reserva) {
      logger.warn({ reservaId: meta.externalReference }, '[webhook/mp] reserva não encontrada')
      return ok(res, { received: true, unknown: true })
    }

    const now = new Date()
    const expiraEm = new Date(now.getTime() + env.RESERVA_DURACAO_DIAS * 24 * 60 * 60 * 1000)

    await prisma.$transaction(async (tx) => {
      // Atualiza reserva com status do pagamento
      await tx.reserva.update({
        where: { id: reserva.id },
        data: {
          mpPaymentId:     paymentId,
          webhookEventId:  eventId,
          pagamentoStatus: meta.status,
          ...(meta.status === 'APROVADO'
            ? { paidAt: reserva.paidAt ?? now, expiraEm, status: 'ATIVA' }
            : {}),
          ...(meta.status === 'REJEITADO' || meta.status === 'CANCELADO'
            ? { status: 'CANCELADA', canceladaEm: now }
            : {}),
        },
      })

      // Se aprovado, marca imóvel como RESERVADO (se ainda estava DISPONIVEL)
      if (meta.status === 'APROVADO' && reserva.imovel.status === 'DISPONIVEL') {
        await tx.imovel.update({
          where: { id: reserva.imovelId },
          data:  { status: 'RESERVADO' },
        })
      }

      // Se rejeitado/cancelado e imóvel estava reservado por essa reserva, libera
      if ((meta.status === 'REJEITADO' || meta.status === 'CANCELADO')
          && reserva.imovel.status === 'RESERVADO') {
        // Confere que era ESSA reserva que reservou (e não outra ATIVA)
        const outraAtiva = await tx.reserva.findFirst({
          where: { imovelId: reserva.imovelId, status: 'ATIVA', id: { not: reserva.id } },
        })
        if (!outraAtiva) {
          await tx.imovel.update({
            where: { id: reserva.imovelId },
            data:  { status: 'DISPONIVEL' },
          })
        }
      }
    })

    logger.info({ reservaId: reserva.id, status: meta.status }, '[webhook/mp] processed')
    return ok(res, { received: true, status: meta.status })
  } catch (err) {
    next(err)
  }
})
