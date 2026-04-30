# Brand Brief — Marquesa

> Identidade visual e linguagem da Marquesa, imobiliária boutique alto-padrão. Documento de referência fonte-única para Frontend, Copywriter e demais agentes. Decisões já travadas em `DECISOES-ESPECIFICAS.md` foram refinadas e operacionalizadas aqui.

Versão 1.0 — 2026-04-29. Owner: Designer. Inspirações canônicas: Compass (EUA), Lionard (Itália), Quintela+Penalva (Portugal), Bossa Nova Sotheby's (BR).

---

## 1. Manifesto

A Marquesa não vende metro quadrado. Cura endereço. Cada imóvel no nosso catálogo passou pelo mesmo crivo: arquitetura que envelhece bem, bairro que valoriza no silêncio, vizinhança que se reconhece. Nosso trabalho é apresentar bem, explicar com precisão e respeitar o tempo de quem decide. Sem pressa fingida, sem ostentação, sem floreio. Boutique não é tamanho do escritório, é critério de seleção.

---

## 2. Direção do logo (descrição, não desenho)

Designer recomenda exploração em duas peças que viajam juntas:

1. **Monograma "M"** — capitular geométrica desenhada sobre uma grade de proporção áurea. Hastes finas (stroke entre 6 e 8% da altura), terminações vivas (sem serifa), simetria perfeita. Funciona em badge favicon 32px e em selo de envelope 80mm. Gravado em ink (`#0A0A0A`) ou estampado em paper (`#FAFAF7`). Nunca colorido em moss.
2. **Wordmark "MARQUESA"** — composto em serif editorial single-weight (Cormorant Garamond Medium ou Canela Light), tracking generoso (≈ 0.16em), all-caps. Letra "Q" com cauda longa funciona como assinatura discreta. Wordmark vem sempre acompanhado do monograma à esquerda em peças horizontais; em peças verticais (story, badge), monograma fica acima.

Conceitos que devem ler na peça final, em ordem: **continência** (a curva fechada do M acolhe), **rigor** (proporções matemáticas), **silêncio** (nada sobra). Conceitos vetados: brilho, gradiente, ornamento, fonte caligráfica, jacarés, casinhas, chaves.

---

## 3. Paleta completa

Monocromática preto/off-white com acento único verde-musgo. Sem cor decorativa. Sem segunda cor de marca.

### Tier 1 — primitives

| Token | Hex | Uso primário |
|---|---|---|
| `--ink` | `#0A0A0A` | Texto principal, títulos, ícones em surfaces claras, status `VENDIDO` |
| `--ink-soft` | `#1A1A1A` | Hover de elementos `ink`, sombra densa |
| `--paper` | `#FAFAF7` | Background principal de toda página pública |
| `--paper-warm` | `#F4F1EA` | Section break, surface elevada em modais, hover de cards em `paper` |
| `--graphite` | `#1F1F1F` | Surface elevada em contexto escuro (header reverso, footer denso) |
| `--ash` | `#6B6B6B` | Texto secundário, metadados (bairro, área, ano), status `RESERVADO` |
| `--ash-soft` | `#9A9A9A` | Texto desabilitado, placeholder, ícones inativos |
| `--bone` | `#E8E4DD` | Divisores, borders padrão, separadores de ficha técnica |
| `--bone-soft` | `#EFEBE3` | Borders sutis em hover, fill de inputs neutros |
| `--moss` | `#4A5D4F` | Acento único — CTAs primários, links, focus rings, badge `DISPONIVEL` em texto |
| `--moss-deep` | `#3B4B3F` | Hover de CTAs e links em `moss` |
| `--moss-pale` | `#DCE4DE` | Highlight sutil — fundo de badge `DISPONIVEL`, hover de tag |
| `--moss-paper` | `#EEF2EE` | Wash de fundo em sections de destaque (raro, máximo 1 vez por página) |

### Tier 2 — semantic (mapeia para Tailwind)

