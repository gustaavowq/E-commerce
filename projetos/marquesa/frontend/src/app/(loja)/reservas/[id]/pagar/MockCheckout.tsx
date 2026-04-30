'use client'

// Checkout MOCK client. Tabs Pix / Cartão / Boleto.
// Aceita qualquer entrada (não valida número de cartão real). Ao confirmar,
// chama POST /api/reservas/:id/mock-aprovar e redireciona pra tela de sucesso.
// Endpoint mock-aprovar é bloqueado no backend se houver token MP real.

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { post } from '@/lib/api'
import { ApiError } from '@/lib/api'
import { formatBRLDetailed } from '@/lib/format'
import { microcopy } from '@/lib/microcopy'

type Aba = 'pix' | 'cartao' | 'boleto'

const inputClass =
  'w-full bg-paper border border-bone px-4 py-3 text-body text-ink placeholder:text-ash-soft focus:outline-none focus:border-moss focus:ring-2 focus:ring-moss/20 transition-colors duration-fast'

interface MockCheckoutProps {
  reservaId: string
  valorSinal: number
  imovelTitulo: string
  isMock: boolean
}

const PIX_FAKE_CODE =
  '00020126890014br.gov.bcb.pix0136marquesa-demo@example.com520400005303986540510.005802BR5915MARQUESA DEMO6009SAO PAULO62070503***6304ABCD'

const BOLETO_LINHA_FAKE =
  '03399.85420 32108.000003 13340.999999 1 99990000010000'

