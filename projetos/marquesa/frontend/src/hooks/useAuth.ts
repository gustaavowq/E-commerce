'use client'

import { useRouter } from 'next/navigation'
import { useCallback } from 'react'
import { post } from '@/lib/api'
import { useAuthStore } from '@/stores/authStore'
import type { User } from '@/types/api'

export function useAuth() {
  const router = useRouter()
  const { user, hydrated, setUser, clear } = useAuthStore()

  const login = useCallback(
    async (email: string, password: string, redirect?: string | null) => {
      const data = await post<{ user: User; accessToken: string }>(
        '/api/auth/login',
        { email, password },
        { withAuth: true },
      )
      setUser(data.user)

      // Login redirect (lição feedback_login_redirect_padrao.md):
      // 1) ?redirect=path → respeita
      // 2) Sem param → role decide (USER → /, ADMIN/ANALYST → /painel)
      const target =
        redirect && redirect.startsWith('/') && !redirect.startsWith('//')
          ? redirect
          : data.user.role === 'USER'
            ? '/'
            : '/painel'

      router.push(target)
      router.refresh()
      return data.user
    },
    [router, setUser],
  )

  const register = useCallback(
    async (input: { name: string; email: string; password: string; phone?: string }) => {
      const data = await post<{ user: User; accessToken: string }>(
        '/api/auth/register',
        input,
        { withAuth: true },
      )
      setUser(data.user)
      router.push('/')
      router.refresh()
      return data.user
    },
    [router, setUser],
  )

  const logout = useCallback(async () => {
    await post('/api/auth/logout', null, { withAuth: true }).catch(() => null)
    clear()
    router.push('/')
    router.refresh()
  }, [router, clear])

  return {
    user,
    hydrated,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'ADMIN' || user?.role === 'ANALYST',
    isAnalyst: user?.role === 'ANALYST',
    login,
    register,
    logout,
  }
}
