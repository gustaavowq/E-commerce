import Link from 'next/link'
import { Instagram, MessageCircle, Youtube } from 'lucide-react'
import { PaymentBadges } from './PaymentBadges'
import { Logo } from './Logo'

export function Footer() {
  const wpp = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? '5511999999999'

  return (
    <footer className="mt-12 border-t border-border bg-surface">
      <div className="container-app py-10 sm:py-14">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <Logo />
            <p className="mt-3 text-sm text-text-secondary">
              Hardware com checagem de compatibilidade. Builds por uso. Lista de espera anti-paper-launch. Tudo com nota fiscal.
            </p>
            <div className="mt-4 flex items-center gap-2">
              <a
                href="https://www.instagram.com/koretech"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="flex h-10 w-10 items-center justify-center rounded-md bg-surface-2 text-text transition hover:bg-surface-3 hover:text-primary"
              >
                <Instagram className="h-5 w-5" />
              </a>
              <a
                href="https://www.youtube.com/@koretech"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="YouTube"
                className="flex h-10 w-10 items-center justify-center rounded-md bg-surface-2 text-text transition hover:bg-surface-3 hover:text-primary"
              >
                <Youtube className="h-5 w-5" />
              </a>
              <a
                href={`https://wa.me/${wpp}`}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="WhatsApp"
                className="flex h-10 w-10 items-center justify-center rounded-md bg-whatsapp text-white transition hover:opacity-90"
              >
                <MessageCircle className="h-5 w-5" />
              </a>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wide text-text">Loja</h3>
            <ul className="mt-3 space-y-2 text-sm text-text-secondary">
              <li><Link href="/" className="hover:text-primary">Inicio</Link></li>
              <li><Link href="/produtos" className="hover:text-primary">Todos os produtos</Link></li>
              <li><Link href="/montar" className="hover:text-primary">Builder de PC</Link></li>
              <li><Link href="/builds/valorant-240fps" className="hover:text-primary">Build Valorant</Link></li>
              <li><Link href="/builds/edicao-4k" className="hover:text-primary">Build edicao 4K</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wide text-text">Ajuda</h3>
            <ul className="mt-3 space-y-2 text-sm text-text-secondary">
              <li><a href={`https://wa.me/${wpp}`} target="_blank" rel="noopener noreferrer" className="hover:text-primary">WhatsApp</a></li>
              <li><Link href="/account" className="hover:text-primary">Meus pedidos</Link></li>
              <li><Link href="/policies/garantia" className="hover:text-primary">Garantia e DOA</Link></li>
              <li><Link href="/policies/troca" className="hover:text-primary">Trocas e devolucoes</Link></li>
              <li><Link href="/policies/envio" className="hover:text-primary">Politica de envio</Link></li>
              <li><Link href="/policies/privacidade" className="hover:text-primary">Privacidade</Link></li>
              <li><Link href="/policies/termos" className="hover:text-primary">Termos</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wide text-text">Pagamento</h3>
            <p className="mt-3 text-xs text-text-secondary">Aceitamos:</p>
            <div className="mt-2">
              <PaymentBadges />
            </div>
            <p className="mt-4 text-xs text-text-secondary">
              <span className="text-primary font-semibold">Pix com 5% off</span> e parcelamento em ate 12x sem juros.
            </p>
            <p className="mt-3 text-xs text-text-muted">Site seguro. Dados criptografados.</p>
          </div>
        </div>

        <div className="mt-8 border-t border-border pt-6 text-xs text-text-muted">
          <p>
            <strong className="text-text-secondary">Kore Tech</strong> · CNPJ 00.000.000/0001-00 · Sao Paulo/SP
          </p>
          <p className="mt-1">
            Marcas mencionadas (Nvidia, AMD, Intel, ASUS, MSI etc) pertencem aos seus proprietarios. Kore Tech e revendedora autorizada.
          </p>
        </div>
      </div>
    </footer>
  )
}
