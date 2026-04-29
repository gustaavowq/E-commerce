# Padrão — Seed demo completo (catálogo respira)

> Aprovado pelo Gustavo após bug recorrente: produtos seedados sem foto/estoque/preço/specs viram "catálogo morto".

## Princípio

> **Demo é prova viva, não placeholder.** Se o cliente abre o site e vê 80% dos produtos com "Sem estoque" ou foto quebrada, ele não acredita no resto.

## Regra dura

Todo produto seedado tem **TODOS** os 5 pilares preenchidos:

| Pilar | Mínimo aceitável |
|---|---|
| **Foto real** | 1+ imagem por produto, URL válida (Cloudinary ou file local). Zero `placehold.co`. |
| **Estoque** | ≥ 12 unidades em pelo menos 1 variação (se tem variação). Sem estoque = produto invisível. |
| **Preço + desconto** | `price` e (opcional) `compareAtPrice` realistas. |
| **Specs/descrição** | descrição com 2+ frases ou bullets. Não "Lorem ipsum". |
| **Categoria + tags** | mínimo 1 categoria. Tags melhoram filtro/SEO. |

## Como aplicar no `prisma/seed.ts`

```ts
const products = [
  {
    slug: 'polo-lacoste-vermelha',
    name: 'Polo Lacoste Vermelha',
    price: 24900,
    compareAtPrice: 32900,
    description: 'Polo Lacoste original em algodão pima, costura reforçada, fit clássico. Disponível P, M, G, GG.',
    images: [
      'https://res.cloudinary.com/.../polo-lacoste-front.jpg',
      'https://res.cloudinary.com/.../polo-lacoste-back.jpg',
    ],
    category: { connect: { slug: 'polos' } },
    variations: {
      create: [
        { color: 'Vermelha', size: 'P', stock: 14, sku: 'POLO-LAC-VER-P' },
        { color: 'Vermelha', size: 'M', stock: 18, sku: 'POLO-LAC-VER-M' },
        { color: 'Vermelha', size: 'G', stock: 12, sku: 'POLO-LAC-VER-G' },
      ],
    },
    tags: { connect: [{ slug: 'lacoste' }, { slug: 'polo' }, { slug: 'masculino' }] },
  },
  // ... outros produtos com mesmo nível de detalhe
]
```

## Idempotência (não esquecer — ver [[../30-LICOES/18-seed-imagens-upsert]])

Seed roda múltiplas vezes (dev, deploy, redeploy). Sempre `upsert`, não `create`:

```ts
for (const p of products) {
  await prisma.product.upsert({
    where: { slug: p.slug },
    create: { ...p },
    update: {
      name: p.name,
      price: p.price,
      description: p.description,
      images: p.images,        // sobrescrever, NÃO ignorar
      // variations: precisa deleteMany + create (Prisma quirk)
    },
  })
}
```

## Auditoria pré-deploy

Rodar antes de declarar seed pronto:

- [ ] `SELECT count(*) FROM products` → ≥ 24 produtos (catálogo respira).
- [ ] `SELECT count(*) FROM products WHERE images IS NULL OR array_length(images, 1) = 0` → **0**.
- [ ] `SELECT count(*) FROM products WHERE NOT EXISTS (SELECT 1 FROM variations WHERE product_id = products.id AND stock > 0)` → **0** (todo produto tem ao menos 1 variação com estoque).
- [ ] `SELECT count(*) FROM products WHERE description IS NULL OR length(description) < 30` → **0**.
- [ ] Abrir loja em prod, scrollar 30s. Quantos "Sem estoque" aparecem? Se >10%, seed falhou.

## Quando o cliente quer 200+ produtos rápido

- Seed manual com 24 cuidadosos (referência de qualidade).
- Resto pode vir de scraping (Insta da própria marca) ou ChatGPT gerando descrição com base no nome — DESDE QUE valide o resultado humanamente.
- Nunca "vou seedar 200 produtos com foto de placeholder pra mostrar". Mostre 24 reais.

## Lições relacionadas

- [[../30-LICOES/18-seed-imagens-upsert]] — upsert idempotente.
- [[seed-imagens-upsert]] — padrão de upsert.
- [[../30-LICOES/13-totalstock-faltando-detail]] — caso real "Sem estoque" em massa.
- `feedback_demo_first_seed_completo.md` (auto-memória).
