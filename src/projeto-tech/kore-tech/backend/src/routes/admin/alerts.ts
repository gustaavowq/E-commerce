// =============================================================================
// Kore Tech — Endpoint de execução manual de alertas (Data Analyst, Agente 04)
//
// Em produção, cron diário chama POST /api/admin/alerts/run às 09:00 BRT.
// Em dev/QA, admin chama manualmente pelo painel ou via curl.
//
// Resposta inclui a lista de alertas detectados pra exibir no painel.
// =============================================================================

import { Router } from 'express'
import { ok } from '../../lib/api-response.js'
import { runAllAlertChecks, dispatchAlerts } from '../../services/alerts.js'

export const adminAlertsRouter: Router = Router()

// POST /api/admin/alerts/run — dispara checagem agora
adminAlertsRouter.post('/run', async (_req, res, next) => {
  try {
    const alerts = await runAllAlertChecks()
    const { logged, emailed } = await dispatchAlerts(alerts)
    return ok(res, {
      detected: alerts.length,
      logged,
      emailed,
      alerts,
    })
  } catch (err) {
    next(err)
  }
})

// GET /api/admin/alerts — apenas roda os checks e devolve (sem dispatch).
// Painel pode usar pra exibir banner de alertas em tempo (quase) real.
adminAlertsRouter.get('/', async (_req, res, next) => {
  try {
    const alerts = await runAllAlertChecks()
    return ok(res, alerts)
  } catch (err) {
    next(err)
  }
})
