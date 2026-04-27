# DE: backend | PARA: techlead | 2026-04-26

## Sprint 2 — Kore Tech | Gaps Alto resolvidos

Typecheck: **OK (zero erros)** — `cd src/projeto-tech/kore-tech/backend && npx tsc --noEmit` exit 0.
Migrations: **1 nova** (não aplicada — sem DB rodando, conforme combinado).
Não commitei.

---

## FIX 1 — Schema Prisma (delta)

**Arquivo:** `prisma/schema.prisma`

- `Cart`:
  - +`source String?` (linha ~520) com whitelist no Zod (`'builder' | null` apenas).
- `Coupon`:
  - +`requiresCartSource String?`
  - +`requiresPaymentMethod String?`
  - +`requiresCategoryPresence String[] @default([])`
  - +`blockOtherPercent Boolean @default(true)`
  - +`stacksWithFreeShipping Boolean @default(true)`
  - +`couponUsages OrderCouponUsage[]` (relação inversa)
- `Order`:
  - +`couponUsages OrderCouponUsage[]` (relação inversa)
- **Novo model `OrderCouponUsage`** com `orderId`, `couponId?` (FK SetNull), `couponCode`, `userId?`, `email?`, `appliedAt`, `discountValueBRL` (Decimal 10,2). Index em `couponCode`, `userId`, `orderId`.

**Migration:** `prisma/migrations/20260427120000_sprint2_coupon_extras/migration.sql` (escrita à mão, formato compatível com Prisma — `--from-migrations` exige shadow DB e não temos). Cobre AlterTable carts/coupons + CreateTable + Index + FK. **Não aplicada.**

**Decisão:** mantive `requiresCategoryPresence` como `String[]` (Postgres array text, nativo) ao invés de Json, conforme escopo do tech lead. O resolver expande `'periferico'` pro grupo `{mouse,teclado,headset,mousepad,monitor,cadeira}` em `lib/coupon.ts`.

`prisma generate` OK (Prisma Client regenerado com tipos novos).

---

## FIX 2 — `src/lib/coupon.ts` reescrito

**Arquivo:** `src/lib/coupon.ts` (ctx novo retrocompatível — `cartSource`, `paymentMethod`, `cartCategories`, `shippingCost` opcionais).

Validações novas (todas com erro PT-BR específico):

- `requiresCartSource` mismatch → "Este cupom vale só pra carrinho montado no PC Builder." (ou genérico)
- `requiresPaymentMethod` mismatch → "Este cupom vale só pagando com Pix." (ou genérico)
- `requiresCategoryPresence` falta categoria → "COMBO15 vale com 1 PC montado + 1 periférico no carrinho." (mensagem específica detectada por par `pc_full + periferico`).
- `validUntil`/`validFrom`/`maxUses`/`minOrderValue`/`perUserLimit` (mantidos).
- `FREE_SHIPPING` agora aceita `shippingCost` opcional pra retornar `discount = shippingCost` (compat com auditoria — guarda valor real do frete economizado).

**Limite por usuário:** mantido via `Order.couponId` (legado, funciona). Em Sprint 3 migra pra `OrderCouponUsage` (mais semântico).

---

## FIX 3 — `src/routes/orders.ts` integrado

**Arquivo:** `src/routes/orders.ts`

- Cart include agora puxa `product.hardwareCategory`. `cartCategories` calculado via `Set` antes do resolver.
- `resolveCoupon(...)` recebe `cartSource: cart.source`, `paymentMethod: body.paymentMethod`, `cartCategories`.
- Persistência de auditoria dentro da `$transaction`:
  ```ts
  await tx.orderCouponUsage.create({
    data: { orderId, couponId, couponCode, userId, email: user.email, discountValueBRL: Decimal(discount) },
  })
  ```
- Atomic decrement de stock e isolation Serializable mantidos.

**Breaking change:** nenhum. Schema do request input idêntico (paymentMethod ainda restrito a `['PIX']` na V1; cartão/boleto entram quando MercadoPago wiring expandir).

---

## FIX 4 — `src/routes/cart.ts`

**Arquivos:** `src/routes/cart.ts` + `src/validators/cart.ts`

- `cartItemAddSchema.source` opcional (Zod enum `['builder']` — nada além).
- Novo `cartUpdateSchema` (PUT `/api/cart`) — frontend marca origem builder explicitamente após concluir build.
- `loadCart()` retorna `source` no payload (frontend ressuscita estado).
- POST `/items` propaga `source` quando vier — **não sobrescreve com null** (proteção: se cart já é builder, abrir PDP e clicar "comprar" não descaracteriza).
- PUT `/` novo handler dedicado.
- DELETE `/` (limpar carrinho) → reseta `source = null`.
- DELETE `/items/:itemId` e PATCH com `quantity=0` → `resetSourceIfEmpty()` (helper) zera source quando carrinho fica vazio. **Anti-fraude BUILDER10** conforme `growth/CUPONS.md` seção 3.

