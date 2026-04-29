# 📁 Projetos

Pasta onde cada e-commerce que a gente cria vive inteiro: docs **e** código.

## Como funciona

Cada projeto = uma subpasta auto-contida com tudo dentro:

```
projetos/[slug]/
├── README.md                ← visão geral, status, URLs
├── COMO-FUNCIONA.md         ← explicação didática das peças
├── JORNADA.md               ← cronologia do que foi feito
├── DECISOES-ESPECIFICAS.md  ← diferenças do template padrão
├── DEPLOY.md                ← Railway + Vercel passo-a-passo
├── .env                     ← segredos (gitignored)
├── .env.example
├── brand-brief.md
├── design/                  ← logo, tokens
├── assets/
│
├── backend/                 ← Express + Prisma + JWT
├── frontend/                ← Next.js 14 (loja)
├── dashboard/               ← Next.js 14 (painel admin)
└── infra/                   ← docker-compose + nginx
```

**Tudo do projeto fica aqui.** Nada de `src/` no root, nada de `.env` solto na raiz. Memória/skills/playbooks reusáveis ficam em `memoria/` e `.claude/skills/` (framework, fora do projeto).

## Projetos atuais

- [`miami-store/`](miami-store/) — primeiro projeto, e-commerce de roupas/calçados de marca (Lacoste, Nike, Adidas, Tommy)

## Quando criar projeto novo

Tech Lead cria nova subpasta seguindo o template do Miami Store. Sequência completa em `memoria/10-PLAYBOOKS/kickoff-novo-ecommerce.md`.

E aponta da `memoria/` pra cá quando relevante (ex: nicho registrado em `memoria/70-NICHOS/[nicho].md`).
