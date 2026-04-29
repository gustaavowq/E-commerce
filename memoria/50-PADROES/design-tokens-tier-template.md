# 🎨 Padrão: Design tokens Tier 1/2/3 (Brad Frost)

> Tier 1 (primitives) → Tier 2 (semantic) → Tier 3 (component).
> Cada tier consome só o anterior. Trocar tema = trocar Tier 2/3, sem tocar Tier 1.
> Sem Tier 2, dark mode vira reescrita de 50 arquivos.

Versão 1.0 — 2026-04-29. Inspirado em Brad Frost — Atomic Design + Design Tokens.

## Por que 3 tiers

- **Tier 1 — primitives:** escala completa de cores, espaçamentos, tipografia. Sem semântica. Ex: `gray-500`, `blue-700`, `space-4`.
- **Tier 2 — semantic:** o que o componente realmente consome. Mapeia primitive → propósito. Ex: `surface`, `text-primary`, `accent`. **Esta é a camada que troca em dark mode.**
- **Tier 3 — component:** valores específicos por componente. Ex: `--btn-primary-bg`, `--card-shadow`. Pode resolver pra Tier 2 ou Tier 1.

UI sempre consome Tier 2 (Tailwind `bg-surface`) ou Tier 3 (CSS var `--btn-primary-bg`). **Nunca Tier 1 direto.**

## Tier 1 — primitives

### `tokens/primitives.ts`

```ts
// projetos/[slug]/tokens/primitives.ts
export const primitives = {
  gray: {
    0:   '#ffffff',
    50:  '#fafafa',
    100: '#f5f5f5',
    200: '#e5e5e5',
    300: '#d4d4d4',
    400: '#a3a3a3',
    500: '#737373',
    600: '#525252',
    700: '#404040',
    800: '#262626',
    900: '#171717',
    950: '#0a0a0a',
    1000: '#000000',
  },

  // Brand color escala — derivar do nicho. Exemplo neutro azul:
  brand: {
    50:  '#eff6ff',
    100: '#dbeafe',
    200: '#bfdbfe',
    300: '#93c5fd',
    400: '#60a5fa',
    500: '#3b82f6',
    600: '#2563eb',
    700: '#1d4ed8',
    800: '#1e40af',
    900: '#1e3a8a',
    950: '#172554',
  },

  red:    { 50: '#fef2f2', 500: '#dc2626', 900: '#7f1d1d' },  // expandir
  green:  { 50: '#f0fdf4', 500: '#16a34a', 900: '#14532d' },
  yellow: { 50: '#fefce8', 500: '#ca8a04', 900: '#713f12' },

  // Espaçamento — múltiplos de 4
  space: {
    0: '0', 1: '4px', 2: '8px', 3: '12px', 4: '16px', 5: '20px',
    6: '24px', 8: '32px', 10: '40px', 12: '48px', 16: '64px', 20: '80px',
  },

  // Tipografia
  font: {
    display: 'var(--font-display)',  // Cabeçalhos — depende do nicho
    sans:    'var(--font-sans)',     // Inter / Geist / system-ui
    mono:    'var(--font-mono)',     // Geist Mono / JetBrains Mono
  },
  fontSize: {
    xs:   '12px',
    sm:   '14px',
    base: '16px',  // ← inputs mínimo (desliga auto-zoom iOS)
    lg:   '18px',
    xl:   '20px',
    '2xl': '24px',
    '3xl': '30px',
    '4xl': '36px',
    '5xl': '48px',
  },

  // Radius
  radius: { sm: '4px', md: '8px', lg: '12px', xl: '16px', '2xl': '20px', full: '9999px' },

  // Shadow primitives — Tier 2 monta hierarquia
  shadow: {
    sm:   '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    md:   '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
    lg:   '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
    xl:   '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
    inner:'inset 0 2px 4px 0 rgba(0, 0, 0, 0.05)',
  },

  // Motion
  duration: {
    fast:   '150ms',
    base:   '200ms',
    slow:   '300ms',
    slower: '500ms',
  },
  easing: {
    inOut:    'cubic-bezier(0.4, 0, 0.2, 1)',  // default
    spring:   'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
    'kore':   'cubic-bezier(0.22, 1, 0.36, 1)', // depth pack ease custom
  },
} as const
```

## Tier 2 — semantic (Tailwind extend)

### `tailwind.config.ts`

