# 🎨 Fase 2 — Design system

> Aprovação visual antes de codar UI. Brand-brief com tokens Tier 1/2/3, mood-board com 6+ refs reais, depth pack cinematic, voz definida. Sem "aprovado" do user, frontend não começa.

Skill responsável: **`ecommerce-designer`**.
Tempo esperado: **30–45 min**.
Gate de saída: [[GATES#Gate 2 — Design]].

## 7 subcamadas

### 2.1 Pesquisa visual

12 referências reais (não mockup IA). Cobre 3 mercados.

- **2 BR** — concorrentes (link site real + screenshot da home)
- **2 EUA** — Awwwards/Behance/site concorrente
- **2 Europa** — idem
- **6 livres** — Unsplash/Pexels com link direto

Output em `projetos/[slug]/MOOD-BOARD.md`. Cada ref tem:
- URL
- Screenshot ou caption do que importa
- 1 frase: "o que tirar daqui" (paleta? tipografia? composição? motion?)

**Anti-padrão Kore:** mood com mockup gerado por IA sem ref real. Cliente percebe na hora — design fica genérico Lovable.

### 2.2 Tokens Tier 1 (primitives)

Escala completa de cor. **Nunca usado direto na UI** — alimenta Tier 2.

```ts
// projetos/[slug]/tokens/primitives.ts (referência)
export const colors = {
  gray: {
    0: '#ffffff', 50: '#fafafa', 100: '#f5f5f5', 200: '#e5e5e5',
    300: '#d4d4d4', 400: '#a3a3a3', 500: '#737373', 600: '#525252',
    700: '#404040', 800: '#262626', 900: '#171717', 950: '#0a0a0a',
  },
  brand: { /* derivar do nicho — moda pastel, tech frio, beleza rosé */ },
  red:    { 50: '...', ..., 950: '...' },  // danger
  green:  { 50: '...', ..., 950: '...' },  // success
  yellow: { 50: '...', ..., 950: '...' },  // warning
  blue:   { 50: '...', ..., 950: '...' },  // info / accent fallback
} as const
```

Ver template completo em [[../50-PADROES/design-tokens-tier-template]].

### 2.3 Tokens Tier 2 (semantic — Tailwind extend)

Camada onde a UI **realmente** consome. Trocar tema = trocar Tier 2, não primitives.

```ts
// tailwind.config.ts
theme: {
  extend: {
    colors: {
      surface:           'var(--surface)',
      'surface-elevated': 'var(--surface-elevated)',
      'surface-overlay':  'var(--surface-overlay)',
      'text-primary':     'var(--text-primary)',
      'text-muted':       'var(--text-muted)',
      'text-subtle':      'var(--text-subtle)',
      border:             'var(--border)',
      'border-strong':    'var(--border-strong)',
      accent:             'var(--accent)',
      'accent-foreground':'var(--accent-foreground)',
      danger:             'var(--danger)',
      success:            'var(--success)',
      warning:            'var(--warning)',
    },
  },
}
```

**Anti-padrão:** card direto com `bg-gray-100`. Errado — deve ser `bg-surface-elevated`. Ifaltar Tier 2 = não consegue trocar dark mode sem reescrever 50 arquivos.

### 2.4 Tokens Tier 3 (component CSS vars)

Por componente, com valores de Tier 1 ou Tier 2.

```css
/* projetos/[slug]/globals.css */
:root {
  /* Surfaces */
  --surface:           #ffffff;
  --surface-elevated:  #fafafa;
  --surface-overlay:   rgba(0, 0, 0, 0.5);

  /* Text */
  --text-primary: #0a0a0a;
  --text-muted:   #525252;
  --text-subtle:  #a3a3a3;

  /* Borders */
  --border:        #e5e5e5;
  --border-strong: #d4d4d4;

  /* Accent (depende do nicho) */
  --accent:             #...;
  --accent-foreground:  #ffffff;

  /* Danger / success / warning */
  --danger:  #dc2626;
  --success: #16a34a;
  --warning: #ca8a04;

  /* Component-specific */
  --btn-primary-bg:    var(--accent);
  --btn-primary-fg:    var(--accent-foreground);
  --card-shadow:       0 1px 2px rgba(0, 0, 0, 0.05);
  --hero-vignette:     radial-gradient(ellipse at center, transparent 30%, rgba(0,0,0,0.4) 100%);
  --aurora-1:          /* gradient ambient */;
  --aurora-2:          /* gradient ambient */;
  --light-beam:        /* light leak */;
}

.dark {
  --surface:           #0a0a0a;
  --surface-elevated:  #171717;
  --surface-overlay:   rgba(255, 255, 255, 0.05);
  --text-primary:      #fafafa;
  --text-muted:        #a3a3a3;
  --text-subtle:       #737373;
  --border:            #262626;
  --border-strong:     #404040;
  /* accent/danger/etc geralmente mantém ou é versão escura */
}
```

### 2.5 Brand-brief deliverable

Documento `projetos/[slug]/BRAND-BRIEF.md` com:

- **Paleta** (visual + códigos hex de Tier 2)
- **Tipografia** — display + sans + mono. Tamanhos mobile-first com `break-words`
- **Voz** — 5 do/don't (link [[../50-PADROES/UX-UI-QUALIDADE]])
- **Mood** — 3 palavras-chave + 6+ refs visuais (link MOOD-BOARD)
- **Don'ts visuais explícitos:**
  - ❌ Hero quadrado raso 60vh (Lovable)
  - ❌ USP icons grid genérico (4 cards "qualidade/entrega/segurança/atendimento")
  - ❌ `transition-all duration-300` em tudo
  - ❌ Paleta sem Tier 2 (cards `gray-100` direto)
  - ❌ Tipografia sem `break-words` em h1
  - ❌ Sombra padrão Tailwind `shadow-md` em tudo (sem hierarquia)

### 2.6 Depth pack cinematic

Reuso direto de [[../50-PADROES/DESIGN-PROFISSIONAL]]. Componentes ambient:

- **Aurora drift** — `<div class="aurora-bg">` com 2 blobs gradient + animation `aurora-drift 20s infinite`
- **Light beam** — `<div class="light-beam">` sweep diagonal
- **Grain** — overlay SVG `feTurbulence` com `mix-blend-mode: overlay; opacity: 0.04`
- **Vignette** — `--hero-vignette` radial gradient
- **Active underline** — Framer Motion `layoutId="header-active"` — link [[../50-PADROES/header-loja-active-underline]]

**Anti-padrão Kore:** depth pack com `transition-all` e blur 110px em mobile low-end → drop frame, 30 FPS iPhone SE. Solução: `prefers-reduced-motion` + opacity reduzida em mobile + disable blur >40px em `<lg`.

### 2.7 Aprovação Creative Director

Não codar UI sem "aprovado" do user. Apresentar:

1. Paleta hex Tier 2 + 3 swatches dark/light
2. Tipografia com 3 exemplos (h1, body, button)
3. Mood-board (link)
4. 1 mockup hero + 1 mockup card de produto (Figma ou ASCII se urgente)

Mensagem ao user (template):

```
Paleta + mood definidos:

Paleta: [3 swatches em hex]
Tipografia: [Display] / [Sans] / [Mono]
Mood: [3 palavras] — refs em MOOD-BOARD.md

Mockup hero: [link/preview]
Mockup card: [link/preview]

Aprovado pra começar a codar UI?
```

Espera resposta. **Sem "aprovado", não passa o gate 2.**

## ✅ Checklist de saída (Gate 2)

Reuso direto de [[GATES#Gate 2 — Design]]. Resumo:

- [ ] Tokens Tier 1/2/3 prontos
- [ ] Tipografia testada em 3 viewports
- [ ] Mood-board com 6+ refs reais (BR + EUA + EU)
- [ ] Depth pack specs documentadas
- [ ] Brand voice 5 do/don't
- [ ] Don'ts visuais explícitos
- [ ] Aprovação explícita do user

## 🚫 Anti-padrões Kore (consolidados)

Lista numerada com link pra lição que originou:

1. **Hero quadrado raso 60vh** — sem aurora, sem light beam, sem vignette. Parece template.
2. **USP icons grid genérico** — 4 cards com ícone + título + texto curto. Identifica IA Lovable na hora.
3. **Paleta sem Tier 2** — cards `bg-gray-100` direto. Trocar dark mode = reescrever 50 arquivos.
4. **Tipografia sem `break-words`** — h1 com produto longo vaza viewport mobile (lição 21 conexa).
5. **`transition-all duration-300`** em tudo — rouba contraste motion. Use `transition-colors`/`transition-transform` específico.
6. **Sombra padrão Tailwind** sem hierarquia — `shadow-sm`/`shadow`/`shadow-md` sem critério.
7. **Depth pack pesado em mobile** — blur 110px low-end = 30 FPS. Solução: opacity reduzida + disable blur >40px `<lg` + `prefers-reduced-motion`.
8. **Mood-board com mockup IA** — sem ref real, design fica genérico.

## Skills relacionadas
- [[../50-PADROES/DESIGN-PROFISSIONAL]] — depth pack snippets
- [[../50-PADROES/UX-UI-QUALIDADE]] — bar Apple/Linear
- [[../50-PADROES/MOBILE-FIRST]] — responsivo desde o token
- [[../50-PADROES/design-tokens-tier-template]] — Tier 1/2/3 ready-to-paste
- [[../50-PADROES/header-loja-active-underline]] — `layoutId` motion
- [[../50-PADROES/motion-policies]] — animação sem invasiva
