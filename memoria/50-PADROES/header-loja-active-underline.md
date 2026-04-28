# Header da loja — active underline animada

## Princípio

> "Active state via tipografia (semibold/bold) cria peso visual inconsistente
> entre rotas. Active via underline + glow é uniforme E elegante."

Aprovado em 2026-04-28 (commits `c8878d6` + `cccc8d5`). Padrão pra todo
header de e-commerce do framework.

## Anti-padrão (NÃO faça)

```tsx
// Active state via peso — DESALINHA visualmente entre rotas
className={cn(
  isActive ? 'text-primary font-semibold'  // ← peso muda
    : isHighlight ? 'text-primary font-semibold hover:text-primary-hover'
    : 'text-text-secondary hover:text-text',
)}
```

Por quê é ruim: em rotas diferentes, items diferentes ficam semibold. Em /
só "Início" + "Monte seu PC"; em /montar só "Monte seu PC"; em /sobre só
"Sobre" + "Monte seu PC". Resultado: header parece "respirar" toda vez
que troca de página, sensação de instabilidade visual.

## Padrão (faça assim)

```tsx
import { motion } from 'framer-motion'

<nav className="flex items-center gap-0.5 text-sm font-medium">
  {NAV.map((it) => {
    const active = isActive(it.href)
    return (
      <Link
        key={it.href}
        href={it.href}
        className={cn(
          'relative inline-flex items-center px-3 py-2 transition-colors',
          active ? 'text-text'
            : isHighlight ? 'text-primary hover:text-primary-hover'
            : 'text-text-secondary hover:text-text',
        )}
      >
        {it.label}
        {active && (
          <motion.span
            layoutId="header-nav-active"
            className="absolute inset-x-3 -bottom-px h-px bg-primary"
            style={{ boxShadow: '0 0 8px rgb(0 229 255 / 0.6)' }}
            transition={{ type: 'spring', stiffness: 380, damping: 32 }}
          />
        )}
      </Link>
    )
  })}
</nav>
```

## Princípios da implementação

1. **Peso uniforme** em todos os items (`font-medium`). Dropdown e link
   regular têm o mesmo peso. Active não muda peso, muda só cor pra `text-text`.
2. **Active indicator separado** via `motion.span` com `layoutId` —
   1 instância por nav, framer-motion automaticamente desliza entre
   posições quando muda rota. Spring 380/32 (snappy, não bouncy demais).
3. **Glow sutil** via `boxShadow: 0 0 8px rgb(0 229 255 / 0.6)` no underline
   — dá personalidade sem peso visual extra.
4. **Highlight item** ("Monte seu PC") mantém só `text-primary`. NÃO usar
   bg/border/font-bold (vira box quadrado feio que sai do alinhamento).

## Logo (wordmark)

Refinar de `font-black uppercase` (peso 900) pra `font-bold tracking-tight`
(peso 700, lowercase). Wordmark composto sem espaço:

```tsx
// Antes:
<span className="text-sm font-black uppercase sm:text-base">
  Kore<span className="text-primary"> Tech</span>
</span>

// Depois:
<span className="text-sm font-bold tracking-tight sm:text-base">
  Kore<span className="text-primary">Tech</span>
</span>
```

font-black é peso brutal; quando nav é font-medium, contraste fica
desconfortável. font-bold harmoniza.

## SearchBar trigger e modal

- Trigger: `md:w-[260px] lg:w-[320px]` (botão visível com placeholder + ⌘K)
- Modal: `max-w-3xl` (768px) — não 2xl, não 4xl
- Input dentro do modal: `text-lg sm:text-xl px-6 py-5 gap-4`, ícone lupa `h-6 w-6`

Sensação tipo Cmd+K do Linear/Vercel. Hierarquia clara entre input grande
e listas de resultados abaixo (text-sm).

## Padrões relacionados
- [[design-dark-cinematografico]] — paleta + hero
- [[depth-pack-cinematic]] — camadas de fundo
