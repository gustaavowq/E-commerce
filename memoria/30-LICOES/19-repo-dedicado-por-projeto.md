# 19 — Repo dedicado por projeto > monorepo subpath

## Sintoma

Tentando deployar Kore Tech do monorepo (`gustaavowq/E-commerce` com
código em `src/projeto-tech/kore-tech/{backend,frontend,dashboard}/`),
bati em 4 problemas em sequência:

1. Vercel não auto-deploya a partir de subpath sem rootDirectory
   configurado no projeto. Push em main = nada.
2. Railway perdeu source GitHub quando rootDirectory tinha caminho
   longo (5 deploys FAILED em sequência).
3. `vercel git connect` exigia path no Vercel project — instalou mas
   build falhou (não achou package.json no root do clone).
4. Mesmo com tudo configurado, qualquer mudança no monorepo dispara
   build em **todos** projetos Vercel ligados, não só no que mudou.

## Causa raiz

Plataformas de deploy (Vercel, Railway) tratam **repo = projeto**
nativamente. Subpath de monorepo é caso suportado mas **frágil**:
exige config em vários lugares, build cache cruzado, paths longos no
sed/grep.

## Fix — repo dedicado plano

Cada projeto do framework vira **seu próprio repo Git**. Estrutura
interna sem subpaths intermediários:

```
gustaavowq/E-commerce-tech/
├── README.md
├── .gitignore
├── .env.example
├── backend/
├── frontend/
├── dashboard/
└── infra/
```

Vantagens:

- Vercel `rootDirectory = frontend` (1 nível, óbvio)
- Railway `rootDirectory = backend` (idem)
- Push em main = deploy automático nos 3 serviços (loja Vercel + painel
  Vercel + backend Railway), sem mexer em mim
- Cache de build não cruza projetos
- README do projeto fica no root, fácil de encontrar
- Cada projeto pode ter ciclo de vida independente

## Migração (caso já esteja em monorepo)

1. `gh repo create gustaavowq/E-commerce-[slug] --private`
2. `git clone <novo-repo>`; copiar `src/projeto-X/[slug]/{backend,frontend,...}`
   pra root do clone (sem o subpath)
3. `git add . && git commit -m "init"; git push -u origin main`
4. Vercel/Railway: criar projetos novos linkados ao repo novo
5. No repo monorepo antigo: `git rm -rf src/projeto-X/[slug]`,
   commitar removeção. Outros projetos continuam intactos.

## Prevenção

- **Em todo kickoff de novo e-commerce do framework**: criar repo Git
  dedicado ANTES de codar. Padrão de nome: `gustaavowq/E-commerce-[slug]`.
- Documentar no `projetos/[slug]/README.md`: repo URL, Vercel project
  IDs, Railway project ID.
- Atualizar [[10-PLAYBOOKS/kickoff-novo-ecommerce]] com esse passo.
