import Link from 'next/link'
import { microcopy } from '@/lib/microcopy'
import { NewsletterCapture } from './NewsletterCapture'

export function Footer() {
  const c = microcopy.footer
  return (
    <footer className="bg-graphite text-paper mt-32">
      {/* Newsletter — captura no topo do footer pra dar destaque sem virar popup. */}
      <div className="container-marquesa pt-20 pb-12 border-b border-paper/10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div className="max-w-md">
            <NewsletterCapture />
          </div>
        </div>
      </div>

      <div className="container-marquesa py-20 grid grid-cols-1 md:grid-cols-4 gap-12">
        <div className="md:col-span-1">
          <div className="font-display text-heading-lg tracking-[0.16em] uppercase mb-4">
            Marquesa
          </div>
          <p className="text-body-sm text-paper/60 leading-relaxed">
            Curadoria de imóveis alto padrão. São Paulo, Rio de Janeiro.
          </p>
        </div>

        <div>
          <h3 className="text-eyebrow uppercase tracking-[0.16em] text-paper/50 mb-5">
            {c.sobre}
          </h3>
          <ul className="flex flex-col gap-3 text-body-sm">
            <li>
              <Link href="/sobre" className="hover:underline underline-offset-4">
                Sobre a Marquesa
              </Link>
            </li>
            <li>
              <Link href="/contato" className="hover:underline underline-offset-4">
                {c.contato}
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="text-eyebrow uppercase tracking-[0.16em] text-paper/50 mb-5">
            {c.imoveis}
          </h3>
          <ul className="flex flex-col gap-3 text-body-sm">
            <li>
              <Link href="/imoveis" className="hover:underline underline-offset-4">
                Catálogo
              </Link>
            </li>
            <li>
              <Link
                href="/imoveis?tipo=APARTAMENTO"
                className="hover:underline underline-offset-4"
              >
                Apartamentos
              </Link>
            </li>
            <li>
              <Link
                href="/imoveis?tipo=COBERTURA"
                className="hover:underline underline-offset-4"
              >
                Coberturas
              </Link>
            </li>
            <li>
              <Link href="/imoveis?tipo=CASA" className="hover:underline underline-offset-4">
                Casas
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="text-eyebrow uppercase tracking-[0.16em] text-paper/50 mb-5">
            {c.politicas}
          </h3>
          <ul className="flex flex-col gap-3 text-body-sm">
            <li>
              <Link
                href="/policies/reserva"
                className="hover:underline underline-offset-4"
              >
                {c.politica_reserva}
              </Link>
            </li>
            <li>
              <Link
                href="/policies/privacidade"
                className="hover:underline underline-offset-4"
              >
                {c.politica_privacidade}
              </Link>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-paper/10">
        <div className="container-marquesa py-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <p className="text-caption text-inverse-subtle">{c.creci}</p>
          <p className="text-caption text-inverse-subtle">{c.endereco}</p>
          <p className="text-caption text-inverse-subtle">{c.copyright}</p>
        </div>
      </div>
    </footer>
  )
}
