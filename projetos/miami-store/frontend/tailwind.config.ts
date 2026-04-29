import type { Config } from 'tailwindcss'

// Tokens importados de docs/design/design-system.md.
// Quando o Designer atualizar lá, atualize aqui também.
const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50:  '#E8F5E9',
          100: '#C8E6C9',
          300: '#66BB6A',
          500: '#2E7D32',     // verde Lacoste médio
          700: '#1B5E20',     // PRIMÁRIO — botões CTA
          900: '#0D3E13',     // hover
          DEFAULT: '#1B5E20',
        },
        accent: {
          500: '#D32F2F',     // vermelho Lacoste — destaques
          700: '#9A0007',
          DEFAULT: '#D32F2F',
        },
        neon: '#C5E000',      // verde-limão — banner promo only
        ink: {
          DEFAULT: '#0A0A0A',
          2: '#1F2937',
          3: '#6B7280',
          4: '#9CA3AF',
        },
        surface: {
          DEFAULT: '#FFFFFF',
          alt:    '#FAFAFA',
          2:      '#F0F0F0',
        },
        border: {
          DEFAULT: '#E5E7EB',
          strong:  '#D1D5DB',
        },
        success: '#16A34A',
        warning: '#F59E0B',
        error:   '#DC2626',
        info:    '#0EA5E9',
        lacoste: { navy: '#0D2C54', red: '#D32F2F' },
        whatsapp: '#25D366',
      },
      fontFamily: {
        display: ['var(--font-display)', 'Georgia', 'serif'],
        sans:    ['var(--font-sans)', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        sm: '0 1px 2px rgba(0,0,0,0.06)',
        md: '0 2px 8px rgba(0,0,0,0.08)',
        lg: '0 8px 24px rgba(0,0,0,0.12)',
        xl: '0 16px 40px rgba(0,0,0,0.16)',
      },
      borderRadius: {
        sm:   '0.25rem',
        md:   '0.5rem',
        lg:   '0.75rem',
        xl:   '1rem',
        pill: '9999px',
      },
      animation: {
        'fade-in':       'fadeIn 200ms ease-out',
        'fade-up':       'fadeUp 400ms cubic-bezier(0.16, 1, 0.3, 1) both',
        'slide-up':      'slideUp 250ms ease-out',
        'slide-down':    'slideDown 220ms cubic-bezier(0.16, 1, 0.3, 1) both',
        'slide-in-right':'slideInRight 300ms cubic-bezier(0.16, 1, 0.3, 1) both',
        'scale-in':      'scaleIn 250ms cubic-bezier(0.16, 1, 0.3, 1) both',
        'pulse-soft':    'pulseSoft 2s infinite',
        'shine':         'shine 2.5s linear infinite',
      },
      keyframes: {
        fadeIn:        { from: { opacity: '0' }, to: { opacity: '1' } },
        fadeUp:        { from: { opacity: '0', transform: 'translateY(16px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
        slideUp:       { from: { opacity: '0', transform: 'translateY(8px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
        slideDown:     { from: { opacity: '0', transform: 'translateY(-12px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
        slideInRight:  { from: { opacity: '0', transform: 'translateX(20px)' }, to: { opacity: '1', transform: 'translateX(0)' } },
        scaleIn:       { from: { opacity: '0', transform: 'scale(0.95)' }, to: { opacity: '1', transform: 'scale(1)' } },
        pulseSoft:     { '0%,100%': { transform: 'scale(1)' }, '50%': { transform: 'scale(1.05)' } },
        shine:         { '0%': { backgroundPosition: '-200% 0' }, '100%': { backgroundPosition: '200% 0' } },
      },
    },
  },
  plugins: [],
}

export default config
