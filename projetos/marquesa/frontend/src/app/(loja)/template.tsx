'use client'

import { useEffect, useState } from 'react'

// Template = re-renderiza ao mudar de rota dentro do (loja).
// CSS-only fade (não esconde conteúdo): nasce em opacity 100; useEffect aplica
// classe transient pra disparar fade-in. Se JS não carregar, conteúdo segue
// visível — regra de "nunca esconder conteúdo atrás de animação".

export default function LojaTemplate({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    // requestAnimationFrame garante 1 frame com opacity-95 antes de subir pra 100
    const id = requestAnimationFrame(() => setMounted(true))
    return () => cancelAnimationFrame(id)
  }, [])

  return (
    <div
      className={`transition-opacity duration-300 ease-out ${mounted ? 'opacity-100' : 'opacity-95'}`}
    >
      {children}
    </div>
  )
}
