# 25 — Vercel free tier tem 100 deploys/dia (rate limit duro)

## Sintoma

Após batch grande de commits (~10+ pushes em sequência rápida), `vercel deploy --prod` retorna:

```
Error: Resource is limited - try again in 24 hours
(more than 100, code: "api-deployments-free-per-day").
```

Push em main não dispara auto-deploy. CLI manual também bloqueado.

## Causa raiz

Vercel **Hobby (free) plan** tem 100 deployments per day por team. Inclui:
- Auto-deploys via Git push
- Manual `vercel --prod` ou `vercel deploy` via CLI
- Builds que falharam contam (não economiza)
- Resets em 24h sliding window (não meia-noite)

## Como detectar antes

Antes de batch grande, rodar:
```sh
vercel ls 2>&1 | head -20
```
Conta deploys das últimas 24h. Se já tem 70+, ESPERAR ou agrupar commits.

## Estratégia de mitigação

### A) Batch commits no main thread (não 1-commit-por-fix)
Quando 5+ agents disparados em paralelo, esperar TODOS terminarem ANTES de cada um pushar. Tech-lead consolida em **1 commit grande** ao invés de 5 separados. Reduz pressão na quota.

### B) Skip Vercel auto-deploy em commits "trivial" (docs, memória)
Adicionar em `vercel.json`:
```json
{
  "git": {
    "deploymentEnabled": {
      "main": true
    }
  }
}
```
e usar `[skip vercel]` em commit message pra commits que não precisam build (docs/, memoria/, etc).

### C) Migrate to Vercel Pro ($20/team/month) se atinge limit toda semana
Pro tem 6000 deploys/mês = ~200/dia. Mais que suficiente.

### D) Self-hosted preview server
Pra branches temporárias, rodar `next dev` ou Docker container em VPS. Vercel só pra prod.

## Caso real

Kore Tech 2026-04-28: durante redesign painel, dispatched 6 agents em paralelo. Cada um commitou + pushou 1x. Mais 6 commits do main thread. Total ~12-15 deploys nessa sessão. Combinado com deploys da loja (também em mesmo team), total bateu 100. Hit quota com 1 commit pendente (`/builds` stub fix).

Workaround: aguardar ~6h pro reset OR upgrade. Optei por documentar pro próximo projeto saber.

## Prevenção

- Em todo kickoff de novo projeto: avisar Gustavo sobre o limit antes de dispatcheamentos paralelos pesados
- Em projetos do framework: setar `[skip vercel]` em commits de `memoria/` e `docs/`
- Em refactor grande: tech-lead **consolida** N agent commits em 1 commit master final, ao invés de pushar cada um
- Em rate limit batido: aguardar 6-24h, não tentar workaround que pode quebrar coisa

## Padrões relacionados
- [[../50-PADROES/painel-admin-tier-1]] — checklist do painel
- [[23-sub-agents-token-limit]] — outro tipo de rate limit (API tokens)
