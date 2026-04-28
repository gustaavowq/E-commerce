# Component Specs — Kore Tech

> Specs visuais dos componentes-chave da loja e painel.
> Para Frontend (Agente 03) implementar sem inventar valor.
> Mantido pelo Designer (Agente 02). Última atualização: 2026-04-26.
> **Não inclui specs do builder** — esses estão em `BUILDER-VISUAL-SPECS.md`.

Tokens vêm de `design/tokens.css` e `design/tailwind.config.preset.ts`. Não usar literal hex no código.

---

## 1. ProductCard (componente avulso — CPU, GPU, mobo, etc)

Card padrão da PLP `/produtos`. Foco em spec técnica curta + preço.

### Tamanho
- **Mobile (375px):** 2 col grid, gap 12px. Card 100% da coluna.
- **Tablet (768px):** 3 col grid.
- **Desktop (1024px+):** 4 col grid, gap 16px. Card ~280px wide.

### Estrutura

```
┌─────────────────────────────────┐
│  [foto produto 4:5]             │
│  ┌────────┐    ┌─────────┐      │
│  │ marca  │    │ -15% off│      │ ← badges absolute top-left + top-right
│  └────────┘    └─────────┘      │
├─────────────────────────────────┤
│ Categoria · Socket AM5          │ ← text-xs muted uppercase tracking-wide
│ Ryzen 7 7700                    │ ← name, font-semibold text-base, 2 lines max
│                                 │
│ R$ 1.899                        │ ← preço, font-mono text-xl bold
│ R$ 2.230 (riscado)              │ ← preço antigo, font-mono text-sm muted line-through
│ ou 12x R$ 158                   │ ← parcela, text-xs secondary
│                                 │
│ ✓ Em estoque                    │ ← stock indicator (success ou danger)
│                                 │
│ [ Ver detalhes ]                │ ← btn ghost full-width 40px
└─────────────────────────────────┘
```

### Tokens

```
bg:                 bg-surface
border:             border border-border
radius:             rounded-lg
shadow:             shadow-sm
padding interno:    p-4 (16px)
gap interno:        gap-2 (8px)

hover (desktop):
  bg-surface-2
  border-border-strong
  shadow-md
  translate-y-(-2px)
  transition all 200ms
```

### Variantes de stock indicator

| Estado | Ícone | Texto | Cor |
|---|---|---|---|
| Em estoque (>5) | check-circle 14x14 | "Em estoque" | `text-success` |
| Estoque baixo (1-5) | alert-circle 14x14 | "Últimas {n} unidades" | `text-warning` |
| Sem estoque | clock 14x14 | "Sem estoque, te avisamos" | `text-danger` (botão vira WaitlistButton) |

---

## 2. PCBuildCard (PC montado pronto)

Card de PC montado completo. Diferença pro ProductCard: **destaque em FPS por jogo** (diferencial competitivo do nicho).

### Tamanho
- **Mobile:** 1 col, full width (cards mais altos com mais info — não cabe 2 col bem).
- **Tablet:** 2 col grid.
- **Desktop:** 3 col grid, gap 16px. Card ~360px wide.

### Estrutura

```
┌────────────────────────────────────────┐
│  [foto PC montado 4:3 — gabinete 3/4]  │
│  ┌──────────┐                          │
│  │ Persona  │ ← chip persona, top-left
│  └──────────┘                          │
├────────────────────────────────────────┤
│ Kore Tech · Valorant Pro               │ ← text-xs muted tracking-wide
│ RTX 4070 Super · Ryzen 7 7700          │ ← name, font-semibold text-lg
│                                        │
│ ┌────────────────────────────────┐     │
│ │ FPS BADGE                      │     │ ← FPSBadge (ver sec. 5)
│ │ 240 FPS · Valorant 1080p high  │     │
│ │ 165 FPS · Fortnite 1440p comp. │     │
│ │ 280 FPS · CS2 1080p high       │     │
│ └────────────────────────────────┘     │
│                                        │
│ R$ 6.499                               │ ← font-mono text-2xl bold
│ Pix R$ 6.175 (5% off)                  │ ← text-sm primary
│ ou 12x R$ 541 sem juros                │ ← text-xs secondary
│                                        │
│ ✓ Em estoque · Envia em 3 dias úteis   │ ← text-sm success
│                                        │
│ [ Ver detalhes ]    [ Comprar ]        │ ← 2 buttons (ghost + primary)
└────────────────────────────────────────┘
```

