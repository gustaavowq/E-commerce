# 16 — Vercel não auto-deploya monorepo se rootDirectory estiver errado

## Sintoma

`git push origin main` no monorepo não disparava deploy nos projetos
Vercel. Quando disparava, build falhava com:
```
npm error enoent ENOENT: no such file or directory, open
'/vercel/path0/package.json'
```

## Causa raiz

Em monorepo com path tipo `src/projeto-tech/kore-tech/frontend/`,
Vercel precisa do `rootDirectory` configurado **no projeto Vercel
(não no repo)**. Se faltar:
- Sem GitHub conectado: Vercel só deploya via CLI manual (`vercel
  --prod`). Push em main = nada.
- Com GitHub conectado mas rootDirectory errado: build falha porque
  Vercel clona o repo na raiz e não acha `package.json`.

`vercel.json` no projeto NÃO substitui `rootDirectory` — esse só vive
no painel Vercel ou via API `PATCH /v9/projects/:id`.

## Fix

Via Vercel REST API (dá pra fazer programaticamente):

```ts
const headers = {
  Authorization: `Bearer ${VERCEL_TOKEN}`,
  'Content-Type': 'application/json',
}
await fetch(`https://api.vercel.com/v9/projects/${projectId}?teamId=${teamId}`, {
  method: 'PATCH',
  headers,
  body: JSON.stringify({ rootDirectory: 'src/projeto-tech/kore-tech/frontend' }),
})
```

Ou via UI: projeto → Settings → General → Root Directory.

## Solução melhor: repo dedicado por projeto

Em vez de subpaths longos, **cada projeto do framework tem seu próprio
repo GitHub**. Estrutura plana:

```
gustaavowq/E-commerce-tech/
├── backend/
├── frontend/
├── dashboard/
└── infra/
```

Vercel rootDirectory vira `frontend` (1 nível, fácil). GitHub conectado
+ push em main = deploy automático nos 3 serviços (loja, painel, backend).

Ver [[19-repo-dedicado-por-projeto]] pra detalhes.

## Prevenção

- Em **todo kickoff de novo e-commerce**: criar repo Git dedicado ANTES
  de codar (`gustaavowq/E-commerce-[slug]`).
- Documentar no `projetos/[slug]/README.md`: repo URL, Vercel project
  IDs, Railway project ID.
- Se for migrar de monorepo: usar `vercel git connect <url>` + setar
  `rootDirectory` via API antes de empurrar primeiro commit.
