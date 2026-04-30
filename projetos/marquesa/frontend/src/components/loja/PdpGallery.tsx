'use client'

import Image from 'next/image'
import { useState, useEffect, useCallback } from 'react'
import { cn } from '@/lib/format'

interface PdpGalleryProps {
  fotos: string[]
  alt: string
}

export function PdpGallery({ fotos, alt }: PdpGalleryProps) {
  const [index, setIndex] = useState(0)
  const [lightbox, setLightbox] = useState(false)

  const safeFotos = fotos.length ? fotos : ['https://placehold.co/1600x1067?text=Marquesa']
  const main = safeFotos[index] ?? safeFotos[0]

  const next = useCallback(
    () => setIndex((i) => (i + 1) % safeFotos.length),
    [safeFotos.length],
  )
  const prev = useCallback(
    () => setIndex((i) => (i - 1 + safeFotos.length) % safeFotos.length),
    [safeFotos.length],
  )

  useEffect(() => {
    if (!lightbox) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setLightbox(false)
      if (e.key === 'ArrowRight') next()
      if (e.key === 'ArrowLeft') prev()
    }
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [lightbox, next, prev])

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[96px_1fr] gap-3">
      {/* Thumbnails laterais (desktop) */}
      <div className="hidden lg:flex flex-col gap-3 overflow-y-auto max-h-[640px] no-scrollbar">
        {safeFotos.map((foto, i) => (
          <button
            key={i}
            type="button"
            onClick={() => setIndex(i)}
            aria-label={`Foto ${i + 1}`}
            className={cn(
              'relative w-24 h-24 overflow-hidden bg-bone shrink-0 transition-opacity duration-fast',
              i === index ? 'ring-1 ring-ink opacity-100' : 'opacity-70 hover:opacity-100',
            )}
          >
            <Image src={foto} alt="" fill sizes="96px" className="object-cover" />
          </button>
        ))}
      </div>

      {/* Foto dominante */}
      <div className="flex flex-col gap-3">
        <button
          type="button"
          onClick={() => setLightbox(true)}
          aria-label="Abrir galeria em tela cheia"
          className="relative aspect-card lg:aspect-[4/3] bg-bone overflow-hidden cursor-zoom-in"
        >
          <Image
            src={main}
            alt={alt}
            fill
            sizes="(min-width: 1024px) 70vw, 100vw"
            className="object-cover"
            priority
          />
        </button>

        {/* Strip horizontal (mobile) */}
        <div className="lg:hidden flex gap-2 overflow-x-auto no-scrollbar">
          {safeFotos.map((foto, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setIndex(i)}
              aria-label={`Foto ${i + 1}`}
              className={cn(
                'relative w-16 h-16 shrink-0 bg-bone overflow-hidden',
                i === index ? 'ring-1 ring-ink' : 'opacity-70',
              )}
            >
              <Image src={foto} alt="" fill sizes="64px" className="object-cover" />
            </button>
          ))}
        </div>
      </div>

      {/* Lightbox */}
      {lightbox && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-ink/90 flex items-center justify-center"
          onClick={() => setLightbox(false)}
        >
          <button
            onClick={(e) => {
              e.stopPropagation()
              prev()
            }}
            aria-label="Foto anterior"
            className="absolute left-6 text-paper text-3xl px-3 py-2 hover:opacity-80"
          >
            ‹
          </button>
          <div className="relative w-[90vw] h-[85vh]" onClick={(e) => e.stopPropagation()}>
            <Image src={main} alt={alt} fill sizes="90vw" className="object-contain" />
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation()
              next()
            }}
            aria-label="Próxima foto"
            className="absolute right-6 text-paper text-3xl px-3 py-2 hover:opacity-80"
          >
            ›
          </button>
          <button
            onClick={() => setLightbox(false)}
            aria-label="Fechar"
            className="absolute top-6 right-6 text-paper text-2xl px-3 py-1 hover:opacity-80"
          >
            ×
          </button>
          <p className="absolute bottom-6 left-1/2 -translate-x-1/2 text-paper/70 text-body-sm tnum">
            {index + 1} / {safeFotos.length}
          </p>
        </div>
      )}
    </div>
  )
}