### Tokens

```
bg:                 bg-surface
border:             border border-border
radius:             rounded-lg
shadow:             shadow-md (mais "presente" que ProductCard)
padding interno:    p-5 (20px)
gap interno:        gap-3 (12px)

hover (desktop):
  bg-surface-2
  border-primary (cyan)
  shadow-lg
  translate-y-(-2px)
```

### Chip persona

```
bg:        bg-primary-soft
text:      text-primary
border:    1px solid rgba(0,229,255,0.30)
radius:    rounded-pill
padding:   4px 10px
font:      text-xs font-medium tracking-wide
```

Exemplo: "VALORANT 240FPS", "EDIÇÃO 4K", "IA LOCAL LLAMA".

---

## 3. Header (loja)

### Mobile (375px)

```
┌────────────────────────────────────────┐
│ ☰  [LOGO]      🔍   👤   🛒(2)         │ ← h-14 (56px) sticky
└────────────────────────────────────────┘
```

- bg: `bg-bg/85` com `backdrop-blur-md` (efeito vidro)
- border-bottom: `1px solid border-border`
- ícones: 24x24 lucide, color `text-text`
- badge no carrinho: bg `bg-primary` text `text-text-on-primary` text-xs font-bold rounded-full

### Desktop (≥1024px)

```
┌──────────────────────────────────────────────────────────────────────────┐
│ [LOGO]  Início | Loja ▼ | Builder | Builds prontos ▼ | Sobre | Contato  │
│                                                  🔍 [busca]   👤   🛒(2) │
└──────────────────────────────────────────────────────────────────────────┘
```

- h-16 (64px) sticky
- bg: `bg-bg/85` com `backdrop-blur-md`
- border-bottom: `1px solid border-border`
- nav items: `text-sm` `text-text-secondary` hover `text-text`, active `text-primary`
- "Builder" tem destaque sutil: `text-primary` permanente
- gap entre nav items: `gap-6` (24px)

### Busca

Input inline no header desktop, modal/drawer no mobile (clica na lupa abre).

```
input bg:        bg-surface
input border:    border-border, focus border-primary
placeholder:     "Busca produto, marca, persona..."
ícone:           lupa 16x16 left-3, text-text-muted
height:          40px
radius:          rounded-md
width:           320px desktop, full mobile
```

---

## 4. Footer

```
┌──────────────────────────────────────────────────────────┐
│ [LOGO Kore Tech]                                         │
│ Hardware sério, montado certo, no FPS que você queria.   │
│                                                          │
│ ── ATENDIMENTO ──   ── INSTITUCIONAL ──   ── PAGAMENTO ──│
│ WhatsApp            Sobre                  Pix 5% off    │
│ Email suporte       Garantia               12x sem juros │
│ FAQ técnico         Trocas e devoluções    Boleto        │
│ Status pedido       Política privacidade   Cartão        │
│                     Termos de uso                        │
│                                                          │
│ ── REDES ──                                              │
│ [insta] [yt] [tiktok] [reddit]                          │
│                                                          │
│ ─────────────────────────────────────────────────────    │
│                                                          │
│ Kore Tech · CNPJ XX.XXX.XXX/0001-XX · Endereço          │
│ Selos: Site Seguro · LGPD · Inmetro · Anatel            │
└──────────────────────────────────────────────────────────┘
```

### Tokens

```
bg:               bg-surface
border-top:       border-t border-border
padding y:        py-12 mobile, py-16 desktop
padding x:        px-4 mobile, px-8 desktop

heading colunas:  text-xs uppercase tracking-wide font-semibold text-text-secondary
links:            text-sm text-text-secondary hover:text-text
gap entre col:    gap-8

bottom row:
  border-top:    border-t border-border
  padding-top:   pt-6
  text:          text-xs text-text-muted
```

---

## 5. FPSBadge (componente único do nicho)

