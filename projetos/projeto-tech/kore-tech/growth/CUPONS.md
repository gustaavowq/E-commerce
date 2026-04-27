# CUPONS — Kore Tech (MVP)

> 5 cupons MVP — regras, lógica, validação e impacto esperado. Backend implementa em `lib/coupon.ts` (validação) + `Coupon` model (persistência) + `OrderCouponUsage` (auditoria).

**Princípios gerais:**
- **Toda regra de cumulação é EXPLÍCITA** — Backend deve permitir empilhar/recusar conforme a tabela. Por padrão, **dois cupons percentuais NÃO empilham** entre si (escolhe o de maior desconto pro cliente).
- **Frete grátis empilha com qualquer percentual.**
- **Validade indefinida ≠ eterna.** Ainda assim Backend deve aceitar `validUntil = null` no schema, mas Growth recomenda revisar trimestralmente.
- **Logging:** todo uso de cupom grava `OrderCouponUsage { orderId, couponCode, userId, appliedAt, discountValueBRL }` pra calcular CAC e ROI no painel.

---

## Tabela resumo

| Código | Tipo | Desconto | Carrinho mín | Limite/usuário | Validade | Cumulação |
|---|---|---|---|---|---|---|
| `BEMVINDO5` | PERCENT | 5% | qualquer | **1x** (vincula a `userId`) | indefinida | **NÃO** com PIXFIRST/BUILDER10/COMBO15. **SIM** com FRETE15. |
| `PIXFIRST` | PERCENT (só Pix) | 5% | qualquer | ilimitado | indefinida | **NÃO** com BEMVINDO5/BUILDER10/COMBO15. **SIM** com FRETE15. |
| `BUILDER10` | PERCENT | 10% | originou do builder | ilimitado por usuário | indefinida | **NÃO** com outros %. **SIM** com FRETE15. |
| `COMBO15` | PERCENT | 15% | ≥1 PC + ≥1 periférico | ilimitado por usuário | indefinida | **NÃO** com outros %. **SIM** com FRETE15. |
| `FRETE15` | FREE_SHIPPING | frete grátis | ≥ R$ 5.000 | ilimitado por usuário | 60 dias | **SIM** com qualquer percentual |

**Resumo da regra de cumulação:** o cliente escolhe **um único cupom percentual** (sistema sugere o de maior desconto pra ele) + **opcionalmente FRETE15** se atingir R$ 5.000.

---

## 1. BEMVINDO5 — primeira compra

| Campo | Valor |
|---|---|
| **Tipo** | `PERCENT` |
| **Desconto** | 5% sobre subtotal (antes do frete) |
| **Carrinho mínimo** | R$ 0 (qualquer valor) |
| **Categorias permitidas** | Qualquer |
| **Limite por usuário** | **1x** — checa pelo `userId` em `OrderCouponUsage`. Se guest, vincula ao email cadastrado pra newsletter no momento do uso (impede burlar criando 2 contas com mesmo email). |
| **Limite global** | sem limite |
| **Validade** | indefinida (revisar trimestral) |
| **Captura** | popup de newsletter (30s ou exit-intent) + email pós-cadastro com cupom + footer |
| **Cumulação** | **NÃO** com PIXFIRST, BUILDER10, COMBO15. **SIM** com FRETE15. |
| **Onde mostra** | popup de captura, email de boas-vindas (`COPY-EMAILS.md` D+0), banner sutil no header pra usuário não-logado primeira sessão |

**Pseudocódigo de validação:**

```ts
// lib/coupon.ts — validateBEMVINDO5
function validateBEMVINDO5(ctx: { userId?: string; email: string; cart: Cart }): CouponResult {
  if (!ctx.userId && !ctx.email) {
    return { valid: false, reason: 'Faça login ou cadastre o email pra usar BEMVINDO5.' };
  }
  const usedBefore = await db.orderCouponUsage.findFirst({
    where: {
      couponCode: 'BEMVINDO5',
      OR: [
        ctx.userId ? { userId: ctx.userId } : undefined,
        { email: ctx.email },
      ].filter(Boolean),
    },
  });
  if (usedBefore) {
    return { valid: false, reason: 'BEMVINDO5 já foi usado nesta conta.' };
  }
  return {
    valid: true,
    discount: ctx.cart.subtotal * 0.05,
    type: 'PERCENT',
    blockOtherPercent: true,
  };
}
```

---

## 2. PIXFIRST — preferência por Pix

| Campo | Valor |
|---|---|
| **Tipo** | `PERCENT` (só aplica se método de pagamento = Pix) |
| **Desconto** | 5% sobre subtotal |
| **Carrinho mínimo** | R$ 0 |
| **Limite por usuário** | sem limite |
| **Limite global** | sem limite |
| **Validade** | indefinida |
| **Cumulação** | **NÃO** com BEMVINDO5, BUILDER10, COMBO15. **SIM** com FRETE15. |
| **Onde mostra** | tela de checkout, ao selecionar Pix → "Aplicar 5% off com PIXFIRST"; também na PDP "5% off pagando Pix" como hint geral |

