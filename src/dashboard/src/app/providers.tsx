'use client'

import { useEffect, useState } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useAuth } from '@/stores/auth'
import { getMe } from '@/services/auth'
import { ApiError } from '@/lib/api-error'

export function Providers({ children }: { children: React.ReactNode }) {
  const [client] = useState(() => new QueryClient({
    defaultOptions: {
      queries: { staleTime: 30_000, refetchOnWindowFocus: false, retry: 1 },
      mutations: { retry: 0 },
    },
  }))

  const setUser     = useAuth(s => s.setUser)
  const setHydrated = useAuth(s => s.setHydrated)

  useEffect(() => {
    let cancelled = false
    getMe()
      .then(r => { if (!cancelled) setUser(r.user) })
      .catch(err => {
        // 401 é esperado quando não logado
        if (!cancelled && !ApiError.is(err)) console.error(err)
      })
      .finally(() => { if (!cancelled) setHydrated(true) })
    return () => { cancelled = true }
  }, [setUser, setHydrated])

  return <QueryClientProvider client={client}>{children}</QueryClientProvider>
}
