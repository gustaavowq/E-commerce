# 🔧 Fase 3 — Backend + DB

> Schema Prisma → endpoints REST → auth flow → seed idempotente → MP Pix sandbox.
> Validar shape ANTES de tipar frontend (lição 20). `_form` em `formErrors` (saga 26).

Skill responsável: **`ecommerce-backend`**.
Tempo esperado: **45–60 min**.
Gate de saída: [[GATES#Gate 3 — Backend]].

## 6 subcamadas

### 3.1 Schema Prisma + smoke test shape

Modelos canônicos. Reuso de [[../50-PADROES/prisma-models-base]].

**Mínimo:** `User`, `Address`, `RefreshToken`, `PasswordResetToken`, `Product`, `ProductVariation`, `ProductImage`, `Category`, `Brand`, `Cart`, `CartItem`, `Order`, `OrderItem`, `Payment`, `Coupon`, `Review`, `WishlistItem`.

Extras por nicho — ex: tech `HardwareCategory` + `Persona` + `Build`; moda `Size` + `Color`.

**Smoke test shape (lição 20):**

Antes de tipar no frontend, curl o endpoint e cole o JSON em comentário:

```ts
// frontend/src/services/types.ts
// curl http://localhost:4000/api/products | jq '.data[0]'
// {
//   "id": "clx...",
//   "name": "...",
//   "price": 19990,
//   "category": { "id": "...", "name": "..." },  // ← include retorna OBJETO (lição 11)
//   "images": [{ "url": "...", "alt": "..." }],
//   "createdAt": "2026-04-29T..."
// }
export type ProductDetail = {
  id: string
  name: string
  price: number
  category: { id: string; name: string }  // não confundir com string
  images: { url: string; alt: string }[]
  createdAt: string
}
```

**Anti-padrão (lição 11):** assumir que `include: { category: true }` retorna string. Crashes JSX `{product.category}` em React.

### 3.2 Auth flow

**Reuso direto de [[../50-PADROES/auth-pattern-completo]]** — backend completo (jwt.ts + password.ts + middleware + routes + validators + error-handler).

Nesta fase, o backend tem que ter:

- `src/lib/jwt.ts` — sign/verify access, gerar refresh raw + hash, util `expiresInToMs`
- `src/lib/password.ts` — bcrypt cost 12
- `src/middleware/auth.ts` — `requireAuth`, `requireRole`, `loadCurrentUser`
- `src/routes/auth.ts` — register, login, refresh com rotation+reuse detection, logout, forgot, reset, **/me**
- `src/validators/auth.ts` — `strongPassword` com blocklist, schemas `.strict()`
- Google OAuth callback (link `[[../50-PADROES/auth-pattern-completo]]`)

**Smoke test obrigatório:** curl em todos os endpoints + paste no relatório.

### 3.3 Endpoints REST + Zod `.strict()` em todos validators

```ts
// backend/src/validators/product.ts
export const productCreateSchema = z.object({
  name: z.string().min(2).max(200),
  description: z.string(),
  price: z.number().int().positive(),  // centavos
  hardwareCategory: z.enum(['cpu', 'gpu', ...]).optional(),
  personaSlug: z.string().nullable().optional(),
  brandId: z.string().cuid().optional(),
  // ... outros write fields
}).strict()  // ← REJEITA campos desconhecidos com formErrors

export const productUpdateSchema = productCreateSchema.partial().strict()
```

**Por que `.strict()`:** se frontend mandar `category` (read shape) em vez de `hardwareCategory` (write shape), Zod rejeita imediatamente com erro útil. Sem `.strict()`, backend silenciosamente ignora e PATCH fica no-op.

**Atenção:** `.strict()` exige error-handler completo (próxima subcamada).

### 3.4 Error handler com `_form`

Defesa em profundidade pra saga 26. **OBRIGATÓRIO** se algum schema usa `.strict()`.

```ts
// backend/src/middleware/error-handler.ts
import { ZodError } from 'zod'
import type { ErrorRequestHandler } from 'express'

export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  if (err instanceof ZodError) {
    const flat = err.flatten()
    const details: Record<string, string[]> = { ...flat.fieldErrors }
    if (flat.formErrors.length > 0) {
      details._form = flat.formErrors  // ← chave especial pra raiz
    }
    return res.status(422).json({
      success: false,
      error: { code: 'VALIDATION_ERROR', message: 'Dados inválidos', details },
    })
  }
  // ... outros handlers (ApiError, ApiErrorClass, fallback 500)
}
```

**Por quê:** `err.flatten()` retorna `{ formErrors: [], fieldErrors: {} }`. Issues de `path: []` (como `unrecognized_keys` de `.strict()`) vão pra **`formErrors`**. Sem incluir `_form`, frontend recebe `details: {}` vazio → "Dados inválidos" puro → saga 26.

Frontend consome via [[../50-PADROES/auth-pattern-completo]] `describeApiError(err)`:

```ts
// frontend/src/lib/api-error.ts
if (err.code === 'VALIDATION_ERROR' && err.details && typeof err.details === 'object') {
  const fields = err.details as Record<string, string[] | undefined>
  const fieldItems = Object.entries(fields)
    .filter(([k, v]) => k !== '_form' && Array.isArray(v) && v.length > 0)
    .map(([k, v]) => `${FIELD_LABELS_PT[k] ?? k}: ${v?.[0]}`)
  if (fieldItems.length > 0) return { title: 'Corrige antes de salvar', body: fieldItems.join(' · ') }
  if (Array.isArray(fields._form) && fields._form.length > 0) {
    return { title: 'Não foi possível salvar', body: fields._form.join(' · ') }
  }
}
```

### 3.5 Seed idempotente upsert

Reuso de [[../50-PADROES/seed-imagens-upsert]]. **Atualizar campos relacionados** quando re-rodar — sem isso, trocar imagem no seed.ts e rodar `npm run db:seed` ignora silenciosamente.

```ts
// backend/prisma/seed.ts
for (const data of products) {
  const product = await prisma.product.upsert({
    where: { slug: data.slug },
    update: {  // ← TODOS os campos, não só nome/preço
      name: data.name,
      description: data.description,
      price: data.price,
      stock: data.stock,
      hardwareCategory: data.hardwareCategory,
      // ...
    },
    create: { ...data },
  })

  // Imagens — apaga e recria pra refletir mudança
  await prisma.productImage.deleteMany({ where: { productId: product.id } })
  await prisma.productImage.createMany({
    data: data.images.map((url, i) => ({ productId: product.id, url, alt: data.name, position: i })),
  })

  // Variations — idem
  await prisma.productVariation.deleteMany({ where: { productId: product.id } })
  await prisma.productVariation.createMany({
    data: data.variations.map(v => ({ productId: product.id, ...v })),
  })
}
```

**Anti-padrão:** `if (!existing) prisma.product.create(...)`. Re-run ignora updates.

**Demo-first (feedback Gustavo):** seed completo desde o dia 1.
- ≥ 12 produtos
- foto real (Cloudinary upload via script)
- preço + desconto + specs em TODOS
- estoque mínimo 12 unidades

Sem isso, "sem estoque" em massa = catálogo morto.

### 3.6 MercadoPago Pix — 3 pré-requisitos

Lição 15. Sem os 3, QR code não gera.

1. **Env name canônico:** `MERCADOPAGO_ACCESS_TOKEN` (NÃO `MP_TOKEN`, NÃO `MERCADO_PAGO_TOKEN`)
2. **Token PRODUCTION** (não TEST). Pix sandbox MP exige conta production.
3. **Chave Pix cadastrada** na conta MP (CNPJ/email/celular). Sem chave, MP gera erro 400 silencioso.

```ts
// backend/src/services/mercadopago.ts
import { MercadoPagoConfig, Payment } from 'mercadopago'
import { env } from '../config/env.js'

const client = new MercadoPagoConfig({ accessToken: env.MERCADOPAGO_ACCESS_TOKEN })
const payment = new Payment(client)

export async function createPixPayment({ amount, payerEmail, orderId }: {...}) {
  const result = await payment.create({
    body: {
      transaction_amount: amount,
      payment_method_id: 'pix',
      payer: { email: payerEmail },
      external_reference: orderId,
      notification_url: `${env.BACKEND_URL}/api/webhooks/mercadopago`,
    },
  })
  return {
    qrCodeBase64: result.point_of_interaction?.transaction_data?.qr_code_base64,
    qrCode: result.point_of_interaction?.transaction_data?.qr_code,
    expiresAt: result.date_of_expiration,
  }
}
```

**Webhook obrigatório:** `/api/webhooks/mercadopago` recebe POST, busca payment por id, atualiza order pra `PAID` se `status === 'approved'`.

**Smoke test em sandbox:** criar order, gerar Pix, simular pagamento via MP simulator (https://www.mercadopago.com.br/developers/), confirmar webhook chegou + order virou PAID.

## ✅ Checklist de saída (Gate 3)

Reuso direto de [[GATES#Gate 3 — Backend]]. Resumo:

- [ ] Schema Prisma com modelos canônicos
- [ ] Smoke test shape em comentário (curl + paste)
- [ ] Validators Zod `.strict()` em todos schemas de mutação
- [ ] error-handler envia `_form` em `details`
- [ ] /auth/register/login/refresh/logout/me/forgot/reset testados via curl
- [ ] JWT_SECRET real (`openssl rand -base64 48`)
- [ ] Seed idempotente — re-run não duplica, atualiza campos relacionados
- [ ] Seed ≥12 produtos com foto real + preço + estoque
- [ ] MP Pix testado em sandbox (3 pré-requisitos)
- [ ] Webhook MP responde + atualiza order

## 🚫 Anti-padrões Kore (consolidados)

1. **Include retorna objeto** ([[../30-LICOES/11-backend-relations-objeto]]) — JSX `{product.category}` crasha React. Sempre prever shape.
2. **JWT_SECRET placeholder** ([[../30-LICOES/01-jwt-secret-placeholder]]) — pentest forja JWT admin. `openssl rand -base64 48` antes de qualquer deploy.
3. **Zod sem `.strict()`** — backend ignora silenciosamente campos errados; frontend acha que salvou. Caminho pra saga 26.
4. **`.strict()` sem `_form` no error-handler** — campo `unrecognized_keys` vai pra `formErrors`, é descartado, frontend cai em "Dados inválidos" puro (saga 26).
5. **Seed `if (!existing)`** — re-run ignora trocas; trocar foto no seed.ts não atualiza prod.
6. **Seed parcial** — 4 produtos sem foto + sem estoque = "catálogo morto"; demo do cliente fica vergonhosa.
7. **MP env name inventado** — `MP_TOKEN` em vez de `MERCADOPAGO_ACCESS_TOKEN` faz código quebrar em prod silenciosamente.
8. **MP token TEST em vez de PRODUCTION** — Pix sandbox exige PRODUCTION.
9. **MP sem chave Pix cadastrada** — erro 400 silencioso na criação.
10. **`tsx` em devDependencies** ([[../30-LICOES/03-tsx-dependencies]]) — seed quebra em prod Docker. Mover pra `dependencies`.

## Padrões reusáveis
- [[../50-PADROES/auth-pattern-completo]] — auth backend+frontend
- [[../50-PADROES/prisma-models-base]] — schema canônico
- [[../50-PADROES/seed-imagens-upsert]] — seed idempotente
- [[../30-LICOES/15-mercadopago-pix-pre-requisitos]] — MP Pix detalhado
- [[../30-LICOES/20-validar-shape-backend]] — curl + paste
- [[../30-LICOES/26-dados-invalidos-silencioso]] — saga completa
