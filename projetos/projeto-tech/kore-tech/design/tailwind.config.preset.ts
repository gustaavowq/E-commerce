/**
 * Kore Tech — Tailwind Preset
 *
 * Importar em `src/projeto-tech/kore-tech/frontend/tailwind.config.ts`
 * e em `src/projeto-tech/kore-tech/dashboard/tailwind.config.ts`:
 *
 *   import type { Config } from 'tailwindcss';
 *   import koreTechPreset from '../../../projetos/projeto-tech/kore-tech/design/tailwind.config.preset';
 *
 *   const config: Config = {
 *     presets: [koreTechPreset],
 *     content: ['./src/**\/*.{ts,tsx}'],
 *   };
 *   export default config;
 *
 * Espelhado em `tokens.css` (mesmo source of truth, dois formatos).
 * Mudanças aqui = atualiza tokens.css junto.
 */

import type { Config } from 'tailwindcss';

const koreTechPreset: Partial<Config> = {
  theme: {
    extend: {
      // ====================================================================
      // CORES — semantic tokens (não usar literal hex no código da app)
      // ====================================================================
      colors: {
        // Surfaces
        bg: '#0A0E14',
        surface: {
          DEFAULT: '#141921',
          2: '#1B2230',
          3: '#212A38',
        },

        // Borders
        border: {
          DEFAULT: '#1E2530',
          strong: '#2A3240',
        },

        // Acento único (cyan elétrico)
        primary: {
          DEFAULT: '#00E5FF',
          hover: '#00B8D4',
          soft: 'rgba(0, 229, 255, 0.10)',
          dim: '#4DB8C4',
        },

        // Texto
        text: {
          DEFAULT: '#E8EEF5',
          secondary: '#8892A0',
          muted: '#5A6573',
          'on-primary': '#0A0E14',
        },

        // Estados
        success: {
          DEFAULT: '#00E676',
          soft: 'rgba(0, 230, 118, 0.10)',
        },
        warning: {
          DEFAULT: '#FFB74D',
          soft: 'rgba(255, 183, 77, 0.10)',
        },
        danger: {
          DEFAULT: '#FF5252',
          soft: 'rgba(255, 82, 82, 0.10)',
        },
        info: {
          DEFAULT: '#29B6F6',
          soft: 'rgba(41, 182, 246, 0.10)',
        },
      },

      // ====================================================================
      // FONTES
      // ====================================================================
      fontFamily: {
        ui: ['var(--font-inter)', 'Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
        sans: ['var(--font-inter)', 'Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
        mono: ['var(--font-jetbrains)', 'JetBrains Mono', 'Consolas', 'Monaco', 'monospace'],
      },

      // ====================================================================
      // ESCALA TIPOGRÁFICA
      // ====================================================================
      fontSize: {
        xs:   ['0.75rem',   { lineHeight: '1.5' }],
        sm:   ['0.875rem',  { lineHeight: '1.5' }],
        base: ['1rem',      { lineHeight: '1.5' }],
        lg:   ['1.125rem',  { lineHeight: '1.5' }],
        xl:   ['1.25rem',   { lineHeight: '1.4' }],
        '2xl': ['1.5rem',   { lineHeight: '1.35' }],
        '3xl': ['1.875rem', { lineHeight: '1.3' }],
        '4xl': ['2.25rem',  { lineHeight: '1.2' }],
        '5xl': ['3rem',     { lineHeight: '1.15' }],
        '6xl': ['3.75rem',  { lineHeight: '1.1', letterSpacing: '-0.02em' }],
      },

      // ====================================================================
      // TRACKING
      // ====================================================================
      letterSpacing: {
        tight:  '-0.02em',
        normal: '0',
        wide:   '0.05em',
        wider:  '0.10em',
      },

      // ====================================================================
      // RADIUS
      // ====================================================================
      borderRadius: {
        none: '0',
        sm:   '0.25rem',
        md:   '0.5rem',
        lg:   '0.75rem',
        xl:   '1rem',
        '2xl':'1.5rem',
        pill: '9999px',
      },

      // ====================================================================
      // SHADOWS — dark-friendly (preto + blur grande + opacidade alta)
      // ====================================================================
      boxShadow: {
        sm: '0 1px 2px rgba(0, 0, 0, 0.45)',
        md: '0 4px 12px rgba(0, 0, 0, 0.55)',
        lg: '0 12px 32px rgba(0, 0, 0, 0.65)',
        xl: '0 20px 48px rgba(0, 0, 0, 0.75)',
        // Glows (estado ativo / hover de CTA / FPS destaque)
        'glow-primary': '0 0 0 1px rgba(0, 229, 255, 0.40), 0 0 24px rgba(0, 229, 255, 0.25)',
        'glow-success': '0 0 0 1px rgba(0, 230, 118, 0.40), 0 0 16px rgba(0, 230, 118, 0.20)',
        'glow-danger':  '0 0 0 1px rgba(255, 82, 82, 0.40), 0 0 16px rgba(255, 82, 82, 0.20)',
      },

      // ====================================================================
      // ANIMAÇÕES — máx 400ms (regra do brief)
      // ====================================================================
      transitionDuration: {
        fast: '150ms',
        base: '200ms',
        slow: '300ms',
      },
      transitionTimingFunction: {
        ease:    'cubic-bezier(0.4, 0, 0.2, 1)',
        'ease-out': 'cubic-bezier(0, 0, 0.2, 1)',
      },
      keyframes: {
        'fade-in': {
          '0%':   { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'fade-up': {
          '0%':   { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'scale-in': {
          '0%':   { opacity: '0', transform: 'scale(0.96)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        'pulse-glow': {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(0, 229, 255, 0.4)' },
          '50%':      { boxShadow: '0 0 0 6px rgba(0, 229, 255, 0)' },
        },
      },
      animation: {
        'fade-in':    'fade-in 200ms cubic-bezier(0.4, 0, 0.2, 1)',
        'fade-up':    'fade-up 240ms cubic-bezier(0.4, 0, 0.2, 1)',
        'scale-in':   'scale-in 200ms cubic-bezier(0.4, 0, 0.2, 1)',
        'pulse-glow': 'pulse-glow 1800ms ease-out infinite',
      },

      // ====================================================================
      // SPACING — Tailwind default + extras pra landing
      // ====================================================================
      spacing: {
        '18': '4.5rem',   /* 72px */
        '22': '5.5rem',   /* 88px */
        '30': '7.5rem',   /* 120px */
      },

      // ====================================================================
      // Z-INDEX — alinhado com tokens.css
      // ====================================================================
      zIndex: {
        base:     '0',
        sticky:   '100',
        whatsapp: '150',
        drawer:   '200',
        modal:    '300',
        toast:    '400',
        tooltip:  '500',
      },

      // ====================================================================
      // TOUCH TARGET — utilitário pra atender 44px (WCAG / skill UX rule)
      // ====================================================================
      minHeight: {
        'touch': '44px',
      },
      minWidth: {
        'touch': '44px',
      },
    },
  },
};

export default koreTechPreset;
