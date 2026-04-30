'use client'

// Count-up de 0 ao valor final em ~600ms easeOutQuart. Respeita reduced-motion.
import { useEffect, useRef, useState } from 'react'

interface AnimatedNumberProps {
  value: number
  duration?: number
  format?: (n: number) => string
  className?: string
}

const easeOutQuart = (t: number) => 1 - Math.pow(1 - t, 4)

export function AnimatedNumber({
  value,
  duration = 600,
  format = (n) => n.toLocaleString('pt-BR'),
  className,
}: AnimatedNumberProps) {
  const [display, setDisplay] = useState(value)
  const fromRef = useRef(value)
  const startRef = useRef(0)
  const rafRef = useRef<number | null>(null)

  useEffect(() => {
    const reduce =
      typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    if (reduce) {
      setDisplay(value)
      return
    }
    fromRef.current = display
    startRef.current = performance.now()
    const target = value

    const tick = (now: number) => {
      const t = Math.min(1, (now - startRef.current) / duration)
      const eased = easeOutQuart(t)
      const v = fromRef.current + (target - fromRef.current) * eased
      setDisplay(v)
      if (t < 1) rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, duration])

  return <span className={className}>{format(display)}</span>
}