**Por que NÃO cumula com BEMVINDO5:**
- Margem do nicho não suporta -10% empilhados (Pix já dá -5% efetivo do gateway, +5% BEMVINDO + 5% PIXFIRST = -15% de margem morta no primeiro pedido)
- UX: cliente novo já ganha 5% com BEMVINDO. Pix vira escolha incentivada por outras razões (sem risco de chargeback). Não é o cupom estrela.

**Pseudocódigo:**

```ts
function validatePIXFIRST(ctx: { paymentMethod: string; cart: Cart }): CouponResult {
  if (ctx.paymentMethod !== 'pix') {
    return { valid: false, reason: 'PIXFIRST só vale pagando com Pix.' };
  }
  return {
    valid: true,
    discount: ctx.cart.subtotal * 0.05,
    type: 'PERCENT',
    blockOtherPercent: true,
  };
}
```

---

## 3. BUILDER10 — incentivo ao uso do builder

| Campo | Valor |
|---|---|
| **Tipo** | `PERCENT` |
| **Desconto** | 10% sobre subtotal |
| **Carrinho mínimo** | qualquer (mas requer flag `cart.source === 'builder'`) |
| **Limite por usuário** | sem limite |
| **Limite global** | sem limite |
| **Validade** | indefinida |
| **Captura** | aplicado **automaticamente** ao concluir build no `/montar` (UX: "10% off aplicado por usar o Builder ✓"). Também digitável manualmente. |
| **Cumulação** | **NÃO** com BEMVINDO5/PIXFIRST/COMBO15. **SIM** com FRETE15. |

**Como o Backend rastreia origem:**
- Frontend, ao adicionar produtos via `/montar`, chama `POST /api/cart` com `source: 'builder'` no payload
- Backend persiste em `Cart.source`
- Validação do cupom checa `cart.source === 'builder'`

**Pseudocódigo:**

```ts
function validateBUILDER10(ctx: { cart: Cart }): CouponResult {
  if (ctx.cart.source !== 'builder') {
    return { valid: false, reason: 'BUILDER10 vale pra carrinho montado no PC Builder.' };
  }
  return {
    valid: true,
    discount: ctx.cart.subtotal * 0.10,
    type: 'PERCENT',
    blockOtherPercent: true,
  };
}
```

**Anti-fraude:** se usuário esvaziar o carrinho e adicionar produtos manualmente, `source` deve ser limpo no Backend (regra: ao remover último item, reseta `source = null`).

---

## 4. COMBO15 — PC + periférico junto

| Campo | Valor |
|---|---|
| **Tipo** | `PERCENT` |
| **Desconto** | 15% sobre subtotal (do PC E dos periféricos no carrinho — não só do periférico) |
| **Condição** | carrinho contém **≥1 produto com `category = 'pc_full'`** E **≥1 produto com `category` ∈ {`mouse`, `teclado`, `headset`, `mousepad`, `monitor`}** |
| **Limite por usuário** | sem limite |
| **Limite global** | sem limite |
| **Validade** | indefinida |
| **Cumulação** | **NÃO** com outros %. **SIM** com FRETE15. |
| **Onde mostra** | banner no PDP de PC montado ("Adicione mouse ou teclado e ganhe 15%"), na sacola quando detectar combo, popup ao adicionar PC ao carrinho ("quer adicionar periférico e ganhar 15%?") |

**Pseudocódigo:**

```ts
function validateCOMBO15(ctx: { cart: Cart }): CouponResult {
  const items = ctx.cart.items;
  const hasPC = items.some(i => i.product.category === 'pc_full');
  const hasPeripheral = items.some(i =>
    ['mouse', 'teclado', 'headset', 'mousepad', 'monitor'].includes(i.product.category)
  );
  if (!hasPC || !hasPeripheral) {
    return { valid: false, reason: 'COMBO15 vale com 1 PC + 1 periférico no carrinho.' };
  }
  return {
    valid: true,
    discount: ctx.cart.subtotal * 0.15,
    type: 'PERCENT',
    blockOtherPercent: true,
  };
}
```

---

## 5. FRETE15 — frete grátis acima de R$ 5.000

| Campo | Valor |
|---|---|
| **Tipo** | `FREE_SHIPPING` |
| **Desconto** | frete = 0 (independente do valor calculado) |
| **Carrinho mínimo** | R$ 5.000 (subtotal antes de outros descontos) |
| **Limite por usuário** | sem limite |
| **Limite global** | sem limite |
| **Validade** | **60 dias** a partir de cada criação. Renovar trimestral. |
| **Cumulação** | **SIM** com qualquer cupom percentual |
| **Onde mostra** | banner no header "Frete grátis acima de R$ 5.000 com FRETE15" + sugestão automática no carrinho ao bater R$ 5.000 |

