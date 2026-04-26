// Tipos espelham os contratos em docs/api-contracts.md.
// Quando o Backend mudar, atualize aqui.

export type Brand = {
  id: string
  slug: string
  name: string
  logoUrl: string | null
  productCount: number
}

export type Category = {
  id: string
  slug: string
  name: string
  parentId: string | null
  productCount: number
  children?: Array<Pick<Category, 'id' | 'slug' | 'name'>>
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
  size: string
  color: string
  colorHex: string | null
  stock: number
  priceOverride: number | null
}

export type ProductColor = {
  color: string
  hex: string | null
}

export type ProductListItem = {
  id: string
  slug: string
  name: string
  basePrice: number
  comparePrice: number | null
  isFeatured: boolean
  brand:        Pick<Brand, 'id' | 'slug' | 'name'>
  category:     Pick<Category, 'id' | 'slug' | 'name'>
  primaryImage: { url: string; alt: string | null } | null
  sizes:        string[]
  colors:       ProductColor[]
  totalStock:   number
}

export type ProductDetail = {
  id: string
  slug: string
  name: string
  description: string
  basePrice: number
  comparePrice: number | null
  isActive: boolean
  isFeatured: boolean
  measureTable: Record<string, unknown> | null
  metaTitle: string | null
  metaDesc: string | null
  brand:    Brand
  category: Pick<Category, 'id' | 'slug' | 'name'>
  variations: ProductVariation[]
  images:     Array<ProductImage & { variationColor?: string | null }>
}

// Settings públicos (branding da loja)
export type StoreSettings = {
  storeName: string
  storeTagline: string | null
  logoUrl: string | null
  faviconUrl: string | null
  whatsappNumber: string | null
  whatsappMessage: string | null
  instagramHandle: string | null
  email: string | null
  phone: string | null
  cnpj: string | null
  legalName: string | null
  address: string | null
  privacyPolicy: string | null
  termsOfUse: string | null
  exchangePolicy: string | null
  shippingPolicy: string | null
  aboutUs: string | null
  pixDiscountPercent: number
  shippingFlatRate: number
  freeShippingMinValue: number | null
}

// Reviews
export type Review = {
  id: string
  rating: number
  comment: string | null
  userName: string
  createdAt: string
}

export type ReviewSummary = {
  average: number
  total: number
  distribution: Array<{ star: number; count: number }>
}

export type ReviewsPayload = {
  summary: ReviewSummary
  mine: { id: string; rating: number; comment: string | null; isApproved: boolean } | null
  reviews: Review[]
}

// Wishlist
export type WishlistEntry = {
  id: string
  addedAt: string
  product: {
    id: string; slug: string; name: string;
    basePrice: number; comparePrice: number | null;
    brand: { name: string; slug: string };
    category: { name: string; slug: string };
    primaryImage: { url: string; alt: string | null } | null;
  }
}

export type ProductListQuery = {
  brand?: string
  brands?: string
  category?: string
  categories?: string
  size?: string
  color?: string
  search?: string
  minPrice?: number
  maxPrice?: number
  inStock?: boolean
  sort?: 'newest' | 'oldest' | 'price_asc' | 'price_desc' | 'name_asc' | 'name_desc' | 'featured'
  page?: number
  limit?: number
}

// Auth
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
  accessToken: string
}

// Cart (server)
export type ServerCartItem = {
  id:          string
  productId:   string
  variationId: string
  quantity:    number
  unitPrice:   number
  subtotal:    number
  maxStock:    number
  product: {
    id:    string
    slug:  string
    name:  string
    brand: { name: string; slug: string }
    image: { url: string; alt: string | null } | null
  }
  variation: {
    id:       string
    sku:      string
    size:     string
    color:    string
    colorHex: string | null
    stock:    number
  }
}

export type ServerCart = {
  id:        string
  items:     ServerCartItem[]
  subtotal:  number
  itemCount: number
  updatedAt: string
} | null

// Addresses
export type Address = {
  id:         string
  userId:     string
  label:      string | null
  recipient:  string
  zipcode:    string
  street:     string
  number:     string
  complement: string | null
  district:   string
  city:       string
  state:      string
  country:    string
  phone:      string | null
  isDefault:  boolean
  createdAt:  string
}

export type AddressInput = {
  label?:      string
  recipient:   string
  zipcode:     string
  street:      string
  number:      string
  complement?: string
  district:    string
  city:        string
  state:       string
  phone?:      string
  isDefault?:  boolean
}

// Shipping
export type ShippingQuote = {
  zipcode:  string
  city:     string
  state:    string
  district: string
  street:   string
  shipping: Array<{
    carrier:       string
    service:       string
    cost:          number
    estimatedDays: number
  }>
}

// Orders
export type OrderStatus =
  | 'PENDING_PAYMENT' | 'PAID' | 'PREPARING' | 'SHIPPED'
  | 'DELIVERED' | 'CANCELLED' | 'REFUNDED'

export type PaymentStatus =
  | 'PENDING' | 'APPROVED' | 'REJECTED' | 'REFUNDED' | 'CANCELLED' | 'EXPIRED'

export type OrderPayment = {
  id:           string
  method:       'PIX' | 'CREDIT_CARD' | 'BOLETO'
  status:       PaymentStatus
  amount:       number
  pixQrCode:    string | null
  pixCopyPaste: string | null
  pixExpiresAt: string | null
  approvedAt:   string | null
}

export type OrderItem = {
  id:             string
  productId:      string
  variationId:    string
  productName:    string
  variationLabel: string
  unitPrice:      number
  quantity:       number
  subtotal:       number
}

export type Order = {
  id:           string
  orderNumber:  string
  status:       OrderStatus
  subtotal:     number
  shippingCost: number
  discount:     number
  total:        number
  notes:        string | null
  address:      Address
  coupon:       { code: string; type: string } | null
  items:        OrderItem[]
  payment:      OrderPayment | null
  createdAt:    string
  updatedAt:    string
}

export type OrderListItem = {
  id:           string
  orderNumber:  string
  status:       OrderStatus
  total:        number
  paymentStatus: PaymentStatus | null
  itemPreview:  string[]
  createdAt:    string
}
