# 11 — Backend retorna RELATIONS como objeto, não string

## Sintoma

Em produção, ao clicar em qualquer card de produto/PC, error boundary
disparava com `"Não foi possível carregar essa página"`. Tela limpa, sem
console errors visíveis pro user.

## Causa raiz

Backend Express + Prisma com `include: { category: true, persona: true }`
retorna esses campos como **OBJETO** (`{ id, slug, name, ... }`). Frontend
typings declaravam como string union (`category: ProductCategory`). JSX
fazia:

```tsx
<p>{product.category}</p>             // crash: "Objects are not valid as a React child"
{ value: product.category.toUpperCase() } // crash: ".toUpperCase is not a function"
{product.persona.replace(/-/g, ' ')}  // crash: ".replace is not a function"
```

React lança imediato → error.tsx fires → tela genérica de erro.

## Fix

1. **Types do frontend** alinham com shape real do backend:
```ts
export type CategoryRef = { id: string; slug: string; name: string }
export type PersonaRef  = { id: string; slug: string; name: string; headline?: string; iconEmoji?: string }

export type ProductDetail = {
  hardwareCategory: ProductCategory  // string canônica (cpu, gpu, ...)
  category?: CategoryRef              // objeto opcional pra `.name` legível
  personaSlug: string | null          // string pra URLs
  persona?: PersonaRef | null         // objeto opcional pra `.name`
  // ...
}
```

2. **JSX** usa string canônica direto:
```tsx
<p>{product.hardwareCategory.toUpperCase()}</p>
<Link href={`/builds/${product.personaSlug}`}>
  {product.persona?.name ?? product.personaSlug.replace(/-/g, ' ')}
</Link>
```

3. **Construções manuais** (FavoritosClient.mapWishlistToCard, BuilderClient
   pickPart) usam `personaSlug` / `hardwareCategory`, nunca os objetos.

## Prevenção

- **SEMPRE validar shape do backend ANTES de declarar type** (smoke test
  1 chamada via curl/PowerShell, comparar JSON real vs `*.d.ts`).
- Convenção do framework: campo string canônica (`hardwareCategory`,
  `personaSlug`) + objeto opcional (`category?`, `persona?`). Use string
  pra render, objeto só pra `.name` legível.
- Erro `Objects are not valid as a React child` é SEMPRE esse padrão —
  procurar `<X>{obj}</X>` e trocar por `{obj.label}`.

## Custo

Várias rodadas de "Não foi possível carregar" no Kore Tech até identificar.
Bug aparecia em 3 lugares (`category`, `persona`, `buildParts.category`)
porque o mesmo padrão se repetia.

## Ver também

- [[12-hardware-category-vs-slug]] — distinção técnica vs humana
- [[20-validar-shape-backend]] — processo geral
