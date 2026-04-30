'use client'

import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { microcopy } from '@/lib/microcopy'
import { WordReveal } from '@/components/effects/WordReveal'

interface HeroProps {
  imageUrl?: string
  imovelSlug?: string | null
  eyebrow?: string
}

export function Hero({
  imageUrl = 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=2400&q=85',
  imovelSlug,
  eyebrow,
}: HeroProps) {
  const linkPrimario = imovelSlug ? `/imoveis/${imovelSlug}` : '/imoveis'
  // Eyebrow sai do JSON quando não vier override por prop. Permite tunar centralizado.
  const eyebrowText = eyebrow ?? microcopy.hero.eyebrow

  return (
    <section className="relative w-screen left-1/2 -translate-x-1/2 h-[80vh] md:h-[85vh] min-h-[560px] overflow-hidden">
      {/* Foto full-bleed */}
      <Image
        src={imageUrl}
        alt="Hero — fachada de imóvel destaque"
        fill
        sizes="100vw"
        priority
        quality={80}
        className="object-cover"
      />
      {/* Overlay UNIFORME e DENSO em toda a foto — feedback Gustavo:
          gostou da sombra, quer ela espalhada (não só na esquerda).
          ~60% flat + reforço inferior pro scroll cue. */}
      <div className="absolute inset-0 bg-ink/60" aria-hidden="true" />
      <div
        className="absolute inset-0 bg-gradient-to-t from-ink/40 via-transparent to-transparent"
        aria-hidden="true"
      />

      {/* Conteúdo centralizado vertical, encostado à esquerda dentro da
          coluna escura. max-w-2xl garante que H1 não escapa pra zona clara. */}
      <div className="relative h-full flex flex-col justify-center">
        <div className="container-marquesa">
          <div className="max-w-2xl">
            <motion.p
              className="text-eyebrow uppercase tracking-[0.16em] text-paper mb-6"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            >
              {eyebrowText}
            </motion.p>
            <h1 className="font-display font-light text-display-hero text-paper leading-[0.95]">
              <WordReveal text={microcopy.hero.titulo} delay={0.15} staggerChildren={0.09} />
            </h1>
            <motion.p
              className="font-sans text-body-lg text-paper mt-6"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.6, ease: [0.16, 1, 0.3, 1] }}
            >
              {microcopy.hero.subtitulo}
            </motion.p>
            <motion.div
              className="mt-10 flex flex-wrap gap-4"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.85, ease: [0.16, 1, 0.3, 1] }}
            >
              <Link
                href={linkPrimario}
                className="inline-flex items-center justify-center px-8 py-4 font-sans font-medium text-body-sm uppercase tracking-[0.04em] bg-paper text-ink hover:bg-paper-warm transition-colors duration-fast"
              >
                {microcopy.hero.cta_primario}
              </Link>
              <Link
                href="/sobre"
                className="inline-flex items-center justify-center px-8 py-4 font-sans font-medium text-body-sm uppercase tracking-[0.04em] border border-paper text-paper hover:bg-paper hover:text-ink transition-colors duration-fast"
              >
                {microcopy.hero.cta_secundario}
              </Link>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Scroll cue */}
      <div
        className="absolute bottom-6 left-1/2 -translate-x-1/2 w-px h-8 bg-paper/50 animate-scroll-cue"
        aria-hidden="true"
      />
    </section>
  )
}
