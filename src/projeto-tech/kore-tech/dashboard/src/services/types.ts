// Espelho dos contratos do admin API do Kore Tech. Mantém em sync com Backend.
// Schema delta vs Miami: Product extras (specs, compatibility, benchmarkFps,
// persona, buildType), PCBuild, Persona, WaitlistSubscription.

export type Role = 'CUSTOMER' | 'ADMIN'

export type AdminUser = {
  id:    string
  email: string
  name:  string
  role:  Role
}

export type AuthPayload = {
  user: AdminUser
  accessToken?: string  // não vem se for cookie httpOnly puro
}

// Métrica com comparativo de período — usada nos KPIs do dashboard
export type MetricCompare = {
  value:    number
  previous: number
  change:   number | null
}

// ----- Dashboard summary (compartilhado com Data Analyst) -----
export type DashboardSummary = {
  period:           number
  revenue:          MetricCompare
  paidOrders:       MetricCompare
  averageTicket:    MetricCompare
  ordersTotal:      MetricCompare
  ordersToday:      number
  pendingActions:   number   // PENDING_PAYMENT + PREPARING (badge sidebar)
  conversionRate:   number | null
  abandonmentRate:  number | null
  cancellationRate: MetricCompare
  activeProducts:   number
  lowStockSkus:     number
  cartsInPeriod:    number
  alerts: {
    stuckInPreparing:    number
    lowStock:            number
    highCancellation:    boolean
    waitlistStale:       number   // produtos com >14d na waitlist sem reposição
  }
}

// ===== Data Analyst (Sprint 1) =====
// Tipos espelhando exatamente o que o /api/admin/dashboard/* devolve.
// Backend pode validar e ajustar se descobrir mismatch — manter sincronizado.

export type DashboardOverview = {
  period:         number
  revenue:        MetricCompare
  paidOrders:     MetricCompare
  averageTicket:  MetricCompare
  conversionRate: { value: number | null; previous: number | null; change: number | null }
  ordersTotal:    MetricCompare
  ordersToday:    number
  cartsInPeriod:  number
  lowStockSkus:   number
  activeProducts: number
}

export type RevenuePoint = {
  date:   string  // 'YYYY-MM-DD'
  total:  number
  orders: number
}

export type TicketMedioRow = {
  bucket:    string  // 'componente' | 'pc_pronto' | 'periferico' | 'monitor' | category name
  revenue:   number
  orders:    number
  avgTicket: number
}

export type FunnelBuilderStage = {
  stage:          string
  order:          number
  count:          number
  conversionRate: number  // % vs etapa 1
}

export type FunnelBuilderResponse = {
  from:        string
  to:          string
  stages:      FunnelBuilderStage[]
  isStub?:     boolean
  stubReason?: string
}

export type PersonaConversionRow = {
  slug:           string
  name:           string
  iconEmoji:      string | null
  heroImage:      string | null
  visits:         number | null  // null se BuilderEvent não disparado ainda
  orders:         number
  revenue:        number
  conversionRate: number | null
}

export type ParcelamentoRow = {
  bucket:     string  // 'PIX' | '1x cartão' | '2-3x' | '4-6x' | '7-12x' | 'Outros'
  payments:   number
  amount:     number
  pctOfTotal: number
}

export type MargemRow = {
  bucket:      string
  revenue:     number
  itemsSold:   number
  cost:        number | null
  marginAbs:   number | null
  marginPct:   number | null
  missingCost: boolean
}

export type MargemResponse = {
  groupBy:     string
  rows:        MargemRow[]
  isStub?:     boolean
  stubReason?: string
}

export type DoaRow = {
  bucket:     string
  delivered:  number
  doaCount:   number
  doaPct:     number
}

export type DoaResponse = {
  period:      number
  rows:        DoaRow[]
  isStub?:     boolean
  stubReason?: string
}

export type DevolucaoRow = {
  bucket:        string
  delivered:     number
  returnCount:   number
  returnPct:     number
}

export type DevolucaoResponse = {
  period:      number
  rows:        DevolucaoRow[]
  isStub?:     boolean
  stubReason?: string
}

export type EstoqueAlertaRow = {
  variationId:   string
  sku:           string
  stock:         number
  size:          string
  color:         string
  product: {
    id:               string
    name:             string
    slug:             string
    hardwareCategory: string
    buildType:        string | null
  }
  dailyVelocity: number
  daysUntilOut:  number | null
}

export type EstoqueAlertaResponse = {
  threshold: number
  rows:      EstoqueAlertaRow[]
}

export type WaitlistTopRow = {
  product: {
    id:               string
    slug:             string
    name:             string
    hardwareCategory: string
    buildType:        string | null
  }
  waitingCount:        number
  firstSubscriptionAt: string
  lastSubscriptionAt:  string
  daysWaiting:         number
}

