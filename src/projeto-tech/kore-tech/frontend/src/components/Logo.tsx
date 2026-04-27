// Logo placeholder Kore Tech. Designer detalhara em LOGO-SPEC.md.
// Aqui um SVG simples: glifo "K" geometrico + wordmark.

import Link from 'next/link'
import { cn } from '@/lib/utils'

type Props = { className?: string; href?: string; showWordmark?: boolean }

export function Logo({ className, href = '/', showWordmark = true }: Props) {
  return (
    <Link
      href={href}
      className={cn(
        'group inline-flex items-center gap-2 font-display font-bold tracking-wide text-text transition-colors hover:text-primary',
        className,
      )}
    >
      <span className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-primary bg-bg text-primary transition-all group-hover:shadow-glow">
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="square" aria-hidden>
          <path d="M5 4 V20" />
          <path d="M5 12 L17 4" />
          <path d="M5 12 L17 20" />
        </svg>
      </span>
      {showWordmark && (
        <span className="text-sm font-black uppercase sm:text-base">
          Kore<span className="text-primary"> Tech</span>
        </span>
      )}
    </Link>
  )
}