Diferencial visual do Kore Tech. Aparece em PCBuildCard, PDP de PC montado, e landing de persona. É o jeito visual de mostrar "esse PC roda X em Y FPS".

### Variantes

#### Variante COMPACT (em card, lista de 3 jogos)

```
┌──────────────────────────────────────┐
│ [240 FPS]  Valorant · 1080p high     │
└──────────────────────────────────────┘

ícone barzinha 4px-altura à esquerda em var(--color-primary)
[240 FPS]:    font-mono text-base font-bold text-primary
"Valorant":   text-sm text-text font-medium
"1080p high": text-xs text-text-secondary

bg:            bg-surface-2
border:        border border-border
radius:        rounded-md
padding:       8px 12px
gap interno:   gap-3
```

Lista de 3 FPSBadges empilhados verticais com gap-2 (8px) entre eles.

#### Variante HERO (em PDP, destaque grande)

```
┌─────────────────────────────────────┐
│                                     │
│        240                          │ ← font-mono text-6xl text-primary
│        FPS                          │ ← text-sm uppercase tracking-wide text-text-secondary
│                                     │
│        VALORANT                     │ ← text-base font-semibold text-text
│        1080p high · estimado        │ ← text-xs text-text-muted
│                                     │
└─────────────────────────────────────┘

bg:            bg-surface
border:        border border-primary (1px cyan)
shadow:        shadow-glow-primary
radius:        rounded-xl
padding:       24px
text-align:    center
```

Aparece em PDP de PC montado, em row de 3 cards (3 jogos principais da persona). Em landing de persona, vira hero element.

#### Sufixo "estimado"

Sempre que mostra FPS, em algum lugar do card aparece "estimado" em `text-xs text-text-muted`. Curado manualmente no MVP, integração 3DMark depois (ver PESQUISA-NICHO seção 14). Transparência protege a marca.

---

## 6. WaitlistButton (substitui "Comprar" quando sem estoque)

Botão crítico do diferencial "anti-paper-launch".

### Estado padrão (não inscrito)

```
┌───────────────────────────────────────┐
│  [bell icon]  Me avise quando voltar  │
└───────────────────────────────────────┘

bg:              bg-surface-2
border:          border border-border-strong
text:            text-text font-semibold text-base
ícone:           bell (lucide) 18x18 var(--color-primary)
height:          44px (touch target)
padding:         px-4
radius:          rounded-md
hover:           bg-surface, border-primary

cursor:          pointer
```

### Estado inscrito (já clicou)

```
┌───────────────────────────────────────┐
│  [check icon]  Te avisamos por email  │
└───────────────────────────────────────┘

bg:              bg-success-soft
border:          border-success
text:            text-success font-medium
ícone:           check (lucide) 18x18 var(--color-success)
cursor:          default
```

### Modal de inscrição (quando clica)

Aparece se cliente não está logado. Pede email simples + opcional WhatsApp.

```
[Modal padrão — ver sec. 8]
Título: "Te avisamos quando essa RTX 4080 voltar."
Subtítulo: "Reservamos por 24h pra quem se inscreveu primeiro."

[ input email * ]
[ input whatsapp opcional ]

[ Me avise ] (primário cyan, full-width)

footer pequeno: "Sem spam. Você cancela quando quiser."
```

---

## 7. SpecsTable (ficha técnica)

Tabela estruturada de specs técnicas. Aparece em PDP de componente e PDP de PC montado (lista de peças).

### Estrutura

```
┌──────────────────────────────────────────┐
│  ESPECIFICAÇÕES TÉCNICAS                 │ ← header collapsible
├──────────────────────────────────────────┤
│  Socket            AM5                   │
│  TDP               105W                  │
│  Núcleos / Threads 8c / 16t              │
│  Frequência base   3.8 GHz               │
│  Frequência boost  5.3 GHz               │
│  Cache L3          32 MB                 │
│  Memória suportada DDR5-5200             │
│  Gráficos integr.  AMD Radeon            │
│  Garantia          36 meses              │
└──────────────────────────────────────────┘
```

### Tokens

