-- =============================================================================
-- Sprint 2 — Cupons com regras avançadas + auditoria de uso
--
-- Alterações:
--   1) carts.source — origem do carrinho (ex: 'builder' pra rastrear PC Builder).
--   2) coupons.* — 5 colunas pra regras de cumulação/condição
--      (requires_cart_source, requires_payment_method, requires_category_presence,
--       block_other_percent, stacks_with_free_shipping).
--   3) order_coupon_usages — auditoria por pedido (CAC/ROI por cupom + limite por usuário).
--
-- Owner: ecommerce-backend (Sprint 2). Não aplicada (sem DB rodando) — rodar
-- com `prisma migrate deploy` quando subir.
-- =============================================================================

-- AlterTable: carts
ALTER TABLE "carts" ADD COLUMN "source" TEXT;

-- AlterTable: coupons
ALTER TABLE "coupons"
  ADD COLUMN "requires_cart_source"        TEXT,
  ADD COLUMN "requires_payment_method"     TEXT,
  ADD COLUMN "requires_category_presence"  TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  ADD COLUMN "block_other_percent"         BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN "stacks_with_free_shipping"   BOOLEAN NOT NULL DEFAULT true;

-- CreateTable: order_coupon_usages
CREATE TABLE "order_coupon_usages" (
    "id"                  TEXT        NOT NULL,
    "order_id"            TEXT        NOT NULL,
    "coupon_code"         TEXT        NOT NULL,
    "coupon_id"           TEXT,
    "user_id"             TEXT,
    "email"               TEXT,
    "applied_at"          TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "discount_value_brl"  DECIMAL(10, 2) NOT NULL,

    CONSTRAINT "order_coupon_usages_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "order_coupon_usages_coupon_code_idx" ON "order_coupon_usages"("coupon_code");
CREATE INDEX "order_coupon_usages_user_id_idx"     ON "order_coupon_usages"("user_id");
CREATE INDEX "order_coupon_usages_order_id_idx"    ON "order_coupon_usages"("order_id");

-- AddForeignKey
ALTER TABLE "order_coupon_usages"
  ADD CONSTRAINT "order_coupon_usages_order_id_fkey"
  FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "order_coupon_usages"
  ADD CONSTRAINT "order_coupon_usages_coupon_id_fkey"
  FOREIGN KEY ("coupon_id") REFERENCES "coupons"("id") ON DELETE SET NULL ON UPDATE CASCADE;
