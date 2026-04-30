import { ScrollReveal } from '@/components/effects/ScrollReveal'
import { microcopy } from '@/lib/microcopy'

export const metadata = {
  title: 'Contato',
  description: 'Atendimento por agendamento. WhatsApp, email e endereço da Marquesa.',
}

const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '5511900000000'

export default function ContatoPage() {
  const c = microcopy.contato
  return (
    <article className="container-marquesa py-24">
      <ScrollReveal>
        {/* Lead editorial */}
        <header className="max-w-3xl mb-16">
          <p className="text-eyebrow uppercase tracking-[0.16em] text-ash mb-4">{c.eyebrow}</p>
          <h1 className="font-display text-display-xl text-ink mb-6">{c.titulo_editorial}</h1>
          <p className="text-body-lg text-ash leading-relaxed">{c.intro_editorial}</p>
        </header>

        {/* Duas colunas: conteúdo (esquerda) × visual editorial (direita).
           Mobile: visual vai pro topo (60vh max), conteúdo embaixo. */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16 items-start">
          {/* Visual editorial — placeholder monograma "M" enquanto não há foto real.
             (Designer: Opção C como fallback sem dependência de asset novo.) */}
          <div className="order-1 lg:order-2 lg:sticky lg:top-24">
            <div className="aspect-[4/5] max-h-[60vh] lg:max-h-none w-full bg-paper-warm flex items-center justify-center overflow-hidden">
              <span
                aria-hidden="true"
                className="font-display font-light text-ink/15 select-none"
                style={{ fontSize: 'clamp(8rem, 22vw, 18rem)', lineHeight: 1 }}
              >
                M
              </span>
            </div>
          </div>

          {/* Coluna conteúdo: visita + remoto empilhadas */}
          <div className="order-2 lg:order-1 flex flex-col gap-12">
            <section>
              <p className="text-eyebrow uppercase tracking-[0.16em] text-ash mb-3">
                {c.coluna_visita_titulo}
              </p>
              <p className="text-body-lg text-ink leading-relaxed mb-4">
                {c.coluna_visita_corpo}
              </p>
              <div className="border-t border-bone pt-4">
                <p className="text-eyebrow uppercase tracking-[0.16em] text-ash mb-2">
                  {c.coluna_visita_endereco_titulo}
                </p>
                <p className="text-body text-ink leading-relaxed">
                  {c.coluna_visita_endereco}
                </p>
              </div>
            </section>

            <section className="border-t border-bone pt-12">
              <p className="text-eyebrow uppercase tracking-[0.16em] text-ash mb-3">
                {c.coluna_remoto_titulo}
              </p>
              <p className="text-body-lg text-ink leading-relaxed mb-6">
                {c.coluna_remoto_corpo}
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 border-t border-bone pt-4">
                <div>
                  <p className="text-eyebrow uppercase tracking-[0.16em] text-ash mb-2">
                    {c.coluna_remoto_whatsapp_titulo}
                  </p>
                  <a
                    href={`https://wa.me/${whatsappNumber}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-body text-ink hover:text-moss underline underline-offset-4 transition-colors duration-fast"
                  >
                    +55 11 90000-0000
                  </a>
                </div>
                <div>
                  <p className="text-eyebrow uppercase tracking-[0.16em] text-ash mb-2">
                    {c.coluna_remoto_email_titulo}
                  </p>
                  <a
                    href="mailto:contato@marquesa.dev"
                    className="text-body text-ink hover:text-moss underline underline-offset-4 transition-colors duration-fast break-all"
                  >
                    contato@marquesa.dev
                  </a>
                </div>
              </div>
            </section>
          </div>
        </div>

        {/* Vendedores — bloco horizontal cheio, secundário */}
        <section className="border-t border-bone pt-12 mb-12 max-w-4xl">
          <p className="text-eyebrow uppercase tracking-[0.16em] text-ash mb-3">
            {c.vendedores_titulo}
          </p>
          <p className="text-body text-ink leading-relaxed">{c.vendedores_corpo}</p>
        </section>

        {/* LGPD — pé da página, ash menor, secundário */}
        <section className="border-t border-bone pt-12 max-w-4xl">
          <p className="text-eyebrow uppercase tracking-[0.16em] text-ash mb-3">
            {c.lgpd_titulo}
          </p>
          <p className="text-body-sm text-ash leading-relaxed">{c.lgpd_corpo}</p>
        </section>
      </ScrollReveal>
    </article>
  )
}