| Token | Resolve para | Quando usar |
|---|---|---|
| `bg` | `--paper` | Fundo padrão de body |
| `bg-elevated` | `--paper-warm` | Surface acima do bg (modal, sheet, hover-card) |
| `bg-inverse` | `--graphite` | Sections escuras de contraste (footer, hero opcional) |
| `text` | `--ink` | Corpo principal |
| `text-muted` | `--ash` | Metadado, legenda, labels de filtro |
| `text-subtle` | `--ash-soft` | Placeholder, helper text |
| `text-inverse` | `--paper` | Texto sobre `bg-inverse` |
| `border` | `--bone` | Border padrão de input, card, divisor |
| `border-strong` | `--ash-soft` | Border de input em focus, separador de section |
| `accent` | `--moss` | Botão primário, link, focus ring, badge ativo |
| `accent-hover` | `--moss-deep` | Hover de `accent` |
| `accent-pale` | `--moss-pale` | Fundo de badge, highlight passivo |

### Estados de imóvel (cor por status)

| Status | Fundo | Borda | Texto | Onde aparece |
|---|---|---|---|---|
| `DISPONIVEL` | `--moss-pale` | nenhuma | `--moss-deep` | Pill no card, no PDP, no painel |
| `RESERVADO` | `--bone` | nenhuma | `--ash` | Pill discreta, não chama atenção |
| `EM_NEGOCIACAO` | `--paper-warm` | `--bone` | `--ink` | Pill com borda fina, contexto neutro |
| `VENDIDO` | `--ink` | nenhuma | `--paper` | Pill em alto contraste, sinaliza fechado |
| `INATIVO` | transparente | `--bone` | `--ash-soft` | Pill outline, só visível no painel |

### Hover, focus, disabled

- Botão primário hover: `bg-moss-deep`, sem mudar tamanho.
- Link hover: underline aparece (1px, offset 4px), cor permanece `moss`.
- Focus visível em qualquer interativo: ring 2px `moss` com offset 2px sobre `paper`. Em `bg-inverse`, ring 2px `moss-pale`.
- Disabled: opacity 0.4, cursor `not-allowed`, sem hover.

---

## 4. Tipografia

Combinação editorial sóbria. Display em serif clássica para hero e títulos de section; sans neutra para tudo o que é UI, leitura corrida e numerais. Numerais tabulares em qualquer coluna de número (preço, área, dorms).

### Famílias

| Função | Primária | Fallback | Pesos em uso |
|---|---|---|---|
| Display (hero, H1, H2 grandes) | **Canela** (Commercial Type — pago) | **Cormorant Garamond** (Google Fonts, free) | Light 300, Regular 400 |
| Body (UI, parágrafo, label, número) | **Söhne** (Klim — pago) | **Inter** (Google Fonts, free) | 400, 500, 600 |
| Mono (raro — id de matrícula, hash de reserva) | **Söhne Mono** | **Geist Mono** | 400 |

> **Decisão prática:** entrega MVP roda com **Cormorant Garamond + Inter** (free, via `next/font/google`). Ao virar produção real, cliente licencia Canela e Söhne; troca CSS var `--font-display` e `--font-sans`, nada mais muda no código.

### Escala (rem em base 16px, com clamp() responsivo onde indicado)

| Step | Tamanho | Line-height | Letter-spacing | Uso |
|---|---|---|---|---|
| display-hero | `clamp(56px, 9vw, 96px)` | 0.95 | -0.02em | Hero título principal |
| display-xl | `clamp(40px, 5.5vw, 64px)` | 1.05 | -0.015em | H1 de página, section opener |
| display-lg | `clamp(32px, 4vw, 48px)` | 1.1 | -0.01em | H2 de section grande |
| display-md | 32px | 1.15 | -0.005em | H2 padrão, título de card de destaque |
| heading-lg | 24px | 1.25 | 0 | H3, título de modal |
| heading-md | 20px | 1.3 | 0 | H4, subtítulo de section |
| body-lg | 18px | 1.55 | 0 | Lead paragraph, descrição PDP |
| body | 16px | 1.6 | 0 | Texto padrão |
| body-sm | 14px | 1.5 | 0.005em | Metadado, secundário |
| caption | 12px | 1.4 | 0.04em | Label, micro-tag |
| eyebrow | 12px (uppercase) | 1.2 | 0.16em | Sobre-título antes de display |