export function MockCheckout({
  reservaId,
  valorSinal,
  imovelTitulo,
  isMock,
}: MockCheckoutProps) {
  const router = useRouter()
  const [aba, setAba] = useState<Aba>('pix')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [pixCopied, setPixCopied] = useState(false)
  const [boletoCopied, setBoletoCopied] = useState(false)

  // Cartão (mock — qualquer entrada é aceita)
  const [numero, setNumero] = useState('')
  const [nome, setNome] = useState('')
  const [validade, setValidade] = useState('')
  const [cvc, setCvc] = useState('')
  const [parcelas, setParcelas] = useState('1')

  async function aprovar() {
    setError(null)
    setLoading(true)
    try {
      await post(`/api/reservas/${reservaId}/mock-aprovar`, {}, { withAuth: true })
      router.push(`/reservas/${reservaId}?status=success`)
    } catch (err) {
      const msg =
        err instanceof ApiError ? err.message : microcopy.erros.rede
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  async function copiar(texto: string, alvo: 'pix' | 'boleto') {
    try {
      await navigator.clipboard.writeText(texto)
      if (alvo === 'pix') {
        setPixCopied(true)
        setTimeout(() => setPixCopied(false), 2000)
      } else {
        setBoletoCopied(true)
        setTimeout(() => setBoletoCopied(false), 2000)
      }
    } catch {
      /* clipboard pode estar indisponível em alguns contextos */
    }
  }

  function pagarCartao(e: React.FormEvent) {
    e.preventDefault()
    if (!numero.trim() || !nome.trim() || !validade.trim() || !cvc.trim()) {
      setError('Preencha todos os campos do cartão.')
      return
    }
    aprovar()
  }

  return (
    <div className="border border-bone bg-paper">
      {/* Aviso de modo demo */}
      {isMock && (
        <div className="border-b border-bone bg-paper-warm px-6 py-4">
          <p className="text-eyebrow uppercase tracking-[0.16em] text-ash mb-1">
            Modo demonstração
          </p>
          <p className="text-body-sm text-ink leading-relaxed">
            Este checkout simula as formas de pagamento. Nenhum valor real é cobrado e
            qualquer entrada é aceita. Use para conhecer o fluxo da reserva.
          </p>
        </div>
      )}

      {/* Resumo */}
      <div className="px-6 py-5 border-b border-bone flex items-baseline justify-between gap-6">
        <div>
          <p className="text-eyebrow uppercase tracking-[0.16em] text-ash mb-1">
            Sinal de reserva
          </p>
          <p className="text-body-sm text-ash">
            {imovelTitulo}
          </p>
        </div>
        <p className="font-display text-display-sm text-ink tnum">
          {formatBRLDetailed(valorSinal)}
        </p>
      </div>

      {/* Tabs */}
      <div role="tablist" className="flex border-b border-bone">
        <TabBtn ativa={aba === 'pix'} onClick={() => setAba('pix')}>
          Pix
        </TabBtn>
        <TabBtn ativa={aba === 'cartao'} onClick={() => setAba('cartao')}>
          Cartão de crédito
        </TabBtn>
        <TabBtn ativa={aba === 'boleto'} onClick={() => setAba('boleto')}>
          Boleto
        </TabBtn>
      </div>

      {/* Conteúdo */}
      <div className="px-6 py-8">
        {aba === 'pix' && (
          <div className="flex flex-col gap-6">
            <div>
              <p className="text-body text-ink mb-2">
                Pagamento instantâneo, com confirmação imediata.
              </p>
              <p className="text-body-sm text-ash">
                Aponte a câmera do app do seu banco para o QR ou copie o código abaixo.
              </p>
            </div>

            {/* QR placeholder em SVG */}
            <div className="flex justify-center py-4">
              <PixQrPlaceholder />
            </div>

            <div className="border border-bone p-4 flex flex-col gap-3">
              <p className="text-eyebrow uppercase tracking-[0.16em] text-ash">
                Pix copia e cola
              </p>
              <code className="block break-all text-caption text-ink bg-paper-warm px-3 py-3 leading-relaxed">
                {PIX_FAKE_CODE}
              </code>
              <button
                type="button"
                onClick={() => copiar(PIX_FAKE_CODE, 'pix')}
                className="self-start text-body-sm text-ash hover:text-ink underline underline-offset-4 transition-colors duration-fast"
              >
                {pixCopied ? 'Código copiado.' : 'Copiar código'}
              </button>
            </div>

            <button
              type="button"
              onClick={aprovar}
              disabled={loading}
              className="self-stretch sm:self-start inline-flex items-center justify-center px-8 py-4 bg-moss text-paper text-body-sm uppercase tracking-[0.04em] hover:bg-moss-deep disabled:opacity-50 transition-colors duration-fast"
            >
              {loading ? 'Confirmando…' : 'Já paguei o Pix'}
            </button>
          </div>
        )}

        {aba === 'cartao' && (
          <form onSubmit={pagarCartao} className="flex flex-col gap-5 max-w-xl">
            <Field label="Número do cartão">
              <input
                type="text"
                inputMode="numeric"
                autoComplete="cc-number"
                value={numero}
                onChange={(e) => setNumero(e.target.value)}
                placeholder="0000 0000 0000 0000"
                className={inputClass}
              />
            </Field>
            <Field label="Nome impresso no cartão">
              <input
                type="text"
                autoComplete="cc-name"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                placeholder="Como aparece no cartão"
                className={inputClass}
              />
            </Field>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Validade">
                <input
                  type="text"
                  inputMode="numeric"
                  autoComplete="cc-exp"
                  value={validade}
                  onChange={(e) => setValidade(e.target.value)}
                  placeholder="MM/AA"
                  className={inputClass}
                />
              </Field>
              <Field label="CVC">
                <input
                  type="text"
                  inputMode="numeric"
                  autoComplete="cc-csc"
                  value={cvc}
                  onChange={(e) => setCvc(e.target.value)}
                  placeholder="000"
                  className={inputClass}
                />
              </Field>
            </div>
            <Field label="Parcelas">
              <select
                value={parcelas}
                onChange={(e) => setParcelas(e.target.value)}
                className={inputClass}
              >
                <option value="1">1x de {formatBRLDetailed(valorSinal)} sem juros</option>
                <option value="2">2x de {formatBRLDetailed(valorSinal / 2)} sem juros</option>
                <option value="3">3x de {formatBRLDetailed(valorSinal / 3)} sem juros</option>
              </select>
            </Field>

            <button
              type="submit"
              disabled={loading}
              className="self-stretch sm:self-start inline-flex items-center justify-center px-8 py-4 bg-moss text-paper text-body-sm uppercase tracking-[0.04em] hover:bg-moss-deep disabled:opacity-50 transition-colors duration-fast"
            >
              {loading ? 'Processando…' : `Pagar ${formatBRLDetailed(valorSinal)}`}
            </button>
          </form>
        )}

        {aba === 'boleto' && (
          <div className="flex flex-col gap-6 max-w-2xl">
            <div>
              <p className="text-body text-ink mb-2">
                Boleto bancário com vencimento em 3 dias úteis.
              </p>
              <p className="text-body-sm text-ash">
                Compensação em até 2 dias úteis após o pagamento.
              </p>
            </div>

            <div className="border border-bone p-4 flex flex-col gap-3">
              <p className="text-eyebrow uppercase tracking-[0.16em] text-ash">
                Linha digitável
              </p>
              <code className="block break-all text-body-sm text-ink bg-paper-warm px-3 py-3 leading-relaxed tnum">
                {BOLETO_LINHA_FAKE}
              </code>
              <button
                type="button"
                onClick={() => copiar(BOLETO_LINHA_FAKE, 'boleto')}
                className="self-start text-body-sm text-ash hover:text-ink underline underline-offset-4 transition-colors duration-fast"
              >
                {boletoCopied ? 'Linha copiada.' : 'Copiar linha digitável'}
              </button>
            </div>

            <button
              type="button"
              onClick={aprovar}
              disabled={loading}
              className="self-stretch sm:self-start inline-flex items-center justify-center px-8 py-4 bg-moss text-paper text-body-sm uppercase tracking-[0.04em] hover:bg-moss-deep disabled:opacity-50 transition-colors duration-fast"
            >
              {loading ? 'Confirmando…' : 'Já paguei o boleto'}
            </button>
          </div>
        )}

        {error && (
          <p className="mt-6 text-caption text-red-700 bg-red-50 border border-red-100 px-3 py-2">
            {error}
          </p>
        )}
      </div>
    </div>
  )
}

function TabBtn({
  ativa,
  onClick,
  children,
}: {
  ativa: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={ativa}
      onClick={onClick}
      className={`flex-1 px-4 py-4 text-body-sm uppercase tracking-[0.04em] transition-colors duration-fast ${
        ativa
          ? 'bg-paper text-ink border-b-2 border-ink -mb-px'
          : 'bg-paper-warm text-ash hover:text-ink'
      }`}
    >
      {children}
    </button>
  )
}

function Field({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <label className="flex flex-col gap-2">
      <span className="text-eyebrow uppercase tracking-[0.16em] text-ash">{label}</span>
      {children}
    </label>
  )
}

function PixQrPlaceholder() {
  // SVG sintético — bloco 21x21 com padrão pseudo-aleatório determinístico.
  // Não é QR válido, é só visual de demo.
  const size = 21
  const cells: boolean[] = []
  let seed = 1234567
  for (let i = 0; i < size * size; i++) {
    seed = (seed * 9301 + 49297) % 233280
    cells.push(seed / 233280 > 0.5)
  }
  // Bordas tipo finder pattern
  function isFinder(x: number, y: number): boolean | null {
    const inTL = x < 7 && y < 7
    const inTR = x >= size - 7 && y < 7
    const inBL = x < 7 && y >= size - 7
    if (!inTL && !inTR && !inBL) return null
    const lx = inTR ? x - (size - 7) : x
    const ly = inBL ? y - (size - 7) : y
    const onBorder = lx === 0 || lx === 6 || ly === 0 || ly === 6
    const onInner = lx >= 2 && lx <= 4 && ly >= 2 && ly <= 4
    return onBorder || onInner
  }
  return (
    <svg viewBox={`0 0 ${size} ${size}`} className="w-48 h-48 bg-paper border border-bone">
      {Array.from({ length: size * size }).map((_, i) => {
        const x = i % size
        const y = Math.floor(i / size)
        const finder = isFinder(x, y)
        const fill = finder !== null ? finder : cells[i]
        return fill ? (
          <rect key={i} x={x} y={y} width="1" height="1" fill="#0A0A0A" />
        ) : null
      })}
    </svg>
  )
}
