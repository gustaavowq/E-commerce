# Builder — Visual Specs

> Specs visuais detalhadas dos componentes do PC Builder.
> Ler junto com `tokens.css` (cores referenciadas por nome de token).
> Para Frontend (Agente 03) implementar sem inventar valor.
> Mantido pelo Designer (Agente 02). Última atualização: 2026-04-26.

---

## 1. Layout geral do `/montar`

### Mobile (375px — base)

```
┌─────────────────────────────────────┐
│ Header padrão (sticky)              │  56px
├─────────────────────────────────────┤
│ [Categoria atual: GPU ▼]            │  48px (selector pro mobile)
│ [filtro] [marca] [preço]            │  40px (chips horizontais scrollable)
├─────────────────────────────────────┤
│                                     │
│   Lista de produtos compatíveis     │  flex-1, scroll
│   (cards verticais 2 col)           │
│                                     │
├─────────────────────────────────────┤
│ ⚡ 580W  💰 R$ 5.480 [Ver build ↑]  │  64px sticky bottom
└─────────────────────────────────────┘
```

### Desktop (≥1024px)

```
┌────────────────────────────────────────────────────────────────────────┐
│ Header padrão                                                          │
├──────────────┬─────────────────────────────────────┬───────────────────┤
│              │                                     │                   │
│ SIDEBAR      │  CONTEÚDO CENTRAL                   │  BUILD ATUAL      │
│ Categorias   │                                     │  Resumo lateral   │
│              │  Lista filtrada de produtos         │                   │
│ ✓ CPU        │  (grid 3 col)                       │  CPU: Ryzen 7700  │
│ ✓ Mobo       │                                     │  Mobo: B650 Tuf   │
│ → GPU        │                                     │  RAM: 32GB DDR5   │
│   RAM        │                                     │  GPU: -           │
│   PSU        │                                     │  PSU: -           │
│   Case       │                                     │  Case: -          │
│   Cooler     │                                     │  Cooler: -        │
│   Storage    │                                     │                   │
│              │                                     │  ⚡ 165W (parcial) │
│              │                                     │  💰 R$ 3.480       │
│ 240px        │                                     │  280px            │
├──────────────┴─────────────────────────────────────┴───────────────────┤
│ BARRA DE STATUS (BuilderCompatibilityBar) — sticky bottom              │  72px
└────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Estados de PartCard no Builder

Card de uma peça (CPU, GPU, etc) na lista filtrada do builder. Cada peça tem 5 estados visuais possíveis.

### Tamanho base
- **Mobile:** width 100% da coluna do grid (2 col), aspect-ratio 4:5 da imagem
- **Desktop:** width ~280px, aspect-ratio 4:5 da imagem
- **Padding interno:** `--space-4` (16px)
- **Gap entre cards:** `--space-3` (12px) mobile / `--space-4` (16px) desktop
- **Border-radius:** `--radius-lg` (12px)

### Estado 1 — PADRÃO (selecionável, compatível)

```
bg:               var(--color-surface)        /* #141921 */
border:           1px solid var(--color-border)   /* #1E2530 */
shadow:           var(--shadow-sm)
text-primary:     var(--color-text)
text-secondary:   var(--color-text-secondary)
preço destaque:   var(--color-text), font-mono, font-semibold
ícone categoria:  var(--color-text-muted) 16x16

Cursor: pointer
Touch target: 44px min em todos os botões internos
```

Estrutura interna:
```
┌─────────────────────────────────┐
│  [foto produto 4:5]             │
│  ┌────────┐                     │
│  │ marca  │ ← badge top-left    │
│  └────────┘                     │
├─────────────────────────────────┤
│ Ryzen 7 7700                    │ ← nome, font-semibold text-base
│ AM5 · 105W · 8c/16t             │ ← specs chave em mono, text-sm muted
│                                 │
│ R$ 1.899                        │ ← preço, font-mono text-xl bold
│ 12x R$ 158                      │ ← parcela, text-xs secondary
│                                 │
│ [ Adicionar ]                   │ ← botão full-width 44px
└─────────────────────────────────┘
```

### Estado 2 — HOVER (desktop)

```
bg:               var(--color-surface-2)      /* #1B2230 */
border:           1px solid var(--color-border-strong)  /* #2A3240 */
shadow:           var(--shadow-md)
transform:        translateY(-2px)
transition:       all 200ms var(--ease)
```

No hover, o botão "Adicionar" muda pra estado de ênfase do primary (ver botão CTA primário em `COMPONENT-SPECS.md`).

### Estado 3 — SELECIONADO (já está no build)

```
bg:               var(--color-surface)
border:           1.5px solid var(--color-primary)   /* #00E5FF */
shadow:           var(--shadow-glow-primary)         /* glow cyan sutil */
                  0 0 0 1px rgba(0,229,255,0.40), 0 0 24px rgba(0,229,255,0.25)

