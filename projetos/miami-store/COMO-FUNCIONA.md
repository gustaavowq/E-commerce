# 🧩 Como funciona o Miami Store

> Explicação peça por peça, em português claro. Pra você entender o que cada coisa faz e como tudo se conecta.

## A ideia em 1 frase

Um site que vende produto, com painel admin que gerencia o que é vendido, conectados a um banco de dados, tudo rodando na nuvem.

---

## A grande divisão: 3 aplicações + 1 banco

Em vez de fazer tudo num programa só (que vira bagunça quando cresce), a gente dividiu em **3 aplicações que conversam entre si**, mais o **banco de dados** onde os dados ficam salvos.

```
┌─────────────────┐  ┌─────────────────┐
│   LOJA (site)   │  │  PAINEL (admin) │
│  cliente vê     │  │  dono gerencia  │
└────────┬────────┘  └────────┬────────┘
         │                    │
         │  pedem dados       │
         ↓                    ↓
       ┌─────────────────────────┐
       │      API (backend)      │
       │   recebe pedidos,       │
       │   busca/salva no banco  │
       └────────────┬────────────┘
                    │
                    ↓
            ┌──────────────┐
            │   BANCO DE   │
            │  DADOS (DB)  │
            └──────────────┘
```

### 1️⃣ Loja (Frontend)

**O que é:** o site que o cliente abre no navegador pra comprar.
**Pasta no código:** `projetos/miami-store/frontend/`
**Tecnologia:** Next.js 14 (um framework de React)
**O que faz:**
- Mostra produtos com fotos, preços, descrições
- Carrinho de compras
- Checkout (finalizar compra)
- Login/cadastro de cliente
- Páginas: home, sobre, contato, políticas

**Por que Next.js e não HTML puro?** Next.js gera HTML otimizado pro Google ranquear bem, faz o site abrir rápido, e é o padrão moderno pra e-commerce.

---

### 2️⃣ Painel admin (Dashboard)

**O que é:** o "escritório virtual" do dono da loja.
**Pasta no código:** `projetos/miami-store/dashboard/`
**Tecnologia:** Next.js 14 (mesma tecnologia da loja)
**O que faz:**
- Cadastrar/editar produtos (com upload de fotos)
- Ver pedidos recebidos e mudar status (pago → enviando → entregue)
- Criar cupons de desconto
- Ver dashboard com KPIs (vendas, ticket médio, top produtos, etc)
- Editar informações da loja (endereço, WhatsApp, políticas)

**Por que separado da loja?** Pra cliente não ter como acessar (é uma URL diferente, com login obrigatório de admin). E pra atualizar o painel sem afetar a loja.

---

### 3️⃣ API (Backend)

**O que é:** o "cérebro" do sistema. Loja e painel não falam direto com o banco — eles **pedem pra API**, que busca/salva.
**Pasta no código:** `projetos/miami-store/backend/`
**Tecnologia:** Express (servidor web em Node.js) + Prisma (acesso ao banco) + TypeScript
**O que faz:**
- Recebe requisições da loja ("me dá lista de produtos")
- Recebe requisições do painel ("salva esse produto novo")
- Valida tudo (senha forte? cupom existe? estoque suficiente?)
- Autentica usuário (login, JWT)
- Salva no banco
- Devolve resposta em JSON

**Por que separado?** Porque tanto a loja quanto o painel precisam dos mesmos dados. Uma API central evita duplicar lógica. Também: **segurança** — só a API tem acesso ao banco, não o navegador do cliente.

---

### 4️⃣ Banco de dados (PostgreSQL)

**O que é:** onde **tudo** que importa fica salvo permanentemente.
**Tecnologia:** PostgreSQL 16 (banco relacional, padrão da indústria pra e-commerce)
**O que tem dentro:**
- Tabela `users` (clientes + admins)
- Tabela `products` (catálogo)
- Tabela `product_variations` (cor + tamanho de cada produto)
- Tabela `orders` (pedidos)
- Tabela `order_items` (o que tem em cada pedido)
- Tabela `coupons`, `addresses`, `reviews`, `wishlist`, etc

**Por que PostgreSQL e não Excel?** Porque banco aguenta milhões de registros, tem buscas rápidas, garante que dois clientes não comprem o mesmo último produto ao mesmo tempo (transações), etc.

---

## Onde cada peça mora (ambientes)

A gente tem **2 ambientes diferentes**: seu PC (dev) e a nuvem (prod).

### 💻 Local (seu PC)

Pra você desenvolver e testar antes de mostrar pra ninguém.

