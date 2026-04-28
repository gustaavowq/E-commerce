# 15 — MercadoPago Pix tem 3 pré-requisitos não-óbvios

## Sintoma

Backend chamava MP API corretamente, criava order com `status:
PENDING_PAYMENT`, mas `payment.gatewayId`, `pixQrCode`, `pixCopyPaste`
ficavam vazios. UI do `/orders/[id]` não mostrava QR.

## 3 erros distintos sobrepostos

Em sequência debugando o Kore Tech, bateu 3 erros do MP empilhados:

### 1) Env name mismatch
```
Error: MERCADOPAGO_TOKEN ausente ou placeholder em produção
```
Backend lia `env.MERCADOPAGO_TOKEN`, Railway tinha `MERCADOPAGO_ACCESS_TOKEN`.
Aceitar AMBOS:
```ts
function resolveToken(): string | undefined {
  return env.MERCADOPAGO_ACCESS_TOKEN ?? env.MERCADOPAGO_TOKEN
}
```

### 2) Token de TESTE em produção
```
401 Unauthorized · code:7 · "Unauthorized use of live credentials"
```
MP novo no Brasil entrega `APP_USR-...` em **ambos** os modos
(produção E teste). Os de "teste" exigem que `payer.email` seja de um
TESTUSER específico criado no painel do MP. As de produção (aba
**Credenciais de produção** no painel MP) funcionam com qualquer email
real. **Pra demo, usar credenciais de produção**.

### 3) Conta MP sem chave Pix cadastrada
```
400 · code:13253 · "Collector user without key enabled for QR render"
```
Pra emitir QR Pix, a conta MP do recebedor precisa ter pelo menos uma
**chave Pix** vinculada (CPF, email, telefone, ou aleatória). Sem
chave, MP não gera QR.

## Checklist pré-deploy MP

Antes de marcar Pix como funcional em produção:

- [ ] Chave Pix cadastrada na conta MP (verificar app/painel MP)
- [ ] Token de PRODUÇÃO (aba "Credenciais de produção", não teste)
- [ ] Env var `MERCADOPAGO_ACCESS_TOKEN` no Railway (canônico),
      `MERCADOPAGO_PUBLIC_KEY` também (pra checkout transparente futuro)
- [ ] Webhook URL configurado no painel MP: `<backend>/api/webhooks/mercadopago`
- [ ] Smoke test: criar pedido via API com email real `@gmail.com` (não
      `.test`), CPF válido — confirmar que retorna `gatewayId` (não-mock)
      + `pixQrCode` (3-4KB base64) + `pixCopyPaste` (~170 chars)

## Erros conhecidos = pré-requisito faltando

| Erro MP | Causa |
|---|---|
| `code:7 Unauthorized use of live credentials` | Token de teste com payer não-TESTUSER, OU app não homologada |
| `code:13253 Collector user without key enabled for QR render` | Falta chave Pix cadastrada na conta |
| `400 payer.email must be a valid email` | Email com TLD inválido (`.test`, `.local`) |

## Prevenção

- DevOps deve incluir o checklist acima no playbook de deploy de qualquer
  e-commerce do framework.
- Backend `lib/mercadopago.ts` deve aceitar **ambos** os env names
  (legacy `MERCADOPAGO_TOKEN` e canônico `MERCADOPAGO_ACCESS_TOKEN`).
- Ver [[50-PADROES/mercadopago-pix-checklist]] (template).
