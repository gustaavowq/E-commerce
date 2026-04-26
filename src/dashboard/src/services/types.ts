// Espelho dos contratos do admin API. Mantém em sync com docs/api-contracts.md.

export type Role = 'CUSTOMER' | 'ADMIN'

export type AdminUser = {
  id:    string
  email: string
  name:  string
  role:  Role
}

export type AuthPayload = {
  user: AdminUser
  accessToken: string
}

// Métrica com comparativo de período (acionável: "+15% vs 30d anteriores")
export type MetricCompare = {
  value:    number
  previous: number
  change:   number | null  // null = sem base de comparação (período anterior zerado)
}

export type DashboardSummary = {
  period:         number
  revenue:        MetricCompare
  paidOrders:     MetricCompare
  averageTicket:  MetricCompare
  ordersTotal:    MetricCompare
  ordersToday:    number
  conversionRate:  number | null   // % carrinhos com item → pagos
  abandonmentRate: number | null
  cancellationRate: MetricCompare
  activeProducts:  number
  lowStockSkus:    number
  cartsInPeriod:   number
  alerts: {
    stuckInPreparing:    number
    lowStock:            number
    highCancellation:    boolean
  }
}

export type RevenuePoint   = { date: string; total: number; orders: number }
export type OrdersByStatus = { status: string; count: number }
export type TopProduct = {
  product: {
    id: string; slug: string; name: string;
    brand:    { name: string };
    category: { name: string };
  } | null
  quantity: number
  revenue:  number
}
export type CategoryRevenue = { category: string; quantity: number; revenue: number }
export type FunnelStage     = { stage: string; value: number; rate: number }

// Products (admin)
export type AdminProductListItem = {
  id: string
  slug: string
  name: string
  basePrice: number
  isActive: boolean
  isFeatured: boolean
  brand:    { name: string; slug: string }
  category: { name: string; slug: string }
  variationCount: number
  totalStock: number
  updatedAt: string
}

export type AdminVariation = {
  id:           string
  sku:          string
  size:         string
  color:        string
  colorHex:     string | null
  stock:        number
  priceOverride: number | null
  isActive:     boolean
}

export type AdminProductImage = {
  id:        string
  url:       string
  alt:       string | null
  sortOrder: number
  isPrimary: boolean
}

export type AdminProductDetail = {
  id:           string
  slug:         string
  name:         string
  description:  string
  basePrice:    number
  comparePrice: number | null
  isActive:     boolean
  isFeatured:   boolean
  metaTitle:    string | null
  metaDesc:     string | null
  brand:        { id: string; name: string; slug: string }
  category:     { id: string; name: string; slug: string }
  variations:   AdminVariation[]
  images:       AdminProductImage[]
  measureTable: Record<string, unknown> | null
  createdAt:    string
  updatedAt:    string
}

// Orders (admin)
export type OrderStatus =
  | 'PENDING_PAYMENT' | 'PAID' | 'PREPARING' | 'SHIPPED'
  | 'DELIVERED' | 'CANCELLED' | 'REFUNDED'

export type PaymentStatus =
  | 'PENDING' | 'APPROVED' | 'REJECTED' | 'REFUNDED' | 'CANCELLED' | 'EXPIRED'

export type AdminOrderListItem = {
  id:           string
  orderNumber:  string
  status:       OrderStatus
  total:        number
  itemCount:    number
  paymentStatus: PaymentStatus | null
  paymentMethod: 'PIX' | 'CREDIT_CARD' | 'BOLETO' | null
  trackingCode: string | null
  customer: { id: string; email: string; name: string }
  createdAt:    string
}

export type AdminOrderDetail = {
  id:           string
  orderNumber:  string
  status:       OrderStatus
  subtotal:     number
  shippingCost: number
  discount:     number
  total:        number
  notes:        string | null
  trackingCode: string | null
  shippedAt:    string | null
  deliveredAt:  string | null
  cancelledAt:  string | null
  createdAt:    string
  updatedAt:    string
  customer: {
    id: string; email: string; name: string;
    phone: string | null; cpf: string | null; createdAt: string;
  }
  address: {
    recipient: string; zipcode: string; street: string; number: string;
    complement: string | null; district: string; city: string; state: string;
    phone: string | null;
  }
  coupon: { code: string; type: string; value: number | null } | null
  items: Array<{
    id: string; productId: string; variationId: string;
    productName: string; variationLabel: string;
    unitPrice: number; quantity: number; subtotal: number;
  }>
  payments: Array<{
    id: string; method: string; status: PaymentStatus;
    amount: number; gatewayId: string | null;
    approvedAt: string | null; rejectedAt: string | null;
    pixExpiresAt: string | null; createdAt: string;
  }>
}

// Customers (admin)
export type AdminCustomerListItem = {
  id: string
  email: string
  name: string
  phone: string | null
  emailVerifiedAt: string | null
  createdAt: string
  orderCount: number
  addressCount: number
  totalSpent: number
}

export type AdminCustomerDetail = {
  id: string
  email: string
  name: string
  phone: string | null
  cpf: string | null
  role: Role
  emailVerifiedAt: string | null
  createdAt: string
  addresses: Array<{
    id: string; label: string | null; recipient: string;
    zipcode: string; street: string; number: string;
    complement: string | null; district: string; city: string; state: string;
    isDefault: boolean;
  }>
  orders: Array<{
    id: string; orderNumber: string; status: OrderStatus;
    total: number; createdAt: string; paymentStatus: PaymentStatus | null;
  }>
}

// Brands & Categories (refs pra forms)
export type Brand    = { id: string; slug: string; name: string }
export type Category = { id: string; slug: string; name: string }
