'use client'

import { useEffect, useState, useRef } from 'react'

type Props = {
  value:    number
  duration?: number  // ms
  format?:  (n: number) => string
  decimals?: number
}

/** Animação ease-out de contagem. Vai de último valor → value. */
export function AnimatedNumber({ value, duration = 700, format, decimals = 0 }: Props) {
  const [display, setDisplay] = useState(0)
  const fromRef  = useRef(0)
  const startRef = useRef<number | null>(null)
  const rafRef   = useRef<number>()

  useEffect(() => {
    fromRef.current = display
    startRef.current = null
    if (rafRef.current) cancelAnimationFrame(rafRef.current)

    const from  = fromRef.current
    const delta = value - from

    function step(ts: number) {
      if (startRef.current === null) startRef.current = ts
      const elapsed = ts - startRef.current
      const t = Math.min(1, elapsed / duration)
      const eased = 1 - Math.pow(1 - t, 3) // ease-out cubic
      setDisplay(from + delta * eased)
      if (t < 1) rafRef.current = requestAnimationFrame(step)
    }
    rafRef.current = requestAnimationFrame(step)
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current) }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, duration])

  const rounded = decimals === 0 ? Math.round(display) : Number(display.toFixed(decimals))
  return <>{format ? format(rounded) : rounded}</>
}
