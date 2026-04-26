# Prisma: schema base

> Schema testado no Miami Store. Reusar em qualquer e-commerce — adaptar campos do nicho mas manter relações.

## Modelos canônicos

### User

```prisma
model User {
  id            String   @id @default(cuid())
  email         String   @unique
  passwordHash  String   @map("password_hash")
  name          String
  phone         String?
  cpf           String?
  role          Role     @default(CUSTOMER)
  emailVerifiedAt DateTime? @map("email_verified_at")
  createdAt     DateTime @default(now()) @map("created_at")
  updatedAt     DateTime @updatedAt       @map("updated_at")

  addresses     Address[]
  orders        Order[]
  carts         Cart[]
  reviews       Review[]
  wishlist      WishlistItem[]
  refreshTokens RefreshToken[]
  passwordResetTokens PasswordResetToken[]

  @@map("users")
}

enum Role {
  ADMIN
  CUSTOMER
}
```

### Brand + Category

```prisma
model Brand {
  id        String  @id @default(cuid())
  slug      String  @unique
  name      String
  logoUrl   String? @map("logo_url")
  sortOrder Int     @default(0) @map("sort_order")
  isActive  Boolean @default(true) @map("is_active")

  products Product[]
  @@map("brands")
}

model Category {
  id        String  @id @default(cuid())
  slug      String  @unique
  name      String
  parentId  String? @map("parent_id")
  parent    Category?  @relation("CategoryHierarchy", fields: [parentId], references: [id])
  children  Category[] @relation("CategoryHierarchy")
  sortOrder Int     @default(0) @map("sort_order")
  isActive  Boolean @default(true) @map("is_active")

  products Product[]
  @@map("categories")
}
```

### Product + Variation + Image

```prisma
model Product {
  id            String   @id @default(cuid())
  slug          String   @unique
  name          String
  description   String   @db.Text
  basePrice     Decimal  @db.Decimal(10, 2) @map("base_price")
  comparePrice  Decimal? @db.Decimal(10, 2) @map("compare_price")
  brandId       String   @map("brand_id")
  categoryId    String   @map("category_id")
  isActive      Boolean  @default(true)  @map("is_active")
  isFeatured    Boolean  @default(false) @map("is_featured")
  measureTable  Json?    @map("measure_table")
  metaTitle     String?  @map("meta_title")
  metaDesc      String?  @map("meta_desc")
  tags          String[] @default([])         // pra filtros (#novidade, #queima, etc)

  brand    Brand    @relation(fields: [brandId],    references: [id])
  category Category @relation(fields: [categoryId], references: [id])

  variations    ProductVariation[]
  images        ProductImage[]
  reviews       Review[]
  wishlistItems WishlistItem[]
  cartItems     CartItem[]
  orderItems    OrderItem[]

  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt       @map("updated_at")
  @@map("products")
}

model ProductVariation {
  id            String   @id @default(cuid())
  productId     String   @map("product_id")
  sku           String   @unique
  size          String   // adapta pro nicho: '34', 'P', '110V', '500ml'
  color         String   // adapta: 'Branco', 'Azul'; vazio se nicho não tem cor
  colorHex      String?  @map("color_hex")
  stock         Int      @default(0)
  priceOverride Decimal? @db.Decimal(10, 2) @map("price_override")
  isActive      Boolean  @default(true) @map("is_active")

  product Product @relation(fields: [productId], references: [id], onDelete: Cascade)

  cartItems  CartItem[]
  orderItems OrderItem[]
  @@map("product_variations")
}

model ProductImage {
  id             String  @id @default(cuid())
  productId      String  @map("product_id")
  url            String
  alt            String?
  sortOrder      Int     @default(0) @map("sort_order")
  isPrimary      Boolean @default(false) @map("is_primary")
  variationColor String? @map("variation_color")  // pra galeria por cor

  product Product @relation(fields: [productId], references: [id], onDelete: Cascade)
  @@map("product_images")
}
```

### Address

```prisma
model Address {
  id         String  @id @default(cuid())
  userId     String  @map("user_id")
  label      String?
  recipient  String
  zipcode    String
  street     String
  number     String
  complement String?
  district   String
  city       String
  state      String
  country    String  @default("BR")
  phone      String?
  isDefault  Boolean @default(false) @map("is_default")

  user   User    @relation(fields: [userId], references: [id], onDelete: Cascade)
  orders Order[]

  createdAt DateTime @default(now()) @map("created_at")
  @@map("addresses")
}
```

