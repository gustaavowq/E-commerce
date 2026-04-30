export const metadata = {
  title: 'Política de reserva',
  description: 'Como funciona a reserva por sinal na Marquesa.',
}

export default function PoliticaReservaPage() {
  return (
    <article className="container-marquesa py-24 max-w-3xl">
      <p className="text-eyebrow uppercase tracking-[0.16em] text-ash mb-4">Políticas</p>
      <h1 className="font-display text-display-xl text-ink mb-12">Política de reserva</h1>

      <div className="prose-marquesa space-y-6 text-body-lg text-ink leading-relaxed">
        <h2 className="font-display text-heading-lg text-ink mt-8">O que é a reserva por sinal</h2>
        <p>
          A reserva é uma forma de garantir exclusividade na negociação de um imóvel da Marquesa.
          Ao pagar o sinal, o imóvel é retirado do catálogo e fica reservado para você por um
          período definido, durante o qual o corretor responsável conduz a negociação do valor
          restante presencialmente.
        </p>
        <p>
          A reserva por sinal está prevista no Código Civil brasileiro (artigos 417 a 420), na
          figura das arras confirmatórias. É um instrumento legítimo, comum no mercado imobiliário
          brasileiro e protegido por lei.
        </p>

        <h2 className="font-display text-heading-lg text-ink mt-8">Valor do sinal</h2>
        <p>
          O sinal padrão é de 5% do valor anunciado do imóvel. Em alguns casos específicos, esse
          percentual pode ser ajustado entre 1% e 5% pelo corretor responsável, conforme
          particularidade da negociação.
        </p>
        <p>
          O valor pago como sinal é abatido integralmente do preço final do imóvel quando a venda
          é concretizada.
        </p>

        <h2 className="font-display text-heading-lg text-ink mt-8">Prazo</h2>
        <p>
          A reserva tem prazo de 10 dias corridos, contados a partir da confirmação do pagamento
          do sinal. Durante esse período:
        </p>
        <ul className="list-disc list-inside space-y-2 ml-2">
          <li>O imóvel não aparece para outros interessados no catálogo.</li>
          <li>
            O corretor responsável agenda visita presencial e conduz negociação dos termos finais.
          </li>
          <li>Documentação é levantada e enviada para análise.</li>
        </ul>
        <p>O prazo pode ser estendido por mais 5 dias mediante acordo entre as partes, sem custo adicional.</p>

        <h2 className="font-display text-heading-lg text-ink mt-8">Formas de pagamento</h2>
        <ul className="list-disc list-inside space-y-2 ml-2">
          <li>Pix: confirmação imediata. Forma recomendada.</li>
          <li>Cartão de crédito: em até 3 vezes sem juros.</li>
        </ul>

        <h2 className="font-display text-heading-lg text-ink mt-8">
          Se a negociação não avançar
        </h2>
        <p>
          Comprador desiste por motivo próprio: o sinal não é devolvido (arras confirmatórias).
        </p>
        <p>
          Vendedor desiste: o sinal é devolvido em dobro ao comprador (artigo 418 do Código Civil).
        </p>
        <p>
          Pendência documental ou impedimento legal: sinal devolvido integralmente em até 5 dias
          úteis.
        </p>
        <p>
          Prazo expira sem fechamento: sinal devolvido integralmente em até 5 dias úteis.
        </p>

        <p className="text-ash text-body-sm mt-12">Política atualizada em 29 de abril de 2026.</p>
      </div>
    </article>
  )
}
