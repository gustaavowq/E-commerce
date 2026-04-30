# Email: Notificação ao corretor (sinal pago)

**Destinatário:** corretor responsável pelo imóvel
**De:** Marquesa <sistema@marquesa.dev>
**Variáveis:** {{corretor_nome}}, {{titulo_imovel}}, {{bairro}}, {{valor_imovel}}, {{valor_sinal}}, {{cliente_nome}}, {{cliente_email}}, {{cliente_telefone}}, {{cliente_cpf}}, {{data_reserva}}, {{data_expiracao}}, {{link_painel_reserva}}

---

**Subject:** Sinal pago, ação necessária em 4h.

**Preheader:** {{cliente_nome}} pagou sinal de R$ {{valor_sinal}}. Contate hoje.

---

{{corretor_nome}},

O imóvel **{{titulo_imovel}}** ({{bairro}}) acaba de receber sinal de reserva. Ação necessária em até 4 horas úteis: contato com o cliente.

## Cliente

- **Nome:** {{cliente_nome}}
- **Email:** {{cliente_email}}
- **Telefone (WhatsApp):** {{cliente_telefone}}
- **CPF:** {{cliente_cpf}}

## Reserva

- **Imóvel:** {{titulo_imovel}}
- **Valor anunciado:** R$ {{valor_imovel}}
- **Sinal pago:** R$ {{valor_sinal}}
- **Reserva feita em:** {{data_reserva}}
- **Expira em:** {{data_expiracao}} (10 dias corridos)

## Sua ação

1. Ligar ou enviar mensagem pelo WhatsApp em até 4 horas úteis.
2. Agendar a visita presencial e a reunião de negociação.
3. Conduzir negociação dos termos finais (valor, condições, documentação).
4. Atualizar o status no painel após cada interação relevante.
5. Concluir como **VENDIDO** ou solicitar **liberação** se não fechar.

[Abrir reserva no painel]({{link_painel_reserva}})

## Lembrete

O imóvel já está com status **RESERVADO** no catálogo público e não aparece para outros interessados. O cliente recebeu email de confirmação com seu nome e telefone como contato responsável.

---

Marquesa Imóveis (sistema)
