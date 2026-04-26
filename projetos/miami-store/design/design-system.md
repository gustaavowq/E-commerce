# 🎨 Design System — Miami Store

> Mantido pelo Designer (Agente 02). Última atualização: 2026-04-25.
> Baseado na análise visual do Instagram @miamii_storee (82 imagens, 8 vídeos em `assets/miami-instagram/`).
> **Direção:** manter alma autêntica (street, comunidade, prova de original) + acabamento profissional de e-commerce.

---

## 1. Tokens

### 1.1 Cores

```scss
/* Brand */
--primary-50:    #E8F5E9;   // verde claríssimo (fundos sutis)
--primary-100:   #C8E6C9;
--primary-300:   #66BB6A;
--primary-500:   #2E7D32;   // verde Lacoste médio (jacaré)
--primary-700:   #1B5E20;   // VERDE PRIMÁRIO — botões CTA, links, headers
--primary-900:   #0D3E13;   // verde profundo (hover)

/* Accent vermelho — usar com parcimônia, só pra destaques */
--accent-500:    #D32F2F;   // vermelho Lacoste — badge "promoção", "última peça"
--accent-700:    #9A0007;

/* Accent neon — uso pontual em banners promocionais (estilo Instagram) */
--neon:          #C5E000;   // verde-limão dripping (arte "voces nao perdem")

/* Neutros */
--bg:            #FFFFFF;   // fundo principal do site (limpo, e-commerce)
--surface:       #FAFAFA;   // cards, seções alternadas
--surface-2:     #F0F0F0;   // bordas suaves, divisores
--ink:           #0A0A0A;   // texto principal e fundo de banners
--ink-2:         #1F2937;   // texto secundário
--ink-3:         #6B7280;   // texto auxiliar (label, helper)
--ink-4:         #9CA3AF;   // placeholder
--border:        #E5E7EB;
--border-strong: #D1D5DB;

/* Estado */
--success:       #16A34A;
--warning:       #F59E0B;
--error:         #DC2626;
--info:          #0EA5E9;

/* Brand-specific dos parceiros (referência, não usar direto na UI) */
--lacoste-navy:  #0D2C54;
--lacoste-red:   #D32F2F;
```

#### Quando usar cada uma
| Cor | Uso |
|---|---|
| `--primary-700` | Botão CTA principal, links de ação, badge de marca, header ativo |
| `--accent-500` | Badge "PROMOÇÃO", preço de oferta, "ÚLTIMAS PEÇAS", botão delete |
| `--neon` | **Apenas em banner promocional especial** (estilo Instagram). Nunca em UI. |
| `--ink` (preto) | Fundo de banner promocional, texto display em fundo claro |
| `--bg` (branco) | Fundo geral. E-commerce limpo. |
| `--surface` / `--surface-2` | Cards de produto, seções intercaladas, modais |

### 1.2 Tipografia

```scss
/* Famílias */
--font-display: 'DM Serif Display', 'Playfair Display', Georgia, serif;
                /* Banners, headlines, "MIAMI STORE" — chunky serif do Instagram */
--font-body:    'Inter', 'Manrope', -apple-system, system-ui, sans-serif;
                /* UI, corpo, labels, botões — máxima legibilidade mobile */
--font-mono:    'JetBrains Mono', Consolas, monospace;
                /* Apenas pra códigos de cupom, SKU */

/* Escala (mobile-first — desktop usa as mesmas com leves ajustes) */
--text-xs:    0.75rem;   /* 12px — labels, helpers */
--text-sm:    0.875rem;  /* 14px — texto auxiliar, badges */
--text-base:  1rem;      /* 16px — corpo padrão (mínimo mobile) */
--text-lg:    1.125rem;  /* 18px — destaque pequeno */
--text-xl:    1.25rem;   /* 20px — preço, h4 */
--text-2xl:   1.5rem;    /* 24px — h3, título de seção */
--text-3xl:   1.875rem;  /* 30px — h2 */
--text-4xl:   2.25rem;   /* 36px — h1 mobile */
--text-5xl:   3rem;      /* 48px — hero display desktop */

/* Pesos */
--font-regular:   400;
--font-medium:    500;
--font-semibold:  600;
--font-bold:      700;
--font-black:     900;  /* serif display em banners */

/* Line height */
--leading-tight:  1.15;  /* display, headlines */
--leading-snug:   1.35;  /* h2, h3 */
--leading-normal: 1.5;   /* corpo */
--leading-loose:  1.7;   /* descrição longa de produto */
```

