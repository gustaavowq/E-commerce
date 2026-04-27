// Contratos com Backend Kore Tech. Espelho do schema Prisma + endpoints documentados no brief.
// Quando Backend mudar nome de campo, ajustar aqui.

// =====================================================================
// Catalogo
// =====================================================================

export type BuildType = 'pc_pronto' | 'componente' | 'periferico' | 'monitor'
export type ProductCategory =
  | 'cpu'
  | 'gpu'
  | 'mobo'
  | 'ram'
  | 'storage'
  | 'psu'
  | 'case'
  | 'cooler'
  | 'pc_full'
  | 'monitor'
  | 'mouse'
  | 'teclado'
  | 'headset'
  | 'cadeira'
  | 'outro'

export type Brand = {
  id: string
  slug: string
  name: string
  logoUrl: string | null
  productCount?: number
}

export type Category = {
  id: string
  slug: string
  name: string
  parentId: string | null
  productCount?: number
}

export type ProductImage = {
  id?: string
  url: string
  alt: string | null
  sortOrder?: number
  isPrimary?: boolean
}

export type ProductVariation = {
  id: string
  sku: string
  label: string // "Tier Ouro", "16GB", ...
  stock: number
  priceOverride: number | null
}

// Specs JSON (chaves variam por categoria — ver PESQUISA-NICHO.md secao 4.2)
export type ProductSpecs = Record<string, string | number | boolean | null | string[]>

// Compatibility hints pro builder.
export type ProductCompatibility = {
  socket?: string // 'AM5' | 'LGA1700' | 'LGA1851' (CPU + mobo + cooler)
  chipset?: string
  formFactor?: string // 'ATX' | 'mATX' | 'ITX' | 'E-ATX' (mobo + case)
  ramType?: 'DDR4' | 'DDR5'
  ramSpeedMhz?: number
  ramSlots?: number
  tdpW?: number
  recommendedPsuW?: number
  lengthMm?: number
  heightMm?: number
  widthMm?: number
  gpuMaxLengthMm?: number // case
  coolerMaxHeightMm?: number // case
  pcie?: string // 'PCIe 5.0'
  storageType?: 'NVMe Gen4' | 'NVMe Gen5' | 'SATA SSD' | 'HDD'
  capacityGb?: number
  wattage?: number // psu
  certification?: string // 80+ Bronze/Gold/Platinum
  modular?: 'full' | 'semi' | 'none'
}

// FPS estimado por jogo / cenario (somente PC montado)
export type BenchmarkFps = Record<string, number>

export type ProductListItem = {
  id: string
  slug: string
  name: string
  buildType: BuildType
  category: ProductCategory
  persona: string | null
  brand: Pick<Brand, 'id' | 'slug' | 'name'>
  basePrice: number
  comparePrice: number | null
  isFeatured: boolean
  primaryImage: { url: string; alt: string | null } | null
  totalStock: number
  benchmarkFps: BenchmarkFps | null
  specsHighlights?: string[] // strings curtas pra card ("Ryzen 7 7700X · 8c/16t")
}

export type ProductDetail = {
  id: string
  slug: string
  name: string
  description: string
  buildType: BuildType
  category: ProductCategory
  persona: string | null
  basePrice: number
  comparePrice: number | null
  isActive: boolean
  isFeatured: boolean
  metaTitle: string | null
  metaDesc: string | null
  brand: Brand
  warrantyMonths: number
  weightGrams: number | null
  dimensionsMm: { length?: number; width?: number; height?: number } | null
  specs: ProductSpecs
  compatibility: ProductCompatibility | null
  benchmarkFps: BenchmarkFps | null
  // Pra PC montado: lista de pecas que compoem o build
  buildParts: Array<{ category: ProductCategory; productId: string; productName: string; productSlug: string }> | null
  variations: ProductVariation[]
  images: ProductImage[]
  totalStock: number
}

export type ProductListQuery = {
  q?: string
  category?: ProductCategory | string
  buildType?: BuildType | string
  brand?: string
  persona?: string
  minPrice?: number
  maxPrice?: number
  inStock?: boolean
  sort?: 'newest' | 'price_asc' | 'price_desc' | 'featured' | 'name_asc'
  page?: number
  limit?: number
}

// =====================================================================
// Personas (landing por uso)
// =====================================================================

export type Persona = {
  id: string
  slug: string
  name: string
  shortDescription: string
  description: string
  targetGames: string[]
  targetFps: Record<string, number> // { valorant: 240, fortnite: 165 }
  heroImageUrl: string | null
  startingPrice: number | null
  buildCount: number
  metaTitle?: string | null
  metaDesc?: string | null
}

// =====================================================================
// Auth + User
// =====================================================================

