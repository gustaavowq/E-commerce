# Padrão: seed idempotente com upsert real (não create-if-missing)

> Aprovado após [[../30-LICOES/18-seed-imagens-upsert]] no Kore Tech.

## Princípio

Seed deve ser **idempotente E refletir mudanças**. Toda re-rodada (no
boot do Railway via `startCommand`, ou em `railway run`) deve aplicar
o estado declarado em código.

## Anti-padrão

```ts
// ❌ Cria se não existe, ignora se existe — perde mudanças em re-runs
const existingImage = await prisma.productImage.findFirst({
  where: { productId: product.id, isPrimary: true },
})
if (!existingImage) {
  await prisma.productImage.create({ data: { url: imageUrl, ... } })
}
```

Resultado: troquei URL no `seed.ts`, redeployei → DB ainda com URL
antiga porque a primeira rodada já criou e a checagem `if
(!existingImage)` é eternamente true.

## Padrão correto

```ts
// ✅ Cria se não existe, atualiza se diverge, no-op se igual
const existingImage = await prisma.productImage.findFirst({
  where: { productId: product.id, isPrimary: true },
})
if (existingImage) {
  if (existingImage.url !== imageUrl || existingImage.alt !== input.name) {
    await prisma.productImage.update({
      where: { id: existingImage.id },
      data:  { url: imageUrl, alt: input.name },
    })
  }
} else {
  await prisma.productImage.create({
    data: { productId: product.id, url: imageUrl, alt: input.name,
            isPrimary: true, sortOrder: 0 },
  })
}
```

Comparação antes do update evita write desnecessário e churn de log.

## Aplicar em todo relacionado

Não é só imagem. Toda entidade relacionada que pode mudar declarativamente
no seed deve seguir o mesmo padrão:

- `productImage` (URL Unsplash, alt)
- `productVariation` (size, color, stock — Prisma `upsert` direto via
  unique key `sku` resolve)
- `productTag`, `productTranslation` (se tiver)
- `coupon` (Prisma `upsert` por `code`)

Pra entidade principal, `prisma.X.upsert({ where, create, update })` é
trivial. Pra relacionados sem unique constraint composto, fazer
findFirst + create OR update.

## Demo-first stock

Pra simulação de loja em produção (ver [[demo-first-seed-completo]]),
forçar estoque mínimo nas variations:

```ts
const demoStock = Math.max(v.stock, 12)
await prisma.productVariation.upsert({
  where:  { sku: v.sku },
  create: { ..., stock: demoStock },
  update: { ..., stock: demoStock },
})
```

Em produção real, voltar pra `v.stock` direto.

## Validação

Rodar seed 2x localmente, comparar dump do DB:
```sh
pg_dump -t product_images -t product_variations $DEV_DB > before.sql
npx tsx prisma/seed.ts
pg_dump -t product_images -t product_variations $DEV_DB > after.sql
diff before.sql after.sql  # deve ser vazio se nada mudou no seed.ts
```