### Numerais

```css
.tnum, .price, .stat, .feature-number {
  font-feature-settings: 'tnum' 1, 'lnum' 1;
}
```

Aplicar em: preço de catálogo, preço de PDP, área m², ano de construção, dorms/suítes/vagas, KPIs do painel. Sem isso, dígito 1 fica mais fino e quebra alinhamento de coluna.

### Regras de uso

- Hero: display-hero em serif Light, sem peso bold.
- H1/H2 sempre em serif. H3 e abaixo em sans.
- Eyebrow vem antes de hero/H2 grandes; sempre em sans Medium 500, all-caps, tracking 0.16em.
- Body justificado: nunca. Sempre alinhado à esquerda.
- Itálico: só em citação institucional ou quando o original exigir (ex.: nome de obra). Nunca em UI.

---

## 5. Espaçamento e grid

Base 4px (compatível com Tailwind default), com **escala canônica** privilegiada para evitar margens órfãs:

```
4 — 8 — 12 — 16 — 24 — 32 — 48 — 64 — 96 — 128
```

- Padding interno de cards: 24px desktop / 20px mobile.
- Gap de grid de catálogo: 32px desktop / 16px mobile.
- Padding vertical de section desktop: `py-24` (96px) padrão, `py-32` (128px) para hero secundário, `py-16` (64px) para sections densas.
- Padding vertical de section mobile: `py-16` (64px) padrão, `py-12` (48px) para sections curtas.
- Container max-width: 1280px (catálogo, conteúdo). Hero pode ir full-bleed (100vw).
- Grid de catálogo desktop: 3 colunas em ≥ 1024px, 2 colunas em ≥ 640px, 1 coluna abaixo. Sempre com `gap-8` desktop.

> Margens fora dessa escala (ex.: `mb-7`, `mb-9`) estão proibidas. Anti-padrão registrado em `memoria/30-LICOES`.

---

## 6. Border radius

Marquesa é boutique séria, não SaaS. **Default `radius-0` (cantos vivos)** em quase tudo:

- Cards de imóvel, hero, sections, inputs grandes (CEP, busca de bairro): `rounded-none`.
- Botões, pills de filtro: `rounded-none`.
- Excepcionalmente, **badges pequenos** (status DISPONIVEL/RESERVADO etc.) usam `rounded` (4px). Pill `rounded-full` é vetada — soa SaaS.
- Avatares de corretor (footer institucional): `rounded-full` (única exceção, contexto humano).
- Modais: `rounded-none` desktop / `rounded-t-md` mobile bottom-sheet.

| Token | Valor | Uso |
|---|---|---|
| `--radius-0` | `0` | Default |
| `--radius-sm` | `2px` | Sub-elementos dentro de badge |
| `--radius-md` | `4px` | Badges de status, tag de filtro ativa |
| `--radius-full` | `9999px` | Avatar humano |

---

## 7. Animação

Sóbria, responde a ação ou a entrada no viewport. Anti-padrões absolutos: cursor glow, scroll-jacking, parallax global, `scroll-behavior: smooth` em html/body.

### Tokens

| Token | Valor | Uso |
|---|---|---|
| `--duration-instant` | `120ms` | Feedback de press (botão, link visitado) |
| `--duration-fast` | `200ms` | Hover de card, fade de overlay, mudança de cor |
| `--duration-base` | `400ms` | Transição padrão (modal abrir, drawer, page transition leve) |
| `--duration-reveal` | `700ms` | Scroll-reveal de section ou card |
| `--ease-standard` | `cubic-bezier(0.16, 1, 0.3, 1)` | Easing default; sai rápido, chega devagar |
| `--ease-swift` | `cubic-bezier(0.4, 0, 0.2, 1)` | Material easing; usar em saída de modal e fade |
| `--ease-linear` | `linear` | Loading bar, marquee — único caso |

