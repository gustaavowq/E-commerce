'use client'

// Providers root — TanStack Query + auth bootstrap.
// Lição #02 do Miami: cuidado com race condition no login.
//   - getMe() do cold-load NÃO sobrescreve user já setado por login concorrente
//   - Login seta {user, hydrated:true} atomicamente via useAuth.loginSuccess
//   - 401 global emitido por lib/api dispara clear() + redirect (sem tela "erro 401")

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useAuth } from '@/stores/auth'
import { getMe } from '@/services/auth'
import { ApiError } from '@/lib/api-error'
import { ToastProvider } from '@/components/Toast'

export function Providers({ children }: { children: React.ReactNode }) {
  const [client] = useState(() => new QueryClient({
    defaultOptions: {
      queries:   { staleTime: 30_000, refetchOnWindowFocus: false, retry: 1 },
      mutations: { retry: 0 },
    },
  }))

  const setUser     = useAuth(s => s.setUser)
  const setHydrated = useAuth(s => s.setHydrated)
  const clear       = useAuth(s => s.clear)
  const router      = useRouter()
  const pathname    = usePathname()

  // Bootstrap: hidrata user a partir do cookie httpOnly via /auth/me
  useEffect(() => {
    let cancelled = false
    getMe()
      .then(r => {
        if (cancelled) return
        // NÃO sobrescreve user já setado por login concorrente — race fix do Miami
        if (useAuth.getState().user) return
        setUser(r.user)
      })
      .catch(err => {
        if (!cancelled && !ApiError.is(err)) console.error(err)
      })
      .finally(() => { if (!cancelled) setHydrated(true) })
    return () => { cancelled = true }
  }, [setUser, setHydrated])

  // Listener global pra 401 (token expirou ou revogado)
  useEffect(() => {
    function on401() {
      // Já está no /login? não faz nada (evita loop).
      if (pathname?.startsWith('/login')) return
      clear()
      router.replace(`/login?next=${encodeURIComponent(pathname ?? '/')}`)
    }
    window.addEventListener('auth:401', on401)
    return () => window.removeEventListener('auth:401', on401)
  }, [router, pathname, clear])

  return (
    <QueryClientProvider client={client}>
      <ToastProvider>{children}</ToastProvider>
    </QueryClientProvider>
  )
}
