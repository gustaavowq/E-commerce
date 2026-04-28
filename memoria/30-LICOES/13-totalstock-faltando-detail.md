# 13 — `totalStock` faltando no endpoint detail = "Sem estoque" eterno

## Sintoma

PDPs sempre mostravam **"Sem estoque"** + botão "Avise-me" no lugar do
"Comprar agora", mesmo com 18 unidades em estoque no banco e
`/products?limit=N` listando estoque correto.

## Causa raiz

Endpoint `GET /products/:slug` (detalhe) NÃO retornava `totalStock` no
payload. Frontend fazia:

```tsx
const inStock = product.totalStock > 0
// → undefined > 0 = false → renderiza WaitlistButton
```

`undefined > 0` é `false` em JS. O badge "Sem estoque" aparecia 100%
das vezes. Bug pré-existente, ninguém viu porque a maioria do site
usava `/products?limit=N` (que retornava `totalStock`).

## Fix

Em `backend/src/routes/products.ts`, no endpoint `GET /:slug`, somar
variations no return:

```ts
return ok(res, {
  ...product,
  basePrice:    Number(product.basePrice),
  comparePrice: product.comparePrice ? Number(product.comparePrice) : null,
  totalStock:   product.variations.reduce((acc, v) => acc + v.stock, 0),
  variations:   product.variations.map(v => ({
    ...v,
    priceOverride: v.priceOverride ? Number(v.priceOverride) : null,
  })),
})
```

Outros endpoints (`/products`, `/products/:slug/related`) já calculavam.
Só o detail ficou sem.

## Prevenção

- **Toda response de produto** (list + detail + related + builder + by-persona)
  deve incluir os mesmos campos canônicos: `id, slug, name, basePrice,
  comparePrice, totalStock, primaryImage, hardwareCategory, brand`.
  Sem disso o frontend tem if/else por endpoint, vira bug.
- Considerar criar helper `mapProductForApi(p)` no backend que aplica
  o mesmo shape em todos endpoints. Single source of truth.
- Smoke test: pra cada endpoint que retorna produto, confirmar que tem
  `totalStock` (ou outro campo canônico esperado pelo frontend).