export type TempoBtoResponse = {
  period:    number
  totalPcs:  number
  avgDays:   number | null
  p50Days:   number | null
  p90Days:   number | null
  p95Days:   number | null
  slaTarget: number  // dias
}

export type AdminAlertSeverity = 'red' | 'yellow'
export type AdminAlertKind =
  | 'low_stock_critical'
  | 'waitlist_stagnant'
  | 'ticket_falling'
  | 'doa_epidemic'
  | 'bto_delayed'
  | 'return_above_normal'

export type AdminAlert = {
  kind:       AdminAlertKind
  severity:   AdminAlertSeverity
  title:      string
  message:    string
  context:    Record<string, unknown>
  detectedAt: string
}

export type AlertRunResponse = {
  detected: number
  logged:   number
  emailed:  number
  alerts:   AdminAlert[]
}

// ----- Hardware / Kore Tech specifics -----
export type BuildType = 'pc_pronto' | 'componente' | 'periferico' | 'monitor'

export type ProductCategory =
  | 'cpu' | 'gpu' | 'mobo' | 'ram' | 'storage' | 'psu' | 'case' | 'cooler'
  | 'pc_full' | 'monitor' | 'mouse' | 'teclado' | 'headset' | 'cadeira'
  | 'fan' | 'cabo' | 'outro'

// Specs estruturadas — chave-valor aberto, frontend renderiza como tabela
export type SpecsMap = Record<string, string | number | boolean | null>

// Compatibilidade — campos que o builder usa pra cruzar peças
export type CompatibilityFields = {
  socket?:        string  // 'AM5', 'LGA1700', 'LGA1851'
  chipset?:       string  // 'B650', 'X670E', 'Z790'
  tdpW?:          number
  ramType?:       'DDR4' | 'DDR5'
  ramSpeedMhz?:   number
  ramCapacityGb?: number
  ramSlots?:      number
  formFactor?:    'ATX' | 'mATX' | 'ITX' | 'E-ATX'
  pcieGen?:       3 | 4 | 5
  gpuLengthMm?:   number
  gpuMaxLengthMm?: number
  coolerHeightMm?: number
  coolerMaxHeightMm?: number
  psuWattage?:    number
  psuRecommendedW?: number
  psuCertification?: '80+ White' | '80+ Bronze' | '80+ Gold' | '80+ Platinum' | '80+ Titanium'
  psuModular?:    'Sim' | 'Não' | 'Semi'
  storageType?:   'NVMe Gen4' | 'NVMe Gen5' | 'SATA SSD' | 'HDD'
  storageCapacityGb?: number
  [key: string]: unknown
}

// FPS estimado por jogo — chave livre tipo 'valorant_1080p_high'
export type BenchmarkFpsMap = Record<string, number>

export type AdminProductImage = {
  id:        string
  url:       string
  alt:       string | null
  sortOrder: number
  isPrimary: boolean
}

export type AdminProductVariation = {
  id:           string
  sku:          string
  label:        string  // "Bronze", "Prata", "Ouro" ou cor/tamanho conforme nicho
  stock:        number
  priceOverride: number | null
  isActive:     boolean
}

export type AdminProductListItem = {
  id:         string
  slug:       string
  name:       string
  basePrice:  number
  buildType:  BuildType | null
  category:   ProductCategory | null
  persona:    string | null
  brand:      { id: string; name: string; slug: string } | null
  isActive:   boolean
  isFeatured: boolean
  totalStock: number
  primaryImage: string | null
  updatedAt:  string
}

export type AdminProductDetail = {
  id:           string
  slug:         string
  name:         string
  description:  string
  basePrice:    number
  comparePrice: number | null
  buildType:    BuildType | null
  category:     ProductCategory | null
  persona:      string | null
  specs:        SpecsMap
  compatibility: CompatibilityFields | null
  benchmarkFps: BenchmarkFpsMap | null
  weightGrams:  number | null
  dimensionsMm: { length: number; width: number; height: number } | null
  warrantyMonths: number
  isActive:     boolean
  isFeatured:   boolean
  metaTitle:    string | null
  metaDesc:     string | null
  brand:        { id: string; name: string; slug: string } | null
  variations:   AdminProductVariation[]
  images:       AdminProductImage[]
  createdAt:    string
  updatedAt:    string
}

// ----- Orders -----
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

