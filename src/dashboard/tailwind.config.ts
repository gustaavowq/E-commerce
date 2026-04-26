import type { Config } from 'tailwindcss'

// Paleta admin: neutro denso pra trabalhar muitas horas, com toques do
// primary verde Lacoste pra manter coerência visual com a loja.
const config: Config = {
  content: [
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50:  '#E8F5E9',
          100: '#C8E6C9',
          500: '#2E7D32',
          700: '#1B5E20',
          900: '#0D3E13',
          DEFAULT: '#1B5E20',
        },
        accent: { 500: '#D32F2F', 700: '#9A0007', DEFAULT: '#D32F2F' },
        ink: {
          DEFAULT: '#0F172A',
          2: '#1F2937',
          3: '#475569',
          4: '#94A3B8',
        },
        surface: {
          DEFAULT: '#FFFFFF',
          alt:    '#F8FAFC',
          2:      '#F1F5F9',
          3:      '#E2E8F0',
        },
        border: {
          DEFAULT: '#E2E8F0',
          strong:  '#CBD5E1',
        },
        success: '#16A34A',
        warning: '#F59E0B',
        error:   '#DC2626',
        info:    '#0EA5E9',
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
        mono: ['ui-monospace', 'SFMono-Regular', 'monospace'],
      },
      boxShadow: {
        sm: '0 1px 2px rgba(15,23,42,0.05)',
        md: '0 2px 8px rgba(15,23,42,0.08)',
        lg: '0 8px 24px rgba(15,23,42,0.10)',
      },
      borderRadius: {
        sm: '0.25rem', md: '0.5rem', lg: '0.75rem', xl: '1rem', pill: '9999px',
      },
      animation: {
        'fade-in':    'fadeIn 200ms ease-out',
        'fade-up':    'fadeUp 400ms cubic-bezier(0.16, 1, 0.3, 1) both',
        'slide-up':   'slideUp 250ms ease-out both',
        'slide-down': 'slideDown 220ms cubic-bezier(0.16, 1, 0.3, 1) both',
        'scale-in':   'scaleIn 250ms cubic-bezier(0.16, 1, 0.3, 1) both',
      },
      keyframes: {
        fadeIn:    { from: { opacity: '0' }, to: { opacity: '1' } },
        fadeUp:    { from: { opacity: '0', transform: 'translateY(12px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
        slideUp:   { from: { opacity: '0', transform: 'translateY(8px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
        slideDown: { from: { opacity: '0', transform: 'translateY(-12px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
        scaleIn:   { from: { opacity: '0', transform: 'scale(0.96)' }, to: { opacity: '1', transform: 'scale(1)' } },
      },
    },
  },
  plugins: [],
}

export default config
