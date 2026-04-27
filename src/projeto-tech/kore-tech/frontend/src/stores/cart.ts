'use client'

import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import type { CartItem } from '@/services/types'

/**
 * Origem do carrinho (pra cupons como BUILDER10).
 * Uma vez 'builder', mantem 'builder' mesmo se o usuario adicionar um item solto depois,
 * pra nao invalidar BUILDER10 quando ele adiciona, por exemplo, um headset junto.
 */
export type CartSource = 'standard' | 'builder'

type CartState = {
  items: CartItem[]
  source: CartSource
  addItem: (item: Omit<CartItem, 'quantity'>, qty?: number) => void
  addManyItems: (
    items: Array<Omit<CartItem, 'quantity'> & { quantity?: number }>,
    opts?: { source?: CartSource },
  ) => void
  removeItem: (variationId: string) => void
  updateQty: (variationId: string, qty: number) => void
  clear: () => void
  totalItems: () => number
  subtotal: () => number
  isInCart: (variationId: string) => boolean
}

export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      source: 'standard',

      addItem: (item, qty = 1) =>
        set((s) => {
          const existing = s.items.find((i) => i.variationId === item.variationId)
          if (existing) {
            return {
              items: s.items.map((i) =>
                i.variationId === item.variationId
                  ? { ...i, quantity: Math.min(i.maxStock, i.quantity + qty) }
                  : i,
              ),
            }
          }
          return { items: [...s.items, { ...item, quantity: Math.min(item.maxStock, qty) }] }
        }),

      addManyItems: (items, opts) =>
        set((s) => {
          const next = [...s.items]
          for (const incoming of items) {
            const qty = incoming.quantity ?? 1
            const found = next.find((i) => i.variationId === incoming.variationId)
            if (found) {
              found.quantity = Math.min(found.maxStock, found.quantity + qty)
            } else {
              const { quantity: _q, ...rest } = incoming
              next.push({ ...rest, quantity: Math.min(rest.maxStock, qty) })
            }
          }
          // Se entrou origem builder, sobe pra builder. Builder nao volta pra standard
          // automaticamente (so quando carrinho e zerado).
          const incomingSource = opts?.source
          const nextSource: CartSource =
            incomingSource === 'builder' || s.source === 'builder' ? 'builder' : 'standard'
          return { items: next, source: nextSource }
        }),

      removeItem: (variationId) =>
        set((s) => ({ items: s.items.filter((i) => i.variationId !== variationId) })),

      updateQty: (variationId, qty) =>
        set((s) => ({
          items: s.items
            .map((i) =>
              i.variationId === variationId
                ? { ...i, quantity: Math.max(0, Math.min(i.maxStock, qty)) }
                : i,
            )
            .filter((i) => i.quantity > 0),
        })),

      clear: () => set({ items: [], source: 'standard' }),
      totalItems: () => get().items.reduce((acc, i) => acc + i.quantity, 0),
      subtotal: () => get().items.reduce((acc, i) => acc + i.unitPrice * i.quantity, 0),
      isInCart: (variationId) => get().items.some((i) => i.variationId === variationId),
    }),
    {
      name: 'kore-cart-v1',
      storage: createJSONStorage(() => localStorage),
    },
  ),
)
