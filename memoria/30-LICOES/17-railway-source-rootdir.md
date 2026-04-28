# 17 — Railway service perde source GitHub se rootDirectory invalida

## Sintoma

Após push, deployments do Railway começavam com status `FAILED` antes
mesmo de rodar build. Mensagem do agente Railway:

```
Could not find root directory: src/projeto-tech/kore-tech/backend
Last successful deployment was connected to gustaavowq/E-commerce
on the main branch
All 5 subsequent deployments failed with repo: null, branch: null,
commitHash: null
```

## Causa raiz

O service `kore-tech-backend` no Railway estava com Source =
`gustaavowq/E-commerce` (monorepo). Quando o repo GitHub mudou
(commits, ou caminho do code), Railway perdeu a referência do
rootDirectory e os deploys subsequentes vieram sem build associado
(repo: null).

E quando o user trocou o Source pra `gustaavowq/E-commerce-tech` (repo
novo dedicado), esqueceu de atualizar o **Root Directory** que ainda
estava `src/projeto-tech/kore-tech/backend` (caminho do monorepo
antigo). No repo novo a estrutura é plana, então Root Directory
correto é simplesmente `backend`.

## Fix

No Railway dashboard:
1. Service → Settings → Source
2. **Disconnect** repo atual
3. **Connect Repo** → seleciona o repo certo
4. **Root Directory**: caminho relativo ao root do repo (ex:
   `backend` se for repo dedicado plano)
5. Branch `main`
6. Save

Pra `railway up` funcionar (sem GitHub), o source precisa estar
configurado mesmo assim — Railway valida mesmo quando upload é via
CLI.

## Prevenção

- Em **repo dedicado por projeto** (ver [[19-repo-dedicado-por-projeto]]),
  Root Directory fica curto (`backend`, sem subpaths). Reduz drasticamente
  chance de erro.
- Documentar no `projetos/[slug]/README.md`:
  ```
  Railway:
    Project: surprising-luck
    Service: kore-tech-backend
    Source: gustaavowq/E-commerce-tech (branch main, root /backend)
  ```
- Ao migrar de monorepo, atualizar AMBOS source repo E rootDirectory
  no mesmo passo. Nunca um sem o outro.

## Custo

5 deploys FAILED em sequência no Kore Tech antes de descobrir, ~30 min
debugando logs Railway.