### Cart + CartItem

```prisma
model Cart {
  id        String  @id @default(cuid())
  userId    String? @map("user_id")  // pode ser guest (sessionId)
  sessionId String? @map("session_id") @unique

  user  User?      @relation(fields: [userId], references: [id], onDelete: Cascade)
  items CartItem[]

  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt       @map("updated_at")
  @@map("carts")
}

model CartItem {
  id          String  @id @default(cuid())
  cartId      String  @map("cart_id")
  productId   String  @map("product_id")
  variationId String  @map("variation_id")
  quantity    Int     @default(1)

  cart      Cart             @relation(fields: [cartId],      references: [id], onDelete: Cascade)
  product   Product          @relation(fields: [productId],   references: [id])
  variation ProductVariation @relation(fields: [variationId], references: [id])

  @@unique([cartId, variationId])
  @@map("cart_items")
}
```

### Order + OrderItem + Payment

```prisma
model Order {
  id            String        @id @default(cuid())
  orderNumber   String        @unique @map("order_number")
  userId        String        @map("user_id")
  addressId     String        @map("address_id")
  couponId      String?       @map("coupon_id")
  status        OrderStatus   @default(PENDING_PAYMENT)
  subtotal      Decimal       @db.Decimal(10, 2)
  shippingCost  Decimal       @db.Decimal(10, 2) @map("shipping_cost")
  discount      Decimal       @db.Decimal(10, 2) @default(0)
  total         Decimal       @db.Decimal(10, 2)
  notes         String?
  trackingCode  String?       @map("tracking_code")

  user    User    @relation(fields: [userId],    references: [id])
  address Address @relation(fields: [addressId], references: [id])
  coupon  Coupon? @relation(fields: [couponId],  references: [id])

  items    OrderItem[]
  payment  OrderPayment?

  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt       @map("updated_at")
  @@map("orders")
}

enum OrderStatus {
  PENDING_PAYMENT
  PAID
  PREPARING
  SHIPPED
  DELIVERED
  CANCELLED
  REFUNDED
}

model OrderItem {
  id             String  @id @default(cuid())
  orderId        String  @map("order_id")
  productId      String  @map("product_id")
  variationId    String  @map("variation_id")
  productName    String  @map("product_name")
  variationLabel String  @map("variation_label")
  unitPrice      Decimal @db.Decimal(10, 2) @map("unit_price")
  quantity       Int
  subtotal       Decimal @db.Decimal(10, 2)

  order     Order            @relation(fields: [orderId],     references: [id], onDelete: Cascade)
  product   Product          @relation(fields: [productId],   references: [id])
  variation ProductVariation @relation(fields: [variationId], references: [id])
  @@map("order_items")
}

model OrderPayment {
  id           String        @id @default(cuid())
  orderId      String        @unique @map("order_id")
  method       PaymentMethod
  status       PaymentStatus @default(PENDING)
  amount       Decimal       @db.Decimal(10, 2)
  pixQrCode    String?       @map("pix_qr_code")
  pixCopyPaste String?       @map("pix_copy_paste")
  pixExpiresAt DateTime?     @map("pix_expires_at")
  approvedAt   DateTime?     @map("approved_at")
  externalId   String?       @map("external_id")  // ID do MercadoPago

  order Order @relation(fields: [orderId], references: [id], onDelete: Cascade)
  @@map("order_payments")
}

enum PaymentMethod { PIX  CREDIT_CARD  BOLETO }
enum PaymentStatus { PENDING APPROVED REJECTED REFUNDED CANCELLED EXPIRED }
```

### Coupon

```prisma
model Coupon {
  id            String      @id @default(cuid())
  code          String      @unique
  type          CouponType
  value         Decimal?    @db.Decimal(10, 2)
  minOrderValue Decimal?    @db.Decimal(10, 2) @map("min_order_value")
  maxUses       Int?        @map("max_uses")
  usedCount     Int         @default(0)        @map("used_count")
  perUserLimit  Int         @default(1)        @map("per_user_limit")
  validFrom     DateTime    @default(now())    @map("valid_from")
  validUntil    DateTime?   @map("valid_until")
  isActive      Boolean     @default(true)     @map("is_active")

  orders Order[]

  createdAt DateTime @default(now()) @map("created_at")
  @@map("coupons")
}

enum CouponType { PERCENT  FIXED  FREE_SHIPPING }
```

