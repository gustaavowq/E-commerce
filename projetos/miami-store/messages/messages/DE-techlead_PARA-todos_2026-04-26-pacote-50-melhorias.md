# DE: Tech Lead | PARA: TIME | Data: 2026-04-26

## Ordem de serviço — pacote de 41 melhorias UX

Cliente aprovou implementação dos 50 insights do agente UX (relatório em
`DE-design-frontend_PARA-techlead_2026-04-26-ux-insights.md`).

9 itens dependem de serviços externos (Cloudinary, Resend, Meta Pixel,
Correios, Bling) — ficam fora desta rodada, vão pro DEPLOY.md.

41 itens distribuídos em 3 frentes paralelas.

## Restrições importantes

- **NÃO mexer em arquivos de outras frentes** (lista abaixo). Conflito de merge atrasa.
- **typecheck zerado** no fim de cada frente é obrigatório
- **commit no final de cada frente** com mensagem descritiva
- Tech Lead não vai mergear nada — cada agente faz tudo na branch main mesmo
- Em caso de bloqueio, deixar `// TODO:` e seguir o resto

## URLs ativas

- LOJA: https://e-commerce-kohl-five-85.vercel.app
- PAINEL: https://miami-painel.vercel.app
- API: https://e-commerce-production-cd06.up.railway.app
- Admin: admin@miami.store / aIKPI2GIp3Vx

## Frente 1 — 01-backend (endpoints e schema)
Arquivos: `src/backend/src/`, `src/backend/prisma/schema.prisma` (apenas adicionar campos)

## Frente 2 — Loja (conversão)
Arquivos: `src/frontend/src/`

## Frente 3 — Painel (produtividade)
Arquivos: `src/dashboard/src/`

## Excluídos (próxima rodada, dependem de externo)
- #21 Cloudinary upload, #6 Resend email, #50 Meta Pixel/GA4, #46 Bling/Tiny,
  #48 Correios API, #5 PDF etiqueta (precisa lib pesada), #43 modo apresentação,
  #44 dark mode painel, #40 hotkeys

Bora.
