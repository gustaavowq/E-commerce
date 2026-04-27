import type { Config } from 'tailwindcss'
// eslint-disable-next-line @typescript-eslint/no-require-imports, @typescript-eslint/no-var-requires
const koreTechPreset = require('../../../../projetos/projeto-tech/kore-tech/design/tailwind.config.preset').default as Partial<Config>

/**
 * Loja Kore Tech — só extensões locais que NAO existem no preset oficial.
 * Tudo de cor/font/shadow/radius vem do preset (single source of truth).
 * Mexer no preset = atualiza todo mundo. Local extend só pra coisas exclusivas da loja.
 */
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
      colors: {
        whatsapp: '#25D366',
      },
      animation: {
        'slide-up': 'slideUp 250ms ease-out',
        'slide-down': 'slideDown 220ms cubic-bezier(0.16, 1, 0.3, 1) both',
        'slide-in-right': 'slideInRight 300ms cubic-bezier(0.16, 1, 0.3, 1) both',
        'pulse-soft': 'pulseSoft 2s infinite',
      },
      keyframes: {
        slideUp: { from: { opacity: '0', transform: 'translateY(8px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
        slideDown: { from: { opacity: '0', transform: 'translateY(-12px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
        slideInRight: { from: { opacity: '0', transform: 'translateX(20px)' }, to: { opacity: '1', transform: 'translateX(0)' } },
        pulseSoft: { '0%,100%': { transform: 'scale(1)' }, '50%': { transform: 'scale(1.04)' } },
      },
    },
  },
  plugins: [],
}

export default config
