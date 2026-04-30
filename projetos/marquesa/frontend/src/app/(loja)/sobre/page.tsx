import { ScrollReveal } from '@/components/effects/ScrollReveal'

export const metadata = {
  title: 'Sobre',
  description: 'Sobre a Marquesa, imobiliária boutique alto padrão em São Paulo e Rio.',
}

export default function SobrePage() {
  return (
    <article className="container-marquesa py-24 max-w-3xl">
      <ScrollReveal>
        <p className="text-eyebrow uppercase tracking-[0.16em] text-ash mb-4">Sobre</p>
        <h1 className="font-display text-display-xl text-ink mb-12">Sobre a Marquesa</h1>

        <div className="prose-marquesa space-y-6 text-body-lg text-ink leading-relaxed">
          <p>
            A Marquesa nasceu em 2018 da inquietação de Lorenzo Mancini, corretor formado em
            Florença com vinte anos de mercado entre Itália e Brasil, em encontrar uma casa
            profissional que tratasse a venda de imóveis como ofício, não como volume.
          </p>
          <p>
            Operamos em São Paulo e Rio de Janeiro com um portfólio enxuto e curado. Cada imóvel
            da Marquesa passa por triagem técnica e visita presencial da equipe antes de entrar
            no catálogo. Documentação verificada, fotografia profissional, ficha de informações
            completa, corretor responsável atribuído. Nada de listagem em massa.
          </p>
          <p>
            Nosso trabalho começa antes do anúncio e segue depois da escritura. Acompanhamos due
            diligence, conexão com escritórios de arquitetura e engenharia, articulação com
            cartórios, recomendação de profissionais de reforma e mudança. Para o vendedor,
            oferecemos avaliação técnica honesta, fotografia editorial, plano de divulgação
            discreto e negociação conduzida pessoalmente. Para o comprador, garantimos que o
            imóvel apresentado é o imóvel entregue.
          </p>
          <p>
            Trabalhamos com exclusividade ou semi-exclusividade nas captações. Não competimos
            por volume, competimos por adequação. Nosso indicador é a permanência do cliente,
            não o ticket único.
          </p>
          <p>
            A equipe atual reúne sete corretores plenos com CRECI ativo, fotógrafa de planta,
            advogado consultor em direito imobiliário e parceria com escritório de arquitetura
            italiano para clientes que buscam reforma após a compra.
          </p>
          <p>Atendimento por agendamento, em nosso escritório nos Jardins ou no imóvel.</p>
        </div>

        <div className="mt-12 pt-8 border-t border-bone">
          <p className="font-display text-heading-lg text-ink">Lorenzo Mancini</p>
          <p className="text-body-sm text-ash mt-1">Sócio fundador, CRECI/SP 12345-J</p>
        </div>
      </ScrollReveal>
    </article>
  )
}
