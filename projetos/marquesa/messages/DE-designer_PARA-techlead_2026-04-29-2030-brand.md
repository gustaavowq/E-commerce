# Brand system Marquesa — entregue

**De:** Designer
**Para:** Tech-Lead (cc Frontend, Copywriter)
**Data:** 2026-04-29 20:30

## Entregas

- `projetos/marquesa/brand-brief.md` — manifesto, paleta completa Tier 1/2, tipografia com escala clamp(), espaçamento canônico (4-8-12-16-24-32-48-64-96-128), animação tokenizada, voz da marca com do/don't, especs em palavras de 11 componentes (botões, card, hero, galeria PDP, ficha técnica, mapa, filtros, footer).
- `projetos/marquesa/design/tokens.css` — Tier 1 (primitives) + Tier 2 (semantic) em `:root` + `prefers-reduced-motion` + `.tnum`. Frontend importa este arquivo no topo de `globals.css`.
- `projetos/marquesa/design/tailwind-extend.json` — bloco `theme.extend` para colar em `tailwind.config.ts` do frontend. Cores resolvem por CSS var, então tema é trocável sem mexer em JSX.

## Decisões que travei

- **Paleta monocromática preto/off-white** com **único acento verde-musgo** (`#4A5D4F`). Sem segunda cor de marca. Status `DISPONIVEL` usa `moss-pale` (não verde forte), `VENDIDO` usa `ink` em alto contraste, `RESERVADO`/`INATIVO` ficam discretos.
- **Cantos vivos** (`radius-0`) em cards, botões e inputs grandes. Excepcionalmente 4px em badges de status. `rounded-full` só em avatar humano. Boutique séria, sem cara de SaaS.
- **Sem sombra em cards** (Marquesa é flat editorial). Sombra só em modal.
- **Display: Cormorant Garamond** (free Google Font) como fallback de **Canela** para o MVP. Body: **Inter** como fallback de **Söhne**. Pesos enxutos (Light 300, Regular 400, Medium 500). Numerais tabulares obrigatórios em preço/área/dorms via `font-feature-settings: 'tnum'`.
- **Animação:** scroll-reveal `fade-up` 700ms com easing `cubic-bezier(0.16,1,0.3,1)`, run-once. Hover de card é só `scale(1.03)` na imagem em 400ms — texto não move, sombra não cresce. Anti-padrões reforçados (cursor glow, scroll-jacking, `scroll-behavior: smooth` global, parallax) ficaram catalogados em §11 do brief.
- **Hero**: foto full-bleed 80vh + overlay `ink/20%` + título serif Light + scroll cue pulsante (única animação cíclica permitida na home). Sem vídeo no MVP.

## Onde Frontend busca

1. Importa `../../design/tokens.css` no topo de `frontend/src/app/globals.css` (antes de `@tailwind base`).
2. Cola o JSON de `design/tailwind-extend.json` dentro de `theme.extend` do `tailwind.config.ts`. Os helpers de pill por status estão no objeto `_status_pill_helper` do JSON (referência, não input do Tailwind).
3. Configura `next/font/google` com `Cormorant_Garamond` (300, 400, 500) e `Inter` (400, 500, 600), expondo em `--font-display` e `--font-sans`. As CSS vars já estão referenciadas em `tokens.css`.

## Atenção

- **Licença de fonte:** Canela (Commercial Type) e Söhne (Klim) são **pagas**. MVP roda com Cormorant Garamond + Inter (free). Antes do go-live em produção comercial real, cliente precisa licenciar Canela e Söhne — só trocar o valor das CSS vars `--font-display` e `--font-sans`, sem mais nada no código. Documentei na §4 do brief.
- **Voz da marca:** §8 do brief tem palavras vetadas (`incrível`, `imperdível`, `dos sonhos` etc.) e CTA aprovados (`Reservar com sinal`, `Agendar visita`, `Catálogo`). Copywriter, este é o seu chão.
- **Travessão (`—`) proibido em UI/copy** — alinhei com a memória do Gustavo. Substituir por vírgula ou frase curta.
- **Anti-padrões de animação:** §11 lista cursor glow, scroll-jacking, parallax global e `scroll-behavior: smooth` em html/body como vedados. Frontend, validar antes de mergear.
- **Pop-up de cookies LGPD:** barra discreta na base, dispensável com um clique. Nunca cobrir CTA.

Próximo bloco depende de Frontend e Copywriter — fico disponível para ajustar tokens se algum componente exigir.
