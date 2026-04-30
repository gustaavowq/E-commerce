'use client'

import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'

// Garante que apenas ADMIN/ANALYST acessam /painel.
// Middleware Next só checa cookie; aqui validamos role real.
export function RoleGate({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const { user, hydrated } = useAuth()

  useEffect(() => {
    if (!hydrated) return
    if (!user) {
      router.replace('/auth/login?redirect=/painel')
      return
    }
    if (user.role === 'USER') {
      router.replace('/')
    }
  }, [user, hydrated, router])

  if (!hydrated) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[60vh]">
        <p className="text-body-sm text-ash">Carregando…</p>
      </div>
    )
  }

  if (!user || user.role === 'USER') {
    return null
  }

  return <>{children}</>
}
