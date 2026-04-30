'use client'

import { useEffect } from 'react'
import { post } from '@/lib/api'

// Dispara POST /api/imoveis/:slug/view 1x por session.
// SessionStorage flag evita duplicar dentro da mesma session.
export function ViewTracker({ slug }: { slug: string }) {
  useEffect(() => {
    if (typeof window === 'undefined') return
    const key = `marquesa:viewed:${slug}`
    if (sessionStorage.getItem(key)) return
    sessionStorage.setItem(key, '1')
    post(`/api/imoveis/${slug}/view`, null, { withAuth: false }).catch(() => {
      // Falha silenciosa — analytics não-bloqueante
    })
  }, [slug])

  return null
}