**Pseudocódigo:**

```ts
function validateFRETE15(ctx: { cart: Cart }): CouponResult {
  if (ctx.cart.subtotal < 5000) {
    return {
      valid: false,
      reason: `FRETE15 vale acima de R$ 5.000. Faltam R$ ${(5000 - ctx.cart.subtotal).toFixed(2)}.`,
    };
  }
  return {
    valid: true,
    discount: ctx.cart.shippingFee, // zera o frete
    type: 'FREE_SHIPPING',
    blockOtherPercent: false, // pode empilhar com %
  };
}
```

---

## 6. Tabela de cumulação (verificação cruzada)

| × | BEMVINDO5 | PIXFIRST | BUILDER10 | COMBO15 | FRETE15 |
|---|---|---|---|---|---|
| **BEMVINDO5** | — | ❌ | ❌ | ❌ | ✅ |
| **PIXFIRST** | ❌ | — | ❌ | ❌ | ✅ |
| **BUILDER10** | ❌ | ❌ | — | ❌ | ✅ |
| **COMBO15** | ❌ | ❌ | ❌ | — | ✅ |
| **FRETE15** | ✅ | ✅ | ✅ | ✅ | — |

**Regra geral implementada no Backend:**
```ts
if (newCoupon.blockOtherPercent && cart.appliedCoupons.some(c => c.blockOtherPercent)) {
  // sugerir trocar pelo de maior desconto
  return { valid: false, reason: '...', suggestion: 'Você pode trocar por X (desconto maior)' };
}
```

---

## 7. Schema (input pro Backend)

```prisma
model Coupon {
  id                  String    @id @default(cuid())
  code                String    @unique
  type                String    // 'PERCENT' | 'FREE_SHIPPING'
  percentValue        Decimal?  // 0.05, 0.10, 0.15
  minSubtotal         Decimal?  @default(0)
  requiresPaymentPix  Boolean   @default(false)
  requiresCartSource  String?   // 'builder' | null
  requiresCategoryAll Json?     // ['pc_full', 'peripheral_any'] — combo
  blockOtherPercent   Boolean   @default(true)
  perUserLimit        Int?      // null = ilimitado, 1 = uma vez
  validUntil          DateTime?
  active              Boolean   @default(true)
  createdAt           DateTime  @default(now())
}

model OrderCouponUsage {
  id              String   @id @default(cuid())
  orderId         String
  couponCode      String
  userId          String?
  email           String
  appliedAt       DateTime @default(now())
  discountValueBRL Decimal
}
```

---

## 8. Seed (input pro Backend executar)

```ts
await prisma.coupon.createMany({
  data: [
    {
      code: 'BEMVINDO5', type: 'PERCENT', percentValue: 0.05,
      perUserLimit: 1, blockOtherPercent: true, active: true,
    },
    {
      code: 'PIXFIRST', type: 'PERCENT', percentValue: 0.05,
      requiresPaymentPix: true, blockOtherPercent: true, active: true,
    },
    {
      code: 'BUILDER10', type: 'PERCENT', percentValue: 0.10,
      requiresCartSource: 'builder', blockOtherPercent: true, active: true,
    },
    {
      code: 'COMBO15', type: 'PERCENT', percentValue: 0.15,
      requiresCategoryAll: ['pc_full', 'peripheral_any'],
      blockOtherPercent: true, active: true,
    },
    {
      code: 'FRETE15', type: 'FREE_SHIPPING',
      minSubtotal: 5000, blockOtherPercent: false,
      validUntil: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
      active: true,
    },
  ],
});
```

---

## 9. Métricas de sucesso (Data Analyst trackeia)

- **Taxa de uso por cupom** (% pedidos com cupom X)
- **AOV com vs sem cupom** (esperado: BUILDER10 e COMBO15 levantam AOV)
- **% pedidos Pix com PIXFIRST aplicado** (alvo: >40% Pix usa o cupom)
- **Conversão de popup BEMVINDO5** (% capturados → primeira compra) — ideal >8%
- **CAC por canal x cupom** (cruzar com `utm_source`) — qual canal traz cliente que usa cupom?

---

## 10. Cupons V2 (depois do MVP)

Pra adicionar quando faturamento estabilizar (não Sprint 1):
- `VOLTA10` — reativação de cliente inativo 90d
- `INDICA15` — programa de indicação (cliente A indica B, ambos ganham R$ 50)
- `ESTUDANTE15` — sazonal (volta às aulas Fev)
- `BLACK40`, `NATAL15`, `OUTLET40`, `GAMER20` — sazonais (ver `CALENDARIO-CAMPANHAS.md`)
