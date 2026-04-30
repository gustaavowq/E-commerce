'use client'

import { motion, useReducedMotion } from 'framer-motion'
import type { ReactNode } from 'react'

type Direction = 'up' | 'down' | 'left' | 'right' | 'fade'

interface ScrollRevealProps {
  children: ReactNode
  delay?: number
  direction?: Direction
  distance?: number
  duration?: number
  as?: keyof typeof motionTags
  className?: string
}

const motionTags = {
  div: motion.div,
  section: motion.section,
  article: motion.article,
  li: motion.li,
  ol: motion.ol,
  ul: motion.ul,
  header: motion.header,
} as const

const offsetByDirection: Record<Direction, { x?: number; y?: number }> = {
  up: { y: 32 },
  down: { y: -32 },
  left: { x: 32 },
  right: { x: -32 },
  fade: {},
}

// Scroll-reveal padrão Marquesa via Framer Motion.
// Run-once via viewport={{ once: true, margin: '0px 0px -10% 0px' }}.
// Respeita prefers-reduced-motion (sem distance, só fade).
// API mantida — todos os usos antigos seguem funcionando.
export function ScrollReveal({
  children,
  delay = 0,
  direction = 'up',
  distance,
  duration = 0.4,
  as = 'div',
  className,
}: ScrollRevealProps) {
  const prefersReduced = useReducedMotion()
  const Tag = motionTags[as]
  const offset = offsetByDirection[direction]
  const x = prefersReduced ? 0 : (distance !== undefined ? Math.sign(offset.x ?? 0) * distance : offset.x ?? 0)
  const y = prefersReduced ? 0 : (distance !== undefined ? Math.sign(offset.y ?? 0) * distance : offset.y ?? 0)

  return (
    <Tag
      className={className}
      initial={{ opacity: 0, x, y }}
      whileInView={{ opacity: 1, x: 0, y: 0 }}
      viewport={{ once: true, margin: '0px 0px -10% 0px' }}
      transition={{
        duration,
        delay,
        ease: [0.16, 1, 0.3, 1],
      }}
    >
      {children}
    </Tag>
  )
}

// Wrapper que aplica stagger nos filhos diretos.
// Cada filho deve ser um <StaggerItem> (ou outro motion element com variants).
interface StaggerListProps {
  staggerChildren?: number
  delay?: number
  as?: 'ul' | 'ol' | 'div'
  className?: string
  children: ReactNode
}

const containerVariants = (staggerChildren: number, delay: number) => ({
  hidden: {},
  visible: {
    transition: { staggerChildren, delayChildren: delay },
  },
})

export function StaggerList({
  staggerChildren = 0.08,
  delay = 0,
  as = 'ul',
  className,
  children,
}: StaggerListProps) {
  const variants = containerVariants(staggerChildren, delay)
  const common = {
    className,
    initial: 'hidden' as const,
    whileInView: 'visible' as const,
    viewport: { once: true, margin: '0px 0px -10% 0px' },
    variants,
  }
  if (as === 'ul') return <motion.ul {...common}>{children}</motion.ul>
  if (as === 'ol') return <motion.ol {...common}>{children}</motion.ol>
  return <motion.div {...common}>{children}</motion.div>
}

interface StaggerItemProps {
  children: ReactNode
  className?: string
  as?: 'li' | 'div' | 'article'
  direction?: Direction
}

export function StaggerItem({
  children,
  className,
  as = 'li',
  direction = 'up',
}: StaggerItemProps) {
  const prefersReduced = useReducedMotion()
  const offset = offsetByDirection[direction]
  const itemVariants = {
    hidden: {
      opacity: 0,
      x: prefersReduced ? 0 : offset.x ?? 0,
      y: prefersReduced ? 0 : offset.y ?? 0,
    },
    visible: {
      opacity: 1,
      x: 0,
      y: 0,
      transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] },
    },
  }
  if (as === 'li') return <motion.li className={className} variants={itemVariants}>{children}</motion.li>
  if (as === 'article') return <motion.article className={className} variants={itemVariants}>{children}</motion.article>
  return <motion.div className={className} variants={itemVariants}>{children}</motion.div>
}
