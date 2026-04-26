// Wrapper de TODOS endpoints /api/admin/*. Centraliza pra cache key não vazar pro componente.
import { get, patch, post, del, apiList } from '@/lib/api'
import type {
  DashboardSummary, RevenuePoint, OrdersByStatus, TopProduct,
  CategoryRevenue, FunnelStage,
  AdminProductListItem, AdminProductDetail, AdminVariation,
  AdminOrderListItem, AdminOrderDetail, OrderStatus,
  AdminCustomerListItem, AdminCustomerDetail,
  Brand, Category,
  StoreSettings, Coupon, CouponInput,
} from './types'

// ----- Dashboard -----
export const adminDashboard = {
  summary:           (period = 30)            => get<DashboardSummary>('/admin/dashboard/summary',           { query: { period } }),
  revenue:           (period = 30)            => get<RevenuePoint[]>('/admin/dashboard/revenue',             { query: { period } }),
  ordersByStatus:    (period = 30)            => get<OrdersByStatus[]>('/admin/dashboard/orders-by-status',  { query: { period } }),
  topProducts:       (period = 30, limit = 5) => get<TopProduct[]>('/admin/dashboard/top-products',          { query: { period, limit } }),
  revenueByCategory: (period = 30)            => get<CategoryRevenue[]>('/admin/dashboard/revenue-by-category', { query: { period } }),
  funnel:            (period = 30)            => get<FunnelStage[]>('/admin/dashboard/funnel',               { query: { period } }),
}

// ----- Products -----
export type AdminProductFilters = {
  page?: number; limit?: number;
  status?: 'active' | 'inactive' | '';
  featured?: 'yes' | 'no' | '';
  brand?: string; category?: string;
  stock?: 'zero' | 'low' | 'ok' | '';
  search?: string;
  onlyInactive?: boolean;  // legacy
}

export const adminProducts = {
  list: (q: AdminProductFilters = {}) =>
    apiList<AdminProductListItem[]>('/admin/products', { query: q }),
  get:    (id: string) => get<AdminProductDetail>(`/admin/products/${id}`),
  update: (id: string, body: Partial<AdminProductDetail>) =>
    patch<{ id: string }>(`/admin/products/${id}`, body),
  updateVariation: (productId: string, variationId: string, body: Partial<AdminVariation>) =>
    patch<AdminVariation>(`/admin/products/${productId}/variations/${variationId}`, body),
  remove: (id: string) => del<null>(`/admin/products/${id}`),
  create: (body: unknown) => post<{ id: string; slug: string; name: string }>('/admin/products', body),
  addImage: (productId: string, body: { url: string; alt?: string; sortOrder?: number; isPrimary?: boolean; variationColor?: string | null }) =>
    post<{ id: string; url: string; alt: string | null; sortOrder: number; isPrimary: boolean; variationColor: string | null }>(`/admin/products/${productId}/images`, body),
  removeImage: (productId: string, imageId: string) =>
    del<null>(`/admin/products/${productId}/images/${imageId}`),
  bulk: (ids: string[], action: 'activate' | 'deactivate' | 'feature' | 'unfeature') =>
    patch<{ updated: number }>('/admin/products/bulk', { ids, action }),
  issues: () => get<{ noImage: AdminProductListItem[]; noDescription: AdminProductListItem[]; outOfStock: AdminProductListItem[] }>('/admin/products/issues'),
}

// ----- Upload -----
export const adminUpload = {
  image: (source: string, folder?: string, tags?: string[]) =>
    post<{ url: string; publicId: string; width: number; height: number; bytes: number; format: string; thumbnail: string }>(
      '/admin/upload',
      { source, folder, tags },
    ),
}

// ----- Orders -----
export const adminOrders = {
  list: (q: { page?: number; limit?: number; status?: OrderStatus; search?: string } = {}) =>
    apiList<AdminOrderListItem[]>('/admin/orders', { query: q }),
  get:    (id: string) => get<AdminOrderDetail>(`/admin/orders/${id}`),
  update: (id: string, body: { status?: OrderStatus; trackingCode?: string | null }) =>
    patch<{ id: string; orderNumber: string; status: OrderStatus; trackingCode: string | null }>(
      `/admin/orders/${id}`, body,
    ),
}

// ----- Customers -----
export const adminCustomers = {
  list: (q: { page?: number; limit?: number; search?: string } = {}) =>
    apiList<AdminCustomerListItem[]>('/admin/customers', { query: q }),
  get: (id: string) => get<AdminCustomerDetail>(`/admin/customers/${id}`),
}

// ----- Refs (pra forms) -----
export const refs = {
  brands:     () => get<Brand[]>('/brands'),
  categories: () => get<Category[]>('/categories'),
}

// ----- Settings -----
export const adminSettings = {
  get:    ()              => get<StoreSettings>('/admin/settings'),
  update: (body: Partial<StoreSettings>) => patch<StoreSettings>('/admin/settings', body),
}

// ----- Coupons -----
export type CouponMetrics = {
  couponId: string; code: string;
  usedCount: number; revenueGenerated: number; totalDiscount: number; avgTicket: number;
}

export const adminCoupons = {
  list:   ()              => apiList<Coupon[]>('/admin/coupons'),
  create: (body: CouponInput) => post<Coupon>('/admin/coupons', body),
  update: (id: string, body: Partial<CouponInput>) => patch<Coupon>(`/admin/coupons/${id}`, body),
  remove: (id: string)    => del<null>(`/admin/coupons/${id}`),
  metrics:   (id: string) => get<CouponMetrics>(`/admin/coupons/${id}/metrics`),
  duplicate: (id: string) => post<Coupon>(`/admin/coupons/${id}/duplicate`, {}),
}

// ----- Top customers (LTV) -----
export type TopCustomer = {
  userId: string; name: string; email: string;
  ordersCount: number; totalSpent: number; lastOrderAt: string | null;
}

export const adminDashboardExt = {
  topCustomers: (limit = 10) => get<TopCustomer[]>('/admin/dashboard/top-customers', { query: { limit } }),
}
