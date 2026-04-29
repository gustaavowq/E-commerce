# Lição 27 — `scroll-behavior: smooth` mata UX em mouse de roda

**Data:** 2026-04-28
**Projeto:** Kore Tech (loja)
**Sintoma:** Gustavo: "o scroll do mouse tá horrível em outros PCs, não sei pq no meu tá normal mas nos outros horrível"

## A armadilha

`html { scroll-behavior: smooth; }` parece inofensivo — só "deixa scroll mais suave". Na prática, faz com que o navegador **interpole programaticamente** cada delta de scroll que chega.

- **Trackpad / Magic Mouse / MX Master (modo livre):** scroll já é contínuo nativamente, com deltas pequenos e contínuos. O browser reconhece como "user-driven smooth" e ignora a regra. Sensação: ótima.
- **Mouse de roda comum (Logitech B100, mouse de notebook, etc):** roda dispara tics discretos de ~100px. Cada tic vira uma animação JS de ~300ms interpolando. Sensação: cremoso, com lag, "atrasado", "horrível".

Resultado: quem desenvolve em Mac/notebook gamer não vê o problema. Quem usa o site em PC com mouse comum sente que o scroll é ruim — sem saber explicar por quê.

## Sintoma diagnóstico

- "Scroll bom no meu PC, ruim em outros."
- Diferença sumindo quando user troca o mouse pra um trackpad ou MX Master.
- Devtools Performance mostra long animation frames de scroll mesmo sem JS rodando.

## Fix

Remover `scroll-behavior: smooth` do `html` global. Manter apenas em casos pontuais via JS:

```js
element.scrollIntoView({ behavior: 'smooth' })
```

Esse uso é OK porque é one-shot, não é interpretado a cada tic da rodinha.

## Onde aplica

**Em todo CSS global de qualquer projeto Next.js / React do framework.** Não usar `scroll-behavior: smooth` em `html`, `body`, ou `*`. Especialmente perigoso em sites com animações pesadas (depth-pack-cinematic, paralax, aurora drift) — combinação com mouse de roda discreta vira intolerável.

## Padrão pro depth-pack

Atualizar `memoria/50-PADROES/depth-pack-cinematic.md` com aviso: o pacote depth+aurora roda em loop, qualquer scroll-jacking adicional (smooth, parallax forçado, scroll-snap) compõe negativamente em GPU integrada + mouse comum. Animação de fundo OK; interpolação de scroll input NÃO.

## Commit

`a80372a` — `fix(loja): remove scroll-behavior smooth — scroll cremoso em mouse de roda`

## Conexão com regras existentes

- `feedback_animacoes_invasivas_proibidas.md` — scroll-jacking já estava na lista de "proibido". `scroll-behavior: smooth` é a forma mais sutil e mais comum de fazer scroll-jacking sem perceber.
- Próximo projeto: `ecommerce-frontend` deve nascer com `globals.css` SEM `scroll-behavior: smooth`.
