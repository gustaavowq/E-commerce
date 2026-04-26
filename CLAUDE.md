# 🛒 E-Commerce Multi-Agent System

## Visão Geral
Este projeto demonstra um time de 7 agentes Senior trabalhando juntos para construir
uma plataforma de e-commerce completa com dashboard analítico para o lojista.

Cada agente possui seu próprio AGENT.md com identidade, responsabilidades e regras de comunicação.

## Estrutura de Pastas
```
ecommerce-agents/
├── CLAUDE.md                  ← Você está aqui (entry point do projeto)
├── README.md                  ← Como rodar em outro PC
├── .env.example               ← Variáveis de ambiente necessárias
│
├── agents/                    ← System prompts e regras de cada agente
│   ├── 00-tech-lead/          ← Líder e Orquestrador
│   ├── 01-backend/            ← Senior Backend Developer
│   ├── 02-designer/           ← Senior UI/UX Designer
│   ├── 03-frontend/           ← Senior Frontend Developer
│   ├── 04-data-analyst/       ← Senior Data Analyst
│   ├── 05-devops/             ← Senior DevOps Engineer
│   └── 06-qa/                 ← Senior QA Engineer
│
├── docs/                      ← Documentação técnica e de arquitetura
│   ├── architecture.md        ← Decisões de arquitetura
│   └── agent-communication.md ← Como os agentes se comunicam
│
├── shared/
│   └── messages/              ← Canal de comunicação entre agentes (arquivos .md)
│
└── src/                       ← Código-fonte gerado pelos agentes
    ├── backend/               ← APIs, banco de dados, lógica de negócio
    ├── frontend/              ← Loja virtual (cliente)
    ├── dashboard/             ← Painel admin do lojista
    └── infra/                 ← Docker, CI/CD, configs de deploy
```

## Como Usar Este Projeto no Claude Code

### 1. Ativar um agente específico
No terminal com Claude Code, referencie o AGENT.md do agente desejado:
```
claude --system-file agents/00-tech-lead/AGENT.md
```

### 2. Deixar o Tech Lead orquestrar tudo
```
claude agents/00-tech-lead/AGENT.md "Inicie o projeto de e-commerce do zero"
```

### 3. Comunicação entre agentes
Agentes deixam mensagens em `shared/messages/` no formato:
```
DE-{agente}_PARA-{agente}_YYYY-MM-DD.md
```

## Time de Agentes

| # | Agente | Foco Principal |
|---|--------|----------------|
| 00 | 🧠 Tech Lead | Orquestração, arquitetura, decisões macro |
| 01 | ⚙️ Backend Dev | APIs, banco de dados, pagamentos |
| 02 | 🎨 Designer | UI/UX, design system, wireframes |
| 03 | 💻 Frontend Dev | Loja, carrinho, checkout, painel |
| 04 | 📊 Data Analyst | KPIs, validação de dados, dashboard |
| 05 | 🔒 DevOps | Infra, deploy, CI/CD, segurança |
| 06 | 🧪 QA Engineer | Testes, edge cases, fluxos críticos |

## Stack Tecnológica (definida pelo Tech Lead)
- **Backend:** Node.js + Express + PostgreSQL
- **Frontend:** Next.js + TailwindCSS
- **Dashboard:** Next.js + Recharts
- **Infra:** Docker + Docker Compose
- **Pagamentos:** MercadoPago API
- **Auth:** JWT + bcrypt
