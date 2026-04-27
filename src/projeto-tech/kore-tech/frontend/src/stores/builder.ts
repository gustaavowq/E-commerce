'use client'

/**
 * Estado do PC Builder.
 * - Cada categoria tem 0 ou 1 produto selecionado (RAM aceita ate 2 sticks via array, simplificacao MVP).
 * - Persistido em localStorage pra cliente nao perder a build se sair acidentalmente.
 * - Compatibilidade e PSU recomendada vem do backend; aqui so guardamos o snapshot ultimo.
 */

import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import type {
  BuilderCheckIssue,
  ProductCategory,
  ProductListItem,
} from '@/services/types'

export type BuilderSelection = {
  productId: string
  productSlug: string
  productName: string
  price: number
  imageUrl: string | null
  brandName?: string
  consumptionW?: number
}

export type BuilderState = {
  // chave = categoria do builder, valor = produto selecionado
  selections: Partial<Record<BuilderCategorySlot, BuilderSelection>>
  activeCategory: BuilderCategorySlot
  totalWattage: number
  isValid: boolean
  issues: BuilderCheckIssue[]
  recommendedPsuW: number
  lastCheckedAt: string | null

  setActive: (cat: BuilderCategorySlot) => void
  pickPart: (cat: BuilderCategorySlot, item: BuilderSelection) => void
  pickPartFromProduct: (cat: BuilderCategorySlot, p: ProductListItem) => void
  removePart: (cat: BuilderCategorySlot) => void
  clear: () => void

  setComputed: (data: {
    totalWattage: number
    recommendedPsuW: number
    isValid: boolean
    issues: BuilderCheckIssue[]
  }) => void

  // helpers
  partsAsArray: () => Array<{ category: BuilderCategorySlot; productId: string }>
  totalPrice: () => number
  pickedCount: () => number
}

export const BUILDER_SLOTS: ReadonlyArray<{ slot: BuilderCategorySlot; label: string; required: boolean; icon?: string }> = [
  { slot: 'cpu', label: 'Processador', required: true },
  { slot: 'mobo', label: 'Placa-mae', required: true },
  { slot: 'ram', label: 'Memoria RAM', required: true },
  { slot: 'gpu', label: 'Placa de video', required: true },
  { slot: 'storage', label: 'Armazenamento', required: true },
  { slot: 'psu', label: 'Fonte', required: true },
  { slot: 'case', label: 'Gabinete', required: true },
  { slot: 'cooler', label: 'Cooler', required: false },
]

export type BuilderCategorySlot = 'cpu' | 'mobo' | 'ram' | 'gpu' | 'storage' | 'psu' | 'case' | 'cooler'

const SLOT_TO_CATEGORY: Record<BuilderCategorySlot, ProductCategory> = {
  cpu: 'cpu',
  mobo: 'mobo',
  ram: 'ram',
  gpu: 'gpu',
  storage: 'storage',
  psu: 'psu',
  case: 'case',
  cooler: 'cooler',
}

export function slotToCategory(s: BuilderCategorySlot): ProductCategory {
  return SLOT_TO_CATEGORY[s]
}

export const useBuilder = create<BuilderState>()(
  persist(
    (set, get) => ({
      selections: {},
      activeCategory: 'cpu',
      totalWattage: 0,
      isValid: true,
      issues: [],
      recommendedPsuW: 0,
      lastCheckedAt: null,

      setActive: (cat) => set({ activeCategory: cat }),

      pickPart: (cat, item) =>
        set((s) => ({ selections: { ...s.selections, [cat]: item } })),

      pickPartFromProduct: (cat, p) =>
        set((s) => ({
          selections: {
            ...s.selections,
            [cat]: {
              productId: p.id,
              productSlug: p.slug,
              productName: p.name,
              price: p.basePrice,
              imageUrl: p.primaryImage?.url ?? null,
              brandName: p.brand?.name,
            },
          },
        })),

      removePart: (cat) =>
        set((s) => {
          const next = { ...s.selections }
          delete next[cat]
          return { selections: next }
        }),

      clear: () =>
        set({
          selections: {},
          activeCategory: 'cpu',
          totalWattage: 0,
          isValid: true,
          issues: [],
          recommendedPsuW: 0,
          lastCheckedAt: null,
        }),

      setComputed: ({ totalWattage, recommendedPsuW, isValid, issues }) =>
        set({
          totalWattage,
          recommendedPsuW,
          isValid,
          issues,
          lastCheckedAt: new Date().toISOString(),
        }),

      partsAsArray: () =>
        Object.entries(get().selections)
          .filter(([, v]) => !!v)
          .map(([cat, sel]) => ({ category: cat as BuilderCategorySlot, productId: sel!.productId })),

      totalPrice: () =>
        Object.values(get().selections).reduce((acc, sel) => acc + (sel?.price ?? 0), 0),

      pickedCount: () => Object.values(get().selections).filter(Boolean).length,
    }),
    {
      name: 'kore-builder-v1',
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({
        selections: s.selections,
        activeCategory: s.activeCategory,
      }),
    },
  ),
)
