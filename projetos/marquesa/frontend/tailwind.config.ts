import type { Config } from 'tailwindcss'

// Marquesa — Tailwind extend baseado em design/tailwind-extend.json.
// Cores resolvem CSS vars definidas em design/tokens.css (importado em globals.css).
const config: Config = {
  darkMode: 'class',
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: 'var(--ink)',
        'ink-soft': 'var(--ink-soft)',
        paper: 'var(--paper)',
        'paper-warm': 'var(--paper-warm)',
        graphite: 'var(--graphite)',
        ash: 'var(--ash)',
        'ash-soft': 'var(--ash-soft)',
        bone: 'var(--bone)',
        'bone-soft': 'var(--bone-soft)',
        moss: 'var(--moss)',
        'moss-deep': 'var(--moss-deep)',
        'moss-pale': 'var(--moss-pale)',
        'moss-paper': 'var(--moss-paper)',

        bg: 'var(--bg)',
        'bg-elevated': 'var(--bg-elevated)',
        'bg-inverse': 'var(--bg-inverse)',
        text: 'var(--text)',
        'text-muted': 'var(--text-muted)',
        'text-subtle': 'var(--text-subtle)',
        'text-inverse': 'var(--text-inverse)',
        // Subtle em fundos escuros (footer/dark) — equivale a ash-pale (#B0B0B0).
        // Designer iter2: garante AA (5.6:1) sobre graphite, melhor que opacity arbitrária.
        'inverse-subtle': 'var(--text-inverse-subtle)',
        'border-default': 'var(--border)',
        'border-strong': 'var(--border-strong)',
        'border-subtle': 'var(--border-subtle)',
        accent: 'var(--accent)',
        'accent-hover': 'var(--accent-hover)',
        'accent-pale': 'var(--accent-pale)',
        'accent-foreground': 'var(--accent-foreground)',
      },
      fontFamily: {
        display: ['var(--font-display)', 'Georgia', 'serif'],
        serif: ['var(--font-display)', 'Georgia', 'serif'],
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-mono)', 'ui-monospace', 'monospace'],
      },
      fontSize: {
        eyebrow: ['12px', { lineHeight: '1.2', letterSpacing: '0.16em' }],
        caption: ['12px', { lineHeight: '1.4', letterSpacing: '0.04em' }],
        'body-sm': ['14px', { lineHeight: '1.5' }],
        body: ['16px', { lineHeight: '1.6' }],
        'body-lg': ['18px', { lineHeight: '1.55' }],
        'heading-md': ['20px', { lineHeight: '1.3' }],
        'heading-lg': ['24px', { lineHeight: '1.25' }],
        'display-md': ['32px', { lineHeight: '1.15', letterSpacing: '-0.005em' }],
        'display-lg': ['clamp(32px, 4vw, 48px)', { lineHeight: '1.1', letterSpacing: '-0.01em' }],
        'display-xl': ['clamp(40px, 5.5vw, 64px)', { lineHeight: '1.05', letterSpacing: '-0.015em' }],
        'display-hero': ['clamp(56px, 9vw, 96px)', { lineHeight: '0.95', letterSpacing: '-0.02em' }],
      },
      letterSpacing: {
        eyebrow: '0.16em',
        caption: '0.04em',
        display: '-0.015em',
        hero: '-0.02em',
      },
      borderRadius: {
        none: '0',
        sm: '2px',
        md: '4px',
        full: '9999px',
      },
      boxShadow: {
        card: 'none',
        'card-hover': 'none',
        modal: '0 20px 50px -10px rgba(10, 10, 10, 0.18)',
        sticky: '0 1px 0 var(--bone)',
      },
      transitionDuration: {
        instant: '120ms',
        fast: '200ms',
        base: '400ms',
        reveal: '700ms',
      },
      transitionTimingFunction: {
        standard: 'cubic-bezier(0.16, 1, 0.3, 1)',
        swift: 'cubic-bezier(0.4, 0, 0.2, 1)',
      },
      maxWidth: {
        container: '1280px',
      },
      aspectRatio: {
        card: '4 / 3',
        hero: '21 / 9',
        cinemascope: '2.39 / 1',
      },
      keyframes: {
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(32px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'scroll-cue': {
          '0%, 100%': { opacity: '0.3' },
          '50%': { opacity: '0.7' },
        },
      },
      animation: {
        'fade-up': 'fade-up 700ms cubic-bezier(0.16, 1, 0.3, 1) both',
        'fade-in': 'fade-in 400ms cubic-bezier(0.4, 0, 0.2, 1) both',
        'scroll-cue': 'scroll-cue 2s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}

export default config