### Padrões aprovados

- **Scroll-reveal** (IntersectionObserver, `threshold: 0.15`, `rootMargin: '0px 0px -10% 0px'`): `opacity 0 → 1`, `translateY 32px → 0`, `--duration-reveal`, `--ease-standard`. **Run-once** — após revelar, observer desconecta. Não anima ao scrollar de volta.
- **Card hover**: imagem `scale 1.0 → 1.03` em `--duration-base`, `--ease-standard`. Texto não move. Sombra não cresce (Marquesa é flat).
- **Botão primário**: hover `bg-moss → bg-moss-deep` em `--duration-fast`. Press `scale(0.99)` em `--duration-instant`.
- **Lightbox de galeria**: fade do overlay em `--duration-fast`, troca de slide com crossfade `--duration-base`.
- **Page transition**: opcional, fade-in de `opacity 0 → 1` em `--duration-base` ao montar. Sem slide horizontal. Sem barra de progresso fake.

### Reduced motion

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

Reveal vira `opacity 1` direto, sem translate. Hover de card desliga o scale.

---

## 8. Voz da marca

### Princípios

1. Descritivo antes de adjetivo. Diga o fato (área, andar, vista, integração) antes de qualificá-lo.
2. Refinamento mora na precisão. "Cobertura duplex de 280m² com terraço integrado e quatro suítes" vence "Imóvel incrível dos sonhos!!!".
3. Tempo do leitor é precioso. Frase curta. Pontuação seca. Sem ponto de exclamação.
4. Tom de boutique, não de plantão. Não vendemos urgência forjada ("últimas unidades!", "corre!"). Vendemos curadoria.
5. Sem travessão (—) em UI nem em copy de marketing. Substituir por vírgula ou frase quebrada.

### Faça vs Não faça

| Faça | Não faça |
|---|---|
| "Cobertura em Higienópolis com 280m² e terraço integrado." | "INCRÍVEL cobertura dos sonhos em Higienópolis!!!" |
| "Reservar com sinal" | "QUERO ESSE IMÓVEL AGORA!" |
| "Sinal de R$ 175.000 trava o imóvel por 10 dias corridos. Negociação segue offline com nosso corretor." | "Garante já com Pix turbo super rápido!" |
| "Disponível para visita." | "Agende sua visita exclusiva premium!" |
| "Apartamento de 4 suítes em Vila Nova Conceição, andar alto, vista sul." | "Apartamento luxuoso, sofisticado, único, top de linha." |
| Eyebrow: "JARDINS · 320M²" | Eyebrow: "OPORTUNIDADE IMPERDÍVEL" |

### Palavras vetadas em UI/marketing

`incrível`, `impressionante`, `dos sonhos`, `imperdível`, `oportunidade única`, `top`, `super`, `mega`, `exclusivo` (usar com extrema parcimônia, no máximo uma vez por página), `luxuoso` (descreva o que torna o imóvel digno do termo, em vez de afirmar), emoji de qualquer tipo na UI da loja.

### Microcopy aprovada (referência rápida)

- CTA primário PDP: **"Reservar com sinal"**
- CTA secundário PDP: **"Agendar visita"**
- CTA do header: **"Catálogo"** (não "Imóveis", não "Comprar")
- Empty state catálogo filtrado: *"Nenhum imóvel atende a esses filtros. Limpe a seleção ou fale com nosso corretor."*
- Empty state favoritos: *"Você ainda não salvou nenhum imóvel."*
- Erro 500: *"Algo travou no nosso lado. Tente novamente em alguns instantes ou fale com a gente."*
- Mensagem pós-sinal pago: *"Sinal recebido. O imóvel está reservado em seu nome por 10 dias corridos. Nosso corretor entrará em contato em até um dia útil."*

---

## 9. Componentes visuais (especs em palavras)

Cada componente abaixo deve ser implementado pelo Frontend usando exclusivamente tokens Tier 2/3.

### 9.1 Botão primário