export type Role = 'CUSTOMER' | 'ADMIN'

export type User = {
  id: string
  email: string
  name: string
  phone?: string | null
  cpf?: string | null
  role: Role
  emailVerifiedAt?: string | null
  createdAt: string
}

export type AuthPayload = {
  user: User
  accessToken?: string
}

// =====================================================================
// Cart + Order
// =====================================================================

export type CartItem = {
  productId: string
  variationId: string
  productSlug: string
  productName: string
  variationLabel: string
  unitPrice: number
  imageUrl: string | null
  quantity: number
  maxStock: number
}

export type ServerCartItem = {
  id: string
  productId: string
  variationId: string
  quantity: number
  unitPrice: number
  subtotal: number
  maxStock: number
  product: {
    id: string
    slug: string
    name: string
    brand: { name: string; slug: string }
    image: { url: string; alt: string | null } | null
  }
  variation: {
    id: string
    sku: string
    label: string
    stock: number
  }
}

export type ServerCart = {
  id: string
  items: ServerCartItem[]
  subtotal: number
  itemCount: number
  updatedAt: string
} | null

export type OrderStatus =
  | 'PENDING_PAYMENT'
  | 'PAID'
  | 'PREPARING'
  | 'SHIPPED'
  | 'DELIVERED'
  | 'CANCELLED'
  | 'REFUNDED'

export type PaymentStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'REFUNDED' | 'CANCELLED' | 'EXPIRED'

export type OrderItem = {
  id: string
  productId: string
  variationId: string
  productName: string
  variationLabel: string
  unitPrice: number
  quantity: number
  subtotal: number
}

export type OrderListItem = {
  id: string
  orderNumber: string
  status: OrderStatus
  total: number
  paymentStatus: PaymentStatus | null
  itemPreview: string[]
  createdAt: string
}

export type Address = {
  id: string
  userId: string
  label: string | null
  recipient: string
  zipcode: string
  street: string
  number: string
  complement: string | null
  district: string
  city: string
  state: string
  country: string
  phone: string | null
  isDefault: boolean
  createdAt: string
}

export type Order = {
  id: string
  orderNumber: string
  status: OrderStatus
  subtotal: number
  shippingCost: number
  discount: number
  total: number
  notes: string | null
  address: Address
  coupon: { code: string; type: string } | null
  items: OrderItem[]
  payment: {
    id: string
    method: 'PIX' | 'CREDIT_CARD' | 'BOLETO'
    status: PaymentStatus
    amount: number
    pixQrCode: string | null
    pixCopyPaste: string | null
    pixExpiresAt: string | null
  } | null
  createdAt: string
  updatedAt: string
}

// =====================================================================
// Builder (PC Builder)
// =====================================================================

export type BuilderPart = {
  category: ProductCategory
  productId: string
}

export type BuilderCheckIssue = {
  level: 'success' | 'warning' | 'danger'
  ruleId: string
  category?: ProductCategory
  message: string
  fixSuggestion?: { productId?: string; description?: string; deltaPrice?: number }
}

export type BuilderCheckResponse = {
  isValid: boolean
  totalWattage: number
  issues: BuilderCheckIssue[]
  // partes resolvidas com nome/preco pra UI
  resolvedParts: Array<{
    category: ProductCategory
    productId: string
    productSlug: string
    productName: string
    price: number
    imageUrl: string | null
    consumptionW: number
  }>
}

export type PsuRecommendation = {
  totalWattageDemand: number
  recommendedWattage: number
  product: {
    id: string
    slug: string
    name: string
    price: number
    imageUrl: string | null
    wattage: number
    certification: string | null
  } | null
}

export type SavedBuild = {
  id: string
  ownerId: string | null
  name: string | null
  parts: Record<ProductCategory, string | string[] | null>
  totalPrice: number
  isPublic: boolean
  shareSlug: string | null
  createdAt: string
}

// =====================================================================
// Waitlist
// =====================================================================

export type WaitlistSubscription = {
  id: string
  productId: string
  email: string
  notifiedAt: string | null
  createdAt: string
}

// =====================================================================
// Settings
// =====================================================================

export type StoreSettings = {
  storeName: string
  storeTagline: string | null
  logoUrl: string | null
  whatsappNumber: string | null
  whatsappMessage: string | null
  instagramHandle: string | null
  email: string | null
  pixDiscountPercent: number
  shippingFlatRate: number
  freeShippingMinValue: number | null
}

// =====================================================================
// Wishlist
// =====================================================================

export type WishlistEntry = {
  id: string
  addedAt: string
  product: {
    id: string
    slug: string
    name: string
    basePrice: number
    comparePrice: number | null
    primaryImage: { url: string; alt: string | null } | null
  }
}
