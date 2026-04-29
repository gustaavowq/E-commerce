import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getStoreSettings } from '@/services/settings'
import type { StoreSettings } from '@/services/types'

type Props = { params: { slug: string } }

const POLICY_MAP: Record<string, { title: string; field: keyof StoreSettings; fallback: string }> = {
  privacy: {
    title: 'Política de Privacidade',
    field: 'privacyPolicy',
    fallback: `# Política de Privacidade

A Miami Store respeita sua privacidade. Coletamos apenas os dados estritamente necessários pra processar pedidos: nome, email, CPF, telefone, endereço de entrega e histórico de compras.

## Como usamos seus dados
- Processar pedidos e enviar produtos
- Confirmar pagamento e gerar nota fiscal
- Atualizar você sobre status de entrega
- Melhorar a experiência da loja

## Com quem compartilhamos
- **Transportadora**: nome + endereço, só pro envio
- **MercadoPago**: dados de pagamento (criptografados)
- **Receita Federal**: nota fiscal eletrônica

Seus dados NUNCA são vendidos. Você pode pedir exclusão a qualquer momento pelo WhatsApp.`,
  },
  terms: {
    title: 'Termos de Uso',
    field: 'termsOfUse',
    fallback: `# Termos de Uso

Ao usar a Miami Store, você concorda com estes termos.

## Produtos
- Todos os produtos são originais, com nota fiscal e caixa da marca
- Estoque sujeito a alteração sem aviso prévio
- Imagens podem variar levemente do produto físico (iluminação)

## Pagamento
- Pix com 5% de desconto, processamento imediato
- Cartão de crédito até 4x sem juros (em breve)
- Boleto à vista (em breve)

## Entrega
- Frete fixo de R$ 15 pra todo Brasil
- Prazo de 3 a 7 dias úteis dependendo da região
- Código de rastreio enviado por email`,
  },
  exchange: {
    title: 'Trocas e Devoluções',
    field: 'exchangePolicy',
    fallback: `# Trocas e Devoluções

Você tem **7 dias corridos** após o recebimento pra solicitar troca ou devolução, conforme o Código de Defesa do Consumidor.

## Como solicitar
1. Chama no WhatsApp e fala o número do pedido
2. A gente te orienta como devolver
3. Frete de devolução por conta da Miami Store
4. Reembolso ou novo produto em até 7 dias úteis após recebermos a peça

## Condições
- Produto sem uso, com etiquetas e embalagem original
- Não aceitamos troca de itens íntimos por motivo de higiene`,
  },
  shipping: {
    title: 'Política de Envio',
    field: 'shippingPolicy',
    fallback: `# Política de Envio

## Prazo
- Capital de SP: 2 a 4 dias úteis
- Outras capitais: 4 a 7 dias úteis
- Interior: 5 a 10 dias úteis

## Custo
- Frete fixo de R$ 15 pra qualquer canto do Brasil
- Pedidos acima de R$ 500: **frete grátis** (em breve)

## Acompanhamento
Quando o pedido sai pra entrega, você recebe email com código de rastreio dos Correios. Pode acompanhar em https://www2.correios.com.br/sistemas/rastreamento/`,
  },
  about: {
    title: 'Sobre a Miami Store',
    field: 'aboutUs',
    fallback: `# Sobre a Miami Store

A Miami Store nasceu da ideia simples: roupa de marca original não precisa ser cara.

A gente compra direto de distribuidores autorizados, sem intermediário, e repassa esse desconto pra você.

Tudo que vendemos vem com:
- Caixa original da marca
- Etiqueta de autenticidade
- Nota fiscal eletrônica

Mais de 5 mil clientes satisfeitos. Acompanha a gente no Instagram @miamii_storee.`,
  },
}

export const dynamic = 'force-dynamic'

export async function generateMetadata({ params }: Props) {
  const meta = POLICY_MAP[params.slug]
  return { title: meta?.title ?? 'Política' }
}

export default async function PolicyPage({ params }: Props) {
  const meta = POLICY_MAP[params.slug]
  if (!meta) notFound()

  let content = meta.fallback
  try {
    const settings = await getStoreSettings()
    const fromDb = settings[meta.field]
    if (typeof fromDb === 'string' && fromDb.trim()) content = fromDb
  } catch {}

  return (
    <div className="container-app py-8 sm:py-12 max-w-3xl">
      <nav className="mb-3 text-xs text-ink-3">
        <Link href="/" className="hover:text-primary-700">Home</Link>
        <span className="mx-1.5">›</span>
        <span>{meta.title}</span>
      </nav>

      <article className="prose prose-sm sm:prose-base max-w-none animate-fade-up">
        <MarkdownLite source={content} />
      </article>
    </div>
  )
}

// Renderer minimalista de markdown (h1..h3, p, ul, strong, link).
// Sem dependência externa pra manter bundle leve.
function MarkdownLite({ source }: { source: string }) {
  const lines = source.split('\n')
  const blocks: React.ReactNode[] = []
  let listBuffer: string[] = []

  function flushList(key: number) {
    if (listBuffer.length) {
      blocks.push(
        <ul key={`l${key}`} className="list-disc pl-6 my-3 space-y-1 text-ink-2">
          {listBuffer.map((it, i) => <li key={i} dangerouslySetInnerHTML={{ __html: inline(it.replace(/^[-*]\s+/, '')) }} />)}
        </ul>
      )
      listBuffer = []
    }
  }

  lines.forEach((raw, i) => {
    const line = raw.trim()
    if (!line) { flushList(i); return }

    if (line.startsWith('# ')) {
      flushList(i)
      blocks.push(<h1 key={i} className="font-display text-3xl text-ink mt-2 mb-4">{line.slice(2)}</h1>)
    } else if (line.startsWith('## ')) {
      flushList(i)
      blocks.push(<h2 key={i} className="font-display text-xl text-ink mt-6 mb-2">{line.slice(3)}</h2>)
    } else if (line.startsWith('### ')) {
      flushList(i)
      blocks.push(<h3 key={i} className="font-semibold text-base text-ink mt-4 mb-1">{line.slice(4)}</h3>)
    } else if (/^[-*]\s+/.test(line)) {
      listBuffer.push(line)
    } else {
      flushList(i)
      blocks.push(<p key={i} className="my-2 text-ink-2 leading-relaxed" dangerouslySetInnerHTML={{ __html: inline(line) }} />)
    }
  })
  flushList(-1)

  return <>{blocks}</>
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function inline(s: string): string {
  return escapeHtml(s)
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-primary-700 underline" target="_blank" rel="noopener">$1</a>')
}
