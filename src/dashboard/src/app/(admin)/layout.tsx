'use client'

import { useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { ShoppingBag, X } from 'lucide-react'
import { Sidebar } from '@/components/Sidebar'
import { MobileTopBar } from '@/components/MobileTopBar'
import { useAuth } from '@/stores/auth'
import { useNewOrderNotification } from '@/hooks/useNewOrderNotification'

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
      <div className="flex h-screen items-center justify-center bg-surface-alt text-sm text-ink-3">
        Verificando acesso…
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col lg:flex-row">
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

function NewOrderToast() {
  const { toast, dismiss } = useNewOrderNotification()
  if (!toast) return null
  return (
    <div
      role="status"
      className="fixed bottom-4 right-4 z-[300] flex max-w-sm items-start gap-3 rounded-lg border border-success/30 bg-white p-4 shadow-2xl animate-slide-up"
    >
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-pill bg-success/10 text-success">
        <ShoppingBag className="h-5 w-5" />
      </div>
      <div className="flex-1">
        <p className="text-sm font-bold text-ink">
          {toast.count === 1 ? '1 pedido novo!' : `${toast.count} pedidos novos!`}
        </p>
        <p className="mt-0.5 text-xs text-ink-3">Vai em Pedidos pra ver e processar.</p>
      </div>
      <button onClick={dismiss} aria-label="Fechar" className="text-ink-3 hover:text-ink">
        <X className="h-4 w-4" />
      </button>
    </div>
  )
}