Badge canto superior direito do card:
  bg:        var(--color-primary)
  text:      var(--color-text-on-primary)  /* preto */
  conteúdo:  "✓ no build"
  font:      text-xs font-bold uppercase tracking-wide
  padding:   4px 8px
  radius:    var(--radius-sm)

Botão "Adicionar" → vira "Trocar" com estilo secundário (ghost):
  bg:        transparent
  border:    1px solid var(--color-primary)
  text:      var(--color-primary)
```

### Estado 4 — INCOMPATÍVEL (não pode adicionar)

```
bg:               var(--color-surface)
border:           1px dashed var(--color-danger)   /* #FF5252 dashed */
opacity:          0.65 na imagem (deixa "sumido")
text:             mantém legibilidade (não reduz)

Banner sobreposto no topo do card (substitui badge marca):
  bg:        var(--color-danger-soft)            /* rgba(255,82,82,0.10) */
  border:    1px solid rgba(255,82,82,0.30)
  ícone:     ⚠ (lucide AlertTriangle 14x14, color danger)
  texto:     "Incompatível: socket AM5 vs LGA1700"
  font:      text-xs medium
  padding:   8px 12px
  radius:    var(--radius-sm)
  position:  absolute top:8px left:8px right:8px

Botão "Adicionar" → vira disabled:
  bg:        var(--color-surface-2)
  text:      var(--color-text-muted)
  cursor:    not-allowed
  texto:     "Não compatível"
```

A peça **continua visível** na lista (não some) pra educar o cliente sobre por que não cabe — texto da incompatibilidade explica o motivo. Cliente aprende sobre o nicho enquanto monta.

### Estado 5 — RECOMENDADO (sugestão upgrade)

```
bg:               var(--color-surface)
border:           1.5px solid var(--color-warning)   /* #FFB74D */
shadow:           0 0 0 1px rgba(255,183,77,0.30)

Badge canto superior direito:
  bg:        var(--color-warning)
  text:      var(--color-text-on-primary)   /* preto pra contraste em âmbar */
  conteúdo:  "Sugerido"
  font:      text-xs font-bold uppercase tracking-wide

Subtext acima do botão "Adicionar":
  bg:        var(--color-warning-soft)
  text:      var(--color-warning)
  conteúdo:  "Sua GPU pede 750W. Essa fonte cobre."
  font:      text-xs medium
  padding:   6px 8px
  radius:    var(--radius-sm)
  margin-bottom: 8px
