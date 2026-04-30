// Cliente MercadoPago — cria preferência de pagamento pra sinal de reserva.
// Em dev sem token, retorna mock pra permitir testar fluxo end-to-end.
//
// Estratégia: usamos `Preference` (não Payment direto) pra que o cliente
// finalize no checkout MP (Pix/cartão/boleto). O MP redireciona pro back_urls
// e nos notifica via webhook.
import { MercadoPagoConfig, Preference, Payment } from 'mercadopago'
import crypto from 'node:crypto'
import { env, isProd } from '../config/env.js'
import { logger } from '../lib/logger.js'

export type CreatePreferenceInput = {
  reservaId:    string
  imovelTitulo: string
  valor:        number   // valor do sinal em BRL
  payerEmail:   string
  payerName:    string
  payerPhone?:  string
}

export type CreatePreferenceResult = {
  preferenceId: string
  initPoint:    string  // URL pra cliente abrir o checkout
  sandbox:      boolean // true se mock
}

export type PaymentStatus = 'PENDENTE' | 'APROVADO' | 'REJEITADO' | 'CANCELADO' | 'REEMBOLSADO'

function isTokenAusente(token: string | undefined): boolean {
  return !token || /x{4,}/i.test(token) || token.startsWith('TEST-') === false && token.length < 20
}

function isTokenPlaceholder(token: string | undefined): boolean {
  return !token || /x{4,}/i.test(token)
}

function mockPreference(input: CreatePreferenceInput): CreatePreferenceResult {
  const fakeId = `mock-${crypto.randomUUID()}`
  const initPoint = `${env.PUBLIC_WEB_URL}/reservas/${input.reservaId}/pagar?mock=1`
  return { preferenceId: fakeId, initPoint, sandbox: true }
}

export async function createReservaPreference(input: CreatePreferenceInput): Promise<CreatePreferenceResult> {
  const token = env.MERCADOPAGO_ACCESS_TOKEN
  if (isTokenPlaceholder(token)) {
    if (isProd) throw new Error('MERCADOPAGO_ACCESS_TOKEN ausente ou placeholder em produção')
    logger.warn('[mercadopago] sem token real — usando mock preference')
    return mockPreference(input)
  }

  const client = new MercadoPagoConfig({ accessToken: token! })
  const preference = new Preference(client)

  const apiBase = env.PUBLIC_API_URL ?? `http://localhost:${env.PORT}`
  const webBase = env.PUBLIC_WEB_URL

  const result = await preference.create({
    body: {
      items: [
        {
          id: input.reservaId,
          title: `Sinal de reserva — ${input.imovelTitulo}`,
          quantity: 1,
          unit_price: Number(input.valor.toFixed(2)),
          currency_id: 'BRL',
        },
      ],
      payer: {
        name: input.payerName.split(' ')[0],
        surname: input.payerName.split(' ').slice(1).join(' ') || input.payerName,
        email: input.payerEmail,
        ...(input.payerPhone ? { phone: { number: input.payerPhone } } : {}),
      },
      external_reference: input.reservaId,
      notification_url: `${apiBase}/api/webhooks/mercadopago`,
      back_urls: {
        success: `${webBase}/reservas/${input.reservaId}?status=success`,
        pending: `${webBase}/reservas/${input.reservaId}?status=pending`,
        failure: `${webBase}/reservas/${input.reservaId}?status=failure`,
      },
      auto_return: 'approved',
      // Pix preferred. Não usamos `payment_methods.excluded_payment_types` aqui
      // pra deixar usuário escolher entre Pix/Cartão/Boleto.
      statement_descriptor: 'MARQUESA',
      metadata: { reservaId: input.reservaId },
    },
  })

  if (!result.id || !result.init_point) {
    throw new Error('MercadoPago não retornou preferenceId/initPoint')
  }

  return {
    preferenceId: String(result.id),
    initPoint:    result.init_point,
    sandbox:      false,
  }
}

export async function getPaymentStatus(paymentId: string): Promise<PaymentStatus> {
  const token = env.MERCADOPAGO_ACCESS_TOKEN
  if (isTokenPlaceholder(token) || paymentId.startsWith('mock-')) return 'PENDENTE'

  const client = new MercadoPagoConfig({ accessToken: token! })
  const payment = new Payment(client)
  const result = await payment.get({ id: paymentId })
  return mapStatus(result.status, result.status_detail)
}

export async function getPaymentMetadata(paymentId: string): Promise<{
  status: PaymentStatus
  externalReference?: string
  amount?: number
}> {
  const token = env.MERCADOPAGO_ACCESS_TOKEN
  if (isTokenPlaceholder(token) || paymentId.startsWith('mock-')) {
    return { status: 'PENDENTE' }
  }
  const client = new MercadoPagoConfig({ accessToken: token! })
  const payment = new Payment(client)
  const result = await payment.get({ id: paymentId })
  return {
    status: mapStatus(result.status, result.status_detail),
    externalReference: result.external_reference ?? undefined,
    amount: typeof result.transaction_amount === 'number' ? result.transaction_amount : undefined,
  }
}

function mapStatus(mp: string | undefined | null, detail?: string | null): PaymentStatus {
  switch (mp) {
    case 'approved':   return 'APROVADO'
    case 'rejected':   return 'REJEITADO'
    case 'cancelled':  return 'CANCELADO'
    case 'refunded':   return 'REEMBOLSADO'
    case 'charged_back': return 'REEMBOLSADO'
    case 'in_process':
    case 'in_mediation':
    case 'pending':
    default:
      // status_detail "expired" pode vir junto de pending
      if (detail === 'expired') return 'CANCELADO'
      return 'PENDENTE'
  }
}
