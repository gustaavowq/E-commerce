import Link from 'next/link'
import { Instagram, MessageCircle } from 'lucide-react'
import { PaymentBadges } from './PaymentBadges'

export function Footer() {
  return (
    <footer className="mt-12 bg-ink text-white">
      <div className="container-app py-10 sm:py-14">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <Link href="/" className="flex items-center gap-2 font-display text-xl font-bold">
              <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-primary-700 text-xs font-black">M</span>
              <span className="tracking-wide">MIAMI STORE</span>
            </Link>
            <p className="mt-3 text-sm text-ink-4">
              Roupa de marca, original, com preço que entra no bolso. Tudo aqui é original.
            </p>
            <div className="mt-4 flex items-center gap-3">
              <a
                href="https://www.instagram.com/miamii_storee/"
                target="_blank" rel="noopener noreferrer"
                aria-label="Instagram"
                className="flex h-10 w-10 items-center justify-center rounded-md bg-white/10 hover:bg-white/20 transition"
              >
                <Instagram className="h-5 w-5" />
              </a>
              <a
                href="https://wa.me/5511999999999"
                target="_blank" rel="noopener noreferrer"
                aria-label="WhatsApp"
                className="flex h-10 w-10 items-center justify-center rounded-md bg-whatsapp hover:opacity-90 transition"
              >
                <MessageCircle className="h-5 w-5" />
              </a>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wide">Navegue</h3>
            <ul className="mt-3 space-y-2 text-sm text-ink-4">
              <li><Link href="/" className="hover:text-white">Início</Link></li>
              <li><Link href="/products" className="hover:text-white">Loja</Link></li>
              <li><Link href="/sobre" className="hover:text-white">Sobre nós</Link></li>
              <li><Link href="/contato" className="hover:text-white">Contato</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wide">Ajuda</h3>
            <ul className="mt-3 space-y-2 text-sm text-ink-4">
              <li><a href="https://wa.me/5511999999999" target="_blank" rel="noopener noreferrer" className="hover:text-white">WhatsApp</a></li>
              <li><Link href="/account" className="hover:text-white">Meus pedidos</Link></li>
              <li><Link href="/policies/exchange" className="hover:text-white">Trocas e devoluções</Link></li>
              <li><Link href="/policies/shipping" className="hover:text-white">Política de envio</Link></li>
              <li><Link href="/policies/privacy" className="hover:text-white">Privacidade</Link></li>
              <li><Link href="/policies/terms" className="hover:text-white">Termos de uso</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wide">Pagamento</h3>
            <p className="mt-3 text-xs text-ink-4">Aceitamos:</p>
            <div className="mt-2">
              <PaymentBadges />
            </div>
            <p className="mt-4 text-xs text-ink-4">
              Site seguro. Suas informações são protegidas com criptografia.
            </p>
          </div>
        </div>

        <div className="mt-8 border-t border-white/10 pt-6 text-xs text-ink-4">
          <p>
            <strong>Miami Store</strong> · CNPJ 00.000.000/0001-00 · Rua Exemplo, 123, São Paulo/SP
          </p>
          <p className="mt-1">
            Miami Store é loja revendedora independente. Marcas exibidas (Lacoste®, Nike®, Adidas®) pertencem aos seus respectivos proprietários e não possuem afiliação direta com a Miami Store.
          </p>
        </div>
      </div>
    </footer>
  )
}