```

Aparece em PSU quando a wattagem somada do build > capacidade da PSU atual selecionada. Aparece em qualquer categoria quando o sistema sugere upgrade lógico.

---

## 3. BuilderCompatibilityBar (sticky bottom)

Componente crítico — sempre visível enquanto o cliente monta. Mostra status em tempo real.

### Mobile

Altura: 64px. Padding: 12px 16px. `position: sticky; bottom: 0; z-index: var(--z-sticky)`.

```
┌─────────────────────────────────────┐
│  [⚡ 580W]  [💰 R$ 5.480]   [Build ▾]│
└─────────────────────────────────────┘
```

- **bg:** `rgba(10, 14, 20, 0.92)` com `backdrop-filter: blur(12px)` (efeito vidro)
- **border-top:** 1px solid `var(--color-border-strong)`
- **shadow:** `0 -8px 24px rgba(0,0,0,0.55)` (sombra pra cima)
- **número wattagem:** `font-mono`, `text-base`, color depende do estado
- **número preço:** `font-mono`, `text-base`, `font-semibold`, `var(--color-text)`
- **Botão "Build ▾":** abre bottom-sheet com a lista completa de peças no build

### Desktop

Altura: 72px. Padding: 16px 32px. Estrutura horizontal com 4 zonas:

```
┌──────────────────────────────────────────────────────────────────┐
│ [STATUS]  [WATTAGEM]  [TOTAL]              [Salvar]  [Comprar]   │
└──────────────────────────────────────────────────────────────────┘
```

#### Zona STATUS (estado da compatibilidade)

3 estados possíveis:

| Estado | bg | ícone | texto | quando |
|---|---|---|---|---|
| **Sucesso** | `var(--color-success-soft)` | check circle (Lucide) `var(--color-success)` 16x16 | "Tudo compatível" font-medium text-sm | nenhuma incompatibilidade nem warning |
| **Warning** | `var(--color-warning-soft)` | alert circle `var(--color-warning)` 16x16 | "1 sugestão de upgrade" | há sugestão (PSU sub) mas nada bloqueante |
| **Erro** | `var(--color-danger-soft)` | x circle `var(--color-danger)` 16x16 | "2 incompatibilidades" | bloqueante — não permite checkout |

Estilo do "pill" status:
- padding: `8px 12px`
- radius: `var(--radius-pill)`
- border: `1px solid` da cor do estado com opacidade 0.40
- gap entre ícone e texto: 8px

#### Zona WATTAGEM

```
[ícone Zap (Lucide) 16x16 var(--color-text-secondary)]
[span font-mono text-base font-semibold]   580W

texto auxiliar abaixo (se PSU selecionada):
  "PSU 750W · 77% utilizada"
  font-mono text-xs var(--color-text-secondary)

cor do número:
  - default (sem PSU ainda): var(--color-text)
  - dentro do limite PSU:    var(--color-success)
  - acima da PSU:            var(--color-danger)
```

#### Zona TOTAL

```
[label uppercase tracking-wide text-xs muted]   TOTAL
[span font-mono text-2xl font-bold]             R$ 5.480
[texto secondary text-xs]                       12x R$ 457 sem juros
```

#### Zona BOTÕES

- **Salvar:** secundário (ghost), ícone bookmark (Lucide). Ver `COMPONENT-SPECS.md`.
- **Comprar:** primário cyan. Disabled quando estado = "Erro". Texto: "Comprar build" se completo, "Faltam X peças" se incompleto.

---

## 4. BuilderPSURecommendation (modal/inline card)

Aparece quando wattagem ultrapassa PSU selecionada (ou quando PSU ainda não foi escolhida e build já tem GPU+CPU).

### Layout

Card inline acima da lista de produtos da categoria PSU, ou modal quando aberto via "Ver sugestão" no warning.

```
bg:               var(--color-warning-soft)
border:           1px solid rgba(255,183,77,0.40)
border-radius:    var(--radius-lg)
padding:          var(--space-4) (16px)

┌──────────────────────────────────────────────┐
│ [⚠]  Sua build precisa de fonte ≥ 750W      │
│      Você selecionou 550W (insuficiente)     │
│                                              │
│  Sugestão da casa:                           │
│  ┌────────────────────────────────────────┐  │
│  │ [foto]  Corsair RM750x 80+ Gold       │  │
│  │         Modular · 10 anos garantia    │  │
│  │         R$ 749 (+ R$ 280 vs sua atual)│  │
│  │         [ Trocar fonte ]              │  │
│  └────────────────────────────────────────┘  │
└──────────────────────────────────────────────┘
```

- ícone âmbar 18x18 `var(--color-warning)` no topo-esquerda
- título font-semibold text-base `var(--color-warning)`
- subtítulo text-sm `var(--color-text-secondary)`
- card interno em `var(--color-surface-2)` com radius md
- botão "Trocar fonte" primário cyan small (32px height)

---

## 5. Cores exatas pra warnings/errors do builder (referência rápida)

| Tipo | Token | Hex | Quando usar |
|---|---|---|---|
| **Success** | `--color-success` | `#00E676` | "✓ socket compatível", "✓ no estoque", "✓ tudo OK" |
| **Success bg** | `--color-success-soft` | `rgba(0,230,118,0.10)` | Background de pill "tudo compatível" |
| **Warning** | `--color-warning` | `#FFB74D` | "⚠ fonte insuficiente, troca por +R$ 280", "⚠ FPS abaixo do alvo da persona" |
| **Warning bg** | `--color-warning-soft` | `rgba(255,183,77,0.10)` | Background de banner sugestão de upgrade |
| **Danger** | `--color-danger` | `#FF5252` | "✗ socket incompatível", "✗ cooler não cabe (158mm vs 155mm)", "✗ sem estoque" |
| **Danger bg** | `--color-danger-soft` | `rgba(255,82,82,0.10)` | Background de banner incompatibilidade |
| **Info** | `--color-info` | `#29B6F6` | "tip: AM5 só aceita DDR5" — esclarecimentos didáticos pra iniciante |

