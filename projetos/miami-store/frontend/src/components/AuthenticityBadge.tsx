import { ShieldCheck } from 'lucide-react'
import { cn } from '@/lib/utils'

type Props = {
  variant?: 'solid' | 'outline'
  className?: string
}

export function AuthenticityBadge({ variant = 'solid', className }: Props) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-sm px-2 py-1 text-xs font-bold uppercase tracking-wide',
        variant === 'solid'
          ? 'bg-primary-700 text-white'
          : 'border border-primary-700 text-primary-700',
        className,
      )}
    >
      <ShieldCheck className="h-3 w-3" />
      100% Original
    </span>
  )
}
