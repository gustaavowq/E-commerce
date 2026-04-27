// =============================================================================
// POST /api/contact — formulário de contato da loja.
//
// Sprint 2 (Backend): MVP só loga via pino estruturado. Resend (email pro
// time ops) entra em Sprint 3 quando a key estiver no env.
//
// Rate limit dedicado: 5/min por IP. Limita spam sem bloquear usuário real
// que volta a tentar.
// =============================================================================
import { Router } from 'express'
import rateLimit from 'express-rate-limit'
import { ok } from '../lib/api-response.js'
import { contactSchema } from '../validators/contact.js'

export const contactRouter: Router = Router()

const contactLimiter = rateLimit({
  windowMs: 60_000,
  limit: 5,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: {
    success: false,
    error: { code: 'RATE_LIMITED', message: 'Muitas mensagens, espera um minuto e tenta de novo.' },
  },
})

contactRouter.post('/', contactLimiter, async (req, res, next) => {
  try {
    const contact = contactSchema.parse(req.body)

    // Log estruturado (pino). Em Sprint 3, Resend manda pro time ops.
    req.log.info({ contact }, 'contact form received')

    return ok(res, {
      message: 'Recebemos sua mensagem. Em até 1 dia útil a gente responde.',
    })
  } catch (err) { next(err) }
})
