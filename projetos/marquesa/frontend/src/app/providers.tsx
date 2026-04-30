'use client'

import { QueryClientProvider } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import { makeQueryClient } from '@/lib/queryClient'
import { api } from '@/lib/api'
import { useAuthStore } from '@/stores/authStore'
import type { User } from '@/types/api'

export function Providers({ children }: { children: React.ReactNode }) {
  const [client] = useState(() => makeQueryClient())
  const setUser = useAuthStore((s) => s.setUser)
  const setHydrated = useAuthStore((s) => s.setHydrated)

  useEffect(() => {
    let cancelled = false
    api<{ user: User }>('/api/auth/me', { withAuth: true })
      .then((res) => {
        if (cancelled) return
        setUser(res.user)
      })
      .catch(() => {
        if (cancelled) return
        setUser(null)
      })
      .finally(() => {
        if (!cancelled) setHydrated()
      })
    return () => {
      cancelled = true
    }
  }, [setUser, setHydrated])

  return <QueryClientProvider client={client}>{children}</QueryClientProvider>
}
