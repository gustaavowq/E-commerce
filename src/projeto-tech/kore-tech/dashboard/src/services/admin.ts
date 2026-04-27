// Wrapper de TODOS endpoints /api/admin/* do Kore Tech.
// Centraliza pra cache key não vazar pro componente. Mantém em sync com Backend.

import { get, patch, post, del, apiList } from '@/lib/api'
import type {
  DashboardSummary,
  DashboardOverview, RevenuePoint, TicketMedioRow, FunnelBuilderResponse,
  PersonaConversionRow, ParcelamentoRow, MargemResponse,
  DoaResponse, DevolucaoResponse, EstoqueAlertaResponse,
  WaitlistTopRow, TempoBtoResponse, AdminAlert, AlertRunResponse,
  AdminProductListItem, AdminProductDetail, BuildType, ProductCategory,
  AdminOrderListItem, AdminOrderDetail, OrderStatus,
  AdminCustomerListItem, AdminCustomerDetail,
  Persona, PersonaInput,
  AdminBuild, AdminBuildDetail, AdminBuildInput,
  Coupon, CouponInput, CouponMetrics,
  WaitlistEntry, WaitlistByProduct,
  AdminReview, ReviewStatus,
  StoreSettings, Brand,
} from './types'

// ----- Dashboard (compartilhado com Data Analyst) -----
export const adminDashboard = {
  summary:  (period = 30) => get<DashboardSummary>('/admin/dashboard/summary', { query: { period } }),

  // Endpoints do Data Analyst (Sprint 1)
  overview:        (period = 30)              => get<DashboardOverview>('/admin/dashboard/overview',         { query: { period } }),
  revenue:         (period = 30)              => get<RevenuePoint[]>('/admin/dashboard/revenue',             { query: { period } }),
  ticketMedio:     (period = 30, groupBy: 'buildType' | 'hardwareCategory' | 'category' = 'buildType') =>
    get<TicketMedioRow[]>('/admin/dashboard/ticket-medio',                                                    { query: { period, groupBy } }),
  funnelBuilder:   (from?: string, to?: string) =>
    get<FunnelBuilderResponse>('/admin/dashboard/funnel-builder',                                             { query: { from, to } }),
  conversaoPersona:(period = 30)              => get<PersonaConversionRow[]>('/admin/dashboard/conversao-persona', { query: { period } }),
  parcelamento:    (period = 30)              => get<ParcelamentoRow[]>('/admin/dashboard/parcelamento',      { query: { period } }),
  margem:          (period = 30, groupBy = 'hardwareCategory') =>
    get<MargemResponse>('/admin/dashboard/margem',                                                            { query: { period, groupBy } }),
  doa:             (period = 30)              => get<DoaResponse>('/admin/dashboard/doa',                     { query: { period } }),
  devolucao:       (period = 30)              => get<DevolucaoResponse>('/admin/dashboard/devolucao-7dias',   { query: { period } }),
  estoqueAlerta:   (threshold = 5)            => get<EstoqueAlertaResponse>('/admin/dashboard/estoque-alerta', { query: { threshold } }),
  waitlistTop:     (limit = 10)               => get<WaitlistTopRow[]>('/admin/dashboard/waitlist-top',       { query: { limit } }),
  tempoBto:        (period = 30)              => get<TempoBtoResponse>('/admin/dashboard/tempo-bto',          { query: { period } }),
}

// ----- Alerts (auto-alertas operacionais) -----
export const adminAlerts = {
  list: ()  => get<AdminAlert[]>('/admin/alerts'),
  run:  ()  => post<AlertRunResponse>('/admin/alerts/run', {}),
}

// ----- Products -----
export type AdminProductFilters = {
  page?:      number
  limit?:     number
  search?:    string
  status?:    'active' | 'inactive' | ''
  featured?:  'yes'    | 'no'       | ''
  buildType?: BuildType | ''
  category?:  ProductCategory | ''
  persona?:   string | ''
  brand?:     string | ''
  stock?:     'zero' | 'low' | 'ok' | ''
}

export const adminProducts = {
  list: (q: AdminProductFilters = {}) =>
    apiList<AdminProductListItem[]>('/admin/products', { query: q }),
  get:    (id: string) => get<AdminProductDetail>(`/admin/products/${id}`),
  create: (body: Partial<AdminProductDetail>) =>
    post<{ id: string; slug: string; name: string }>('/admin/products', body),
  update: (id: string, body: Partial<AdminProductDetail>) =>
    patch<AdminProductDetail>(`/admin/products/${id}`, body),
  remove: (id: string) => del<null>(`/admin/products/${id}`),
  bulk: (ids: string[], action: 'activate' | 'deactivate' | 'feature' | 'unfeature' | 'delete') =>
    patch<{ updated: number }>('/admin/products/bulk', { ids, action }),

  // Imagens
  addImage: (productId: string, body: { url: string; alt?: string; sortOrder?: number; isPrimary?: boolean }) =>
    post<{ id: string; url: string; alt: string | null; sortOrder: number; isPrimary: boolean }>(
      `/admin/products/${productId}/images`, body,
    ),
  removeImage: (productId: string, imageId: string) =>
    del<null>(`/admin/products/${productId}/images/${imageId}`),
  reorderImages: (productId: string, order: string[]) =>
    patch<{ updated: number }>(`/admin/products/${productId}/images/reorder`, { order }),
  setPrimaryImage: (productId: string, imageId: string) =>
    patch<{ id: string }>(`/admin/products/${productId}/images/${imageId}/primary`, {}),
}

// ----- Upload (Cloudinary) -----
export const adminUpload = {
  image: (source: string, folder?: string, tags?: string[]) =>
    post<{ url: string; publicId: string; width: number; height: number; bytes: number; format: string; thumbnail: string }>(
      '/admin/upload',
      { source, folder, tags },
    ),
}

