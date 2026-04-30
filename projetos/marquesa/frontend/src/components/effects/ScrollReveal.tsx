'use client'

import { useEffect, useRef, useState, type ReactNode } from 'react'

type Direction = 'up' | 'down' | 'left' | 'right' | 'fade'

interface ScrollRevealProps {
  children: ReactNode
  delay?: number
  direction?: Direction
  duration?: number
  as?: 'div' | 'section' | 'article' | 'li' | 'ol' | 'ul' | 'header'
  className?: string
}

// REGRA ABSOLUTA (memória feedback_nunca_esconder_conteudo_inicial):
// HTML SSR sai com conteúdo VISÍVEL (opacity:1 default). Se JS hidrar, aplicamos
// estado "before-reveal" (opacity-0 + translate) E observamos viewport. Quando
// entra na tela, removemos as classes "before" → CSS transition cuida do fade.
// Se JS falhar / atrasar / framer não montar — conteúdo permanece visível.

const directionToTranslate: Record<Direction, string> = {
  up: 'translate-y-6',
  down: '-translate-y-6',
  left: 'translate-x-6',
  right: '-translate-x-6',
  fade: '',
}

export function ScrollReveal({
  children,
  delay = 0,
  direction = 'up',
  duration = 0.4,
  as: Tag = 'div',
  className = '',
}: ScrollRevealProps) {
  const ref = useRef<HTMLElement | null>(null)
  // armed = JS rodou e prendeu o estado "before". Default false → sai visível no SSR.
  const [armed, setArmed] = useState(false)
  const [revealed, setRevealed] = useState(false)

  useEffect(() => {
    // Após mount, só armamos a animação se o usuário NÃO pediu reduced motion.
    if (typeof window === 'undefined') return
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reducedMotion) {
      setRevealed(true)
      return
    }
    setArmed(true)

    const node = ref.current
    if (!node) return
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setTimeout(() => setRevealed(true), delay * 1000)
            observer.unobserve(entry.target)
          }
        }
      },
      { threshold: 0.12, rootMargin: '0px 0px -8% 0px' },
    )
    observer.observe(node)
    return () => observer.disconnect()
  }, [delay])

  // Se ainda não armou (SSR ou JS atrasado): conteúdo visível.
  // Se armou e ainda não revelou: aplica before (opacity-0 + translate).
  // Se revelou: opacity-100, translate zerado.
  const beforeClasses = armed && !revealed ? `opacity-0 ${directionToTranslate[direction]}` : 'opacity-100'
  const finalClass = `transition-all ease-out will-change-transform ${beforeClasses} ${className}`
  const style = { transitionDuration: `${duration}s` }
  const refAny = ref as React.RefObject<never>

  switch (Tag) {
    case 'section':
      return <section ref={refAny} className={finalClass} style={style}>{children}</section>
    case 'article':
      return <article ref={refAny} className={finalClass} style={style}>{children}</article>
    case 'li':
      return <li ref={refAny} className={finalClass} style={style}>{children}</li>
    case 'ol':
      return <ol ref={refAny} className={finalClass} style={style}>{children}</ol>
    case 'ul':
      return <ul ref={refAny} className={finalClass} style={style}>{children}</ul>
    case 'header':
      return <header ref={refAny} className={finalClass} style={style}>{children}</header>
    default:
      return <div ref={refAny} className={finalClass} style={style}>{children}</div>
  }
}

interface StaggerListProps {
  staggerChildren?: number
  delay?: number
  as?: 'ul' | 'ol' | 'div'
  className?: string
  children: ReactNode
}

// Stagger via delay incremental nos children — NÃO esconde nenhum filho
// no SSR (rendering inicial visível). Após hydration, anima cascata.
export function StaggerList({
  as: Tag = 'ul',
  className = '',
  children,
}: StaggerListProps) {
  if (Tag === 'ol') return <ol className={className}>{children}</ol>
  if (Tag === 'div') return <div className={className}>{children}</div>
  return <ul className={className}>{children}</ul>
}

interface StaggerItemProps {
  children: ReactNode
  className?: string
  as?: 'li' | 'div' | 'article'
  direction?: Direction
  index?: number
}

// Cada item é um ScrollReveal independente com delay calculado pelo index.
export function StaggerItem({
  children,
  className,
  as = 'li',
  direction = 'up',
  index = 0,
}: StaggerItemProps) {
  return (
    <ScrollReveal
      as={as}
      direction={direction}
      delay={index * 0.06}
      duration={0.35}
      className={className}
    >
      {children}
    </ScrollReveal>
  )
}
