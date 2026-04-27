'use client'

// Layout autenticado. Guard client-side: se não tem user (após hidratar) → /login.
// Não-admin → /login?error=forbidden.
//
// Animação fade-in por pathname (key={pathname}) pra cada navegação ter feedback.

import { useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { Sidebar } from '@/components/Sidebar'
import { MobileTopBar } from '@/components/MobileTopBar'
import { NewOrderToast } from '@/components/NewOrderToast'
import { useAuth } from '@/stores/auth'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router   = useRouter()
  const pathname = usePathname()
  const user     = useAuth(s => s.user)
  const hydrated = useAuth(s => s.hydrated)

  useEffect(() => {
    if (!hydrated) return
    if (!user) {
      router.replace(`/login?next=${encodeURIComponent(pathname)}`)
      return
    }
    if (user.role !== 'ADMIN') {
      router.replace('/login?error=forbidden')
    }
  }, [hydrated, user, router, pathname])

  if (!hydrated || !user || user.role !== 'ADMIN') {
    return (
      <div className="flex h-screen items-center justify-center bg-bg text-sm text-text-secondary">
        Verificando acesso…
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col bg-bg lg:flex-row">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <MobileTopBar />
        <main key={pathname} className="flex-1 p-4 sm:p-6 lg:p-8 overflow-x-hidden animate-fade-in">
          {children}
        </main>
      </div>
      <NewOrderToast />
    </div>
  )
}
