# Email: Confirmação de reserva

**Destinatário:** cliente que pagou sinal
**De:** Marquesa <reservas@marquesa.dev>
**Variáveis:** {{nome}}, {{titulo_imovel}}, {{bairro}}, {{valor_imovel}}, {{valor_sinal}}, {{data_reserva}}, {{data_expiracao}}, {{corretor_nome}}, {{corretor_telefone}}, {{link_imovel}}, {{link_minhas_reservas}}

---

**Subject:** Reserva confirmada, {{nome}}.

**Preheader:** O imóvel saiu do catálogo. Próximos passos no email.

---

Olá, {{nome}}.

Recebemos o sinal de reserva do imóvel **{{titulo_imovel}}**, no {{bairro}}. O imóvel foi retirado do catálogo e fica reservado exclusivamente para você até {{data_expiracao}}.

## Detalhes da reserva

- **Imóvel:** {{titulo_imovel}}
- **Valor anunciado:** R$ {{valor_imovel}}
- **Sinal pago:** R$ {{valor_sinal}}
- **Data da reserva:** {{data_reserva}}
- **Válida até:** {{data_expiracao}} (10 dias corridos)

## Próximos passos

1. **{{corretor_nome}}**, corretor responsável por este imóvel, entra em contato em até 4 horas úteis pelo telefone que você informou. Caso prefira, ligue diretamente: {{corretor_telefone}}.
2. A negociação do valor restante e a verificação documental acontecem presencialmente, na nossa sede ou no imóvel.
3. Caso a negociação avance, o sinal pago é abatido do valor total na assinatura do contrato.
4. Caso a negociação não avance dentro do prazo, o sinal é devolvido conforme a [política de reserva](https://marquesa.gustavo.agenciaever.cloud/policies/reserva).

## Documentos enviados em anexo

- Comprovante de pagamento do sinal
- Compromisso de Compra e Venda (CCV) preliminar para sua referência

## Acompanhe pelo painel

Você pode acompanhar o status da reserva, baixar comprovantes e ver o histórico em [Minhas reservas]({{link_minhas_reservas}}).

---

Para qualquer dúvida, responda este email ou chame pelo WhatsApp [+55 11 90000-0000](https://wa.me/5511900000000).

Marquesa Imóveis
Rua dos Tranquilos, 142, Jardins, São Paulo
CRECI/SP 12345-J
