'use client'

import { Check, Cpu, MemoryStick, HardDrive, Plug, Box, Fan, MonitorPlay, CircuitBoard, Info } from 'lucide-react'
import { BUILDER_SLOTS, useBuilder, type BuilderCategorySlot } from '@/stores/builder'
import { formatBRL } from '@/lib/format'
import { cn } from '@/lib/utils'
import { Tooltip } from '@/components/ui/Tooltip'

const ICONS: Record<BuilderCategorySlot, React.ComponentType<{ className?: string }>> = {
  cpu: Cpu,
  mobo: CircuitBoard,
  ram: MemoryStick,
  gpu: MonitorPlay,
  storage: HardDrive,
  psu: Plug,
  case: Box,
  cooler: Fan,
}

// Microcopy didatico (BUILDER-VISUAL-SPECS.md secao 6). Direto, sem travessao.
const TOOLTIPS: Record<BuilderCategorySlot, string> = {
  cpu: 'Processador. Define o socket e o tipo de RAM da placa-mae.',
  mobo: 'Placa-mae. Mostramos so as que servem na CPU que voce escolheu.',
  ram: 'Memoria RAM. Tipo (DDR4/DDR5) e velocidade vem da placa-mae.',
  gpu: 'Placa de video. Define o FPS no jogo e a wattagem da fonte.',
  storage: 'Armazenamento. NVMe e bem mais rapido que SSD SATA.',
  psu: 'Fonte. Calculamos a wattagem somada e sugerimos fonte adequada.',
  case: 'Gabinete. Tem que caber a placa-mae, a GPU e a altura do cooler.',
  cooler: 'Cooler. Pode ser opcional se a CPU vier com cooler de fabrica.',
}

export function BuilderCategoryPicker() {
  const selections = useBuilder((s) => s.selections)
  const active = useBuilder((s) => s.activeCategory)
  const setActive = useBuilder((s) => s.setActive)

  return (
    <nav aria-label="Categorias do builder" className="flex flex-col gap-1.5">
      {BUILDER_SLOTS.map(({ slot, label, required }) => {
        const sel = selections[slot]
        const Icon = ICONS[slot]
        const isActive = active === slot
        const checked = !!sel
        return (
          <div key={slot} className="relative flex items-stretch gap-1">
            <button
              type="button"
              onClick={() => setActive(slot)}
              className={cn(
                'group flex flex-1 items-center gap-3 rounded-md border px-3 py-2.5 text-left transition-all',
                isActive
                  ? 'border-primary bg-primary-soft text-text'
                  : 'border-border bg-surface hover:border-primary/40 hover:bg-surface-2',
              )}
            >
              <span
                className={cn(
                  'flex h-9 w-9 shrink-0 items-center justify-center rounded-md transition-colors',
                  checked
                    ? 'bg-success/15 text-success border border-success/40'
                    : isActive
                      ? 'bg-primary/15 text-primary'
                      : 'bg-bg text-text-secondary',
                )}
              >
                {checked ? <Check className="h-4 w-4" /> : <Icon className="h-4 w-4" />}
              </span>
              <span className="flex-1 min-w-0">
                <span className="block text-sm font-semibold text-text">
                  {label}
                  {!required && <span className="ml-1 text-xs font-normal text-text-muted">(opcional)</span>}
                </span>
                {sel ? (
                  <span className="block truncate text-xs text-text-secondary">
                    {sel.productName} · <span className="font-specs text-primary">{formatBRL(sel.price)}</span>
                  </span>
                ) : (
                  <span className="block text-xs text-text-muted">Escolher</span>
                )}
              </span>
            </button>
            <Tooltip content={TOOLTIPS[slot]} side="right">
              <button
                type="button"
                aria-label={`O que e ${label}`}
                tabIndex={0}
                className="flex h-8 w-8 shrink-0 items-center justify-center self-center rounded-md text-text-muted hover:bg-surface-2 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                <Info className="h-3.5 w-3.5" />
              </button>
            </Tooltip>
          </div>
        )
      })}
    </nav>
  )
}
