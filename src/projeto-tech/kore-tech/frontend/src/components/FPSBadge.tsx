import { cn } from '@/lib/utils'
import { formatFps } from '@/lib/format'

type Props = {
  game: string
  fps: number
  size?: 'sm' | 'md' | 'lg'
  className?: string
  resolution?: string // "1080p high" etc
}

/**
 * Badge de FPS estimado por jogo. Numero em JetBrains Mono cyan.
 * Tag importante pro nicho — destaque visual.
 */
export function FPSBadge({ game, fps, size = 'md', className, resolution }: Props) {
  const big = size === 'lg'
  return (
    <div
      className={cn(
        'flex flex-col items-start gap-0.5 rounded-md border border-border bg-bg/60 px-3 py-2 transition-colors hover:border-primary/40',
        big && 'px-4 py-3',
        className,
      )}
    >
      <p className={cn('text-text-secondary uppercase tracking-wide font-semibold', big ? 'text-xs' : 'text-[10px]')}>
        {game}
        {resolution ? <span className="ml-1 text-text-muted normal-case">· {resolution}</span> : null}
      </p>
      <p className={cn('font-specs text-primary leading-none', big ? 'text-2xl' : 'text-base sm:text-lg')}>
        {formatFps(fps)}
      </p>
    </div>
  )
}