#### Hierarquia
| Elemento | Família | Tamanho | Peso |
|---|---|---|---|
| H1 (banner hero) | `--font-display` | `--text-4xl` (mobile) / `--text-5xl` (≥md) | `--font-black` |
| H2 (título seção) | `--font-display` | `--text-3xl` | `--font-bold` |
| H3 (sub-seção) | `--font-body` | `--text-2xl` | `--font-bold` |
| H4 (card title) | `--font-body` | `--text-xl` | `--font-semibold` |
| Corpo | `--font-body` | `--text-base` | `--font-regular` |
| Preço (destaque) | `--font-body` | `--text-2xl` | `--font-bold` |
| Preço (riscado) | `--font-body` | `--text-sm` line-through | `--font-regular` |
| Label | `--font-body` | `--text-sm` uppercase tracking-wide | `--font-medium` |
| Badge | `--font-body` | `--text-xs` uppercase | `--font-bold` |

### 1.3 Espaçamento (sistema de 4px)

```scss
--space-0:   0;
--space-1:   0.25rem;  /* 4px */
--space-2:   0.5rem;   /* 8px */
--space-3:   0.75rem;  /* 12px */
--space-4:   1rem;     /* 16px — base */
--space-5:   1.25rem;  /* 20px */
--space-6:   1.5rem;   /* 24px */
--space-8:   2rem;     /* 32px */
--space-10:  2.5rem;   /* 40px */
--space-12:  3rem;     /* 48px */
--space-16:  4rem;     /* 64px */
--space-20:  5rem;     /* 80px */
--space-24:  6rem;     /* 96px */
```

Padding padrão de card: `--space-4`. Gap padrão de grid de produtos mobile: `--space-3`. Margem entre seções: `--space-12` (mobile) / `--space-20` (desktop).

### 1.4 Border radius

```scss
--radius-none:  0;
--radius-sm:    0.25rem;   /* 4px — inputs, badges */
--radius-md:    0.5rem;    /* 8px — cards, botões */
--radius-lg:    0.75rem;   /* 12px — cards de destaque */
--radius-xl:    1rem;      /* 16px — modal, drawer */
--radius-pill:  9999px;    /* pílulas, avatares */
```

### 1.5 Sombras

```scss
--shadow-sm:   0 1px 2px rgba(0,0,0,0.06);
--shadow-md:   0 2px 8px rgba(0,0,0,0.08);   /* card padrão */
--shadow-lg:   0 8px 24px rgba(0,0,0,0.12);  /* hover de card, header sticky */
--shadow-xl:   0 16px 40px rgba(0,0,0,0.16); /* modal */
```

### 1.6 Breakpoints (mobile-first)

```scss
--bp-sm:  640px;    /* tablet pequeno */
--bp-md:  768px;    /* tablet */
--bp-lg:  1024px;   /* desktop */
--bp-xl:  1280px;   /* desktop largo */
--bp-2xl: 1536px;
```

**Padrão da casa:** **375px é a base**. Tudo é desenhado mobile-first. Desktop é progressive enhancement.

### 1.7 Z-index (camadas)

```scss
--z-base:      0;
--z-sticky:    100;   /* header, filtros sticky */
--z-drawer:    200;   /* cart drawer, menu mobile */
--z-modal:     300;   /* dialog */
--z-toast:     400;   /* notificações */
--z-tooltip:   500;
--z-whatsapp:  150;   /* botão flutuante WhatsApp — sempre visível */
```

### 1.8 Transições

```scss
--ease:           cubic-bezier(0.4, 0, 0.2, 1);
--duration-fast:  150ms;
--duration-base:  200ms;
--duration-slow:  300ms;
```

---

## 2. Componentes principais

### 2.1 Botão Primário (CTA)

```
Estado normal
  bg: var(--primary-700)
  text: #FFFFFF
  font-weight: --font-semibold
  font-size: --text-base
  padding: 12px 24px (mínimo 44x44px area de toque)
  border-radius: --radius-md
  transição: 200ms

Hover (desktop)
  bg: var(--primary-900)

Active
  scale(0.98)

Disabled
  opacity: 0.5
  cursor: not-allowed

Loading
  spinner branco substituindo o texto, mesma altura
```

### 2.2 Botão Secundário (outline)

```
Estado normal
  bg: transparent
  border: 1.5px solid var(--primary-700)
  text: var(--primary-700)

Hover
  bg: var(--primary-50)
```

