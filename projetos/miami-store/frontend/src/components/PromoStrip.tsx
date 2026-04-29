// Tira fina no topo: Pix 5% off + Frete fixo. Branding 24/7.
import { Zap, Truck } from 'lucide-react'

export function PromoStrip() {
  return (
    <div className="bg-ink text-white">
      <div className="container-app flex items-center justify-center gap-4 py-2 text-xs sm:text-sm overflow-hidden whitespace-nowrap">
        <span className="inline-flex items-center gap-1.5">
          <Zap className="h-3.5 w-3.5 text-neon" />
          <strong>Pix com 5% OFF</strong>
        </span>
        <span className="text-ink-4">|</span>
        <span className="inline-flex items-center gap-1.5">
          <Truck className="h-3.5 w-3.5" />
          Frete <strong>R$ 15</strong> pro Brasil todo
        </span>
        <span className="hidden sm:inline text-ink-4">|</span>
        <span className="hidden sm:inline">Original, com caixa e nota</span>
      </div>
    </div>
  )
}