| Peça | Como roda |
|---|---|
| Loja, Painel, API, Banco | Tudo dentro do **Docker** (programa que isola cada parte em "containers") |
| URL local | `miami.test`, `admin.miami.test`, `api.miami.test` (configurado no arquivo `hosts` do Windows) |
| Para acessar de fora do PC | **Cloudflare Tunnel** dá uma URL pública grátis tipo `https://xxx.trycloudflare.com` |

**Docker** é uma ferramenta que empacota cada serviço (loja, painel, API, banco) em uma "caixa" isolada. Vantagem: roda igual no seu PC, no PC do colega, e em qualquer servidor. Sem "no meu PC funciona".

**Nginx** é um "porteiro" que recebe a requisição (`http://miami.test/`) e decide pra qual serviço encaminhar (loja na porta 3000, painel na porta 3002, API na porta 3001).

### ☁️ Produção (nuvem)

O que tá no ar pro público ver. Aqui que mora a versão "de verdade":

| Peça | Plataforma | Por quê |
|---|---|---|
| API + Banco | **Railway** | Free tier US$5/mês de crédito, deploya direto do GitHub, tem Postgres incluso |
| Loja | **Vercel** | Free pra projetos Next.js, edge global (rápido em qualquer país), HTTPS automático |
| Painel | **Vercel** | Mesma coisa (projeto separado pelo Vercel) |
| Imagens dos produtos | **Cloudinary** | CDN otimizada (gera versão webp, redimensiona automático). 25k uploads grátis/mês |
| Pagamento | **MercadoPago** | Pix nativo, integração estável, mercado brasileiro |
| Email transacional | **Resend** (futuro) | Send confirmação de pedido, recuperar senha. 3k emails grátis/mês |

---

## GitHub: o "histórico" do código

**O que é:** site que armazena o código + todo histórico de mudanças.
**URL:** https://github.com/gustaavowq/E-commerce

**Por que importa:**
1. **Backup**: se seu PC quebrar, código tá lá
2. **Histórico**: dá pra voltar pra qualquer versão anterior
3. **Deploy automático**: Railway e Vercel **olham o GitHub** — toda vez que você dá `git push`, eles detectam e fazem deploy novo automático
4. **Colaboração**: outros devs podem clonar e contribuir

Por isso a gente faz `git push origin main` quando muda alguma coisa importante.

---

## Como tudo se conecta na vida real

Imagine que cliente abre `https://e-commerce-kohl-five-85.vercel.app`:

1. **Browser** → manda request pro **Vercel**
2. **Vercel** → serve o HTML/JS da **Loja** (Next.js)
3. **Loja no browser** → faz fetch pra `https://e-commerce-production-cd06.up.railway.app/products`
4. **Railway** → recebe na **API** (Express)
5. **API** → consulta o **PostgreSQL** (também no Railway)
6. **API** → devolve JSON dos produtos pra Loja
7. **Loja** → renderiza os cards na tela do cliente

Quando admin loga no painel:

1. Mesma coisa, mas no Vercel do **Painel**
2. Painel pede `/auth/login` pra API com email/senha
3. API valida, **devolve Set-Cookie** com JWT (token criptografado)
4. Próximas requests do painel levam o cookie automaticamente
5. API valida o cookie, autoriza acesso a `/admin/*`

---

## O que cada agente fez (resumão da nossa equipe)

| Agente | Função | O que entregou |
|---|---|---|
| 🧠 Tech Lead | Orquestrar | Brief, decisões, sintetizar reports, aprovar deploy |
| ⚙️ Backend | API | Schema do banco, rotas (auth, produtos, pedidos, admin), validações, integrações |
| 🎨 Designer | Marca | Paleta verde+amarelo (Lacoste-inspired), voz de marca (sem travessão, sem emoji), tom informal-jovem |
| 💻 Frontend | Loja + Painel | Header, cards, PDP, carrinho, checkout, painel completo, animações |
| 📊 Data Analyst | KPIs | Dashboard com receita, pedidos, top produtos, funil de conversão |
| 🔒 DevOps | Infra | Docker compose, Nginx, deploy Railway+Vercel, tunnels |
| 🧪 QA | Testes | Smoke E2E, pentest (achou JWT placeholder!), bug bash UX |

---

## O que VOCÊ faz (sua função)

Você não precisa programar pra ser dono do projeto. Suas funções principais:

### 1. Decisões de produto
- "Quero vender X também" → cria produto novo no painel
- "Quero promo do Black Friday" → cria cupom
- "Vou mudar a foto principal" → upload novo

### 2. Decisões de negócio
- "Quero domínio próprio agora" → me chama, eu te guio
- "Vou começar a vender com cartão" → me passa conta MP real
- "Quero começar a mandar email transacional" → conta Resend

