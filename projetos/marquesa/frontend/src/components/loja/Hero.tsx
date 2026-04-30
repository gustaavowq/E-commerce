import Link from 'next/link'
import Image from 'next/image'
import { microcopy } from '@/lib/microcopy'

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

      {/* Sombra na foto — usa arbitrary rgba pq cores Tailwind são CSS vars
          sem componentes RGB, então `bg-ink/X` NÃO renderiza opacity (era
          o bug que segurou o feedback do Gustavo por horas). */}
      <div
        className="absolute inset-0"
        style={{ backgroundColor: 'rgba(10, 10, 10, 0.6)' }}
        aria-hidden="true"
      />
      <div
        className="absolute inset-0"
        style={{
          background:
            'linear-gradient(to top, rgba(10,10,10,0.55), rgba(10,10,10,0.15) 50%, transparent)',
        }}
        aria-hidden="true"
      />

      {/* Conteúdo — sem framer-motion no hero (era o que prendia opacity:0) */}
      <div className="relative h-full flex flex-col justify-center">
        <div className="container-marquesa">
          <div className="max-w-2xl">
            <p className="text-eyebrow uppercase tracking-[0.16em] text-paper mb-6">
              {eyebrowText}
            </p>
            <h1 className="font-display font-light text-display-hero text-paper leading-[0.95]">
              {microcopy.hero.titulo}
            </h1>
            <p className="font-sans text-body-lg text-paper mt-6">
              {microcopy.hero.subtitulo}
            </p>
            <div className="mt-10 flex flex-wrap gap-4">
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
            </div>
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