- Fundo: `accent` (`--moss`).
- Texto: `paper` (`--paper`), sans Medium 500, 14-15px, tracking 0.02em, all-caps opcional em CTAs de hero.
- Padding: `16px 32px` (desktop), `14px 24px` (mobile).
- Radius: 0.
- Border: nenhuma.
- Hover: fundo vai para `accent-hover` em 200ms.
- Press: `scale(0.99)` em 120ms.
- Focus: ring 2px `accent` offset 2px.
- Disabled: opacity 0.4, sem hover.

### 9.2 Botão secundário

- Fundo: transparente.
- Texto: `ink`.
- Border: 1px solid `ink`.
- Mesma medida do primário.
- Hover: fundo `ink`, texto `paper` em 200ms.

### 9.3 Botão fantasma (terciário)

- Fundo: transparente.
- Texto: `ink`, com underline aparecendo no hover (1px, offset 4px).
- Sem border.
- Para "Ver detalhes", "Voltar ao catálogo", "Limpar filtros".

### 9.4 Card de imóvel (catálogo)

Retangular, vertical, sem sombra, sem border. Hierarquia:

- Imagem 4:3, full-bleed dentro do card. `object-cover`, lazy loading.
- Pill de status sobreposta no canto superior esquerdo (margem 16px do topo e da esquerda da imagem).
- Bairro em eyebrow (12px, all-caps, tracking 0.16em, `text-muted`), abaixo da imagem com 16px de gap.
- Título serif (heading-lg ou display-md, depende da densidade do grid), `text` (ink), 4px abaixo do bairro.
- Linha de metadados: dorms · m² · vagas, em sans 14px, `text-muted`, 8px abaixo do título.
- Preço: sans Medium 500, 18-20px, tabular-nums, `text` (ink), 16px abaixo dos metadados, alinhado à esquerda.
- Hover: imagem `scale(1.03)` em 400ms `--ease-standard`. Texto não move. Card inteiro é clicável e leva ao PDP.

### 9.5 Pill de status

- Padding `4px 10px`.
- Radius 4px (`--radius-md`).
- Tipografia caption (12px, tracking 0.04em, all-caps).
- Cor por estado conforme tabela em §3.

### 9.6 Hero

- Foto full-bleed (100vw), altura 80vh em desktop / 70vh em mobile.
- Overlay opcional escuro a 20% (`rgba(10,10,10,0.20)`) para garantir contraste do título sobre foto. Aplicar sempre — se a foto já é dark, overlay vira 12%.
- Título serif display-hero, peso Light 300, cor `paper`, posicionado absoluto, centralizado horizontalmente, alinhado à base com `padding-bottom: clamp(40px, 8vh, 96px)`.
- Eyebrow opcional acima do título, `paper` opacity 0.7, 12px tracking 0.16em.
- Scroll cue na base central: linha vertical 1px, 32px de altura, `paper` opacity 0.5, com pequena animação de fade-pulse de 2s infinita (única animação cíclica permitida na home).
- CTA opcional dentro do hero: botão fantasma sobre a foto, com ring 1px `paper` opacity 0.4 — não usar primário moss por cima de foto, contraste fica instável.

### 9.7 Galeria PDP (lightbox)

- Layout desktop: imagem dominante 16:9 ou 4:3 ocupando ~75% da largura, com 4-6 thumbnails verticais à esquerda (96x96, gap 12px). Thumbnail ativa: ring 1px `ink`.
- Layout mobile: imagem dominante full-width, swipe horizontal. Thumbnails em strip horizontal abaixo, 64x64.
- Lightbox (clicar imagem dominante): overlay `ink` opacity 0.92, imagem central com max-height 90vh, navegação com setas laterais e ESC para fechar. Crossfade 400ms entre slides. Contador "3 / 18" na base, em sans 14px `paper` opacity 0.7.

### 9.8 Ficha técnica (PDP)

