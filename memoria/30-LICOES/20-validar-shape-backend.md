# 20 — Validar shape do backend ANTES de tipar/usar no frontend

## Sintoma (síndrome geral)

Vários bugs do Kore Tech compartilham a mesma raiz: TypeScript types
do frontend foram **escritos a olho**, sem confirmar shape real do
backend. Quando endpoint retorna formato diferente, runtime crasha.

Casos:
- [[11-backend-relations-objeto]] — `category` declarado como string,
  veio objeto Prisma → React crash
- [[12-hardware-category-vs-slug]] — assumi que `category=cpu`
  filtrava, na verdade era `hardwareCategory=cpu` → builder vazio
- [[13-totalstock-faltando-detail]] — `totalStock` declarado no type
  mas backend não retornava em todo endpoint → "Sem estoque" eterno

## Princípio

> "Type não é prova. É promessa. Promessa não vale nada se o backend
> não cumpriu."

Em TypeScript, declarar `category: string` não impede o backend de
retornar `{ id, slug, name }`. Só impede TS de reclamar no compile.
Runtime crasha do mesmo jeito.

## Processo obrigatório pra novo serviço

Antes de criar/atualizar `services/X.ts`:

1. **Curl o endpoint real**:
   ```sh
   curl https://<backend>/products/<slug> | jq
   ```
2. **Cole o JSON num comentário acima do type** (ou em
   `projetos/[slug]/api-shapes/[endpoint].json`):
   ```ts
   // Shape retornado por GET /products/:slug (validado 2026-04-28):
   // { id: string, slug: string, category: { id, slug, name },
   //   persona: { id, slug, name, headline, iconEmoji } | null,
   //   variations: Array<{ size: string, color?: string, ... }>, ... }
   export type ProductDetail = { ... }
   ```
3. **Tipar conforme o JSON real**, não o que parece intuitivo

## Convenções aprendidas (Kore Tech)

- Quando backend usa Prisma `include: { X: true }`, X vem como
  **objeto** `{ id, slug, name }`. Não tente tipar como string.
- Pra ter string canônica também (URL, badge), criar campo separado no
  schema (`hardwareCategory`, `personaSlug`) e expor SEMPRE no payload.
- Frontend: usar string canônica em JSX (`product.hardwareCategory`),
  objeto opcional pra `.name` legível (`product.category?.name`).

## Automação futura (TODO)

Criar `scripts/snapshot-api-shapes.ts` que bate em todos os endpoints
do backend e gera `*.d.ts` automaticamente. Elimina classe inteira
de bugs.

## Prevenção

- Tipo é **derivado** do shape real, não do que parece intuitivo
- Em pull request com novo endpoint, exigir o smoke-test JSON no PR
- Em todo turno de iteração em projeto existente, rodar bug-bash em
  produção primeiro (ver [[../10-PLAYBOOKS/bug-bash-ux]]) — testes
  pegam mismatches que TS não pega
