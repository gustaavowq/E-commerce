import type { Config } from 'tailwindcss'

// Preset inlined (projetos/design/tailwind.config.preset.ts) — sem import externo pra Vercel
const koreTechPreset: Partial<Config> = {
  theme: {
    extend: {
      colors: {
        bg: '#0A0E14',
        surface: { DEFAULT: '#141921', 2: '#1B2230', 3: '#212A38' },
        border: { DEFAULT: '#1E2530', strong: '#2A3240' },
        primary: { DEFAULT: '#00E5FF', hover: '#00B8D4', soft: 'rgba(0, 229, 255, 0.10)', dim: '#4DB8C4' },
        text: { DEFAULT: '#E8EEF5', secondary: '#8892A0', muted: '#5A6573', 'on-primary': '#0A0E14' },
        success: { DEFAULT: '#00E676', soft: 'rgba(0, 230, 118, 0.10)' },
        warning: { DEFAULT: '#FFB74D', soft: 'rgba(255, 183, 77, 0.10)' },
        danger: { DEFAULT: '#FF5252', soft: 'rgba(255, 82, 82, 0.10)' },
        info: { DEFAULT: '#29B6F6', soft: 'rgba(41, 182, 246, 0.10)' },
      },
      fontFamily: {
        ui:   ['var(--font-inter)', 'Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
        sans: ['var(--font-inter)', 'Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
        mono: ['var(--font-jetbrains)', 'JetBrains Mono', 'Consolas', 'Monaco', 'monospace'],
        display: ['var(--font-inter)', 'Inter', '-apple-system', 'sans-serif'],
        specs:   ['var(--font-jetbrains)', 'JetBrains Mono', 'Consolas', 'monospace'],
      },
      borderRadius: { none: '0', sm: '0.25rem', md: '0.5rem', lg: '0.75rem', xl: '1rem', '2xl': '1.5rem', pill: '9999px' },
      boxShadow: {
        sm: '0 1px 2px rgba(0,0,0,0.45)',
        md: '0 4px 12px rgba(0,0,0,0.55)',
        lg: '0 12px 32px rgba(0,0,0,0.65)',
        xl: '0 20px 48px rgba(0,0,0,0.75)',
        'glow-primary': '0 0 0 1px rgba(0,229,255,0.40), 0 0 24px rgba(0,229,255,0.25)',
        'glow-success': '0 0 0 1px rgba(0,230,118,0.40), 0 0 16px rgba(0,230,118,0.20)',
        'glow-danger':  '0 0 0 1px rgba(255,82,82,0.40), 0 0 16px rgba(255,82,82,0.20)',
      },
      zIndex: { base: '0', sticky: '100', whatsapp: '150', drawer: '200', modal: '300', toast: '400', tooltip: '500' },
      minHeight: { touch: '44px' },
      minWidth: { touch: '44px' },
      spacing: { '18': '4.5rem', '22': '5.5rem', '30': '7.5rem' },
      keyframes: {
        'fade-in':    { '0%': { opacity: '0' }, '100%': { opacity: '1' } },
        'fade-up':    { '0%': { opacity: '0', transform: 'translateY(8px)' }, '100%': { opacity: '1', transform: 'translateY(0)' } },
        'scale-in':   { '0%': { opacity: '0', transform: 'scale(0.96)' }, '100%': { opacity: '1', transform: 'scale(1)' } },
        'pulse-glow': { '0%,100%': { boxShadow: '0 0 0 0 rgba(0,229,255,0.4)' }, '50%': { boxShadow: '0 0 0 6px rgba(0,229,255,0)' } },
      },
      animation: {
        'fade-in':    'fade-in 200ms cubic-bezier(0.4,0,0.2,1)',
        'fade-up':    'fade-up 240ms cubic-bezier(0.4,0,0.2,1)',
        'scale-in':   'scale-in 200ms cubic-bezier(0.4,0,0.2,1)',
        'pulse-glow': 'pulse-glow 1800ms ease-out infinite',
      },
    },
  },
}

const config: Config = {
  presets: [koreTechPreset],
  content: [
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  plugins: [],
}

export default config
