'use client'

import { useState, useEffect, type ReactNode } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { useAuth } from '@/stores/auth'
import { getMe } from '@/services/auth'
import { ApiError } from '@/lib/api-error'

export function Providers({ children }: { children: ReactNode }) {
  const [client] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 30_000,
        retry: (failureCount, err) => {
          // Não retry em 4xx
          if (ApiError.is(err) && err.status >= 400 && err.status < 500) return false
          return failureCount < 2
        },
        refetchOnWindowFocus: false,
      },
    },
  }))

  const { setUser, setHydrated } = useAuth()

  useEffect(() => {
    let cancelled = false
    getMe()
      .then((res) => { if (!cancelled) setUser(res.user) })
      .catch(() => { if (!cancelled) setUser(null) })
      .finally(() => { if (!cancelled) setHydrated(true) })
    return () => { cancelled = true }
  }, [setUser, setHydrated])

  return (
    <QueryClientProvider client={client}>
      {children}
      {process.env.NODE_ENV === 'development' && <ReactQueryDevtools initialIsOpen={false} />}
    </QueryClientProvider>
  )
}
