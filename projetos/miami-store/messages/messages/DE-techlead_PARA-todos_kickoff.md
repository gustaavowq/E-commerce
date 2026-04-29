# De: Tech Lead
# Para: Todos os Agentes
# Data: Início do projeto
# Assunto: Kickoff — E-Commerce Platform
# Prioridade: Alta

## Contexto
Iniciando o projeto. Este é o alinhamento inicial para todo o time.

## Ordem de execução das primeiras entregas

### Semana 1 — Fundação (sem essa base, nada avança)

**Designer (Agente 02) — PRIMEIRO**
- Entregue o design system completo em `docs/design/design-system.md`
- Sem isso, o Frontend não começa

**Backend (Agente 01) — EM PARALELO COM DESIGNER**
- Crie o schema Prisma completo em `src/backend/prisma/schema.prisma`
- Configure as rotas base e middleware de auth
- Documente contratos de API em `docs/api-contracts.md`

**DevOps (Agente 05) — EM PARALELO**
- Suba o `docker-compose.yml` funcional em `src/infra/`
- Garanta que `docker-compose up` sobe tudo sem erros

### Semana 2 — Produto

**Frontend (Agente 03) — APÓS design system + schema prontos**
- Implemente a loja: home, listagem, produto, carrinho, checkout

**Data Analyst (Agente 04) — APÓS endpoints do backend**
- Valide os KPIs e aprove os endpoints de dashboard
- Documente métricas aprovadas em `docs/kpis.md`

### Semana 3 — Qualidade

**QA (Agente 06) — DURANTE E APÓS as features**
- Inicie testes de API assim que o Backend terminar cada endpoint
- Testes E2E após Frontend completar cada fluxo

## Regra do time
Qualquer bloqueio: crie mensagem em `shared/messages/` imediatamente.
Não espere a próxima reunião. Não resolva sozinho se depende de outro agente.

## Próximo passo esperado
Cada agente confirme que leu este kickoff criando um arquivo:
`shared/messages/CONFIRMACAO-{agente}_inicio.md`
