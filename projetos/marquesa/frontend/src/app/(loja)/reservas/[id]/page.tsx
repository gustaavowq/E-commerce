// Página de retorno após pagamento (MercadoPago redirect_urls).
// MP redireciona para /reservas/{id}?status=approved|pending|failure após o checkout.
// Esta página é Server Component: lê o cookie httpOnly `access_token`, busca o detalhe
// da reserva via `GET /api/reservas/:id` (backend valida owner ou staff) e mostra
// o status atual + próximos passos pro cliente.

import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import type { Metadata } from 'next'
import { formatBRLDetailed, formatDate } from '@/lib/format'
import type { Reserva } from '@/types/api'

export const metadata: Metadata = {
  title: 'Sua reserva',
  robots: { index: false, follow: false },
}

interface PageProps {
  params: { id: string }
  searchParams?: { status?: string; collection_status?: string }
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
      headers: {
        Accept: 'application/json',
        Cookie: cookieHeader,
      },
      cache: 'no-store',
    })
    if (!res.ok) return null
    const json = (await res.json()) as { success: boolean; data: Reserva }
    if (!json.success) return null
    return json.data
  } catch {
    return null
  }
}

const WHATSAPP =
  process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '5511900000000'

const statusCopy: Record<
  string,
  { label: string; tone: 'success' | 'pending' | 'error' | 'neutral'; descricao: string }
> = {
  APROVADO: {
    label: 'Sinal pago — imóvel reservado por você',
    tone: 'success',
    descricao:
      'Em até 10 dias corridos nosso corretor entra em contato pra dar continuidade na negociação.',
  },
  PENDENTE: {
    label: 'Aguardando confirmação do pagamento',
    tone: 'pending',
    descricao:
      'O pagamento está em processamento. Assim que confirmarmos, sua reserva passa a ATIVA. Pode levar alguns minutos.',
  },
  REJEITADO: {
    label: 'Pagamento recusado',
    tone: 'error',
    descricao:
      'O pagamento não foi aprovado. Você pode tentar novamente pela página do imóvel ou falar com o corretor.',
  },
  CANCELADO: {
    label: 'Reserva cancelada',
    tone: 'neutral',
    descricao: 'Esta reserva foi cancelada. Para reservar novamente, volte para a página do imóvel.',
  },
  REEMBOLSADO: {
    label: 'Pagamento reembolsado',
    tone: 'neutral',
    descricao: 'O valor do sinal foi reembolsado. Em caso de dúvida, fale com nosso corretor.',
  },
}

export default async function ReservaPage({ params, searchParams }: PageProps) {
  const cookieStore = cookies()
  // Sem access_token → manda pro login com redirect de volta pra cá.
  if (!cookieStore.get('access_token')?.value) {
    redirect(`/auth/login?redirect=${encodeURIComponent(`/reservas/${params.id}`)}`)
  }

  // Forward TODOS os cookies (refresh_token + access_token) pra rede interna.
  const cookieHeader = cookieStore
    .getAll()
    .map((c) => `${c.name}=${c.value}`)
    .join('; ')

  const reserva = await fetchReserva(params.id, cookieHeader)
  if (!reserva) notFound()

  const copy =
    statusCopy[reserva.pagamentoStatus] ?? {
      label: reserva.pagamentoStatus,
      tone: 'neutral' as const,
      descricao: '',
    }

  // Hint do MP se vier no query (?status=approved|pending|failure) — só pra fallback
  // visual antes do webhook bater. Source-of-truth segue sendo o pagamentoStatus do DB.
  const mpHint = searchParams?.status || searchParams?.collection_status

  const toneClass =
    copy.tone === 'success'
      ? 'text-moss'
      : copy.tone === 'error'
        ? 'text-red-600'
        : 'text-ash'

  return (
    <div className="container-marquesa py-16 lg:py-24 max-w-3xl">
      <p className="text-eyebrow uppercase tracking-[0.16em] text-ash mb-3">Sua reserva</p>
      <h1 className="font-display font-light text-display-lg text-ink mb-6">
        {reserva.imovel?.titulo ?? 'Reserva'}
      </h1>
      <p className={`text-body-lg mb-12 ${toneClass}`}>{copy.label}</p>

      <div className="border border-bone bg-paper p-8 lg:p-10 flex flex-col gap-8">
        <div>
          <p className="text-eyebrow uppercase tracking-[0.16em] text-ash mb-2">Imóvel</p>
          <p className="font-display text-heading-lg text-ink">
            {reserva.imovel?.titulo ?? '—'}
          </p>
          {reserva.imovel?.bairro && (
            <p className="text-body-sm text-ash mt-1">
              {reserva.imovel.bairro}
              {reserva.imovel.cidade ? ` · ${reserva.imovel.cidade}` : ''}
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 border-t border-bone pt-8">
          <div>
            <p className="text-eyebrow uppercase tracking-[0.16em] text-ash mb-2">Sinal</p>
            <p className="font-display text-display-sm text-ink tnum">
              {formatBRLDetailed(reserva.valorSinal)}
            </p>
          </div>
          <div>
            <p className="text-eyebrow uppercase tracking-[0.16em] text-ash mb-2">Reserva expira em</p>
            <p className="font-display text-display-sm text-ink tnum">
              {formatDate(reserva.expiraEm)}
            </p>
          </div>
        </div>
      </div>

      {copy.descricao && (
        <p className="text-body text-ink leading-relaxed mt-10 max-w-2xl">{copy.descricao}</p>
      )}

      {mpHint && reserva.pagamentoStatus === 'PENDENTE' && (
        <p className="text-caption text-ash mt-4">
          Status do MercadoPago: {mpHint}. Atualizamos sua reserva assim que confirmarmos.
        </p>
      )}

      <div className="mt-12 flex flex-wrap items-center gap-4">
        {reserva.imovel?.slug && (
          <Link
            href={`/imoveis/${reserva.imovel.slug}`}
            className="inline-flex items-center justify-center px-6 py-3 border border-ink text-ink hover:bg-ink hover:text-paper transition-colors duration-fast text-body-sm uppercase tracking-[0.12em]"
          >
            Ver imóvel
          </Link>
        )}
        <Link
          href="/imoveis"
          className="inline-flex items-center justify-center px-6 py-3 border border-bone text-ash hover:text-ink hover:border-ink transition-colors duration-fast text-body-sm uppercase tracking-[0.12em]"
        >
          Ver outros imóveis
        </Link>
        <a
          href={`https://wa.me/${WHATSAPP}?text=${encodeURIComponent(
            `Olá, é sobre minha reserva ${reserva.id.slice(0, 8)}.`,
          )}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-body-sm text-ash hover:text-ink hover:underline underline-offset-4"
        >
          Falar no WhatsApp
        </a>
      </div>
    </div>
  )
}
