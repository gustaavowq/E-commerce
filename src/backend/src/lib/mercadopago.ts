// Cliente MercadoPago. Em dev sem token, retorna mock (Pix fake) pra
// permitir testar fluxo end-to-end. Em prod, precisa de MERCADOPAGO_TOKEN.
import { MercadoPagoConfig, Payment } from 'mercadopago'
import crypto from 'node:crypto'
import { env, isProd } from '../config/env.js'

export type PixPaymentResult = {
  gatewayId:    string
  qrCode:       string  // base64 do QR
  copyPaste:    string  // BR Code (string que o cliente cola no app)
  expiresAt:    Date
  status:       'PENDING' | 'APPROVED' | 'REJECTED' | 'EXPIRED'
}

const PIX_EXPIRES_MIN = 30

function mockPix(orderNumber: string, amount: number): PixPaymentResult {
  const expiresAt = new Date(Date.now() + PIX_EXPIRES_MIN * 60_000)
  const fakeKey = `00020126360014BR.GOV.BCB.PIX0114+5511999999999520400005303986540${amount.toFixed(2).length}${amount.toFixed(2)}5802BR5910MIAMI STORE6009SAO PAULO62${orderNumber.length + 4}05${orderNumber}6304ABCD`
  const fakeQr = Buffer.from(`MOCK QR FOR ${orderNumber} R$${amount.toFixed(2)}`).toString('base64')
  return {
    gatewayId: `mock-${crypto.randomUUID()}`,
    qrCode:    fakeQr,
    copyPaste: fakeKey,
    expiresAt,
    status:    'PENDING',
  }
}

export async function createPixPayment(opts: {
  orderNumber:    string
  amount:         number
  payerEmail:     string
  payerName:      string
  payerCpf?:      string
  description:    string
}): Promise<PixPaymentResult> {
  // Token placeholder do .env.example também conta como "ausente"
  const token = env.MERCADOPAGO_TOKEN
  if (!token || /x{4,}/i.test(token)) {
    if (isProd) throw new Error('MERCADOPAGO_TOKEN ausente ou placeholder em produção')
    console.warn('[mercadopago] sem token real — usando mock Pix')
    return mockPix(opts.orderNumber, opts.amount)
  }

  const client = new MercadoPagoConfig({ accessToken: token })
  const payment = new Payment(client)

  const expiresAt = new Date(Date.now() + PIX_EXPIRES_MIN * 60_000)

  const result = await payment.create({
    body: {
      transaction_amount: Number(opts.amount.toFixed(2)),
      description:        opts.description,
      payment_method_id:  'pix',
      external_reference: opts.orderNumber,
      date_of_expiration: expiresAt.toISOString(),
      payer: {
        email:      opts.payerEmail,
        first_name: opts.payerName.split(' ')[0],
        last_name:  opts.payerName.split(' ').slice(1).join(' ') || opts.payerName,
        identification: opts.payerCpf
          ? { type: 'CPF', number: opts.payerCpf.replace(/\D/g, '') }
          : undefined,
      },
    },
  })

  const tx = result.point_of_interaction?.transaction_data
  if (!result.id || !tx?.qr_code_base64 || !tx?.qr_code) {
    throw new Error('MercadoPago não retornou dados do Pix')
  }

  return {
    gatewayId: String(result.id),
    qrCode:    tx.qr_code_base64,
    copyPaste: tx.qr_code,
    expiresAt,
    status:    mapStatus(result.status),
  }
}

export async function getPaymentStatus(gatewayId: string): Promise<PixPaymentResult['status']> {
  const token = env.MERCADOPAGO_TOKEN
  if (!token || /x{4,}/i.test(token) || gatewayId.startsWith('mock-')) return 'PENDING'

  const client = new MercadoPagoConfig({ accessToken: token })
  const payment = new Payment(client)
  const result = await payment.get({ id: gatewayId })
  return mapStatus(result.status)
}

function mapStatus(mp: string | undefined): PixPaymentResult['status'] {
  switch (mp) {
    case 'approved':   return 'APPROVED'
    case 'rejected':
    case 'cancelled':  return 'REJECTED'
    case 'expired':    return 'EXPIRED'
    default:           return 'PENDING'
  }
}