```
container:
  bg:        bg-surface
  border:    border border-border
  radius:    rounded-lg
  padding:   0 (rows têm padding próprio)

header:
  padding:   px-4 py-3
  text:      text-xs uppercase tracking-wide font-semibold text-text-secondary
  border-bottom: border-b border-border
  cursor:    pointer (collapsible)
  ícone:     chevron-down 16x16, rotate-180 quando aberto

rows:
  display:   flex justify-between
  padding:   px-4 py-3
  border-bottom: border-b border-border (exceto última)

label (esquerda):
  text:      text-sm text-text-secondary
  font:      font-medium
  flex:      flex-1

valor (direita):
  text:      text-sm text-text font-mono   ← MONO pra alinhamento de números
  font:      font-semibold
  text-align: right
```

### Comportamento

- Default: aberta em PDP de componente.
- Default: fechada em PDP de PC montado (cliente clica pra ver detalhe).
- Em PC montado: cada peça é uma `SpecsTable` separada, agrupadas em accordion (CPU / Mobo / RAM / GPU / etc).

---

## 8. Modal padrão

```
┌────────────────────────────────────────┐
│ Título do modal                    [✕] │ ← header
├────────────────────────────────────────┤
│                                        │
│  Conteúdo                              │
│                                        │
│                                        │
├────────────────────────────────────────┤
│              [ Cancelar ] [ Confirmar ]│ ← footer (alinhado à direita)
└────────────────────────────────────────┘
```

### Tokens

```
overlay:
  bg:        rgba(10, 14, 20, 0.78)
  backdrop:  blur(4px)
  z-index:   var(--z-modal)
  animation: animate-fade-in 200ms

container:
  bg:        bg-surface-2
  border:    border border-border-strong
  radius:    rounded-xl
  shadow:    shadow-xl
  width:     max-w-md (mobile: full minus 32px margin)
  animation: animate-scale-in 200ms

header:
  padding:   px-6 py-4
  border-bottom: border-b border-border
  título:    text-lg font-semibold

botão fechar (X):
  size:      40x40 (touch)
  ícone:     x (lucide) 20x20
  color:     text-text-muted hover:text-text

body:
  padding:   px-6 py-5

footer:
  padding:   px-6 py-4
  border-top: border-t border-border
  display:   flex justify-end gap-3
```

### Acessibilidade

- ESC fecha (regra UX da skill).
- Foco trap dentro do modal.
- `aria-labelledby` apontando pro título.
- `role="dialog"` + `aria-modal="true"`.

---

## 9. Botões (referência mestre)

### Primário (cyan)

```
bg:           bg-primary
text:         text-text-on-primary (preto pra contraste em cyan)
font:         font-semibold text-sm
padding:      px-5 py-3 (≥44px height)
radius:       rounded-md
shadow:       shadow-sm

hover:
  bg:         bg-primary-hover
  shadow:     shadow-glow-primary

active:
  scale:      0.98

disabled:
  bg:         bg-surface-2
  text:       text-text-muted
  cursor:     not-allowed
  shadow:     none

loading:
  spinner branco substituindo o texto
```

### Secundário (ghost cyan)

```
bg:           transparent
text:         text-primary
border:       1px solid var(--color-primary)
font:         font-medium text-sm
padding:      px-5 py-3

hover:
  bg:         bg-primary-soft

disabled:
  border:     border-border
  text:       text-text-muted
```

### Tertiário (texto puro)

```
bg:           transparent
text:         text-primary
font:         font-medium text-sm
padding:      px-2 py-1
underline:    on hover (underline-offset-2)
```

### Danger (raro — só em "remover", "cancelar pedido")

```
bg:           bg-danger
text:         text-text (branco)
font:         font-semibold text-sm
hover:        bg-danger com shadow-glow-danger
```

---

## 10. Inputs (form)

```
input bg:        bg-surface
input border:    1px solid border-border
input radius:    rounded-md
input padding:   px-4 py-3 (≥44px height)
input text:      text-text text-base
input placeholder: text-text-muted

focus:
  border:        border-primary (1.5px)
  shadow:        0 0 0 3px rgba(0,229,255,0.20)
  outline:       none

error:
  border:        border-danger
  + label helper abaixo:
    text:        text-sm text-danger
    icon:        alert-circle 14x14 inline antes do texto

label (acima do input):
  text:          text-sm font-medium text-text
  margin-bottom: 6px
```

