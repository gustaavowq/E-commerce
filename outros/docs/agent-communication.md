# Protocolo de Comunicação entre Agentes

## Como os agentes se comunicam

Todos os agentes se comunicam através de arquivos `.md` na pasta `shared/messages/`.

## Nomenclatura dos arquivos

```
DE-{remetente}_PARA-{destinatario}_{YYYY-MM-DD}.md
```

Exemplos:
```
DE-backend_PARA-frontend_2025-01-15.md
DE-analyst_PARA-backend_2025-01-15.md
DE-qa_PARA-techlead_2025-01-16.md
BUG-001_2025-01-16.md
```

## Template de Mensagem

```markdown
# De: {Agente Remetente}
# Para: {Agente Destinatário}
# Data: {data}
# Assunto: {título curto}
# Prioridade: Alta / Média / Baixa

## Contexto
Explique brevemente por que está enviando esta mensagem.

## O que preciso / O que estou entregando
Seja específico. Se for uma solicitação, detalhe exatamente o que precisa.
Se for uma entrega, documente o que foi feito.

## Impacto se não resolvido
O que fica bloqueado enquanto isso não for resolvido?

## Próximo passo esperado
O que você espera que o destinatário faça com esta mensagem?
```

## Ordem de Prioridade de Leitura

O Tech Lead lê `shared/messages/` no início de cada ciclo de trabalho.
Os agentes devem verificar mensagens endereçadas a eles antes de começar qualquer tarefa.

## Tipos de Comunicação

| Tipo | Quando usar |
|------|-------------|
| Solicitação | Preciso que outro agente faça algo |
| Entrega | Informando que terminei algo que outro agente depende |
| Bloqueio | Não consigo avançar por causa de outra dependência |
| Bug | Problema encontrado (use template do QA Agent) |
| Decisão | Tomei uma decisão que afeta outro agente |
