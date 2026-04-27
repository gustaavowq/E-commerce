import Link from 'next/link'
import { ArrowRight, Wrench, Zap } from 'lucide-react'
import { ProductImage } from './ProductImage'
import { Button } from './ui/Button'
import { cn } from '@/lib/utils'
import { formatBRL } from '@/lib/format'

type Props = {
  slug: string
  name: string
  shortDescription: string
  targetGames: string[]
  targetFps: Record<string, number>
  heroImageUrl?: string | null
  startingPrice?: number | null
  className?: string
}

/**
 * Hero de landing page por persona. SEO killer feature.
 * Nome + descricao + jogos-alvo + FPS-alvo + CTAs (ver builds prontos / abrir builder).
 */
export function PersonaHero({
  slug,
  name,
  shortDescription,
  targetGames,
  targetFps,
  heroImageUrl,
  startingPrice,
  className,
}: Props) {
  return (
    <section className={cn('relative overflow-hidden border-b border-border bg-bg', className)}>
      <div aria-hidden className="pointer-events-none absolute -left-32 top-0 h-96 w-96 rounded-full bg-primary/15 blur-3xl" />
      <div aria-hidden className="pointer-events-none absolute -right-20 -bottom-20 h-80 w-80 rounded-full bg-primary/10 blur-3xl" />

      <div className="container-app relative grid items-center gap-10 py-12 sm:py-16 lg:grid-cols-[1.1fr_1fr]">
        <div>
          <p className="font-specs text-xs font-bold uppercase tracking-widest text-primary animate-fade-up">
            Build {slug}
          </p>
          <h1 className="mt-3 font-display text-4xl font-bold leading-tight text-text sm:text-5xl lg:text-6xl animate-fade-up" style={{ animationDelay: '80ms' }}>
            {name}
          </h1>
          <p className="mt-4 max-w-xl text-base text-text-secondary sm:text-lg animate-fade-up" style={{ animationDelay: '160ms' }}>
            {shortDescription}
          </p>

          {Object.keys(targetFps).length > 0 && (
            <div className="mt-6 grid grid-cols-2 gap-3 sm:max-w-md sm:grid-cols-3 animate-fade-up" style={{ animationDelay: '240ms' }}>
              {Object.entries(targetFps).slice(0, 6).map(([game, fps]) => (
                <div key={game} className="rounded-md border border-border bg-surface px-3 py-2.5">
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-text-secondary">{game}</p>
                  <p className="font-specs text-xl text-primary">{fps}<span className="text-xs ml-0.5">FPS</span></p>
                </div>
              ))}
            </div>
          )}

          <div className="mt-8 flex flex-wrap items-center gap-3 animate-fade-up" style={{ animationDelay: '320ms' }}>
            <Link href="#builds-prontos">
              <Button variant="primary" size="lg" className="cta-glow">
                <Zap className="h-4 w-4" /> Ver builds prontos
              </Button>
            </Link>
            <Link href={`/montar?persona=${encodeURIComponent(slug)}`}>
              <Button variant="outline" size="lg">
                <Wrench className="h-4 w-4" /> Monte o seu
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>

          {startingPrice != null && (
            <p className="mt-4 text-xs text-text-muted animate-fade-up" style={{ animationDelay: '380ms' }}>
              A partir de <span className="font-specs text-text">{formatBRL(startingPrice)}</span>
              {' · 12x sem juros · Pix com 5% off'}
            </p>
          )}
        </div>

        <div className="relative aspect-video w-full overflow-hidden rounded-xl border border-border-strong bg-surface lg:aspect-square animate-scale-in">
          <ProductImage
            src={heroImageUrl}
            alt={`PC para ${name}`}
            fallbackLabel={name}
            sizes="(max-width: 1024px) 100vw, 50vw"
            priority
          />
          {targetGames.length > 0 && (
            <div className="absolute bottom-3 left-3 right-3 flex flex-wrap gap-1.5">
              {targetGames.slice(0, 6).map((g) => (
                <span key={g} className="rounded-pill border border-border-strong bg-bg/85 px-2.5 py-1 text-[11px] font-semibold text-text backdrop-blur-sm">
                  {g}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
