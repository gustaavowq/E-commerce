'use client'

// Polling de 30s no dashboard summary pra detectar pedido novo.
// Quando ordersToday aumenta vs snapshot anterior:
//   - Toca som (silencioso se browser bloquear autoplay — OK, não trava)
//   - Mostra toast no canto inferior
//   - Atualiza badge na sidebar (estado compartilhado em hook auxiliar)
// Polling roda só com aba em foco (visibilitychange), pra não acordar dispositivos
// nem queimar bateria de mobile.

import { useEffect, useRef, useState } from 'react'
import { adminDashboard } from '@/services/admin'

export type PendingCounts = {
  ordersToday:    number
  pendingActions: number  // PENDING_PAYMENT + PREPARING (do summary)
}

type Listener = (n: { newToday: number; payload: PendingCounts }) => void
const listeners = new Set<Listener>()
let lastSnapshot: PendingCounts | null = null

function emit(payload: PendingCounts) {
  const newToday = lastSnapshot ? Math.max(0, payload.ordersToday - lastSnapshot.ordersToday) : 0
  lastSnapshot = payload
  listeners.forEach(l => l({ newToday, payload }))
}

async function pollOnce() {
  try {
    const summary = await adminDashboard.summary(1)
    emit({
      ordersToday:    Number(summary?.ordersToday    ?? 0),
      pendingActions: Number(summary?.pendingActions ?? 0),
    })
  } catch {
    // silent — backend pode estar dormindo, não quebra UI
  }
}

let pollerId: ReturnType<typeof setInterval> | null = null
function startPolling() {
  if (pollerId) return
  pollOnce()  // imediato
  pollerId = setInterval(() => {
    if (typeof document !== 'undefined' && document.visibilityState === 'visible') pollOnce()
  }, 30_000)
}
function stopPolling() {
  if (pollerId) { clearInterval(pollerId); pollerId = null }
}

// Hook principal — usado no layout pra disparar toast + som
export function useNewOrderNotification() {
  const [toast, setToast] = useState<{ count: number; ts: number } | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    if (typeof window === 'undefined') return
    audioRef.current = new Audio('/notification.mp3')
    audioRef.current.volume = 0.5

    function listener({ newToday }: { newToday: number; payload: PendingCounts }) {
      if (newToday > 0) {
        setToast({ count: newToday, ts: Date.now() })
        audioRef.current?.play().catch(() => {})  // browser pode bloquear autoplay — OK
        setTimeout(() => setToast(null), 6000)
      }
    }
    listeners.add(listener)

    function onVisibility() {
      if (document.visibilityState === 'visible') startPolling()
      else stopPolling()
    }
    document.addEventListener('visibilitychange', onVisibility)
    startPolling()

    return () => {
      listeners.delete(listener)
      document.removeEventListener('visibilitychange', onVisibility)
      if (listeners.size === 0) stopPolling()
    }
  }, [])

  return { toast, dismiss: () => setToast(null) }
}

// Hook auxiliar usado pela Sidebar pra mostrar badge — recebe o último snapshot
export function usePendingCounts(): PendingCounts | null {
  const [counts, setCounts] = useState<PendingCounts | null>(lastSnapshot)
  useEffect(() => {
    function listener({ payload }: { newToday: number; payload: PendingCounts }) { setCounts(payload) }
    listeners.add(listener)
    if (lastSnapshot) setCounts(lastSnapshot)
    else startPolling()
    return () => { listeners.delete(listener) }
  }, [])
  return counts
}
