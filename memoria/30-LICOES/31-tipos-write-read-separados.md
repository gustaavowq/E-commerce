# Lição 31 — Tipos Write ≠ Read em CRUD (sempre separar)

> Custo de descoberta: **ALTO** — combinação com [[26-dados-invalidos-silencioso]] = bugs silenciosos no admin que custam horas.

## Sintoma

- Painel admin: editar produto → "Dados inválidos" sem detalhe.
- Console: zero erro útil.
- Backend Zod: `productUpdateSchema.parse(req.body)` retorna `ZodError` com `formErrors` que o middleware ignora.

## Causa raiz

Frontend tenta usar `Partial<ProductDetail>` como payload de PATCH. Mas `ProductDetail` (shape de leitura) e `ProductWritePayload` (shape de escrita) divergem:

```ts
// ProductDetail (vem do GET)
{
  id: string,
  slug: string,
  category: { id, slug, name },         // OBJETO
  variations: [{ id, color, stock }],   // OBJETOS
  images: ['url1', 'url2'],             // strings
  totalStock: 18,                       // computed
}

// ProductWritePayload (espera no POST/PATCH)
{
  slug: string,
  categoryId: string,                   // ID, não objeto
  variations: [{ color, stock }],       // sem id (cria novo)
  imageUrls: ['url1', 'url2'],          // nome de campo diferente
  // sem totalStock (computed, não edita)
}
```

Frontend manda `category: {id, slug, name}` (vindo do GET) e Zod rejeita silenciosamente.

## Regra

**Sempre** criar 2 tipos distintos:

```ts
// types/product.ts
export type ProductDetail = {
  id: string
  slug: string
  category: { id: string, slug: string, name: string }
  variations: Array<{ id: string, color: string, stock: number }>
  images: string[]
  totalStock: number
  createdAt: string
}

export type ProductWritePayload = {
  slug: string
  categoryId: string
  variations: Array<{ color: string, stock: number }>
  imageUrls: string[]
  // sem id, sem totalStock, sem createdAt
}
```

E **nunca** usar `Partial<ProductDetail>` em PATCH:

```ts
// ❌ ERRADO
await api.patch<ProductDetail>(`/admin/products/${id}`, partialDetail)

// ✅ CERTO
await api.patch<ProductDetail, ProductWritePayload>(`/admin/products/${id}`, writePayload)
```

## Conversão Detail → WritePayload

Em formulários de edição, converter explicitamente ao carregar:

```ts
function detailToWritePayload(d: ProductDetail): ProductWritePayload {
  return {
    slug: d.slug,
    categoryId: d.category.id,
    variations: d.variations.map(v => ({ color: v.color, stock: v.stock })),
    imageUrls: d.images,
  }
}
```

## Prevenção

- [ ] **Toda entidade no backend** que aceita criação/edição: criar `XxxWritePayload` em `types/`.
- [ ] **Schema Zod** valida `XxxWritePayload`, NÃO `Partial<XxxDetail>`.
- [ ] **Form admin** usa explicit converter `detailToWritePayload(detail)` no `defaultValues`.
- [ ] **Smoke test**: editar UM campo de cada entidade e ver `200 OK`. Se retornar `422 Dados inválidos`, parar e revisar shapes.

## Lições relacionadas

- [[26-dados-invalidos-silencioso]] — caso fundador, mostra como o erro é invisível.
- [[20-validar-shape-backend]] — meta sobre validar shape antes de tipar.
