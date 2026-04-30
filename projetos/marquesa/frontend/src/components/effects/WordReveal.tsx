'use client'

import { motion, useReducedMotion } from 'framer-motion'

interface WordRevealProps {
  text: string
  className?: string
  delay?: number
  staggerChildren?: number
  as?: 'h1' | 'h2' | 'h3' | 'p'
}

// Reveal palavra por palavra. Hero h1 e openers de section ficam mais
// editoriais sem custo de bundle (só usa framer-motion já instalado).
// Respeita prefers-reduced-motion (vira fade único).
export function WordReveal({
  text,
  className,
  delay = 0,
  staggerChildren = 0.08,
  as: Tag = 'h1',
}: WordRevealProps) {
  const prefersReduced = useReducedMotion()
  const words = text.split(' ')

  if (prefersReduced) {
    return (
      <motion.span
        className={className}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, delay }}
      >
        {text}
      </motion.span>
    )
  }

  // Renderiza como span pra herdar tipografia do parent (Tag aqui só decora semantica via prop).
  // Caller deve envolver com <Tag> apropriado se quiser h1/h2 real semântico.
  return (
    <motion.span
      className={className}
      initial="hidden"
      animate="visible"
      variants={{
        hidden: {},
        visible: {
          transition: { staggerChildren, delayChildren: delay },
        },
      }}
      data-as={Tag}
    >
      {words.map((word, i) => (
        <motion.span
          key={`${word}-${i}`}
          className="inline-block"
          variants={{
            hidden: { opacity: 0, y: '0.6em' },
            visible: {
              opacity: 1,
              y: 0,
              transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] },
            },
          }}
          style={{ marginRight: '0.25em' }}
        >
          {word}
        </motion.span>
      ))}
    </motion.span>
  )
}