export type OrderTimelineEvent = {
  at:    string
  kind:  'created' | 'paid' | 'preparing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded' | 'note'
  label: string
  by?:   string  // admin que fez a ação, se aplicável
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
  } | null
  coupon: { code: string; type: string; value: number | null } | null
  items: Array<{
    id: string; productId: string; variationId: string | null;
    productName: string; variationLabel: string | null;
    unitPrice: number; quantity: number; subtotal: number;
    image: string | null;
  }>
  payments: Array<{
    id: string; method: string; status: PaymentStatus;
    amount: number; gatewayId: string | null;
    approvedAt: string | null; rejectedAt: string | null;
    pixExpiresAt: string | null; createdAt: string;
  }>
  timeline?: OrderTimelineEvent[]
}

// ----- Customers -----
export type AdminCustomerListItem = {
  id: string
  email: string
  name: string
  phone: string | null
  emailVerifiedAt: string | null
  createdAt: string
  orderCount: number
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

// ----- Personas (CRUD) -----
export type Persona = {
  id:          string
  slug:        string
  name:        string
  description: string
  targetGames: string[]              // ['Valorant', 'CS2']
  targetFps:   Record<string, number>  // { 'Valorant 1080p high': 240 }
  heroImage:   string | null
  productCount?: number              // PCs montados associados
  createdAt:   string
  updatedAt:   string
}

export type PersonaInput = {
  slug:        string
  name:        string
  description: string
  targetGames: string[]
  targetFps:   Record<string, number>
  heroImage?:  string | null
}

// ----- Builds (PCs montados pelo admin pra venda) -----
export type AdminBuild = {
  id:           string
  productId:    string  // o Product associado (buildType=pc_pronto)
  name:         string
  personaSlug:  string | null
  totalPrice:   number
  partCount:    number
  isPublished:  boolean
  primaryImage: string | null
  benchmarkFps: BenchmarkFpsMap | null
  createdAt:    string
  updatedAt:    string
}

export type AdminBuildDetail = AdminBuild & {
  parts: Array<{
    productId: string
    name:      string
    category:  ProductCategory
    price:     number
    quantity:  number
    image:     string | null
  }>
  description: string
  totalWattage: number
  recommendedPsuW: number | null
}

export type AdminBuildInput = {
  name:         string
  personaSlug:  string | null
  parts:        Array<{ productId: string; quantity: number }>
  description:  string
  benchmarkFps: BenchmarkFpsMap
  isPublished?: boolean
}

// ----- Coupons -----
export type CouponType = 'PERCENT' | 'FIXED' | 'FREE_SHIPPING'

export type Coupon = {
  id:           string
  code:         string
  type:         CouponType
  value:        number | null
  minOrderValue: number | null
  maxUses:      number | null
  usedCount:    number
  perUserLimit: number
  validFrom:    string
  validUntil:   string | null
  isActive:     boolean
  createdAt:    string
}

export type CouponInput = {
  code:         string
  type:         CouponType
  value?:       number | null
  minOrderValue?: number | null
  maxUses?:     number | null
  perUserLimit?: number
  validFrom?:   string
  validUntil?:  string | null
  isActive?:    boolean
}

export type CouponMetrics = {
  couponId:         string
  code:             string
  usedCount:        number
  revenueGenerated: number
  totalDiscount:    number
  avgTicket:        number
}

// ----- Waitlist -----
export type WaitlistEntry = {
  id:          string
  productId:   string
  productName: string
  productSlug: string
  email:       string
  userId:      string | null
  notifiedAt:  string | null
  createdAt:   string
}

export type WaitlistByProduct = {
  productId:    string
  productName:  string
  productSlug:  string
  productImage: string | null
  totalActive:  number
  oldestAt:     string
  inStock:      boolean
}

// ----- Reviews -----
export type ReviewStatus = 'PENDING' | 'APPROVED' | 'REJECTED'

export type AdminReview = {
  id:          string
  productId:   string
  productName: string
  productSlug: string
  userId:      string
  userName:    string
  userEmail:   string
  rating:      number
  title:       string | null
  body:        string
  status:      ReviewStatus
  createdAt:   string
}

// ----- Settings -----
export type StoreSettings = {
  storeName:        string
  storeTagline:     string | null
  logoUrl:          string | null
  faviconUrl:       string | null
  whatsappNumber:   string | null
  whatsappMessage:  string | null
  instagramHandle:  string | null
  email:            string | null
  phone:            string | null
  cnpj:             string | null
  legalName:        string | null
  address:          string | null
  privacyPolicy:    string | null
  termsOfUse:       string | null
  exchangePolicy:   string | null
  shippingPolicy:   string | null
  warrantyPolicy:   string | null
  aboutUs:          string | null
  pixDiscountPercent:    number
  shippingFlatRate:      number
  freeShippingMinValue:  number | null
}

// ----- Refs -----
export type Brand    = { id: string; slug: string; name: string }
