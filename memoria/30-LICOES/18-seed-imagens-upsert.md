# 18 — Seed `if (!existingImage)` ignora trocas de URL em re-runs

## Sintoma

Substituí placeholders Cloudinary `demo` por URLs Unsplash reais no
`seed.ts`. Após redeploy do Railway (que roda `npx tsx prisma/seed.ts`
no startCommand), as imagens **continuaram Cloudinary placeholder no
DB**. URL nova só seria aplicada se DB fosse zerado primeiro.

## Causa raiz

`upsertProduct` em `seed.ts` fazia upsert do produto, mas pra imagem
primária só **criava se não existisse**:

```ts
if (!existingImage) {
  await prisma.productImage.create({ data: { url: imageUrl, ... } })
}
// se existe: NO-OP, ignora a nova URL silenciosamente
```

Re-runs do seed: produto já existia → existingImage existia → URL
nova ignorada.

## Fix

Comportamento de upsert real (atualizar URL/alt se diverge):

```ts
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

Compara antes de update pra evitar churn de log + write desnecessário.

## Prevenção

- **Seed deve ser idempotente E refletir mudanças**. `upsert` no
  registro principal + `upsert` (compare + update) nos relacionados
  (imagens, variations, traduções).
- Pra "demo-first" garantir que toda mudança no `seed.ts` (URL nova,
  preço novo, stock) chega em produção sem precisar zerar DB.
- Validação: rodar seed 2x localmente, dump do DB antes/depois — não
  deve haver diff exceto nos campos que mudei intencionalmente.

## Ver também

- [[24-demo-first-seed-completo]] — política de "produção parece loja real"
