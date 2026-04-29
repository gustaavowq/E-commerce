# 🛒 E-Commerce Multi-Agent Framework

> Framework pra criar e-commerce completo (loja + painel admin + API + deploy) em **≤ 4 horas** pra qualquer nicho — usando 9 agentes Claude Code orquestrados.

Cada projeto vive **inteiro dentro de `projetos/[slug]/`**: código, docs, `.env`, deploy. Framework genérico (memória, skills, mensagens) fica fora do projeto.

## 📁 Estrutura

```
ecommerce-agents/
├── CLAUDE.md             ← entry point dos agentes (Claude Code lê do root)
├── README.md             ← este arquivo
├── .gitignore
│
├── .claude/skills/       ← 9 skills (1 por agente Senior)
├── memoria/              ← decisões, lições, playbooks, padrões, nichos
├── outros/               ← shared/messages, docs técnicas, scripts
└── projetos/
    └── miami-store/      ← projeto auto-contido
        ├── README.md         ← como rodar este projeto
        ├── DEPLOY.md         ← Railway + Vercel passo-a-passo
        ├── .env / .env.example
        ├── backend/          ← Express + Prisma + JWT
        ├── frontend/         ← Next.js 14 (loja)
        ├── dashboard/        ← Next.js 14 (painel admin)
        └── infra/            ← docker-compose + nginx
```

## 🚀 Como começar projeto novo

Diga: **"vamos criar e-commerce de [nicho]"** → o Claude Code invoca `ecommerce-tech-lead` que pesquisa o nicho, propõe identidade e dispara as 8 skills em paralelo.

Detalhes do fluxo: ver [`CLAUDE.md`](./CLAUDE.md).

## 🏃 Rodar um projeto local

Cada projeto se documenta. Exemplo Miami:

```bash
cd projetos/miami-store
cp .env.example .env       # preencha valores reais
cd infra
docker compose up -d
```

Veja [`projetos/miami-store/README.md`](./projetos/miami-store/README.md) pra detalhes.

## 🧠 Memória (Obsidian)

A pasta `memoria/` **é um vault Obsidian** (`.obsidian/` está dentro). Abra-a no Obsidian pra navegar com graph view, links e tags.

## 🤝 Contribuição

Quando aprender algo novo no decorrer de um projeto:
- Bug novo → `memoria/30-LICOES/`
- Padrão novo → `memoria/50-PADROES/`
- Nicho novo → `memoria/70-NICHOS/`

A memória reduz perguntas redundantes ao cliente — quanto mais rica, mais rápido o próximo.

## 📚 Projetos atuais

- [`miami-store/`](./projetos/miami-store/) — e-commerce de roupas/calçados de marca (Lacoste, Nike, Adidas, Tommy)
