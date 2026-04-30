'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useTransition, useState, useEffect } from 'react'
import { microcopy } from '@/lib/microcopy'
import { cn } from '@/lib/format'

type Sort = 'recentes' | 'precoAsc' | 'precoDesc' | 'areaDesc'

const tipos: { value: string; label: string }[] = [
  { value: '', label: microcopy.filtros.tipo_todos },
  { value: 'APARTAMENTO', label: microcopy.filtros.tipo_apartamento },
  { value: 'COBERTURA', label: microcopy.filtros.tipo_cobertura },
  { value: 'CASA', label: microcopy.filtros.tipo_casa },
  { value: 'SOBRADO', label: microcopy.filtros.tipo_sobrado },
  { value: 'TERRENO', label: microcopy.filtros.tipo_terreno },
  { value: 'COMERCIAL', label: microcopy.filtros.tipo_comercial },
]

const sorts: { value: Sort; label: string }[] = [
  { value: 'recentes', label: microcopy.filtros.ordenar_recentes },
  { value: 'precoAsc', label: microcopy.filtros.ordenar_preco_asc },
  { value: 'precoDesc', label: microcopy.filtros.ordenar_preco_desc },
  { value: 'areaDesc', label: microcopy.filtros.ordenar_area_desc },
]

const quartosOpts = [
  { value: '', label: microcopy.filtros.quartos_qualquer },
  { value: '1', label: '1+' },
  { value: '2', label: '2+' },
  { value: '3', label: '3+' },
  { value: '4', label: '4+' },
]

export function FiltersBar() {
  const router = useRouter()
  const params = useSearchParams()
  const [, startTransition] = useTransition()

  const [tipo, setTipo] = useState(params.get('tipo') || '')
  const [bairro, setBairro] = useState(params.get('bairro') || '')
  const [precoMin, setPrecoMin] = useState(params.get('precoMin') || '')
  const [precoMax, setPrecoMax] = useState(params.get('precoMax') || '')
  const [quartosMin, setQuartosMin] = useState(params.get('quartosMin') || '')
  const [sort, setSort] = useState<Sort>((params.get('sort') as Sort) || 'recentes')

  // Sincroniza state quando URL muda externamente
  useEffect(() => {
    setTipo(params.get('tipo') || '')
    setBairro(params.get('bairro') || '')
    setPrecoMin(params.get('precoMin') || '')
    setPrecoMax(params.get('precoMax') || '')
    setQuartosMin(params.get('quartosMin') || '')
    setSort((params.get('sort') as Sort) || 'recentes')
  }, [params])

  const hasFilters = !!(tipo || bairro || precoMin || precoMax || quartosMin)

  const apply = () => {
    const url = new URLSearchParams()
    if (tipo) url.set('tipo', tipo)
    if (bairro) url.set('bairro', bairro)
    if (precoMin) url.set('precoMin', precoMin)
    if (precoMax) url.set('precoMax', precoMax)
    if (quartosMin) url.set('quartosMin', quartosMin)
    if (sort && sort !== 'recentes') url.set('sort', sort)
    startTransition(() => router.push(`/imoveis?${url.toString()}`))
  }

  const clear = () => {
    setTipo('')
    setBairro('')
    setPrecoMin('')
    setPrecoMax('')
    setQuartosMin('')
    setSort('recentes')
    startTransition(() => router.push('/imoveis'))
  }

  return (
    <div className="sticky top-[73px] z-30 bg-paper border-b border-bone py-4">
      <form
        onSubmit={(e) => {
          e.preventDefault()
          apply()
        }}
        className="container-marquesa flex flex-col lg:flex-row gap-3 items-stretch lg:items-end"
      >
        <FilterField label={microcopy.filtros.tipo}>
          <select
            value={tipo}
            onChange={(e) => setTipo(e.target.value)}
            className={selectClass}
          >
            {tipos.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
        </FilterField>

        <FilterField label={microcopy.filtros.bairro}>
          <input
            type="text"
            value={bairro}
            onChange={(e) => setBairro(e.target.value)}
            placeholder="Jardins, Itaim…"
            className={inputClass}
          />
        </FilterField>

        <FilterField label={microcopy.filtros.preco_min}>
          <input
            type="number"
            value={precoMin}
            onChange={(e) => setPrecoMin(e.target.value)}
            placeholder="R$"
            min={0}
            step={50000}
            className={cn(inputClass, 'tnum')}
          />
        </FilterField>

        <FilterField label={microcopy.filtros.preco_max}>
          <input
            type="number"
            value={precoMax}
            onChange={(e) => setPrecoMax(e.target.value)}
            placeholder="R$"
            min={0}
            step={50000}
            className={cn(inputClass, 'tnum')}
          />
        </FilterField>

        <FilterField label={microcopy.filtros.quartos}>
          <select
            value={quartosMin}
            onChange={(e) => setQuartosMin(e.target.value)}
            className={selectClass}
          >
            {quartosOpts.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </FilterField>

        <FilterField label={microcopy.filtros.ordenar}>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as Sort)}
            className={selectClass}
          >
            {sorts.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </FilterField>

        <div className="flex gap-2">
          <button
            type="submit"
            className="px-6 py-3 bg-moss text-paper text-body-sm uppercase tracking-[0.04em] hover:bg-moss-deep transition-colors duration-fast whitespace-nowrap"
          >
            {microcopy.filtros.aplicar}
          </button>
          {hasFilters && (
            <button
              type="button"
              onClick={clear}
              className="px-4 py-3 text-body-sm text-ink hover:underline underline-offset-4 whitespace-nowrap"
            >
              {microcopy.filtros.limpar}
            </button>
          )}
        </div>
      </form>
    </div>
  )
}

const inputClass =
  'w-full bg-paper border border-bone px-3 py-2 text-body-sm text-ink focus:border-ash-soft focus:outline-none focus:ring-1 focus:ring-moss transition-colors duration-fast'
const selectClass =
  'w-full bg-paper border border-bone px-3 py-2 text-body-sm text-ink focus:border-ash-soft focus:outline-none focus:ring-1 focus:ring-moss transition-colors duration-fast'

function FilterField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1.5 min-w-0 flex-1">
      <span className="text-eyebrow uppercase tracking-[0.16em] text-ash">{label}</span>
      {children}
    </label>
  )
}
