'use client'

// Editor estruturado pro JSON de compatibilidade. Diferente do SpecsEditor:
// aqui os campos são CONHECIDOS (o builder usa eles pra cruzar peças). Form
// com tipos certos, dropdown pra socket/chipset, number pra wattagem, etc.

import { Input } from './ui/Input'
import { Select } from './ui/Select'
import { Label } from './ui/Label'
import type { CompatibilityFields, ProductCategory } from '@/services/types'

type Props = {
  category: ProductCategory | null
  value:    CompatibilityFields | null
  onChange: (next: CompatibilityFields) => void
}

export function CompatibilityEditor({ category, value, onChange }: Props) {
  const v = value ?? {}
  function set<K extends keyof CompatibilityFields>(k: K, val: CompatibilityFields[K]) {
    onChange({ ...v, [k]: val === ('' as unknown) ? undefined : val })
  }
  function setNum(k: keyof CompatibilityFields, raw: string) {
    if (raw === '') { onChange({ ...v, [k]: undefined }); return }
    const n = Number(raw)
    if (!Number.isFinite(n)) return
    onChange({ ...v, [k]: n as never })
  }

  return (
    <div className="space-y-4">
      <p className="text-xs text-text-secondary">
        Esses campos alimentam o <strong className="text-text">builder de PC</strong> — preenche com cuidado pra cruzamento de peças funcionar.
      </p>

      {/* CPU + MOBO */}
      {(category === 'cpu' || category === 'mobo') && (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          <Field label="Socket">
            <Select value={v.socket ?? ''} onChange={e => set('socket', e.target.value as string)}>
              <option value="">-</option>
              <option value="AM5">AM5</option>
              <option value="AM4">AM4</option>
              <option value="LGA1700">LGA1700</option>
              <option value="LGA1851">LGA1851</option>
              <option value="LGA1200">LGA1200</option>
            </Select>
          </Field>
          {category === 'mobo' && (
            <Field label="Chipset">
              <Select value={v.chipset ?? ''} onChange={e => set('chipset', e.target.value as string)}>
                <option value="">-</option>
                <option value="A620">A620</option>
                <option value="B650">B650</option>
                <option value="B650E">B650E</option>
                <option value="X670">X670</option>
                <option value="X670E">X670E</option>
                <option value="B760">B760</option>
                <option value="Z790">Z790</option>
                <option value="B860">B860</option>
                <option value="Z890">Z890</option>
              </Select>
            </Field>
          )}
          {category === 'cpu' && (
            <Field label="TDP (W)">
              <Input type="number" mono value={v.tdpW ?? ''} onChange={e => setNum('tdpW', e.target.value)} />
            </Field>
          )}
          {category === 'mobo' && (
            <>
              <Field label="Form factor">
                <Select value={v.formFactor ?? ''} onChange={e => set('formFactor', e.target.value as CompatibilityFields['formFactor'])}>
                  <option value="">-</option>
                  <option value="ATX">ATX</option>
                  <option value="mATX">mATX</option>
                  <option value="ITX">ITX</option>
                  <option value="E-ATX">E-ATX</option>
                </Select>
              </Field>
              <Field label="Tipo RAM">
                <Select value={v.ramType ?? ''} onChange={e => set('ramType', e.target.value as CompatibilityFields['ramType'])}>
                  <option value="">-</option>
                  <option value="DDR4">DDR4</option>
                  <option value="DDR5">DDR5</option>
                </Select>
              </Field>
              <Field label="Slots RAM">
                <Input type="number" mono value={v.ramSlots ?? ''} onChange={e => setNum('ramSlots', e.target.value)} />
              </Field>
              <Field label="PCIe Gen">
                <Select value={String(v.pcieGen ?? '')} onChange={e => setNum('pcieGen', e.target.value)}>
                  <option value="">-</option>
                  <option value="3">3.0</option>
                  <option value="4">4.0</option>
                  <option value="5">5.0</option>
                </Select>
              </Field>
            </>
          )}
        </div>
      )}

      {/* RAM */}
      {category === 'ram' && (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          <Field label="Tipo">
            <Select value={v.ramType ?? ''} onChange={e => set('ramType', e.target.value as CompatibilityFields['ramType'])}>
              <option value="">-</option>
              <option value="DDR4">DDR4</option>
              <option value="DDR5">DDR5</option>
            </Select>
          </Field>
          <Field label="Velocidade (MHz)">
            <Input type="number" mono value={v.ramSpeedMhz ?? ''} onChange={e => setNum('ramSpeedMhz', e.target.value)} />
          </Field>
          <Field label="Capacidade (GB)">
            <Input type="number" mono value={v.ramCapacityGb ?? ''} onChange={e => setNum('ramCapacityGb', e.target.value)} />
          </Field>
        </div>
      )}

      {/* GPU */}
      {category === 'gpu' && (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          <Field label="TDP (W)">
            <Input type="number" mono value={v.tdpW ?? ''} onChange={e => setNum('tdpW', e.target.value)} />
          </Field>
          <Field label="Comprimento (mm)">
            <Input type="number" mono value={v.gpuLengthMm ?? ''} onChange={e => setNum('gpuLengthMm', e.target.value)} />
          </Field>
          <Field label="PCIe Gen">
            <Select value={String(v.pcieGen ?? '')} onChange={e => setNum('pcieGen', e.target.value)}>
              <option value="">-</option>
              <option value="3">3.0</option>
              <option value="4">4.0</option>
              <option value="5">5.0</option>
            </Select>
          </Field>
          <Field label="PSU recomendada (W)">
            <Input type="number" mono value={v.psuRecommendedW ?? ''} onChange={e => setNum('psuRecommendedW', e.target.value)} />
          </Field>
        </div>
      )}

      {/* PSU */}
      {category === 'psu' && (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          <Field label="Wattagem">
            <Input type="number" mono value={v.psuWattage ?? ''} onChange={e => setNum('psuWattage', e.target.value)} />
          </Field>
          <Field label="Certificação">
            <Select value={v.psuCertification ?? ''} onChange={e => set('psuCertification', e.target.value as CompatibilityFields['psuCertification'])}>
              <option value="">-</option>
              <option value="80+ White">80+ White</option>
              <option value="80+ Bronze">80+ Bronze</option>
              <option value="80+ Gold">80+ Gold</option>
              <option value="80+ Platinum">80+ Platinum</option>
              <option value="80+ Titanium">80+ Titanium</option>
            </Select>
          </Field>
          <Field label="Modular">
            <Select value={v.psuModular ?? ''} onChange={e => set('psuModular', e.target.value as CompatibilityFields['psuModular'])}>
              <option value="">-</option>
              <option value="Sim">Sim</option>
              <option value="Semi">Semi</option>
              <option value="Não">Não</option>
            </Select>
          </Field>
        </div>
      )}

      {/* CASE */}
      {category === 'case' && (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          <Field label="Form factor">
            <Select value={v.formFactor ?? ''} onChange={e => set('formFactor', e.target.value as CompatibilityFields['formFactor'])}>
              <option value="">-</option>
              <option value="ATX">ATX</option>
              <option value="mATX">mATX</option>
              <option value="ITX">ITX</option>
              <option value="E-ATX">E-ATX</option>
            </Select>
          </Field>
          <Field label="GPU max (mm)">
            <Input type="number" mono value={v.gpuMaxLengthMm ?? ''} onChange={e => setNum('gpuMaxLengthMm', e.target.value)} />
          </Field>
          <Field label="Cooler max altura (mm)">
            <Input type="number" mono value={v.coolerMaxHeightMm ?? ''} onChange={e => setNum('coolerMaxHeightMm', e.target.value)} />
          </Field>
        </div>
      )}

      {/* COOLER */}
      {category === 'cooler' && (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          <Field label="Socket compatível">
            <Input value={v.socket ?? ''} onChange={e => set('socket', e.target.value)} placeholder="ex: AM5, LGA1700" />
          </Field>
          <Field label="Altura (mm)">
            <Input type="number" mono value={v.coolerHeightMm ?? ''} onChange={e => setNum('coolerHeightMm', e.target.value)} />
          </Field>
        </div>
      )}

      {/* STORAGE */}
      {category === 'storage' && (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          <Field label="Tipo">
            <Select value={v.storageType ?? ''} onChange={e => set('storageType', e.target.value as CompatibilityFields['storageType'])}>
              <option value="">-</option>
              <option value="NVMe Gen5">NVMe Gen5</option>
              <option value="NVMe Gen4">NVMe Gen4</option>
              <option value="SATA SSD">SATA SSD</option>
              <option value="HDD">HDD</option>
            </Select>
          </Field>
          <Field label="Capacidade (GB)">
            <Input type="number" mono value={v.storageCapacityGb ?? ''} onChange={e => setNum('storageCapacityGb', e.target.value)} />
          </Field>
        </div>
      )}

      {(!category || ['monitor', 'mouse', 'teclado', 'headset', 'cadeira', 'fan', 'cabo', 'outro', 'pc_full'].includes(category)) && (
        <p className="rounded-md border border-dashed border-border bg-surface-2 p-3 text-sm text-text-muted">
          Periférico, monitor ou PC pronto não usa compatibilidade pro builder. Pode pular essa aba.
        </p>
      )}
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <Label className="mb-1">{label}</Label>
      {children}
    </div>
  )
}