### Review (com aprovação manual)

```prisma
model Review {
  id         String   @id @default(cuid())
  productId  String   @map("product_id")
  userId     String   @map("user_id")
  rating     Int      // 1-5
  comment    String?
  isApproved Boolean  @default(false) @map("is_approved")

  product Product @relation(fields: [productId], references: [id], onDelete: Cascade)
  user    User    @relation(fields: [userId],    references: [id], onDelete: Cascade)

  @@unique([productId, userId])
  createdAt DateTime @default(now()) @map("created_at")
  @@map("reviews")
}
```

### WishlistItem

```prisma
model WishlistItem {
  id        String @id @default(cuid())
  userId    String @map("user_id")
  productId String @map("product_id")

  user    User    @relation(fields: [userId],    references: [id], onDelete: Cascade)
  product Product @relation(fields: [productId], references: [id], onDelete: Cascade)

  @@unique([userId, productId])
  addedAt DateTime @default(now()) @map("added_at")
  @@map("wishlist_items")
}
```

### RefreshToken + PasswordResetToken (auth)

```prisma
model RefreshToken {
  id        String   @id @default(cuid())
  userId    String   @map("user_id")
  tokenHash String   @unique @map("token_hash")  // SHA256 do raw token
  expiresAt DateTime @map("expires_at")
  userAgent String?  @map("user_agent")
  ip        String?
  revokedAt DateTime? @map("revoked_at")
  // Reuse detection: se um token já usado for reapresentado, invalida todos do user
  usedAt    DateTime? @map("used_at")

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  createdAt DateTime @default(now()) @map("created_at")
  @@map("refresh_tokens")
}

model PasswordResetToken {
  id        String   @id @default(cuid())
  userId    String   @map("user_id")
  tokenHash String   @unique @map("token_hash")
  expiresAt DateTime @map("expires_at")
  usedAt    DateTime? @map("used_at")

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  createdAt DateTime @default(now()) @map("created_at")
  @@map("password_reset_tokens")
}
```

### StoreSettings (singleton)

```prisma
// Uma linha só com id="default". Painel edita.
model StoreSettings {
  id              String   @id @default("default")
  storeName       String?  @map("store_name")
  storeTagline    String?  @map("store_tagline")
  logoUrl         String?  @map("logo_url")
  faviconUrl      String?  @map("favicon_url")
  whatsappNumber  String?  @map("whatsapp_number")
  whatsappMessage String?  @map("whatsapp_message")
  instagramHandle String?  @map("instagram_handle")
  email           String?
  phone           String?
  cnpj            String?
  legalName       String?  @map("legal_name")
  address         String?
  privacyPolicy   String?  @map("privacy_policy")   @db.Text
  termsOfUse      String?  @map("terms_of_use")     @db.Text
  exchangePolicy  String?  @map("exchange_policy")  @db.Text
  shippingPolicy  String?  @map("shipping_policy")  @db.Text
  aboutUs         String?  @map("about_us")         @db.Text
  pixDiscountPercent   Int     @default(5)         @map("pix_discount_percent")
  shippingFlatRate     Decimal @db.Decimal(10, 2) @default(15.00) @map("shipping_flat_rate")
  freeShippingMinValue Decimal? @db.Decimal(10, 2) @map("free_shipping_min_value")

  updatedAt DateTime @updatedAt @map("updated_at")
  @@map("store_settings")
}
```

## Adaptações por nicho

Ver [[../70-NICHOS/]] — cada template descreve quais campos adaptar.

Padrão geral:
- **`size`** vira o atributo principal de variação (tamanho roupa, voltagem eletrônico, sabor comida)
- **`color`** vira o secundário (ou vazio se nicho não tem cor)
- **`measureTable`** vira tabela de **especificações** no eletrônico, **tamanhos** na roupa, etc

## Migrations

```bash
# Em dev local (gera arquivo + aplica)
docker exec miami-backend npx prisma migrate dev --name <nome_descritivo>

# Só gera arquivo (não aplica)
docker exec miami-backend npx prisma migrate dev --name <nome> --create-only

# Aplica em prod (Railway faz no startCommand automático)
npx prisma migrate deploy
```
