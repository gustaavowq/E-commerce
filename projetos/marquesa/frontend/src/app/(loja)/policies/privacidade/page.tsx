export const metadata = {
  title: 'Política de privacidade',
  description: 'Como a Marquesa trata dados pessoais conforme a LGPD.',
}

export default function PrivacidadePage() {
  return (
    <article className="container-marquesa py-24 max-w-3xl">
      <p className="text-eyebrow uppercase tracking-[0.16em] text-ash mb-4">Políticas</p>
      <h1 className="font-display text-display-xl text-ink mb-12">Política de privacidade</h1>

      <div className="prose-marquesa space-y-6 text-body-lg text-ink leading-relaxed">
        <p>
          A Marquesa Imóveis Ltda., inscrita no CRECI/SP sob o número 12345-J, é responsável pelo
          tratamento dos dados pessoais coletados neste site, em conformidade com a Lei Geral de
          Proteção de Dados (Lei 13.709/2018).
        </p>

        <h2 className="font-display text-heading-lg text-ink mt-8">Dados que coletamos</h2>
        <p>
          Dados de cadastro: nome completo, email, telefone, CPF e senha (criptografada). Dados
          de navegação: IP, navegador, páginas visitadas, origem da visita. Dados de transação:
          forma de pagamento, identificador da transação (sem armazenar número do cartão).
        </p>

        <h2 className="font-display text-heading-lg text-ink mt-8">Finalidade</h2>
        <p>
          Cadastro e gestão de conta, processamento de reservas e devoluções, comunicação com
          consentimento, geração de comprovantes e contratos preliminares, prevenção a fraude,
          obrigações legais e regulatórias do setor imobiliário.
        </p>

        <h2 className="font-display text-heading-lg text-ink mt-8">Compartilhamento</h2>
        <p>
          Compartilhamos dados estritamente necessários com MercadoPago (pagamentos), cartórios e
          órgãos públicos quando exigido, corretor responsável pelo imóvel, e autoridades
          competentes mediante ordem judicial. Não vendemos, alugamos ou cedemos dados pessoais
          para terceiros com finalidade comercial.
        </p>

        <h2 className="font-display text-heading-lg text-ink mt-8">Seus direitos (LGPD)</h2>
        <ul className="list-disc list-inside space-y-2 ml-2">
          <li>Acesso e cópia dos dados.</li>
          <li>Correção de dados desatualizados ou incorretos.</li>
          <li>Anonimização ou exclusão.</li>
          <li>Portabilidade.</li>
          <li>Revogação do consentimento.</li>
          <li>Informação sobre compartilhamento.</li>
        </ul>
        <p>
          Para exercer qualquer direito, escreva para{' '}
          <a
            href="mailto:dpo@marquesa.dev"
            className="text-ink hover:underline underline-offset-4"
          >
            dpo@marquesa.dev
          </a>
          . Atendemos em até 15 dias.
        </p>

        <h2 className="font-display text-heading-lg text-ink mt-8">Segurança</h2>
        <p>
          Criptografia em trânsito (HTTPS), senhas com hash bcrypt, acesso interno restrito,
          backup periódico, monitoramento de tentativas de invasão.
        </p>

        <p className="text-ash text-body-sm mt-12">Política atualizada em 29 de abril de 2026.</p>
      </div>
    </article>
  )
}
