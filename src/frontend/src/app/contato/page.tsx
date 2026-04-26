import Link from 'next/link'
import { MessageCircle, Mail, MapPin, Phone, Clock, Instagram } from 'lucide-react'
import { getStoreSettings } from '@/services/settings'
import type { StoreSettings } from '@/services/types'
import { ContactForm } from './ContactForm'

export const metadata = {
  title: 'Fale com a Miami Store',
  description: 'Tira dúvida no WhatsApp, manda email ou passa pra deixar um oi. Atendimento humano, sem robô.',
}

export const revalidate = 300

export default async function ContatoPage() {
  let settings: StoreSettings | null = null
  try { settings = await getStoreSettings() } catch {}

  const whatsapp = settings?.whatsappNumber ?? '5511999999999'
  const email    = settings?.email          ?? 'contato@miamistore.com.br'
  const phone    = settings?.phone          ?? '(11) 99999-9999'
  const address  = settings?.address        ?? 'Rua Exemplo, 123, Vila Madalena, São Paulo/SP, 05433-000'
  const insta    = settings?.instagramHandle ?? 'miamii_storee'

  // Google Maps embed via query string (não precisa de API key pra modo place)
  const mapQuery = encodeURIComponent(address)
  const mapUrl   = `https://www.google.com/maps?q=${mapQuery}&output=embed`

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-ink text-white">
        <div aria-hidden className="absolute -left-32 top-1/2 h-96 w-96 -translate-y-1/2 rounded-full bg-primary-700/30 blur-3xl" />
        <div aria-hidden className="absolute -right-20 -top-20 h-80 w-80 rounded-full bg-accent/20 blur-3xl" />

        <div className="container-app relative py-12 sm:py-16">
          <nav className="mb-4 text-xs text-ink-4 animate-fade-up">
            <Link href="/" className="hover:text-white">Início</Link>
            <span className="mx-1.5">›</span>
            <span className="text-white">Contato</span>
          </nav>
          <p className="text-sm font-bold uppercase tracking-widest text-neon animate-fade-up" style={{ animationDelay: '50ms' }}>
            Fala aí
          </p>
          <h1 className="mt-3 max-w-3xl font-display text-3xl leading-tight sm:text-5xl animate-fade-up" style={{ animationDelay: '100ms' }}>
            A gente <span className="text-shine">responde rápido.</span>
          </h1>
          <p className="mt-4 max-w-2xl text-base text-ink-4 animate-fade-up" style={{ animationDelay: '200ms' }}>
            Dúvida sobre tamanho, prazo, troca ou só quer dar um oi? Manda. Atendimento humano de seg a sáb, das 9h às 19h.
          </p>
        </div>
      </section>

      {/* Cards de contato rápido */}
      <section className="container-app -mt-8 mb-12 grid gap-3 sm:grid-cols-3 sm:-mt-10">
        {[
          {
            icon: MessageCircle,
            title: 'WhatsApp',
            value: phone,
            href: `https://wa.me/${whatsapp}?text=${encodeURIComponent('Oi! Vim do site da Miami Store.')}`,
            external: true,
            highlight: true,
          },
          {
            icon: Mail,
            title: 'Email',
            value: email,
            href: `mailto:${email}`,
            external: false,
            highlight: false,
          },
          {
            icon: Instagram,
            title: 'Instagram',
            value: `@${insta}`,
            href: `https://www.instagram.com/${insta}/`,
            external: true,
            highlight: false,
          },
        ].map((c, i) => (
          <a
            key={i}
            href={c.href}
            target={c.external ? '_blank' : undefined}
            rel={c.external ? 'noopener noreferrer' : undefined}
            className={`group flex items-center gap-4 rounded-lg border bg-white p-5 transition-all hover:-translate-y-1 hover:shadow-lg animate-fade-up ${
              c.highlight ? 'border-whatsapp/30 hover:border-whatsapp' : 'border-border hover:border-primary-700/30'
            }`}
            style={{ animationDelay: `${i * 80}ms` }}
          >
            <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-pill transition-transform group-hover:scale-110 ${
              c.highlight ? 'bg-whatsapp/10 text-whatsapp' : 'bg-primary-50 text-primary-700'
            }`}>
              <c.icon className="h-6 w-6" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-wide text-ink-3">{c.title}</p>
              <p className="truncate text-sm font-bold text-ink sm:text-base">{c.value}</p>
            </div>
          </a>
        ))}
      </section>

      {/* Form + Info */}
      <section className="container-app pb-12">
        <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
          <div className="rounded-lg border border-border bg-white p-6 sm:p-8 animate-fade-up">
            <h2 className="font-display text-2xl text-ink sm:text-3xl">Manda sua mensagem</h2>
            <p className="mt-2 text-sm text-ink-3">
              Preenche aí que a gente te chama no WhatsApp em alguns minutos. Direto, sem formulário interminável.
            </p>
            <ContactForm whatsappNumber={whatsapp} />
          </div>

          <aside className="space-y-4 animate-fade-up" style={{ animationDelay: '120ms' }}>
            <div className="rounded-lg border border-border bg-white p-5">
              <div className="flex items-center gap-2 text-primary-700">
                <MapPin className="h-5 w-5" />
                <h3 className="font-bold">Endereço</h3>
              </div>
              <p className="mt-2 text-sm text-ink-2 leading-relaxed">{address}</p>
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${mapQuery}`}
                target="_blank" rel="noopener noreferrer"
                className="mt-3 inline-block text-xs font-semibold text-primary-700 hover:underline"
              >
                Abrir no Google Maps →
              </a>
            </div>

            <div className="rounded-lg border border-border bg-white p-5">
              <div className="flex items-center gap-2 text-primary-700">
                <Clock className="h-5 w-5" />
                <h3 className="font-bold">Horário de atendimento</h3>
              </div>
              <ul className="mt-3 space-y-1.5 text-sm text-ink-2">
                <li className="flex justify-between"><span>Segunda a sexta</span><strong className="text-ink">9h às 19h</strong></li>
                <li className="flex justify-between"><span>Sábado</span><strong className="text-ink">9h às 14h</strong></li>
                <li className="flex justify-between"><span>Domingo</span><span className="text-ink-3">fechado</span></li>
              </ul>
            </div>

            <div className="rounded-lg border border-border bg-white p-5">
              <div className="flex items-center gap-2 text-primary-700">
                <Phone className="h-5 w-5" />
                <h3 className="font-bold">Outros canais</h3>
              </div>
              <ul className="mt-3 space-y-2 text-sm text-ink-2">
                <li><a href={`mailto:${email}`} className="hover:text-primary-700 hover:underline">{email}</a></li>
                <li><a href={`https://www.instagram.com/${insta}/`} target="_blank" rel="noopener noreferrer" className="hover:text-primary-700 hover:underline">Instagram @{insta}</a></li>
              </ul>
            </div>
          </aside>
        </div>
      </section>

      {/* Mapa */}
      <section className="container-app pb-16">
        <div className="overflow-hidden rounded-lg border border-border bg-white animate-fade-up">
          <div className="border-b border-border bg-surface-2 px-5 py-3">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-primary-700" />
              <p className="text-sm font-semibold text-ink">Onde a gente fica</p>
            </div>
          </div>
          <div className="aspect-[16/9] sm:aspect-[21/9]">
            <iframe
              src={mapUrl}
              width="100%"
              height="100%"
              style={{ border: 0 }}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Localização Miami Store"
              allowFullScreen
            />
          </div>
        </div>
      </section>
    </>
  )
}
