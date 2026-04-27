'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import {
  User as UserIcon,
  Package,
  Heart,
  MapPin,
  Wrench,
  BellRing,
  LogOut,
  ArrowRight,
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Skeleton } from '@/components/ui/Skeleton'
import { useToast } from '@/components/ui/Toast'
import { useAuth } from '@/stores/auth'
import { useCart } from '@/stores/cart'
import { useWishlist } from '@/stores/wishlist'
import { logout } from '@/services/auth'
import { listMyOrders } from '@/services/orders'
import { listAddresses } from '@/services/addresses'
import { getMyWaitlist } from '@/services/waitlist'
import { listMyBuilds } from '@/services/builder'
import { formatBRL, formatDateBR } from '@/lib/format'

export function AccountClient() {
  const router = useRouter()
  const toast = useToast()
  const qc = useQueryClient()
  const user = useAuth((s) => s.user)
  const hydrated = useAuth((s) => s.hydrated)
  const setUser = useAuth((s) => s.setUser)
  const clearCart = useCart((s) => s.clear)
  const clearWishlist = useWishlist((s) => s.clear)
  // ids da wishlist (Zustand mantido em sync com /wishlist via useWishlistSync)
  const wishlistIds = useWishlist((s) => s.ids)

  useEffect(() => {
    if (hydrated && !user) router.replace(`/auth/login?redirect=${encodeURIComponent('/account')}`)
  }, [hydrated, user, router])

  const ordersQuery = useQuery({
    queryKey: ['orders', 'mine'],
    queryFn: listMyOrders,
    enabled: !!user,
  })
  const addrQuery = useQuery({ queryKey: ['addresses'], queryFn: listAddresses, enabled: !!user })
  const buildsQuery = useQuery({ queryKey: ['builds', 'mine'], queryFn: listMyBuilds, enabled: !!user })
  const waitlistQuery = useQuery({ queryKey: ['waitlist', 'mine'], queryFn: getMyWaitlist, enabled: !!user })

  async function doLogout() {
    try {
      await logout()
    } catch {
      // ignora — vamos limpar cliente de qq jeito
    }
    setUser(null)
    clearCart()
    clearWishlist()
    qc.clear()
    toast.push({ variant: 'info', message: 'Voce saiu da conta.' })
    router.push('/')
  }

  if (!hydrated || !user) {
    return (
      <main className="container-app py-12">
        <Skeleton className="h-32 w-full" />
      </main>
    )
  }

  const recentOrders = (ordersQuery.data?.data ?? []).slice(0, 3)
  const addresses = addrQuery.data ?? []
  const builds = buildsQuery.data ?? []
  const waitlist = waitlistQuery.data ?? []

  return (
    <main className="container-app py-8 sm:py-12">
      <header className="mb-6 flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="font-specs text-xs font-bold uppercase tracking-widest text-primary">Minha conta</p>
          <h1 className="mt-1 font-display text-2xl font-bold text-text sm:text-3xl">Ola, {user.name.split(' ')[0]}</h1>
          <p className="mt-1 text-sm text-text-secondary">{user.email}</p>
        </div>
        <Button variant="ghost" onClick={doLogout}>
          <LogOut className="h-4 w-4" /> Sair
        </Button>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={<Package className="h-5 w-5" />} label="Pedidos" value={String(ordersQuery.data?.data?.length ?? 0)} href="/orders" />
        <StatCard icon={<Wrench className="h-5 w-5" />} label="Builds salvos" value={String(builds.length)} href="/account#builds" />
        <StatCard icon={<Heart className="h-5 w-5" />} label="Favoritos" value={String(wishlistIds.length)} href="/favoritos" />
        <StatCard icon={<BellRing className="h-5 w-5" />} label="Lista de espera" value={String(waitlist.length)} href="/account#waitlist" />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="space-y-6">
          <Section icon={<Package className="h-4 w-4" />} title="Pedidos recentes" href="/orders">
            {ordersQuery.isLoading && <Skeleton className="h-20 w-full" />}
            {!ordersQuery.isLoading && recentOrders.length === 0 && (
              <p className="text-sm text-text-secondary">Voce ainda nao tem pedidos.</p>
            )}
            <ul className="space-y-2">
              {recentOrders.map((o) => (
                <li key={o.id}>
                  <Link
                    href={`/orders/${o.id}`}
                    className="flex items-center justify-between rounded-md border border-border bg-bg/40 p-3 transition hover:border-primary/40"
                  >
                    <div className="text-sm">
                      <p className="font-specs font-semibold text-text">#{o.orderNumber}</p>
                      <p className="text-xs text-text-secondary">
                        {formatDateBR(o.createdAt)} · {o.itemPreview.slice(0, 1).join(', ')}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-specs text-sm font-bold text-text">{formatBRL(o.total)}</p>
                      <span className="text-xs text-primary">Detalhes</span>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </Section>

          <Section id="builds" icon={<Wrench className="h-4 w-4" />} title="Builds salvos">
            {buildsQuery.isLoading && <Skeleton className="h-20 w-full" />}
            {!buildsQuery.isLoading && builds.length === 0 && (
              <div className="rounded-md border border-dashed border-border bg-bg/40 p-4 text-sm text-text-secondary">
                Nenhum build salvo ainda. <Link href="/montar" className="text-primary hover:underline">Abrir o builder</Link>.
              </div>
            )}
            <ul className="space-y-2">
              {builds.map((b) => (
                <li key={b.id} className="flex items-center justify-between rounded-md border border-border bg-bg/40 p-3 text-sm">
                  <div>
                    <p className="font-semibold text-text">{b.name ?? 'Build sem nome'}</p>
                    <p className="text-xs text-text-secondary">
                      Salvo em {formatDateBR(b.createdAt)} · {Object.keys(b.parts ?? {}).length} pecas
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-specs text-sm font-bold text-text">{formatBRL(b.totalPrice)}</p>
                    {b.shareSlug && (
                      <Link href={`/builds/saved/${b.shareSlug}`} className="text-xs text-primary hover:underline">
                        Compartilhar
                      </Link>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </Section>

          <Section id="waitlist" icon={<BellRing className="h-4 w-4" />} title="Lista de espera">
            {waitlistQuery.isLoading && <Skeleton className="h-20 w-full" />}
            {!waitlistQuery.isLoading && waitlist.length === 0 && (
              <p className="text-sm text-text-secondary">
                Voce nao esta inscrito em nenhuma lista. Quando ativar em produto sem estoque, aparece aqui.
              </p>
            )}
            <ul className="space-y-2">
              {waitlist.map((w) => (
                <li key={w.id} className="flex items-center justify-between rounded-md border border-border bg-bg/40 p-3 text-sm">
                  <div>
                    <p className="font-medium text-text">Produto: {w.productId.slice(0, 8)}</p>
                    <p className="text-xs text-text-secondary">
                      Inscrito em {formatDateBR(w.createdAt)}
                      {w.notifiedAt ? ` · Notificado em ${formatDateBR(w.notifiedAt)}` : ''}
                    </p>
                  </div>
                  <span
                    className={`rounded-pill border px-2 py-0.5 text-[11px] ${w.notifiedAt ? 'border-success/40 text-success' : 'border-warning/40 text-warning'}`}
                  >
                    {w.notifiedAt ? 'Disponivel' : 'Aguardando'}
                  </span>
                </li>
              ))}
            </ul>
          </Section>
        </div>

        <aside className="space-y-4">
          <Section icon={<UserIcon className="h-4 w-4" />} title="Dados pessoais">
            <ul className="space-y-1 text-sm">
              <li className="flex justify-between">
                <span className="text-text-secondary">Nome</span>
                <span className="text-text">{user.name}</span>
              </li>
              <li className="flex justify-between">
                <span className="text-text-secondary">Email</span>
                <span className="text-text">{user.email}</span>
              </li>
              {user.phone && (
                <li className="flex justify-between">
                  <span className="text-text-secondary">Telefone</span>
                  <span className="text-text">{user.phone}</span>
                </li>
              )}
            </ul>
          </Section>

          <Section icon={<MapPin className="h-4 w-4" />} title="Enderecos">
            {addrQuery.isLoading && <Skeleton className="h-16 w-full" />}
            {!addrQuery.isLoading && addresses.length === 0 && (
              <p className="text-sm text-text-secondary">Sem endereco cadastrado.</p>
            )}
            <ul className="space-y-2 text-sm">
              {addresses.slice(0, 3).map((a) => (
                <li key={a.id} className="rounded-md border border-border bg-bg/40 p-3">
                  <p className="font-medium text-text">
                    {a.recipient}
                    {a.isDefault && (
                      <span className="ml-2 rounded-pill bg-primary-soft px-2 py-0.5 text-[10px] text-primary">Padrao</span>
                    )}
                  </p>
                  <p className="text-xs text-text-secondary">
                    {a.street}, {a.number} · {a.city}/{a.state}
                  </p>
                </li>
              ))}
            </ul>
            <p className="mt-2 text-xs text-text-muted">Pra adicionar/editar, va pro checkout.</p>
          </Section>
        </aside>
      </div>
    </main>
  )
}

function StatCard({ icon, label, value, href }: { icon: React.ReactNode; label: string; value: string; href: string }) {
  return (
    <Link
      href={href}
      className="group flex items-center gap-3 rounded-lg border border-border bg-surface p-4 transition-all hover:-translate-y-0.5 hover:border-primary/40"
    >
      <span className="flex h-10 w-10 items-center justify-center rounded-md bg-primary-soft text-primary">{icon}</span>
      <div className="flex-1">
        <p className="text-xs uppercase tracking-wide text-text-secondary">{label}</p>
        <p className="font-specs text-xl font-bold text-text">{value}</p>
      </div>
      <ArrowRight className="h-4 w-4 text-text-muted transition-transform group-hover:translate-x-1 group-hover:text-primary" />
    </Link>
  )
}

function Section({
  icon,
  title,
  children,
  href,
  id,
}: {
  icon: React.ReactNode
  title: string
  children: React.ReactNode
  href?: string
  id?: string
}) {
  return (
    <section id={id} className="rounded-lg border border-border bg-surface p-5">
      <header className="mb-3 flex items-center justify-between">
        <h2 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-text">
          {icon} {title}
        </h2>
        {href && (
          <Link href={href} className="text-xs font-semibold text-primary hover:underline">
            Ver tudo
          </Link>
        )}
      </header>
      {children}
    </section>
  )
}
