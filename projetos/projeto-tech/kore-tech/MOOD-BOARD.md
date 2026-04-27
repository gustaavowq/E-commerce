# Mood Board — Kore Tech

> 14 referências visuais que definem o "look and feel" do Kore Tech.
> Cada URL com 1 frase do que pegamos. Sem inspiração genérica.
> Mantido pelo Designer (Agente 02). Última atualização: 2026-04-26.

---

## Hardware / PC builders (concorrência direta + referência ouro)

### 1. NZXT BLD — https://nzxt.com/category/gaming-pcs
**O que pegamos:** o jeito de organizar PC montado por uso/persona ("Best for Valorant", "Best for Streaming") com FPS estimado em destaque, fundo escuro respirando, foto do PC bem iluminada como herói. **Não pegamos:** RGB excessivo nas fotos (eles abusam, a gente segura).

### 2. Maingear — https://maingear.com
**O que pegamos:** boutique premium feeling sem virar "luxo de varejo", uso de tipografia generosa em hero ("BUILT TO ORDER"), spec table organizada em 2 colunas. **Não pegamos:** paleta cromada/dourada (não combina com nosso cyan).

### 3. Origin PC — https://www.originpc.com
**O que pegamos:** badge de garantia/suporte vitalício como trust signal vendido logo na PDP, breakdown de configuração em sidebar fixa. **Não pegamos:** densidade extrema do hero (parece banner promocional).

### 4. BuildCores — https://www.buildcores.com
**O que pegamos:** **referência ouro do nosso PC Builder.** Sidebar de categorias à esquerda, lista filtrada no centro, barra inferior com status (compatibilidade + wattagem somada + total). Usaremos exatamente essa estrutura. **Não pegamos:** o visualizador 3D (V3, fora da MVP).

### 5. PCSpecialist — https://www.pcspecialist.co.uk/pc-configurator/
**O que pegamos:** configurador "5 passos jargon-free" — cada etapa explica o que está pedindo em linguagem humana, ideal pra iniciante. Inspira nossa tooltip ao lado de cada categoria do builder. **Não pegamos:** UI antiquada (anos 2010 inteiros).

### 6. LDLC PC Builder (FR) — https://www.ldlc.com/en/pc-builder/
**O que pegamos:** notificação em tempo real "estoque baixo" / "chegou" como overlay sutil sobre cards de produto, anti paper-launch. Vamos replicar no nosso WaitlistButton. **Não pegamos:** densidade visual exagerada.

---

## Design system / SaaS (referência de UI escura, tipografia, microinteração)

### 7. Linear — https://linear.app
**O que pegamos:** **referência ouro de dark UI séria.** Bg quase-preto com tom azulado, 1 acento cromático único, tipografia muito limpa, microanimações que somem em 200ms, contraste de texto perfeito. Nossa UI deve sentir como Linear, não como Razer. **Não pegamos:** purple-roxo (trocamos por cyan).

### 8. Vercel — https://vercel.com
**O que pegamos:** uso de gradientes sutis em surfaces grandes (hero, banner) sem virar parallax, tipografia mono pra dado técnico (build size, latência), grid denso de cards organizados. **Não pegamos:** branco/preto extremo (somos azul-preto).

### 9. Geist (design system Vercel) — https://vercel.com/geist
**O que pegamos:** spacing scale clara, cards com bordas sutis (1px) em vez de sombra, foco visível com 2px solid + offset. Aplicamos no nosso `:focus-visible`.

### 10. Stripe Dashboard — https://stripe.com/dashboard
**O que pegamos:** organização de KPIs em cards leves, gráfico de linha minimalista (sem grid pesado), navegação lateral com ícone + label que colapsa. Inspira o painel admin do Kore Tech.

---

## Gamer respeitável (sem cair no cliché)

### 11. Razer — https://www.razer.com
**O que pegamos:** confiança da marca em mostrar produto isolado em fundo escuro com 1 luz lateral cyan/verde. Foto de produto com esse tratamento. **Não pegamos:** o verde-Razer (nosso é cyan), nem a tipografia angular display.

### 12. Logitech G — https://www.logitechg.com
**O que pegamos:** card de PDP de periférico com ângulo isométrico do mouse/teclado, specs estruturadas em tabela ao lado. Usamos no nosso SpecsTable.

---

## Apple-clean (contraponto pra calibrar densidade)

### 13. Apple Mac (página produto Pro) — https://www.apple.com/shop/buy-mac/mac-pro
**O que pegamos:** **antídoto contra o gamer berrante.** Quando o site começar a ficar carregado, abre o Apple Mac Pro pra lembrar como spec técnica pode ser apresentada com calma. Tabela vertical com header sticky, separadores sutis. **Não pegamos:** o branco extremo (somos dark).

---

## Anti-padrões (NÃO copiar)

### 14. Pichau (BR) — https://www.pichau.com.br
**O que NÃO fazemos:** banner promocional empilhado, 6 cores de acento na home (rosa + verde + amarelo + azul + vermelho + roxo), tipografia agressiva tipo "OFERTA RELÂMPAGO", densidade caótica. É o líder do BR mas é o exemplo do que evitar visualmente.

---

## Fotografia de produto (direção)

- **Closeup de componente iluminado** — placa-mãe com luz lateral revelando detalhe, GPU vista 3/4 com leds discretos acesos, cooler com fan parado em frame congelado.
- **Fundo escuro matching o site** (#0A0E14 ou levemente mais claro) pra não "estourar" no card branco/cinza.
- **Lifestyle setup pra hero da home** — setup completo em quarto com luz quente baixa + monitor aceso (RGB do setup OK aqui, é foto, não UI).
- **Lookbook persona** — pessoa real usando o setup ("Edição 4K" → editor com timeline na tela; "IA local" → terminal Llama na tela; "Valorant 240fps" → screenshot do jogo num monitor 240Hz).

Direção pra qualquer foto futura: **escuro, contrastado, 1 fonte de luz fria (cyan/branco-frio) lateral, sem RGB explosivo no fundo**. Cliente quer ver o que está comprando, não show de luz.

---

## Tipografia em ação (referência)

- **Inter weights 400/500/600/700** — corpo, UI, headers. NÃO usar 800/900 (passa cafona).
- **JetBrains Mono** — qualquer número técnico: FPS, watts, MHz, MB/s, preço destaque na PDP, SKU, código cupom.

Exemplos de stacks tipográficos vistos em ação no mercado SaaS (tudo Inter ou similar): Linear, Vercel, Stripe, Cursor, Anthropic, OpenAI, Resend, Railway, Supabase, Plausible. **Hardware-side** quase ninguém usa Inter — é nossa diferenciação visual contra Pichau/KaBuM.

---

## Resumo — 1 frase

**Linear/Vercel encontra NZXT BLD encontra meupc.net. Dark-mode, cyan único, denso técnico, snappy.**