**Breaking change:** payload de retorno do GET/POST/PUT/PATCH/DELETE de `/api/cart*` agora inclui campo `source`. Frontend deve aceitar (ignorar é OK).

---

## FIX 5 — POST `/api/contact`

**Arquivos novos:**
- `src/lib/logger.ts` — pino com pino-pretty em dev, redact em campos sensíveis (password, token, cookie). Middleware `attachLogger` injeta `req.log` (filho com `path/method/ip`).
- `src/validators/contact.ts` — Zod (`name`, `email`, `phone?`, `subject`, `message`); regras min/max razoáveis.
- `src/routes/contact.ts` — POST `/` com rate limit dedicado (5/min/IP). Loga via `req.log.info({ contact }, 'contact form received')`. Resposta padrão: `"Recebemos sua mensagem. Em até 1 dia útil a gente responde."`

**Wiring em `src/index.ts`:**
- `app.use(attachLogger)` antes de `extractUser`.
- `mountRoutes()` adicionou `app.use(\`${prefix}/contact\`, contactRouter)` (montado em `/contact` e `/api/contact` — strip dupla pelo Nginx, padrão do projeto).

**Resend:** TODO em Sprint 3 quando key estiver no env (pattern já tem placeholder em `services/alerts.ts`).

---

## FIX 6 — Limpar `console.log` de reset URL

**Arquivo:** `src/routes/auth.ts:343-345`

```ts
// Antes:
if (isDev) console.log(`[dev] reset url: ${resetUrl}`)

// Depois:
if (isDev) {
  req.log.debug({ resetUrl, email: user.email }, 'password reset url generated (dev only)')
}
```

`req.log` vem do `attachLogger`. Pino `redact` não pega `resetUrl` por nome, mas o `if (isDev)` já bloqueia em prod (level=info em prod ignora debug — dupla proteção).

---

## FIX 7 — Endpoint admin alerts contract

**Arquivos verificados:**
- `src/routes/admin/alerts.ts`
- `src/services/alerts.ts`
- `src/projeto-tech/kore-tech/dashboard/src/services/admin.ts:39-47`
- `src/projeto-tech/kore-tech/dashboard/src/services/types.ts:203-226`

**Resultado:** **Contrato OK, sem mudança necessária.**

Backend retorna:
- `GET /api/admin/alerts` → `Alert[]` com shape `{ kind, severity, title, message, context, detectedAt }` ✅ bate exato com `AdminAlert` do dashboard.
- `POST /api/admin/alerts/run` → `{ detected, logged, emailed, alerts }` ✅ bate exato com `AlertRunResponse`.
- `kind` e `severity` enums batem 1:1 (`'red' | 'yellow'` e os 6 kinds).

Único detalhe: `detectedAt` é `Date` no backend (serializa como ISO string no JSON) e `string` no type do dashboard — comportamento esperado, sem ajuste necessário.

---

## Bloqueios pra outro agente

- **[frontend]** Quando começar a usar BUILDER10:
  - Após concluir build em `/montar`, chamar `PUT /api/cart` com body `{ source: 'builder' }`. **Ou** já enviar `source: 'builder'` no body do `POST /api/cart/items` que adiciona o primeiro componente.
  - No checkout, passar `paymentMethod: 'PIX'` no `POST /api/orders` quando aplicar PIXFIRST (já vinha; só confirmar).
- **[frontend]** Loja já tinha `/contato` com fetch fake — agora pode trocar pra `POST /api/contact` real. Response: `{ success: true, data: { message: '...' } }`.
- **[devops]** Migration `20260427120000_sprint2_coupon_extras` precisa rodar (`prisma migrate deploy`) antes de subir backend Sprint 2. Sem DB rodando agora, deixei pronta — não apliquei.
- **[growth/data-analyst]** `OrderCouponUsage` agora persiste em todo checkout com cupom. Pode começar a montar query de CAC/ROI por cupom em `services/alerts.ts` ou novo endpoint `/admin/dashboard/coupon-roi`.

## Riscos

- **Migration manual:** escrita à mão sem shadow DB pra validar contra Prisma. Estrutura é direta (3 alters + 1 create + 3 indexes + 2 FKs); revisar mentalmente antes de aplicar em prod.
- **Coupon limit por usuário:** ainda checa via `Order.couponId`. Pedidos cancelados (`status: CANCELLED`) já são excluídos. `OrderCouponUsage` é write-only nesta sprint — Sprint 3 migra a checagem pra ser semantica.
- **Seed cupons (Sprint 1):** ainda não foi atualizado pra setar os novos campos (`requiresCartSource: 'builder'` em BUILDER10, etc). Recomendo update do seed em paralelo, mas não está nos 7 FIXES — fica como gap pra Tech Lead avaliar.

— Backend, 2026-04-26 (Sprint 2 — 7 FIXES entregues, typecheck OK)
