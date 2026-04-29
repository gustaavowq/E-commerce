// Calcula frete. Por enquanto: flat rate vinda do .env (SHIPPING_FLAT_RATE)
// + valida CEP via ViaCEP pra rejeitar CEP inválido e devolver cidade/UF.
import { Router } from 'express'
import { ok, errors } from '../lib/api-response.js'
import { env } from '../config/env.js'
import { shippingCalcSchema } from '../validators/shipping.js'

export const shippingRouter: Router = Router()

type ViaCepResponse = {
  cep:        string
  logradouro: string
  bairro:     string
  localidade: string  // cidade
  uf:         string
  erro?:      boolean
}

async function lookupCep(zipcode: string): Promise<ViaCepResponse> {
  const clean = zipcode.replace(/\D/g, '')
  const r = await fetch(`https://viacep.com.br/ws/${clean}/json/`)
  if (!r.ok) throw errors.badRequest('Não foi possível consultar o CEP agora, tenta de novo')
  const data = (await r.json()) as ViaCepResponse
  if (data.erro) throw errors.badRequest('CEP não existe')
  return data
}

shippingRouter.post('/calculate', async (req, res, next) => {
  try {
    const body = shippingCalcSchema.parse(req.body)
    const cep = await lookupCep(body.zipcode)

    return ok(res, {
      zipcode: cep.cep,
      city:    cep.localidade,
      state:   cep.uf,
      district: cep.bairro,
      street:  cep.logradouro,
      shipping: [{
        carrier:        'Miami Express',
        service:        'Frete fixo',
        cost:           env.SHIPPING_FLAT_RATE,
        estimatedDays:  cep.uf === 'SP' ? 3 : 7,
      }],
    })
  } catch (err) { next(err) }
})