```ts
import type { Config } from 'tailwindcss'

export default {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Surfaces (background)
        surface:           'var(--surface)',
        'surface-elevated':'var(--surface-elevated)',
        'surface-overlay': 'var(--surface-overlay)',
        'surface-inverse': 'var(--surface-inverse)',

        // Text
        'text-primary': 'var(--text-primary)',
        'text-muted':   'var(--text-muted)',
        'text-subtle':  'var(--text-subtle)',
        'text-inverse': 'var(--text-inverse)',

        // Borders
        border:          'var(--border)',
        'border-strong': 'var(--border-strong)',
        'border-subtle': 'var(--border-subtle)',

        // Semantic
        accent:               'var(--accent)',
        'accent-foreground':  'var(--accent-foreground)',
        'accent-hover':       'var(--accent-hover)',
        danger:               'var(--danger)',
        'danger-foreground':  'var(--danger-foreground)',
        success:              'var(--success)',
        warning:              'var(--warning)',
      },

      fontFamily: {
        display: 'var(--font-display)',
        sans:    'var(--font-sans)',
        mono:    'var(--font-mono)',
      },

      boxShadow: {
        card:        'var(--shadow-card)',
        'card-hover':'var(--shadow-card-hover)',
        sheet:       'var(--shadow-sheet)',
        modal:       'var(--shadow-modal)',
      },

      transitionTimingFunction: {
        'kore': 'cubic-bezier(0.22, 1, 0.36, 1)',
      },
    },
  },
  plugins: [],
} satisfies Config
```

## Tier 3 — component CSS vars

### `globals.css`

```css
/* projetos/[slug]/src/app/globals.css */
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    /* === Surfaces === */
    --surface:           #ffffff;       /* Tier 1: gray-0 */
    --surface-elevated:  #fafafa;       /* Tier 1: gray-50 */
    --surface-overlay:   rgba(0, 0, 0, 0.5);
    --surface-inverse:   #0a0a0a;       /* Tier 1: gray-950 */

    /* === Text === */
    --text-primary: #0a0a0a;
    --text-muted:   #525252;
    --text-subtle:  #a3a3a3;
    --text-inverse: #ffffff;

    /* === Borders === */
    --border:        #e5e5e5;
    --border-strong: #d4d4d4;
    --border-subtle: #f5f5f5;

    /* === Accent (DERIVAR DO NICHO) === */
    --accent:             #2563eb;       /* Tier 1: brand-600 */
    --accent-foreground:  #ffffff;
    --accent-hover:       #1d4ed8;       /* Tier 1: brand-700 */

    /* === Danger / success / warning === */
    --danger:             #dc2626;
    --danger-foreground:  #ffffff;
    --success:            #16a34a;
    --warning:            #ca8a04;

    /* === Component shadows (hierarquia) === */
    --shadow-card:       0 1px 2px rgba(0, 0, 0, 0.05);
    --shadow-card-hover: 0 4px 6px -1px rgba(0, 0, 0, 0.08);
    --shadow-sheet:      0 -10px 25px -5px rgba(0, 0, 0, 0.1);
    --shadow-modal:      0 20px 50px -10px rgba(0, 0, 0, 0.25);

    /* === Component-specific === */
    --btn-primary-bg:    var(--accent);
    --btn-primary-fg:    var(--accent-foreground);
    --btn-primary-hover: var(--accent-hover);
    --card-radius:       12px;
    --card-padding:      16px;

    /* === Cinematic depth pack (ambient) === */
    --aurora-1:    radial-gradient(circle at 20% 30%, rgba(37, 99, 235, 0.15), transparent 60%);
    --aurora-2:    radial-gradient(circle at 80% 70%, rgba(168, 85, 247, 0.12), transparent 60%);
    --light-beam:  linear-gradient(115deg, transparent 40%, rgba(255, 255, 255, 0.06) 50%, transparent 60%);
    --hero-vignette: radial-gradient(ellipse at center, transparent 30%, rgba(0, 0, 0, 0.4) 100%);
    --grain-opacity: 0.04;

    /* Fonts (next/font injeta CSS vars) */
    --font-display: 'Inter', system-ui, sans-serif;
    --font-sans:    'Inter', system-ui, sans-serif;
    --font-mono:    'Geist Mono', 'JetBrains Mono', monospace;
  }

  .dark {
    --surface:           #0a0a0a;
    --surface-elevated:  #171717;
    --surface-overlay:   rgba(255, 255, 255, 0.05);
    --surface-inverse:   #ffffff;

    --text-primary: #fafafa;
    --text-muted:   #a3a3a3;
    --text-subtle:  #737373;
    --text-inverse: #0a0a0a;

    --border:        #262626;
    --border-strong: #404040;
    --border-subtle: #171717;

    /* accent geralmente brilha mais em dark */
    --accent:        #3b82f6;
    --accent-hover:  #60a5fa;

    --shadow-card:       0 1px 2px rgba(0, 0, 0, 0.3);
    --shadow-card-hover: 0 4px 6px -1px rgba(0, 0, 0, 0.4);
  }

  /* Reduced motion */
  @media (prefers-reduced-motion: reduce) {
    *, *::before, *::after {
      animation-duration: 0.01ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: 0.01ms !important;
    }
    .aurora-bg::before, .aurora-bg::after { opacity: 0.25 !important; }
  }
}

@layer components {
  /* === Aurora drift (ambient) === */
  .aurora-bg {
    position: relative;
    isolation: isolate;
    overflow: hidden;
  }
  .aurora-bg::before,
  .aurora-bg::after {
    content: '';
    position: absolute;
    inset: 0;
    z-index: -1;
    pointer-events: none;
  }
  .aurora-bg::before {
    background: var(--aurora-1);
    animation: aurora-drift-1 20s ease-in-out infinite;
  }
  .aurora-bg::after {
    background: var(--aurora-2);
    animation: aurora-drift-2 25s ease-in-out infinite reverse;
  }

  @keyframes aurora-drift-1 {
    0%, 100% { transform: translate(0, 0) scale(1); }
    50%      { transform: translate(5%, -5%) scale(1.1); }
  }
  @keyframes aurora-drift-2 {
    0%, 100% { transform: translate(0, 0) scale(1); }
    50%      { transform: translate(-5%, 5%) scale(0.95); }
  }

  /* Disable blur pesado em mobile low-end */
  @media (max-width: 1023px) {
    .aurora-bg::before, .aurora-bg::after {
      filter: blur(40px);  /* desktop usa 80px+ */
      opacity: 0.5;
    }
  }
}
```

