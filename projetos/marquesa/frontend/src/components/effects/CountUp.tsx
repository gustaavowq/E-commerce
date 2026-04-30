'use client'

import { useEffect, useRef, useState } from 'react'
import { motion, useInView, useReducedMotion } from 'framer-motion'

interface CountUpProps {
  to: number
  duration?: number
  suffix?: string
  prefix?: string
  className?: string
  formatter?: (n: number) => string
}

// Conta até o número quando entra no viewport. Suporta sufixo (% / etc).
// Respeita prefers-reduced-motion (mostra valor final direto).
// easeOutQuart pra terminar suave.
export function CountUp({
  to,
  duration = 1.2,
  suffix = '',
  prefix = '',
  className,
  formatter,
}: CountUpProps) {
  const ref = useRef<HTMLSpanElement | null>(null)
  const inView = useInView(ref, { once: true, margin: '0px 0px -10% 0px' })
  const prefersReduced = useReducedMotion()
  const [value, setValue] = useState(prefersReduced ? to : 0)

  useEffect(() => {
    if (!inView || prefersReduced) return
    const start = performance.now()
    const totalMs = duration * 1000
    let raf = 0
    const tick = (now: number) => {
      const elapsed = now - start
      const t = Math.min(1, elapsed / totalMs)
      // easeOutQuart
      const eased = 1 - Math.pow(1 - t, 4)
      setValue(Math.round(to * eased))
      if (t < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [inView, to, duration, prefersReduced])

  const display = formatter ? formatter(value) : String(value)

  return (
    <motion.span ref={ref} className={className}>
      {prefix}
      {display}
      {suffix}
    </motion.span>
  )
}