### 3. Validar o que a IA fez
- Olhar o que apareceu na loja, sentir se tá bom
- Reportar bugs que você ver ("esse botão tá sumindo no celular")
- Aprovar ou rejeitar mudanças que eu sugiro

### 4. Trazer contexto que só você sabe
- "O cliente típico nosso é X"
- "Concorrente Y faz Z"
- "Em janeiro vende mais de A"

### O que eu NÃO consigo fazer sozinho
- Criar conta em serviço externo (Cloudinary, MercadoPago, Resend, registro.br) — você cria, me passa as credenciais
- Comprar domínio
- Configurar conta bancária pra receber pagamento
- Decisões de marca (qual cor exatamente, qual nome)
- Decisões legais (CNPJ, política fiscal, contratos)

---

## O que ainda falta (próximos passos)

### 🔴 Urgente (impacta vendas reais)

1. **MercadoPago real** — hoje tá `TEST-xxx` (sandbox). Pra Pix de verdade rodar:
   - Criar conta em mercadopago.com.br/developers
   - Pegar `Access Token` (formato `APP_USR-...`)
   - Substituir `MERCADOPAGO_TOKEN` no Railway

2. **Cloudinary** — você já criou! Só falta colar a env:
   - Railway → Variables → `CLOUDINARY_URL = cloudinary://384451914996587:...@daypgxhhg`
   - Aí o upload de foto no painel começa a funcionar

3. **Senha admin atual está fraca** (`aIKPI2GIp3Vx` — só 12 chars sem special char). Trocar por uma forte com special char.

### 🟡 Recomendado pro próximo nível

4. **Domínio próprio** — `miamistore.com.br` em registro.br (~R$ 40/ano). Fica profissional. Eu te guio na configuração DNS quando você comprar.

5. **Resend** (emails) — confirmação de pedido, "esqueci senha", "produto enviado". Free tier 3k/mês cobre demo.

6. **Foto real dos produtos** — hoje os produtos no Miami Store usam fotos da pasta `public/products/` (que vieram pré-cadastradas no projeto). Pra produtos novos com fotos reais, é só usar o upload Cloudinary.

### 🟢 Daqui a 6 meses (otimizações)

7. **Meta Pixel + GA4** — pra rodar anúncio Insta/Google e medir conversão
8. **Frete real Correios** — calcula com base em CEP+peso (hoje é R$ 15 fixo)
9. **Resend templates bonitos** — emails brandeados em vez de texto puro
10. **Backup automatizado do banco** — Railway tem export, pode automatizar

---

## Glossário rápido (termos técnicos)

| Termo | Tradução pra português |
|---|---|
| **Frontend** | Site que cliente vê |
| **Backend** | Servidor que processa as coisas |
| **API** | Sistema que recebe requests e devolve respostas (geralmente em JSON) |
| **Endpoint** | Uma URL específica da API (`/products`, `/auth/login`, etc) |
| **JWT** | Token criptografado que prova que você tá logado |
| **Cookie httpOnly** | Cookie que JavaScript não consegue ler (mais seguro) |
| **CSP** | Lista de quais sites o navegador pode acessar a partir da sua loja (segurança) |
| **CORS** | Quem pode chamar sua API (segurança cross-domain) |
| **Schema** | "Mapa" de quais tabelas e colunas existem no banco |
| **Migration** | Arquivo que muda o schema do banco de forma controlada |
| **Seed** | Script que popula o banco com dados iniciais (admin + produtos exemplo) |
| **Deploy** | Subir o código pra nuvem |
| **Build** | Processo de "compilar" o código pra rodar mais rápido |
| **Container** | "Caixa" do Docker que empacota um serviço + dependências |
| **CDN** | Servidor de conteúdo distribuído (Cloudinary é uma) |
| **Webhook** | URL que outro serviço chama quando algo acontece (MercadoPago avisa quando Pix é pago) |
| **TypeScript** | JavaScript com tipos (mais seguro, menos bugs) |
| **Prisma** | "Tradutor" entre código TS e banco SQL |
| **Tailwind** | Forma de fazer CSS rápido com classes utilitárias |
| **Zustand** | Biblioteca pra guardar estado global no React (carrinho, login) |
| **TanStack Query** | Biblioteca pra fazer requests com cache automático |

---

## Como aprender mais

Se quiser entrar mais a fundo (sem precisar programar):

- **YouTube**: "Como funciona um e-commerce moderno" (canais Filipe Deschamps, Rocketseat)
- **Documentação**: Próprio Vercel e Railway têm guias de iniciante muito bons
- **Próxima conversa**: pergunta o que tá curioso. Por exemplo, "como funciona o cookie httpOnly?" — explico em 3 frases sem jargão.
