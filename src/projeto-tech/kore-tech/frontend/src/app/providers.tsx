'use client'

import { useState, useEffect, type ReactNode } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { useAuth } from '@/stores/auth'
import { useWishlistSync } from '@/stores/useWishlistSync'
import { getMe } from '@/services/auth'
import { ApiError } from '@/lib/api-error'
import { ToastProvider } from '@/components/ui/Toast'

export function Providers({ children }: { children: ReactNode }) {
  const [client] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 30_000,
            retry: (failureCount, err) => {
              if (ApiError.is(err) && err.status >= 400 && err.status < 500) return false
              return failureCount < 2
            },
            refetchOnWindowFocus: false,
          },
        },
      }),
  )

  const setUser = useAuth((s) => s.setUser)
  const setHydrated = useAuth((s) => s.setHydrated)

  useEffect(() => {
    let cancelled = false
    getMe()
      .then((res) => {
        if (!cancelled) setUser(res.user)
      })
      .catch(() => {
        if (!cancelled) setUser(null)
      })
      .finally(() => {
        if (!cancelled) setHydrated(true)
      })
    return () => {
      cancelled = true
    }
  }, [setUser, setHydrated])

  return (
    <QueryClientProvider client={client}>
      <ToastProvider>
        <SyncBridges />
        {children}
      </ToastProvider>
      {process.env.NODE_ENV === 'development' && <ReactQueryDevtools initialIsOpen={false} />}
    </QueryClientProvider>
  )
}

/**
 * Hooks de sincronizacao que precisam viver dentro do QueryClientProvider.
 * Colocar aqui evita ter que envolver cada pagina manualmente.
 */
function SyncBridges() {
  useWishlistSync()
  return null
}
