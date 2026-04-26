// Router master do /api/admin/*. Aplica requireAuth + requireRole('ADMIN')
// em tudo que pendurar aqui — sem chance de vazar endpoint admin sem auth.
import { Router } from 'express'
import { requireAuth, requireRole } from '../../middleware/auth.js'
import { adminProductsRouter } from './products.js'
import { adminDashboardRouter } from './dashboard.js'
import { adminOrdersRouter } from './orders.js'
import { adminCustomersRouter } from './customers.js'
import { adminSettingsRouter } from './settings.js'
import { adminCouponsRouter } from './coupons.js'
import { adminReviewsRouter } from './reviews.js'

export const adminRouter: Router = Router()

// Toda rota daqui pra baixo exige JWT válido + role ADMIN
adminRouter.use(requireAuth, requireRole('ADMIN'))

adminRouter.use('/products',  adminProductsRouter)
adminRouter.use('/orders',    adminOrdersRouter)
adminRouter.use('/customers', adminCustomersRouter)
adminRouter.use('/settings',  adminSettingsRouter)
adminRouter.use('/coupons',   adminCouponsRouter)
adminRouter.use('/reviews',   adminReviewsRouter)
adminRouter.use('/dashboard', adminDashboardRouter)
