# 📋 Template — STATUS do projeto

> Tech-lead copia este template pra `projetos/[slug]/STATUS.md` no kickoff.
> Atualiza a cada fase fechada. Fica como dashboard vivo do projeto.

---

# Status — [Nome do projeto]

> Slug: `[slug]` · Nicho: `[nicho]` · Repo: `[github.com/gustaavowq/...]`
> Iniciado: `YYYY-MM-DD` · Atualizado: `YYYY-MM-DD HH:MM` por `[skill]`

## Fase atual

**[N — Nome da fase]** — [1 frase do que está acontecendo agora]

## Gates aprovados

Reuso de [[../../memoria/05-PROCESSO/GATES]]. Marcar binário.

- [ ] Gate 0 — Pesquisa nicho
- [ ] Gate 0.5 — Proposta validada (user diz "sim")
- [ ] Gate 1 — Setup repo
- [ ] Gate 2 — Design (user "aprovado")
- [ ] Gate 3 — Backend
- [ ] Gate 4 — Frontend
- [ ] Gate 5 — Painel admin
- [ ] Gate 6 — Audits 3 vetores
- [ ] Gate 7 — Deploy
- [ ] Gate 8 — Aprendizado

## Bugs abertos

| # | Título | Severidade | Arquivo | Atribuído | Origem (audit/manual) |
|---|---|---|---|---|---|
| 1 | exemplo: Filtros mobile empilham | alto | `frontend/.../page.tsx:42` | frontend | mobile-27pt |

## Decisões pendentes do user

- [ ] Logo SVG (recebido por email?)
- [ ] Domínio custom ou `.vercel.app`?
- [ ] Cupom de boas-vindas — % desconto?

## URLs

- **Loja:** `https://...`
- **Painel:** `https://...`
- **Backend:** `https://...railway.app`
- **DB:** Railway PostgreSQL
- **Repo:** `https://github.com/gustaavowq/...`

## Credenciais (refs, NÃO valores)

- MercadoPago: conta framework (ver [[../../reference_credenciais_kore_tech]])
- Cloudinary: conta framework
- Vercel: org Gustavo
- Railway: org Gustavo

## Próxima ação clara

[1 frase: "Despachar designer pra brand-brief" / "Validar 3 fluxos auth em prod" / etc]

## Métricas correntes

- Mensagens user↔assistant: `N` / 15
- Commits: `N`
- Deploys Vercel hoje: `N` / 100
- Bugs críticos abertos: `N` / 0

## Débitos técnicos (// DEBT)

Reuso da regra anti-débito do [[../../memoria/05-PROCESSO/GATES]].

- [ ] DEBT: [hash do commit] — [reason]

## Inovações desta iteração

> Coisas inéditas que viraram padrão pro próximo. Atualizar no gate 8.

- ...

## Bugs descobertos (vão pra `30-LICOES/`)

> Atualizar no gate 8.

- ...

---

## Como usar

1. **No kickoff** — copia este template pra `projetos/[slug]/STATUS.md`, preenche campos `[]`
2. **A cada fase fechada** — checa o gate, atualiza fase atual + próxima ação + métricas
3. **Audit retorna bugs** — popula tabela "Bugs abertos"
4. **Gate 8 (aprendizado)** — preenche "Inovações" e "Bugs descobertos", joga lições novas em `30-LICOES/`
5. **Projeto entregue** — STATUS vira documento histórico do projeto

## Por que isso importa

Sem dashboard, tech-lead perde estado. Despacha skill 2 vezes pra mesma coisa, esquece bug aberto, anuncia "no ar" sem rodar smoke E2E. **Dashboard = single source of truth do projeto em andamento.**
