// Router master admin. Aplica requireAuth + requireRole pra todas sub-rotas.
import { Router } from 'express'
import { requireAuth, requireRole } from '../../middlewares/auth.js'
import { adminImoveisRouter } from './imoveis.js'
import { adminReservasRouter } from './reservas.js'
import { adminClientesRouter } from './clientes.js'
import { adminDashboardRouter } from './dashboard.js'
import { adminLeadsRouter } from './leads.js'

export const adminRouter: Router = Router()

// Tudo que entra em /api/admin precisa ser ADMIN ou ANALYST.
// As sub-rotas restringem CRUD pra ADMIN-only quando necessário.
adminRouter.use(requireAuth, requireRole(['ADMIN', 'ANALYST']))

adminRouter.use('/imoveis',   adminImoveisRouter)
adminRouter.use('/reservas',  adminReservasRouter)
adminRouter.use('/clientes',  adminClientesRouter)
adminRouter.use('/dashboard', adminDashboardRouter)
adminRouter.use('/leads',     adminLeadsRouter)