Atributos obrigatórios:
- `inputmode="numeric"` em CEP/CPF/cartão.
- `inputmode="email"` em email, `inputmode="tel"` em telefone.
- `autocomplete` apropriado em todos.
- `<label>` SEMPRE associado (visível, não placeholder-only).

---

## 11. Toast (notificação)

```
position:        fixed top-4 right-4 (desktop) / bottom-4 left-4 right-4 (mobile)
z-index:         var(--z-toast)
animation:       animate-fade-up

bg:              bg-surface-2
border:          1px solid (cor do estado)
border-left:     4px solid (cor do estado destaque)
radius:          rounded-md
padding:         p-4
shadow:          shadow-lg
max-width:       400px

ícone:           18x18 (color do estado)
título:          text-sm font-semibold text-text
mensagem:        text-sm text-text-secondary

botão fechar:    24x24 ícone X muted hover:text
```

Variantes (cor do estado):
- success: `border-success` + `border-l-success` + ícone `check-circle` cyan-success
- warning: `border-warning` + `border-l-warning` + ícone `alert-triangle`
- danger: `border-danger` + `border-l-danger` + ícone `x-circle`
- info: `border-info` + `border-l-info` + ícone `info`

Auto-dismiss em 5s. Escapável com ESC.

---

## 12. Skeleton loading

Em vez de spinner (regra UX da skill), usar skeleton animado.

```
bg:              linear-gradient(90deg, bg-surface 0%, bg-surface-2 50%, bg-surface 100%)
animation:       shimmer 1.4s infinite linear
border-radius:   herda do container

shimmer keyframes:
  from: background-position -200%
  to:   background-position 200%
```

Aplicar como placeholder de:
- ProductCard (imagem 4:5 + 3 linhas de text + botão)
- PCBuildCard
- SpecsTable rows
- Hero image

---

## 13. PaymentBadges (footer + checkout)

Lista horizontal de logos de método de pagamento. Pix sempre primeiro com destaque sutil.

```
container:       flex items-center gap-3
height:          32px

cada badge:
  bg:            bg-surface-2
  border:        border border-border
  radius:        rounded-md
  padding:       px-3 py-1.5
  height:        32px
  display:       flex items-center
  ícone:         24x16 logo do método (svg)

Pix (primeiro, destaque):
  border:        border-primary
  + sub-text:    "5% off" text-xs text-primary font-mono
```

Métodos: Pix · Visa · Master · Elo · Amex · Boleto.

---

## 14. PersonaHero (landing /builds/{persona-slug})

Hero de landing de persona — page SEO killer.

```
┌──────────────────────────────────────────────────────────┐
│                                                          │
│  [chip: PERSONA · VALORANT 240FPS]                       │
│                                                          │
│  Build pra rodar Valorant a 240 FPS no 1080p.            │ ← h1 text-5xl
│  3 PCs prontos. Ou monta o seu.                          │ ← subtitle text-xl text-secondary
│                                                          │
│  [ Ver builds prontos ]   [ Montar do zero ]            │
│                                                          │
│  ┌────┐ ┌────┐ ┌────┐                                    │
│  │240 │ │280 │ │165 │   ← FPSBadge HERO (3 jogos)        │
│  │FPS │ │FPS │ │FPS │                                    │
│  └────┘ └────┘ └────┘                                    │
│                                                          │
└──────────────────────────────────────────────────────────┘

bg:              bg-bg
+ overlay sutil: linear-gradient(180deg, transparent 0%, rgba(0,229,255,0.04) 100%)
padding:         py-20 desktop, py-12 mobile
text-align:      left desktop, center mobile

chip persona:    igual chip do PCBuildCard (sec. 2)
h1:              text-5xl font-bold tracking-tight text-text
subtitle:        text-xl text-text-secondary mt-3
botões:          gap-3 mt-8
```

A landing /builds/{persona-slug} usa essa hero + 3 PCBuildCards do persona + USPs em row + CTA pro builder + FAQ específico.