- Grid de 2 colunas desktop, 1 coluna mobile.
- Cada linha: label em eyebrow (12px tracking 0.16em, `text-muted`), valor em sans 16-18px Medium, tabular-nums quando numérico.
- Divisor 1px `bone` entre linhas, padding-y 16px.
- Campos canônicos: matrícula, área útil, área total, dormitórios, suítes, vagas, ano de construção, condomínio, IPTU anual, andar (se aplicável), face solar.

### 9.9 Mapa (Google Maps embed)

- Aspect 16:9 desktop / 4:3 mobile.
- Sem borda colorida. Container com 1px `bone` ao redor.
- Disclaimer em caption abaixo: "Localização aproximada por privacidade. Endereço completo é compartilhado com interessados qualificados pelo corretor."

### 9.10 Filtros do catálogo

- Sticky topo abaixo do header, fundo `paper` com 1px `bone` na base ao scrollar (sombra zero).
- Cada filtro: pill outline `bone`, label em sans 14px, ícone chevron à direita.
- Pill ativa: fundo `ink`, texto `paper`. Ao hover de pill inativa: border vira `ash-soft`.
- Botão "Limpar filtros" como fantasma, alinhado à direita, só aparece se houver ao menos um filtro ativo.

### 9.11 Footer

- Fundo `graphite`, texto `paper`, padding `py-24 px-8`.
- Logo (monograma + wordmark) à esquerda em peso Light, tamanho moderado.
- 3 colunas de links: Marquesa (sobre, contato, blog), Catálogo (tipos, bairros), Legal (LGPD, política de reserva, CRECI).
- CRECI em caption na base: "CRECI/SP 12345-J · Marquesa Imóveis Ltda. · CNPJ XX.XXX.XXX/0001-XX".
- Copyright e endereço fictício na linha final.
- Sem ícones sociais grandes; só inline em sans com underline-on-hover.

---

## 10. Acessibilidade (não-negociável)

- Contraste `ink` sobre `paper`: passa AAA (≈ 18.7:1).
- `moss` sobre `paper`: contraste ≈ 7.4:1, passa AAA para texto normal.
- `moss-pale` sobre `moss-deep`: passa AA Large (uso exclusivo em badge pequena).
- Focus visível em 100% dos interativos. Nunca remover outline sem repor `:focus-visible`.
- Alt text obrigatório em toda imagem de imóvel. Pattern: `"{Tipo} de {área}m² em {bairro}, {cidade}"`.
- Touch target 44px mínimo.
- Single H1 por página.

---

## 11. O que NÃO fazer (anti-padrões absolutos)

- Cursor glow seguindo viewport.
- Scroll-jacking (controle do scroll roubado do user).
- Parallax global pesado.
- `scroll-behavior: smooth` em html/body.
- Hero com vídeo pesado em loop (MVP fica em foto estática; vídeo é fase 2 com peso < 2MB e poster de fallback).
- Saturação de cor; nunca um terceiro acento.
- Cantos arredondados em cards e botões grandes.
- Sombra forte em cards (Marquesa é flat editorial, não material design).
- Pop-up de newsletter na primeira visita.
- Pop-up de cookies cobrindo CTA (só barra discreta na base, dispensável com um clique).
- Texto justificado.
- Emoji em UI da loja.
- Travessão em UI/copy.
- Logo Lacoste/jacaré ou qualquer remix óbvio de marca alheia.

---

## 12. Onde encontrar os tokens reais

- CSS vars: `projetos/marquesa/design/tokens.css` — fonte de verdade Tier 3.
- Tailwind extend: `projetos/marquesa/design/tailwind-extend.json` — colar em `tailwind.config.ts` do frontend.
- Frontend importa `tokens.css` em `app/globals.css` (`@import "../../design/tokens.css";` ou copiar conteúdo no `:root`).
- Fontes: configurar `next/font/google` com Cormorant Garamond e Inter, expor em CSS vars `--font-display` e `--font-sans`. Detalhe técnico no message para o Frontend.

Mudança de paleta, tipografia ou regra de animação requer nova versão deste documento e mensagem `DE-designer_PARA-todos_AAAA-MM-DD-update-brief.md` com diff explícito.
