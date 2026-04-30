import { ScrollReveal } from '@/components/effects/ScrollReveal'

export const metadata = {
  title: 'Contato',
  description: 'Atendimento por agendamento. WhatsApp, email e endereço da Marquesa.',
}

const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '5511900000000'

export default function ContatoPage() {
  return (
    <article className="container-marquesa py-24 max-w-3xl">
      <ScrollReveal>
        <p className="text-eyebrow uppercase tracking-[0.16em] text-ash mb-4">Contato</p>
        <h1 className="font-display text-display-xl text-ink mb-12">Fale com a curadoria</h1>

        <div className="space-y-12">
          <Section title="Escritório">
            <p>Rua dos Tranquilos, 142</p>
            <p>Jardins, São Paulo, SP</p>
            <p>CEP 01401-000</p>
            <p className="text-ash mt-2">
              Atendimento por agendamento, segunda a sexta, das 10h às 19h.
            </p>
          </Section>

          <Section title="WhatsApp">
            <a
              href={`https://wa.me/${whatsappNumber}`}
              className="text-ink hover:underline underline-offset-4"
              target="_blank"
              rel="noopener noreferrer"
            >
              +55 11 90000-0000
            </a>
            <p className="text-ash mt-2">
              Resposta em até 4 horas úteis. Para mensagens fora do horário comercial,
              retornamos no próximo dia útil.
            </p>
          </Section>

          <Section title="Email">
            <a href="mailto:contato@marquesa.dev" className="text-ink hover:underline underline-offset-4">
              contato@marquesa.dev
            </a>
          </Section>

          <Section title="Para vendedores">
            <p>
              Captação de imóveis em São Paulo e Rio de Janeiro com avaliação técnica e plano de
              divulgação personalizado. Trabalhamos com exclusividade ou semi-exclusividade.
            </p>
            <p className="mt-3">
              Para apresentar seu imóvel à curadoria, escreva para{' '}
              <a
                href="mailto:captacao@marquesa.dev"
                className="text-ink hover:underline underline-offset-4"
              >
                captacao@marquesa.dev
              </a>
              .
            </p>
          </Section>

          <Section title="Encarregado de dados (LGPD)">
            <a href="mailto:dpo@marquesa.dev" className="text-ink hover:underline underline-offset-4">
              dpo@marquesa.dev
            </a>
            <p className="text-ash mt-2">
              Para exercer direitos de acesso, correção, portabilidade ou exclusão de dados
              pessoais conforme a Lei Geral de Proteção de Dados.
            </p>
          </Section>
        </div>
      </ScrollReveal>
    </article>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-eyebrow uppercase tracking-[0.16em] text-ash mb-3">{title}</p>
      <div className="text-body-lg text-ink leading-relaxed space-y-1">{children}</div>
    </div>
  )
}