## Variações por nicho

Derive o `--accent` e o display font do nicho.

| Nicho | Mood | Accent | Display font | Surface tone |
|---|---|---|---|---|
| Moda | Elegante, pastel | `#e8b4b8` (rosé) | Playfair Display | Cream `#fafafa` |
| Eletrônicos / tech | Frio, neon | `#3b82f6` (blue-500) | Geist | Quase preto `#0a0a0a` |
| Alimentação | Quente, terra | `#d97706` (amber-600) | Lora | Cream `#fef9f3` |
| Beleza | Champagne | `#c9a37c` | Cormorant Garamond | Off-white `#fdf9f5` |
| Pet | Vivo, friendly | `#16a34a` (green-600) | Quicksand | White `#ffffff` |
| Esporte | Energético | `#dc2626` (red-600) | Anton | White `#ffffff` |
| Joias | Luxuoso | `#a16207` (amber-700) | Trajan / Cinzel | Black `#0a0a0a` |
| Casa & decor | Neutro orgânico | `#525252` (gray-600) | DM Serif | Stone `#f5f5f4` |

## Snippet — `tailwind.config.ts` mínimo de novo projeto

```ts
import type { Config } from 'tailwindcss'

export default {
  content: ['./src/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        surface: 'var(--surface)',
        'surface-elevated': 'var(--surface-elevated)',
        'text-primary': 'var(--text-primary)',
        'text-muted': 'var(--text-muted)',
        border: 'var(--border)',
        accent: 'var(--accent)',
        'accent-foreground': 'var(--accent-foreground)',
        danger: 'var(--danger)',
        success: 'var(--success)',
        warning: 'var(--warning)',
      },
      fontFamily: {
        display: 'var(--font-display)',
        sans: 'var(--font-sans)',
        mono: 'var(--font-mono)',
      },
      boxShadow: {
        card: 'var(--shadow-card)',
        sheet: 'var(--shadow-sheet)',
      },
    },
  },
} satisfies Config
```

## ✅ Checklist de uso

- [ ] `tokens/primitives.ts` com escala completa
- [ ] `tailwind.config.ts` extend com Tier 2 (var refs)
- [ ] `globals.css` com `:root` + `.dark` + `prefers-reduced-motion`
- [ ] Componentes consomem **só** Tier 2 ou Tier 3 (nunca Tier 1 direto)
- [ ] Dark mode funcional sem editar componente

## 🚫 Anti-padrões

1. **Componente usando `bg-gray-100` direto** — pula Tier 2, dark mode quebra.
2. **Tier 2 sem `text-subtle`** — gradação de hierarquia rasa.
3. **Sem `--shadow-card-hover`** — hover sem profundidade extra.
4. **`accent` fixo no Tier 1** sem var — trocar nicho exige reescrever.
5. **Sem `prefers-reduced-motion`** — acessibilidade quebra.

## Padrões relacionados
- [[DESIGN-PROFISSIONAL]] — depth pack cinematic completo
- [[../05-PROCESSO/FASE-2-DESIGN]] — fase de design completa
- [[motion-policies]] — animação sem invasiva
