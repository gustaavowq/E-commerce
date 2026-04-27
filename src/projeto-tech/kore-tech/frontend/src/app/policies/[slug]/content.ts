/**
 * Conteudo placeholder das paginas institucionais de politica.
 * Tom on-brand: direto, tecnico-amigavel, sem juridiques exagerado.
 * Versao legal final passara por juridico antes do lancamento publico real.
 */

export type PolicySection = {
  heading: string
  paragraphs?: string[]
  bullets?: string[]
}

export type Policy = {
  title: string
  summary: string
  sections: PolicySection[]
}

export const POLICIES: Record<string, Policy> = {
  termos: {
    title: 'Termos de uso',
    summary: 'Regras pra usar o site, criar conta e comprar na Kore Tech.',
    sections: [
      {
        heading: '1. Quem somos',
        paragraphs: [
          'A Kore Tech e uma loja virtual de hardware (PCs montados, componentes, monitores e perifericos), sediada em Sao Paulo/SP, CNPJ 00.000.000/0001-00. Estes termos regem o uso do site loja.koretech.com.br e dos servicos relacionados.',
          'Ao usar o site, voce concorda com estes termos. Se nao concorda, encerra a navegacao.',
        ],
      },
      {
        heading: '2. Conta e seguranca',
        paragraphs: [
          'Voce pode navegar sem conta. Pra comprar, salvar builds e usar lista de espera, e necessario criar uma conta. A senha e responsabilidade sua.',
          'Detectamos atividade suspeita e podemos bloquear acesso preventivamente. Voce pode recuperar a conta pelo email cadastrado.',
        ],
      },
      {
        heading: '3. Pedidos e pagamento',
        paragraphs: [
          'Pedidos so confirmam apos aprovacao do pagamento. Pix tem desconto automatico de 5% e compensa em ate 1 minuto. Cartao parcelado em ate 12x sem juros depende de aprovacao do emissor.',
          'O preco do site reflete o valor a vista no cartao. Boleto compensa em 1 a 2 dias uteis.',
        ],
      },
      {
        heading: '4. Estoque e disponibilidade',
        paragraphs: [
          'Estoque e atualizado a cada compra. Em raros casos de sobreposicao (duas compras simultaneas no ultimo item), entramos em contato em ate 1 dia util com opcoes (estorno, troca por similar, espera com desconto).',
          'Lista de espera reserva 24h pra primeiros da fila quando produto volta ao estoque.',
        ],
      },
      {
        heading: '5. Conduta proibida',
        paragraphs: [
          'Nao e permitido raspar conteudo, automatizar compras (bots), fraudar pagamento ou usar a Kore Tech pra revenda nao autorizada. Detectamos e bloqueamos.',
        ],
      },
      {
        heading: '6. Limitacoes de responsabilidade',
        paragraphs: [
          'O FPS estimado e curado manualmente. Variacoes podem ocorrer por driver, BIOS, configuracao de jogo. A garantia DOA cobre defeito de fabrica, nao incompatibilidade autoinstalada.',
        ],
      },
      {
        heading: '7. Foro e contato',
        paragraphs: [
          'Foro de Sao Paulo/SP. Duvidas: contato@koretech.com.br ou WhatsApp.',
        ],
      },
    ],
  },
  privacidade: {
    title: 'Politica de privacidade',
    summary: 'Que dados coletamos, pra que usamos e como voce pode pedir exclusao.',
    sections: [
      {
        heading: '1. Que dados coletamos',
        paragraphs: [
          'Coletamos o minimo necessario pra operar a loja: nome, email, telefone (opcional), CPF (na nota fiscal), endereco de entrega, historico de pedido, builds salvos, lista de espera.',
          'Cookies tecnicos pra manter sessao e carrinho. Cookies de analytics (GA4, Meta Pixel) so com consentimento.',
        ],
      },
      {
        heading: '2. Como usamos',
        paragraphs: [
          'Pra processar pagamento, emitir nota fiscal, entregar produto, enviar atualizacao de pedido, avisar sobre lista de espera. Nao vendemos dado pra terceiro. Nao usamos pra publicidade direcionada sem consentimento.',
        ],
      },
      {
        heading: '3. Compartilhamento',
        paragraphs: [
          'Compartilhamos dados estritamente necessarios com: gateway de pagamento (MercadoPago), transportadora, contador (nota fiscal), provedor de email (Resend). Todos contratualmente obrigados a tratar com seguranca.',
        ],
      },
      {
        heading: '4. Seus direitos (LGPD)',
        paragraphs: [
          'Voce pode pedir acesso, correcao, exclusao, portabilidade, revogacao de consentimento e informacao sobre compartilhamento. Resposta em ate 15 dias uteis.',
          'Pra exercer: contato@koretech.com.br com assunto "LGPD".',
        ],
      },
      {
        heading: '5. Seguranca',
        paragraphs: [
          'TLS em todo o trafego. Senha com hash bcrypt. Cookies httpOnly. Acesso a banco restrito por IP. Logs de auditoria.',
        ],
      },
      {
        heading: '6. Encarregado (DPO)',
        paragraphs: [
          'DPO: dpo@koretech.com.br. Responde sobre tratamento de dados pessoais, ANPD e exercicio de direitos.',
        ],
      },
    ],
  },
  troca: {
    title: 'Trocas e devolucoes',
    summary: '7 dias de arrependimento. Defeito tem prioridade. Veja como pedir.',
    sections: [
      {
        heading: '1. Direito de arrependimento (CDC)',
        paragraphs: [
          'Voce tem 7 dias corridos a partir do recebimento pra desistir da compra, sem precisar justificar. Vale pra qualquer item, contanto que esteja sem uso, lacrado ou em estado de revenda.',
          'Reembolso integral, incluindo frete, estornado pelo mesmo meio em ate 5 dias uteis apos vistoria.',
        ],
      },
      {
        heading: '2. Defeito de fabrica (DOA)',
        paragraphs: [
          'Identificou defeito ao ligar pela primeira vez? Abre chamado pelo WhatsApp ou email com fotos/videos do problema. Aprovado o DOA, troca-se peca em ate 7 dias uteis com prioridade.',
        ],
      },
      {
        heading: '3. Garantia legal e do fabricante',
        paragraphs: [
          'Garantia legal: 90 dias (CDC). Garantia do fabricante varia por componente (CPU 36 meses, GPU 36-60 meses, fonte 60-120 meses, etc). Cada produto traz a info na ficha tecnica.',
          'Acionamento via Kore Tech facilita. Se preferir, voce pode acionar o fabricante direto.',
        ],
      },
      {
        heading: '4. Como pedir troca/devolucao',
        bullets: [
          'Abre chamado em "Meus pedidos" ou WhatsApp / email.',
          'Conta o motivo (arrependimento ou defeito) e envia foto/video se for defeito.',
          'Recebe codigo de postagem reverso em ate 1 dia util.',
          'Despacha na agencia (Correios) ou aguarda transportadora coletar.',
          'Apos vistoria (ate 5 dias uteis), confirmamos estorno ou troca.',
        ],
      },
      {
        heading: '5. O que invalida a troca',
        paragraphs: [
          'Mau uso, modificacao, overclock danoso, dano fisico, ausencia da nota fiscal ou da embalagem original. Em PC montado, abrir e desmontar antes de acionar suporte tecnico anula.',
        ],
      },
    ],
  },
  garantia: {
    title: 'Garantia e DOA',
    summary: 'Defeito tem caminho rapido. PC montado tem garantia ampliada de funcionamento.',
    sections: [
      {
        heading: '1. Garantia DOA (defeito imediato)',
        paragraphs: [
          'DOA = "Dead on Arrival". Ao ligar pela primeira vez, peca nao funciona ou apresenta defeito grave. Voce tem 7 dias corridos pra acionar com prioridade.',
          'Aprovado o DOA, trocamos a peca em ate 7 dias uteis. Se nao houver estoque, devolucao do valor ou troca por similar de mesmo valor com sua autorizacao.',
        ],
      },
      {
        heading: '2. Garantia do fabricante',
        paragraphs: [
          'Cada componente tem prazo proprio do fabricante. A Kore Tech serve de ponte: voce abre chamado conosco, a gente intermedia e cuida da logistica reversa quando aplicavel.',
        ],
      },
      {
        heading: '3. Garantia de PC montado Kore Tech',
        paragraphs: [
          'PCs montados pela Kore Tech tem garantia adicional de 12 meses cobrindo montagem, cabeamento e funcionamento integrado. Componentes individuais mantem prazo do fabricante.',
          'Garantia de FPS (V2): se o PC nao roda no FPS prometido em condicao igual a do site, devolucao em ate 7 dias.',
        ],
      },
      {
        heading: '4. Como acionar',
        bullets: [
          'WhatsApp pra urgencia (PC nao liga, GPU sem imagem, etc).',
          'Email pra registro com fotos/videos.',
          '"Meus pedidos" → botao "Abrir suporte" no pedido em questao.',
        ],
      },
    ],
  },
  envio: {
    title: 'Politica de envio',
    summary: 'Frete asseguro+ pra Brasil todo. Prazo varia por regiao e tipo de produto.',
    sections: [
      {
        heading: '1. Frete asseguro+',
        paragraphs: [
          'Todo envio inclui seguro contra extravio e dano. Em caso de problema na transportadora, ressarcimento integral em ate 7 dias uteis.',
        ],
      },
      {
        heading: '2. Prazo de entrega',
        paragraphs: [
          'Componentes em estoque: 1 dia util pra postagem + prazo da transportadora (1 a 7 dias uteis dependendo da regiao).',
          'PC montado (BTO): 3 a 5 dias uteis pra montagem + frete.',
        ],
      },
      {
        heading: '3. Frete gratis',
        paragraphs: [
          'Pedidos acima de R$ 5.000 tem frete gratis pra capitais e regioes metropolitanas. Outras regioes podem ter taxa parcial.',
        ],
      },
      {
        heading: '4. Acompanhamento',
        paragraphs: [
          'Codigo de rastreio enviado por email assim que postado. Tambem aparece em "Meus pedidos".',
        ],
      },
      {
        heading: '5. Recebimento',
        paragraphs: [
          'Confira a embalagem na hora. Caixa amassada ou violada? Recuse a entrega e abra chamado imediatamente. Apos receber sem ressalva, abrir suporte por dano externo fica mais dificil.',
        ],
      },
    ],
  },
}

export const POLICY_SLUGS = Object.keys(POLICIES)
export type PolicySlug = string
