# 🚨 #04 `prisma db seed` no startCommand sobrescreve edições do admin

## Sintoma (latente)

Admin mexe no painel, muda preço da Polo Lacoste de R$ 269,90 pra R$ 299,90. 3 dias depois, qualquer redeploy (mexer em env, commit qualquer coisa) volta o preço pra R$ 269,90 sem aviso.

## Causa raiz

Pra rodar o seed na primeira vez sem Railway CLI, colocamos no startCommand:
```
sh -c 'npx prisma migrate deploy && npx prisma db seed && node dist/index.js'
```

O seed usa `upsert` por slug, com bloco `update` que sobrescreve campos editáveis (name, description, basePrice, comparePrice, isFeatured). Logo:
- Produtos novos criados pelo admin (slug que não está no seed) → safe
- Os 7 produtos hardcoded (que estão no `seed.ts`) → rebatidos a cada deploy

```ts
// projetos/miami-store/backend/prisma/seed.ts:251
prisma.product.upsert({
  where: { slug: p.slug },
  update: {                  // ← isso roda em todo deploy
    name: p.name,
    basePrice: p.basePrice,  // sobrescreve edição do admin
    ...
  },
  create: { ... },
})
```

## Fix aplicado

1. **Tirar seed do startCommand** depois da primeira execução:
   ```json
   // projetos/miami-store/backend/railway.json
   "startCommand": "sh -c 'npx prisma migrate deploy && node dist/index.js'"
   ```

2. Pra rodar seed depois (quando precisar), 3 opções:
   - Railway CLI: `railway run npx prisma db seed`
   - Web Terminal Railway (planos pagos)
   - Reincluir `&& npx prisma db seed &&` temporariamente, deploy, e remover

## Prevenção

- ✅ Documentar isso no `railway.json` com comentário visível
- ✅ Seed feito pra ser executado UMA vez, idempotente, mas com `update` mínimo (só campos imutáveis tipo `slug`, `brandId`, `categoryId`)
- ✅ Considerar usar `Object.fromEntries` pra incluir só campos seguros no `update`:
  ```ts
  update: { name: p.name, isActive: true }   // não incluir preço/descrição
  ```
- ✅ Em vez disso, criar um endpoint admin "Reseed catálogo" que o operador chama manualmente quando quer
