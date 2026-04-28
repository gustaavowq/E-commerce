# 12 — `hardwareCategory` (string) vs `category.slug` (slug humano)

## Sintoma

Página `/montar` (PC Builder) mostrava **"Sem produtos cadastrados nessa
categoria"** em TODAS as 8 categorias (CPU, GPU, mobo, RAM, storage,
psu, case, cooler), mesmo com 50+ produtos no banco.

## Causa raiz

Frontend chamava:
```ts
listByCategory(slotToCategory('cpu'), 24)
// → GET /products?category=cpu&limit=24
```

Backend processava:
```ts
const categorySlugs = csvList(q.categories) ?? (q.category ? [q.category] : undefined)
if (categorySlugs) where.category = { slug: { in: categorySlugs } }
```

Ou seja, filtra pela `Category.slug` (entidade do schema). Mas no
`seed.ts` os slugs estão em **PT humano**: `processadores`,
`placas-de-video`, `memoria-ram`, `armazenamento`, `gabinetes`. Nunca
`cpu`/`gpu`.

`cpu`, `gpu` etc são valores do campo **`hardwareCategory`** —
classificação técnica separada da `Category` navegável.

## Fix

Nova função `listByHardwareCategory` em `services/products.ts`:

```ts
export async function listByHardwareCategory(
  hardwareCategory: string,
  limit = 24,
  extra: Partial<ProductListQuery> = {},
) {
  return apiList<ProductListItem[]>('/products', {
    params: { hardwareCategory, limit, inStock: true, ...extra },
  })
}
```

Builder usa essa em vez de `listByCategory`.

## Distinção canônica

| Campo | Tipo | Uso | Exemplo |
|---|---|---|---|
| `hardwareCategory` | string union técnica | Builder, filtros técnicos, lógica de compatibilidade | `cpu`, `gpu`, `mobo`, `ram`, `storage`, `psu`, `case`, `cooler` |
| `category` (objeto Prisma) | `{ id, slug, name }` | Navegação humana, breadcrumb, SEO | `{ slug: 'processadores', name: 'Processadores' }` |
| `category.slug` | string PT | URL `/produtos?category=processadores` | `processadores` |

**Regra**: filtros técnicos (builder, compat) → `hardwareCategory`.
Navegação humana (URL, breadcrumb) → `category.slug`.

## Prevenção

- Em todo novo schema com double-classification (técnico + humano),
  documentar essa distinção no próprio types.ts com comentário.
- Em endpoints de listagem, nomes de query param refletem o campo do
  banco (`hardwareCategory=cpu` ou `category=processadores`), nunca
  misturar.
- Antes de marcar funcionalidade do builder como pronta, smoke test
  cada slot e confirmar que retorna >0 produtos.
