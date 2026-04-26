// Carrinho client-side via Zustand + persist localStorage.
// Em sprint 2, adicionar sync com backend (POST /cart/items) pra carrinhos
// de visitante via cookie de sessão.
'use client'

import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

export type CartItem = {
  productId:    string
  variationId:  string
  productSlug:  string
  productName:  string
  variationLabel: string         // "Tamanho M / Vermelho"
  unitPrice:    number
  imageUrl:     string | null
  quantity:     number
  maxStock:     number
}

type CartState = {
  items: CartItem[]
  addItem: (item: Omit<CartItem, 'quantity'>, qty?: number) => void
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

      addItem: (item, qty = 1) => set((s) => {
        const existing = s.items.find(i => i.variationId === item.variationId)
        if (existing) {
          return {
            items: s.items.map(i => i.variationId === item.variationId
              ? { ...i, quantity: Math.min(i.maxStock, i.quantity + qty) }
              : i),
          }
        }
        return { items: [...s.items, { ...item, quantity: Math.min(item.maxStock, qty) }] }
      }),

      removeItem: (variationId) => set((s) => ({
        items: s.items.filter(i => i.variationId !== variationId),
      })),

      updateQty: (variationId, qty) => set((s) => ({
        items: s.items
          .map(i => i.variationId === variationId ? { ...i, quantity: Math.max(0, Math.min(i.maxStock, qty)) } : i)
          .filter(i => i.quantity > 0),
      })),

      clear: () => set({ items: [] }),

      totalItems: () => get().items.reduce((acc, i) => acc + i.quantity, 0),

      subtotal:   () => get().items.reduce((acc, i) => acc + i.unitPrice * i.quantity, 0),

      isInCart:   (variationId) => get().items.some(i => i.variationId === variationId),
    }),
    {
      name: 'miami-cart-v1',
      storage: createJSONStorage(() => localStorage),
    },
  ),
)
