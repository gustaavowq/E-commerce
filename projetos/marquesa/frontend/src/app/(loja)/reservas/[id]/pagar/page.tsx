// Checkout MOCK do sinal de reserva.
// Backend (services/mercadoPago.ts) redireciona pra cá quando MP está sem token —
// permite demo do fluxo completo (Pix / Cartão / Boleto) sem cobrança real.
// Server Component carrega dados da reserva; o componente client renderiza tabs.

import { notFound, redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import type { Metadata } from 'next'
import { MockCheckout } from './MockCheckout'
import type { Reserva } from '@/types/api'

export const metadata: Metadata = {
  title: 'Pagar sinal',
  robots: { index: false, follow: false },
}

interface PageProps {
  params: { id: string }
  searchParams?: { mock?: string }
}

function getApiBase(): string {
  return (
    process.env.INTERNAL_API_URL ||
    process.env.NEXT_PUBLIC_API_URL ||
    'http://localhost:8211'
  ).replace(/\/+$/, '')
}

async function fetchReserva(id: string, cookieHeader: string): Promise<Reserva | null> {
  try {
    const res = await fetch(`${getApiBase()}/api/reservas/${id}`, {
      headers: { Accept: 'application/json', Cookie: cookieHeader },
      cache: 'no-store',
    })
    if (!res.ok) return null
    const json = (await res.json()) as { success: boolean; data: Reserva }
    return json.success ? json.data : null
  } catch {
    return null
  }
}

export default async function PagarPage({ params, searchParams }: PageProps) {
  const cookieStore = cookies()
  if (!cookieStore.get('access_token')?.value) {
    redirect(`/auth/login?redirect=${encodeURIComponent(`/reservas/${params.id}/pagar`)}`)
  }

  const cookieHeader = cookieStore
    .getAll()
    .map((c) => `${c.name}=${c.value}`)
    .join('; ')

  const reserva = await fetchReserva(params.id, cookieHeader)
  if (!reserva) notFound()

  // Se já pago, manda direto pra tela de status.
  if (reserva.pagamentoStatus === 'APROVADO') {
    redirect(`/reservas/${params.id}?status=success`)
  }

  const isMock = searchParams?.mock === '1'

  return (
    <div className="container-marquesa py-12 lg:py-16 max-w-4xl">
      <p className="text-eyebrow uppercase tracking-[0.16em] text-ash mb-3">
        Pagamento do sinal
      </p>
      <h1 className="font-display font-light text-display-md text-ink mb-2">
        {reserva.imovel?.titulo ?? 'Reserva'}
      </h1>
      {reserva.imovel?.bairro && (
        <p className="text-body-sm text-ash mb-10">
          {reserva.imovel.bairro}
          {reserva.imovel.cidade ? ` · ${reserva.imovel.cidade}` : ''}
        </p>
      )}

      <MockCheckout
        reservaId={reserva.id}
        valorSinal={Number(reserva.valorSinal)}
        imovelTitulo={reserva.imovel?.titulo ?? 'Imóvel'}
        isMock={isMock}
      />
    </div>
  )
}