### 2.3 Botão WhatsApp (flutuante)

```
Posição: fixed bottom: 16px, right: 16px
Tamanho: 56x56px
bg: #25D366 (verde WhatsApp oficial)
border-radius: --radius-pill
shadow: --shadow-lg
ícone: WhatsApp branco 24x24
z-index: --z-whatsapp
animação: pulse leve a cada 5s pra atrair atenção
```

### 2.4 Input

```
Border: 1px solid var(--border)
Border-radius: --radius-md
Padding: 12px 16px
Font: --font-body --text-base
Min height: 44px (touch target)

Focus
  border: var(--primary-700)
  box-shadow: 0 0 0 3px rgba(27, 94, 32, 0.15)

Error
  border: var(--error)
  + texto helper abaixo em var(--error), --text-sm

Atributos obrigatórios mobile
  - inputmode correto: numeric pra CEP/CPF/cartão, email pra e-mail, tel pra telefone
  - autocomplete tags
  - placeholder claro mas com label sempre visível em cima
```

### 2.5 ProductCard (componente mais importante da loja)

```
Tamanho mobile: 100% da coluna do grid (2 colunas em mobile)
Tamanho desktop: ~280px largura
Aspect-ratio da imagem: 4:5

Estrutura:
  ┌─────────────────────────────┐
  │ [BADGE marca + BADGE %]     │ ← topo da imagem, posição absoluta
  │                             │
  │       IMAGEM PRODUTO        │
  │       (next/image)          │
  │                             │
  │ [SELO ORIGINAL ✓]          │ ← canto inferior direito da imagem
  ├─────────────────────────────┤
  │ Nome do produto            │
  │ R$ 199 (preço destaque)    │
  │ R$ 299 (riscado, opcional) │
  │ ou 4x R$ 49 sem juros      │
  │                             │
  │ [Botão: Comprar]            │ ← largura 100%, sempre visível em mobile
  └─────────────────────────────┘

Mobile: botão SEMPRE VISÍVEL (não usa hover-to-reveal — proibido pelo AGENT 03)
Desktop: hover sutil que sobe o card 2px com sombra mais forte
```

### 2.6 Badge "100% ORIGINAL"

```
Variantes:
  Solid (em foto):   bg: var(--primary-700), text: #FFF
  Outline (em texto): border: 1px var(--primary-700), text: var(--primary-700)

Texto: "100% ORIGINAL" + ícone check
Font: --font-body --text-xs uppercase --font-bold tracking-wide
Border-radius: --radius-sm
Padding: 4px 8px
```

### 2.7 Filtro de marca + categoria

```
Em mobile: drawer (bottom sheet) que sobe quando clica no botão "Filtrar"
Em desktop: sidebar fixa esquerda

Marcas: lista com checkbox + contagem ("Lacoste (24)", "Nike (12)")
Categorias: lista similar
Faixa de preço: range slider duplo
Tamanhos: grid de pílulas selecionáveis (P, M, G, GG)
Cores: grid de swatches circulares (com aria-label)
```

### 2.8 Selo de Pix (CTA de pagamento)

```
Layout: card destacado com borda verde
Conteúdo:
  - Ícone Pix oficial
  - "Pix instantâneo"
  - "À vista R$ 189" (5% off)
  - Badge "RECOMENDADO"

Posição: TOPO da seleção de pagamento no checkout, antes de cartão.
```

### 2.9 Header

```
Mobile (375px):
  ┌──────────────────────────────────┐
  │ ☰  [LOGO]      🔍   🛒(2)        │ ← 56px altura
  └──────────────────────────────────┘
  ┌──────────────────────────────────┐
  │ CEP: 04567-000  ✏️  [Frete: R$15]│ ← faixa fina logo abaixo
  └──────────────────────────────────┘

Desktop (≥lg):
  ┌──────────────────────────────────────────────────────┐
  │ [LOGO]  Polos  Tênis  Bonés  ...   🔍   👤   🛒(2)  │
  ├──────────────────────────────────────────────────────┤
  │ CEP: 04567-000 ✏️   Frete: R$ 15   Pix com 5% OFF   │
  └──────────────────────────────────────────────────────┘

Sticky no scroll mobile (some metade quando rola pra baixo, volta quando sobe).
```

### 2.10 Footer

