# 22 — `@layer utilities` quebra quando arquivo é importado via `@import`

## Sintoma

Build Vercel falha com:
```
Syntax error: src/styles/admin-tokens.css `@layer utilities` is used
but no matching `@tailwind utilities` directive is present.
```

## Causa raiz

Tailwind processa `@layer` apenas no contexto onde `@tailwind base/components/utilities` está declarado. Quando você importa um CSS externo via `@import './admin-tokens.css';` no `globals.css`, o PostCSS/Webpack processa cada arquivo **isoladamente** — o `admin-tokens.css` perde o contexto Tailwind e o `@layer utilities {}` vira sintaxe inválida.

Importar via JS (`import '../styles/admin-tokens.css'` no layout.tsx) tem o mesmo problema — webpack pega o arquivo standalone, sem Tailwind ao redor.

## Fix

Remover o wrapper `@layer utilities { ... }` do arquivo importado. As classes funcionam plain — só ficam **depois** das utilities Tailwind no cascade (que é exatamente onde `@layer utilities` colocaria).

```css
/* ANTES — quebra: */
@layer utilities {
  .canvas-spotlight-admin { ... }
  .grid-admin { ... }
}

/* DEPOIS — funciona: */
.canvas-spotlight-admin { ... }
.grid-admin { ... }
```

## Prevenção

- **Regra geral**: arquivos CSS importados via `@import` ou JS (fora do `globals.css` principal) **não usam `@layer`**. Só plain classes.
- Se precisar de `@layer` (pra controlar specificity), cole o conteúdo direto no `globals.css` em vez de importar.
- Em design system shared entre projetos, exporta como objeto Tailwind plugin (ver `addUtilities`) em vez de arquivo CSS importado.

## Caso real

Kore Tech 2026-04-28: Designer entregou `dashboard/src/styles/admin-tokens.css` envolto em `@layer utilities {}`. Importei via JS no layout.tsx (commit 5fe3b35) e build Vercel falhou. Tentei migrar pra `@import` no globals.css (commit 1b110dc) — falhou pelo mesmo motivo. Fix definitivo (commit 778517c) removeu o wrapper.

Custo: 2 deploys quebrados, ~3min cada.
