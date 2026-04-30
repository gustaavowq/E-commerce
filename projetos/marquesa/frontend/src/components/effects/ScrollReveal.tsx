'use client'

import { useEffect, useRef, useState, type ReactNode } from 'react'
import { cn } from '@/lib/format'

interface ScrollRevealProps {
  children: ReactNode
  delay?: number
  as?: 'div' | 'section' | 'article' | 'li'
  className?: string
}

// Scroll-reveal padrão Marquesa: IntersectionObserver, threshold 0.15,
// fade-in + translateY 32px → 0, easing standard, 700ms, run-once.
// Reduced motion → reveal direto sem translate.
export function ScrollReveal({
  children,
  delay = 0,
  as: Tag = 'div',
  className,
}: ScrollRevealProps) {
  const ref = useRef<HTMLElement | null>(null)
  const [revealed, setRevealed] = useState(false)

  useEffect(() => {
    const node = ref.current
    if (!node) return

    // Reduced motion → revela imediatamente
    if (typeof window !== 'undefined') {
      const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      if (prefersReduced) {
        setRevealed(true)
        return
      }
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            // Run-once: para de observar após primeiro reveal
            setTimeout(() => setRevealed(true), delay)
            observer.unobserve(entry.target)
          }
        }
      },
      { threshold: 0.15, rootMargin: '0px 0px -10% 0px' },
    )

    observer.observe(node)
    return () => observer.disconnect()
  }, [delay])

  return (
    <Tag
      ref={ref as never}
      className={cn(
        'transition-[opacity,transform] duration-reveal ease-standard',
        revealed ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8',
        className,
      )}
    >
      {children}
    </Tag>
  )
}