**Regra acessibilidade:** cor sozinha NUNCA carrega a info crítica. Sempre pareada com:
- ícone (check, alert-triangle, x-circle, info)
- texto explícito ("compatível", "atenção", "incompatível")

---

## 6. Microcopy padrão do builder (Copywriter usa de base)

Strings curtas que aparecem em estados do builder. Copywriter pode refinar mas mantém o tom direto.

| Estado | Copy |
|---|---|
| Tooltip categoria CPU | "O processador. Define socket da placa-mãe e tipo de RAM." |
| Tooltip categoria Mobo | "Placa-mãe. Mostramos só as que servem na CPU que você escolheu." |
| Tooltip categoria PSU | "Fonte. Calculamos a wattagem somada e sugerimos fonte adequada." |
| Empty state — antes de escolher CPU | "Começa pela CPU. As outras peças vão filtrar a partir dela." |
| Empty state — todas as peças escolhidas | "Build pronto. Wattagem dentro do limite. Vai pro carrinho?" |
| Warning — fonte sub | "Fonte de {atual}W não cobre essa GPU. Sugerimos {sugerida}W por +R$ {diff}." |
| Erro — socket | "Socket incompatível: CPU {socket_cpu} vs placa-mãe {socket_mobo}. Troca uma das duas." |
| Erro — cooler altura | "Cooler de {altura_cooler}mm não cabe nesse gabinete (max {altura_case}mm). Troca o cooler ou o gabinete." |
| Erro — GPU comprimento | "GPU de {gpu_length}mm não cabe nesse gabinete (max {case_max}mm)." |
| Erro — RAM tipo | "Essa RAM é {ddr_ram} mas a placa-mãe só aceita {ddr_mobo}. Troca a RAM." |
| Botão checkout incompleto | "Faltam {n} peças" (font-medium) |
| Botão checkout completo + warnings | "Comprar mesmo com avisos" (warning) |
| Botão checkout completo OK | "Comprar build" (primário cyan) |

---

## 7. Animações específicas do builder

- **Adicionar peça:** `animate-fade-up` (240ms) no badge "✓ no build" + `pulse-glow` no card por 1.8s.
- **Remover peça:** fade-out 150ms + colapsa altura 200ms.
- **Trocar peça:** sem animação (instant) pra não dar impressão de lentidão.
- **Status bar mudar de OK pra warning:** transição de `bg-color` 200ms (sem flash). Cor do número wattagem transita junto.
- **Modal PSU recommendation:** `animate-scale-in` (200ms) com backdrop blur fade-in.

Tudo dentro do limite 300ms padrão / 400ms máximo do brief.

---

## 8. Acessibilidade do builder

- **Tab order:** sidebar → conteúdo central → status bar (esquerda pra direita).
- **Botão "Adicionar":** `aria-label="Adicionar Ryzen 7 7700 ao build"` (descritivo, não só "Adicionar").
- **Estado incompatível:** `aria-disabled="true"` no botão + `aria-describedby` apontando pro motivo.
- **Status bar:** `role="status"` + `aria-live="polite"` pra screen reader anunciar mudança ("580W de 750W. Tudo compatível.").
- **Focus visível:** anel cyan 2px offset 2px (regra global). Não some no estado selecionado.
- **Touch:** todos os botões 44x44px min (regra `min-h-touch` do preset Tailwind).
