# 21 — Truncate / text-ellipsis precisa de elemento block

## Sintoma

Texto dinâmico longo (nome de produto, título, descrição) **estoura
o slot/card** mesmo com classe `truncate` aplicada. Os 3 pontinhos
`…` simplesmente não aparecem. Layout empurrado pra direita,
sidebar quebra, cards ficam desalinhados.

Caso real (Kore Tech, BuilderCategoryPicker):
- Sidebar com slots de altura fixa `h-14`
- Produto selecionado: "Kingston Fury Renegade DDR5 32GB (2x16GB) 7200MHz CL38"
- Esperado: nome cortado com `…` no fim
- Real: slot estourava lateralmente, empurrando o conteúdo central

## Causa raiz

`truncate` no Tailwind = `overflow: hidden; text-overflow: ellipsis;
white-space: nowrap`. Pra `text-overflow: ellipsis` renderizar, o
elemento precisa ter:

1. `display: block` ou `inline-block`
2. **largura computada** (não `width: auto`)

`<span>` (e `<motion.span>`, `<a>`, etc) é `display: inline` por
padrão. Inline ignora `overflow: hidden` e `text-overflow`. Então
mesmo com a classe aplicada, o ellipsis **silenciosamente não funciona**.

## Receita que funciona

```tsx
{/* Parent: flex container que define o limite de largura */}
<div className="flex min-w-0 flex-1 overflow-hidden">
  {/* Child: BLOCK com width computada do parent flex */}
  <div className="w-full max-w-full overflow-hidden text-ellipsis whitespace-nowrap">
    {nomeProdutoLongoQuePodeEstourar}
  </div>
</div>
```

Pontos críticos:
- Parent precisa de `min-w-0` (default flex é `min-width: auto` que ignora overflow)
- Child precisa ser `div`/`block`, **não span**
- Child precisa de `w-full` ou `max-w-full` pra ter largura computada

## Anti-padrão

```tsx
{/* QUEBRA — span é inline, ellipsis silenciosamente ignorado */}
<motion.span className="truncate">{nomeLongo}</motion.span>

{/* QUEBRA — sem min-w-0 no parent flex */}
<div className="flex">
  <div className="truncate">{nomeLongo}</div>
</div>

{/* QUEBRA — sem largura computada */}
<div className="inline-block truncate">{nomeLongo}</div>
```

## Como pegar antes de subir

1. Antes de commit em componente que renderiza texto dinâmico, mentalmente
   passar **o nome mais longo possível** pelo componente.
2. Se a resposta exige raciocínio sobre display semantics, abrir devtools
   (ou rodar local) e validar com olho.
3. Em PR/commit message de fix de overflow, citar o caso testado:
   "validado com 'Kingston Fury Renegade DDR5 32GB (2x16GB) 7200MHz CL38'"

## Lição mais geral

Bug visual = obrigatório conferir visualmente antes do "está resolvido".
Não declarar fix de UI/CSS fechado só com base em "o código parece certo".
Ver [[../50-PADROES/validar-visual-antes-de-fechar]].
