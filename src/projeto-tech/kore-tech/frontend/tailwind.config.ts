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
        'fade-up':    { '0%': { opacity: '0', transform: 'translateY(16px)' }, '100%': { opacity: '1', transform: 'translateY(0)' } },
        'fade-up-lg': { '0%': { opacity: '0', transform: 'translateY(40px)' }, '100%': { opacity: '1', transform: 'translateY(0)' } },
        'scale-in':   { '0%': { opacity: '0', transform: 'scale(0.96)' }, '100%': { opacity: '1', transform: 'scale(1)' } },
        'pulse-glow': { '0%,100%': { boxShadow: '0 0 0 0 rgba(0,229,255,0.4)' }, '50%': { boxShadow: '0 0 0 6px rgba(0,229,255,0)' } },
        'float':      { '0%,100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-12px)' } },
        'gradient-pan': {
          '0%,100%': { backgroundPosition: '0% 50%' },
          '50%':     { backgroundPosition: '100% 50%' },
        },
        'shimmer': {
          '0%':   { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
        'aurora': {
          '0%,100%': { transform: 'translate(0,0) scale(1)' },
          '33%':     { transform: 'translate(40px,-30px) scale(1.1)' },
          '66%':     { transform: 'translate(-30px,20px) scale(0.95)' },
        },
      },
      animation: {
        'fade-in':     'fade-in 240ms cubic-bezier(0.4,0,0.2,1) both',
        'fade-up':     'fade-up 380ms cubic-bezier(0.16,1,0.3,1) both',
        'fade-up-lg':  'fade-up-lg 700ms cubic-bezier(0.16,1,0.3,1) both',
        'scale-in':    'scale-in 320ms cubic-bezier(0.4,0,0.2,1) both',
        'pulse-glow':  'pulse-glow 1800ms ease-out infinite',
        'float':       'float 6s ease-in-out infinite',
        'gradient-pan':'gradient-pan 12s ease infinite',
        'shimmer':     'shimmer 2.5s linear infinite',
        'aurora-slow': 'aurora 22s ease-in-out infinite',
      },
    },
  },
}

const config: Config = {
  darkMode: 'class',
  presets: [koreTechPreset],
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: { whatsapp: '#25D366' },
      animation: {
        'slide-up':       'slideUp 250ms ease-out',
        'slide-down':     'slideDown 220ms cubic-bezier(0.16,1,0.3,1) both',
        'slide-in-right': 'slideInRight 300ms cubic-bezier(0.16,1,0.3,1) both',
        'pulse-soft':     'pulseSoft 2s infinite',
      },
      keyframes: {
        slideUp:       { from: { opacity: '0', transform: 'translateY(8px)' },   to: { opacity: '1', transform: 'translateY(0)' } },
        slideDown:     { from: { opacity: '0', transform: 'translateY(-12px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
        slideInRight:  { from: { opacity: '0', transform: 'translateX(20px)' },  to: { opacity: '1', transform: 'translateX(0)' } },
        pulseSoft:     { '0%,100%': { transform: 'scale(1)' }, '50%': { transform: 'scale(1.04)' } },
      },
    },
  },
  plugins: [],
}

export default config
