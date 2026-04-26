-- AlterTable
ALTER TABLE "product_images" ADD COLUMN     "variation_color" TEXT;

-- CreateTable
CREATE TABLE "store_settings" (
    "id" TEXT NOT NULL DEFAULT 'default',
    "store_name" TEXT NOT NULL DEFAULT 'Miami Store',
    "store_tagline" TEXT,
    "logo_url" TEXT,
    "favicon_url" TEXT,
    "whatsapp_number" TEXT,
    "whatsapp_message" TEXT,
    "instagram_handle" TEXT,
    "email" TEXT,
    "phone" TEXT,
    "cnpj" TEXT,
    "legal_name" TEXT,
    "address" TEXT,
    "privacy_policy" TEXT,
    "terms_of_use" TEXT,
    "exchange_policy" TEXT,
    "shipping_policy" TEXT,
    "about_us" TEXT,
    "pix_discount_percent" INTEGER NOT NULL DEFAULT 5,
    "shipping_flat_rate" DECIMAL(10,2) NOT NULL DEFAULT 15.00,
    "free_shipping_min_value" DECIMAL(10,2),
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "store_settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "wishlist_items" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "product_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "wishlist_items_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "wishlist_items_user_id_idx" ON "wishlist_items"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "wishlist_items_user_id_product_id_key" ON "wishlist_items"("user_id", "product_id");

-- CreateIndex
CREATE INDEX "product_images_product_id_variation_color_idx" ON "product_images"("product_id", "variation_color");

-- AddForeignKey
ALTER TABLE "wishlist_items" ADD CONSTRAINT "wishlist_items_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "wishlist_items" ADD CONSTRAINT "wishlist_items_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;