// ----- Orders -----
export const adminOrders = {
  list: (q: { page?: number; limit?: number; status?: OrderStatus; search?: string; from?: string; to?: string } = {}) =>
    apiList<AdminOrderListItem[]>('/admin/orders', { query: q }),
  get:    (id: string) => get<AdminOrderDetail>(`/admin/orders/${id}`),
  update: (id: string, body: { status?: OrderStatus; trackingCode?: string | null; notes?: string }) =>
    patch<AdminOrderDetail>(`/admin/orders/${id}`, body),
  markPaid:    (id: string)                    => post<AdminOrderDetail>(`/admin/orders/${id}/mark-paid`, {}),
  markShipped: (id: string, trackingCode: string) => post<AdminOrderDetail>(`/admin/orders/${id}/ship`, { trackingCode }),
  cancel:      (id: string, reason: string)    => post<AdminOrderDetail>(`/admin/orders/${id}/cancel`, { reason }),
  refund:      (id: string, amount: number, reason: string) =>
    post<AdminOrderDetail>(`/admin/orders/${id}/refund`, { amount, reason }),
}

// ----- Customers -----
export const adminCustomers = {
  list: (q: { page?: number; limit?: number; search?: string } = {}) =>
    apiList<AdminCustomerListItem[]>('/admin/customers', { query: q }),
  get: (id: string) => get<AdminCustomerDetail>(`/admin/customers/${id}`),
}

// ----- Personas -----
export const adminPersonas = {
  list:   ()                       => get<Persona[]>('/admin/personas'),
  get:    (slug: string)           => get<Persona>(`/admin/personas/${slug}`),
  create: (body: PersonaInput)     => post<Persona>('/admin/personas', body),
  update: (slug: string, body: Partial<PersonaInput>) =>
    patch<Persona>(`/admin/personas/${slug}`, body),
  remove: (slug: string)           => del<null>(`/admin/personas/${slug}`),
}

// ----- Builds (PCs montados pra venda — curados pelo admin) -----
export const adminBuilds = {
  list: (q: { page?: number; limit?: number; search?: string; persona?: string; published?: 'yes' | 'no' } = {}) =>
    apiList<AdminBuild[]>('/admin/builds', { query: q }),
  get:    (id: string)             => get<AdminBuildDetail>(`/admin/builds/${id}`),
  create: (body: AdminBuildInput)  => post<AdminBuildDetail>('/admin/builds', body),
  update: (id: string, body: Partial<AdminBuildInput>) =>
    patch<AdminBuildDetail>(`/admin/builds/${id}`, body),
  publish:   (id: string)          => post<AdminBuildDetail>(`/admin/builds/${id}/publish`, {}),
  unpublish: (id: string)          => post<AdminBuildDetail>(`/admin/builds/${id}/unpublish`, {}),
  remove:    (id: string)          => del<null>(`/admin/builds/${id}`),
  // Reusa o builder público pra checar compatibilidade no painel
  checkCompatibility: (parts: Array<{ productId: string; quantity?: number }>) =>
    post<{
      ok: boolean
      errors:   Array<{ rule: string; message: string }>
      warnings: Array<{ rule: string; message: string; suggestion?: string }>
      totalWattage: number
      recommendedPsuW: number
    }>('/builder/check-compatibility', { parts }),
}

// ----- Coupons -----
export const adminCoupons = {
  list:      ()                       => apiList<Coupon[]>('/admin/coupons'),
  get:       (id: string)             => get<Coupon>(`/admin/coupons/${id}`),
  create:    (body: CouponInput)      => post<Coupon>('/admin/coupons', body),
  update:    (id: string, body: Partial<CouponInput>) => patch<Coupon>(`/admin/coupons/${id}`, body),
  remove:    (id: string)             => del<null>(`/admin/coupons/${id}`),
  metrics:   (id: string)             => get<CouponMetrics>(`/admin/coupons/${id}/metrics`),
  duplicate: (id: string)             => post<Coupon>(`/admin/coupons/${id}/duplicate`, {}),
}

// ----- Waitlist -----
export const adminWaitlist = {
  byProduct:    (limit = 10)          => get<WaitlistByProduct[]>('/admin/waitlist/by-product', { query: { limit } }),
  list:         (productId: string)   => get<WaitlistEntry[]>(`/admin/waitlist/product/${productId}`),
  notifyAll:    (productId: string)   => post<{ notified: number }>(`/admin/waitlist/product/${productId}/notify`, {}),
  notifyOne:    (entryId: string)     => post<WaitlistEntry>(`/admin/waitlist/${entryId}/notify`, {}),
  remove:       (entryId: string)     => del<null>(`/admin/waitlist/${entryId}`),
}

// ----- Reviews -----
export const adminReviews = {
  list:    (q: { status?: ReviewStatus; page?: number; limit?: number } = {}) =>
    apiList<AdminReview[]>('/admin/reviews', { query: q }),
  approve: (id: string)             => patch<AdminReview>(`/admin/reviews/${id}`, { status: 'APPROVED' }),
  reject:  (id: string)             => patch<AdminReview>(`/admin/reviews/${id}`, { status: 'REJECTED' }),
  remove:  (id: string)             => del<null>(`/admin/reviews/${id}`),
}

// ----- Settings -----
export const adminSettings = {
  get:    ()                         => get<StoreSettings>('/admin/settings'),
  update: (body: Partial<StoreSettings>) => patch<StoreSettings>('/admin/settings', body),
}

// ----- Refs (pra forms) -----
export const refs = {
  brands: () => get<Brand[]>('/brands'),
}