```
- Logo + tagline curta
- Colunas: Atendimento, Institucional, Pagamento
- "Comunidade Miami Store" — galeria de fotos de clientes
- CNPJ + endereço físico (prova de legitimidade)
- Disclaimer: "Miami Store é loja independente. Marcas exibidas pertencem aos seus respectivos proprietários."
- Selo de Site Seguro (SSL)
- Ícones: Pix, Visa, Master, Elo, Amex, Boleto
```

---

## 3. Wireframes — telas principais (mobile 375px)

### 3.1 Home
```
[Header com CEP]
[Banner hero (próximo drop / promo) — fundo preto + serif chunky branca]
[Tira "Pix com 5% OFF | Frete fixo R$ 15"]
[Seção: Marcas em destaque — carrossel de 6-8 logos]
[Seção: Mais vendidos — grid 2 col]
[Seção: Lançamentos — grid 2 col]
[Banner "Comunidade Miami" — fotos de clientes]
[CTA WhatsApp]
[Footer]
```

### 3.2 Listagem (categoria ou marca)
```
[Header]
[Breadcrumb: Home › Polos]
[Botão "Filtrar (3)"  | Ordenar ▾]
[Grid 2 col de ProductCard]
[Paginação ou infinite scroll]
[Footer]
```

### 3.3 Página do produto
```
[Header]
[Galeria — swipe horizontal full-width]
[Nome do produto]
[Selo "100% ORIGINAL"]
[Preço grande + opção "à vista no Pix R$ 189 (5% off)"]
[Parcelamento: "ou 4x R$ 49 sem juros"]
[Seletor de cor — swatches]
[Seletor de tamanho — grid de pílulas]
[Botão "Comprar agora" — sticky bottom]
[Botão "Adicionar ao carrinho"]
[Tabela de medidas — collapsible]
[Descrição — collapsible]
[Calculadora de frete inline]
[Selo "Comprou? Mostra na DM e a gente posta!"]
[Você também pode gostar — carrossel]
[CTA WhatsApp]
[Footer]
```

### 3.4 Carrinho
```
[Header simplificado]
[Lista de itens com qtd +/- e remover]
[Cupom — input + aplicar]
[Calculadora de frete (já preenchida do CEP do header)]
[Resumo: subtotal, frete, desconto, TOTAL]
[Banner: "Pague no Pix e ganhe 5% OFF"]
[Botão "Finalizar Compra" — sticky bottom]
```

### 3.5 Checkout (1 página)
```
[Header simplificado: só logo + ícone segurança]
[Stepper: 1 Dados › 2 Pagamento › 3 Confirmação] — visual, mas tudo na mesma página
[Seção 1: Dados de entrega — auto-preenche se logado]
[Seção 2: Pagamento — Pix DESTACADO no topo, Cartão, Boleto]
[Seção 3: Resumo do pedido]
[Botão "Pagar agora" — sticky bottom]
```

### 3.6 Painel Admin (Dashboard) — `/admin`
```
[Header admin: nome do lojista, sair]
[KPI Cards (linha 1): Receita 30d | Pedidos hoje | Ticket médio | Abandono]
[Gráfico de linha: Receita por dia (últimos 30 dias)]
[Top produtos vendidos (barra horizontal)]
[Pedidos por status (donut)]
[Tabela: Últimos 10 pedidos com status colorido]
[Atalho: "Adicionar Produto" | "Ver pedidos pendentes"]
```

---

## 4. Acessibilidade (não-negociável)

- Contraste mínimo **WCAG AA** em todo texto (texto pequeno ≥4.5:1, texto grande ≥3:1)
- Foco visível em todos os elementos interativos (`:focus-visible` com outline 2px var(--primary-700))
- Imagem com `alt` descritivo (ou `alt=""` se decorativa)
- Botão de ícone só com `aria-label`
- Form com `<label>` associado a input
- Erros de form anunciados com `role="alert"`
- Skip link "Pular para o conteúdo" no topo
- Teclado: tudo navegável com Tab, Enter, Esc

---

## 5. Princípios visuais

1. **Branco respira.** E-commerce confiável é limpo. Cores fortes só onde precisa de atenção.
2. **Verde é o herói.** Toda decisão de cor primária volta pro verde Lacoste.
3. **Vermelho é a exceção.** Só pra "gente, agora": promoção, última peça, erro.
4. **Foto manda no card.** Texto não compete com a imagem — sempre menor, sempre depois.
5. **Mobile primeiro, sempre.** Se não funciona em 375px, não vai pro merge.
6. **Autenticidade > polish exagerado.** Foto de cliente real vale mais que renderização perfeita.
