# Logo Spec — Kore Tech

> Logo placeholder funcional v1 (entregue por mim, designer-de-produto).
> Este documento descreve **o que um designer humano de marca deveria refinar** numa próxima iteração.
> Mantido pelo Designer (Agente 02). Última atualização: 2026-04-26.

---

## Arquivos entregues

| Arquivo | Uso |
|---|---|
| `design/logo.svg` | Logo principal horizontal (320x64) — header da loja, hero da home, footer, email transacional |
| `design/logo-mark.svg` | Marca quadrada (64x64) — favicon, avatar de redes sociais, app icon |

Ambos SVG, sem dependência de imagem rasterizada. Bem peso < 2KB cada.

---

## Anatomia da v1

### Marca (símbolo)

Letra **"K"** geométrica em branco (`#E8EEF5`) com um pequeno **círculo cyan (`#00E5FF`) no centro** preenchendo a contra-forma — o "kernel" / núcleo.

**Conceito:** *Kore* vem do grego *κόρη* (kore) = núcleo, centro. O kernel cyan no meio do K reforça duas coisas:
1. O núcleo do PC = a CPU/kernel — domínio técnico do nicho
2. O acento único do brand (cyan) entrando exatamente onde a marca tem seu "centro"

### Wordmark

**"KORE"** em Inter Bold + **" TECH"** em Inter Medium com cor secundária (`#8892A0`).
- Tracking generoso (0.08em) — sensação tech-séria, não amontoada
- Hierarquia visual: "KORE" pesa, "TECH" descansa

### Paleta usada

| Elemento | Token | Hex |
|---|---|---|
| K principal | `--color-text` | `#E8EEF5` |
| Kernel | `--color-primary` | `#00E5FF` |
| "TECH" | `--color-text-secondary` | `#8892A0` |

---

## Versões (devem existir, falta entregar)

A v1 atende fundo escuro (uso primário no site dark). Designer humano deve produzir:

1. **Versão dark on light** — pra eventual material impresso, fatura, NFe. K em `#0A0E14` (preto-azulado), kernel mantém cyan, "TECH" em `#5A6573`. (Cliente exporta NFe; precisa ler em fundo branco.)
2. **Versão monocromática** — 1 cor (preto puro `#000` OU branco puro `#FFF`) pra impressão a laser, gravação a laser em caixa, embalagem barata. Sem o kernel cyan — vira marca-d'água preta/branca.
3. **Versão favicon 32x32 e 16x16 simplificada** — em tamanhos pequenos o círculo cyan vira pixel sujo. Designer otimiza pra grid pixel.
4. **Versão animada (loading splash)** — kernel cyan pulsa entrando do meio do K (~600ms, 1x). Útil em loading inicial do app.

---

## O que designer humano deveria refinar (próxima iteração)

### Decisão de marca, não de código

- **K geométrico custom em vez de Inter Bold modificado.** A v1 desenha o K em paths simples pra ficar vector-puro sem dependência de font carregada. Designer humano com Figma + Glyphs deveria desenhar um K proprietário com:
  - Cantos suavizados (raio 1-2px nas pontas) pra parecer "tech smooth" sem virar bauhaus rígido
  - Talvez chanfro nas diagonais (como notch nos PCs gamer modernos) — sutil
  - Espessura ligeiramente diferente entre coluna vertical e diagonais (tensão visual moderna)

- **Kernel cyan menos literal.** O círculo perfeito é genérico. Versões a explorar:
  - Hexágono (referência a chip/socket)
  - Ponto piscando (animação) com leve halo
  - Quadrado rotacionado (referência a chip die)
  - Forma orgânica (mais marca, menos engenharia)

- **Wordmark custom.** Inter é ótima fonte pra UI mas não é uma fonte de logotipo proprietário. Opções:
  - Customizar 4 letras KORE (kerning otimizado, terminais ajustados)
  - Optar por outra font display tech-séria (Space Grotesk, Geist Mono em weight bold, IBM Plex Sans Condensed)

- **Hierarquia "TECH"**. A v1 deixa em medium muted. Alternativas:
  - Mesma cor mas peso muito mais leve (200/300) — perigo de sumir em mobile pequeno
  - Inteiramente diferente: "TECH" abaixo do "KORE" em mono pequena (assinatura técnica)
  - Remover "TECH" do logo principal — usa só "KORE" + kernel. "TECH" vira tagline opcional

### Investigação de marca real

- **Nome "Kore" tem trademark search**. Antes de finalizar, conferir conflito com marcas de hardware no INPI (Brasil) e USPTO (EUA).
- **Domínio**: `koretech.com.br` está livre? `kore.tech` (domínio premium)?
- **@koretech** nas redes (Instagram, Twitter/X, TikTok, YouTube, Reddit) — checar disponibilidade ANTES de finalizar marca.

### Aplicações reais

Designer humano deveria apresentar mock de:
- Logo no header em mobile 375px (caber em altura 56px)
- Logo no footer em coluna estreita
- Logo em favicon Chrome 16x16 + iOS app icon 180x180
- Logo gravado em caixa de PC (estilo BTO — selo no gabinete)
- Logo em assinatura de email (200x60 PNG transparente)
- Logo em fatura (PDF, 1200dpi, vetor)
- Logo em camiseta interna de funcionário (estampa peito esquerdo, 80mm)

---

## Restrições de uso (não negociáveis)

1. **Espaço de respiro mínimo** = altura do K (32px na v1 320x64). Nada de texto/borda/elemento gráfico encostando no logo.
2. **Tamanho mínimo legível** = 24px de altura. Abaixo disso, usar `logo-mark.svg` (só o K).
3. **NÃO usar:**
   - Outline branco em volta (vira anos 2000)
   - Sombra (vira anos 2010 skeumórfico)
   - Inclinação/rotação (vira gamer-cliché)
   - Trocar cor do kernel (cyan é único acento — quebrar isso = quebrar brand)
   - Troca de tipografia em uso ad-hoc
4. **Cores oficiais do brand** = SÓ as 3 listadas acima. Nada de versão "vermelha pra promoção" ou "verde pra Black Friday".
5. **Em fundo claro** (raríssimo, MVP é dark only): trocar `#E8EEF5` → `#0A0E14`. Manter cyan no kernel.

---

## Por que isso é "placeholder funcional v1" e não final

Sou designer de produto digital, não diretor de arte de campanha. A v1 entrega:
- ✅ Sistema visual coerente com o resto da marca (cores + tipografia)
- ✅ Funcional em todos os contextos digitais imediatos (header, footer, favicon)
- ✅ SVG vector limpo, peso < 2KB
- ✅ Acessível (`role="img"` + `aria-label="Kore Tech"`)
- ✅ Conceito narrativo defensável (kernel cyan = núcleo do PC)

Não entrega:
- ✗ Marca registrada com proteção legal
- ✗ K customizado proprietário (uso paths geométricos baseados em Inter)
- ✗ Variantes mono / impressas / animadas
- ✗ Mock em aplicação física (caixa, embalagem, t-shirt)
- ✗ Brand guidelines completos (manual de marca em 30 páginas)

Se o cliente quiser virar venda real, contrata designer de marca por R$ 8-25k pra fazer essas etapas. Pra demo fictícia de MVP, a v1 é mais que suficiente e segura nenhum compromisso visual estranho.
