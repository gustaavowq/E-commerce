# 🎨 Decisões específicas do Miami Store

> Coisas que escolhemos pro Miami Store que podem (ou não) repetir no próximo projeto. Diferenças do template padrão.

## Identidade da marca

| Item | Decisão |
|---|---|
| Nome | Miami Store |
| Nicho | Roupa/calçado de marca premium (revenda autorizada) |
| Cliente | B2C, 18–45 anos, urbano, Insta-driven |
| Faixa de preço | R$ 50–500 |
| Diferencial | "Original com preço justo" |
| Tom | Informal, jovem, direto, Insta-friendly |

## Paleta

```
primary-700:  #2E7D32  ← verde escuro (Lacoste-inspired)
primary-900:  #1B5E20  ← verde mais escuro (hover)
primary-50:   #E8F5E9  ← verde clarinho (background sutil)
accent:       #E11D48  ← vermelho promo / desconto
neon:         #C5E000  ← amarelo limão (highlight no dark hero)
ink:          #0A0A0A  ← preto principal do texto
ink-2:        #2D2D2D
ink-3:        #6B6B6B  ← texto secundário
ink-4:        #9E9E9E  ← texto terciário
border:       #E5E7EB
surface-2:    #F5F5F5  ← background de input/skeleton
whatsapp:     #25D366
```

## Voz da marca (regras absolutas)

- ❌ **Sem travessão `—`** em copy
- ❌ **Sem emoji** em UI/marketing (exceção: 🇺🇸 foi tirada do footer)
- ✅ "A gente" em vez de "nós"
- ✅ Frases curtas
- ✅ Pix com 5% off em destaque sempre
- ✅ "Original" e "vem com nota fiscal" repetido

## Marcas vendidas (cadastradas no banco)

1. Lacoste (foco principal — todos os 7 produtos do seed)
2. Nike
3. Adidas
4. Tommy Hilfiger
5. Polo Ralph Lauren

## Categorias

1. Polos
2. Camisetas
3. Tênis
4. Bonés
5. Conjuntos Esportivos
6. Bermudas / Shorts
7. Jaquetas / Moletons
8. Calças
9. Acessórios

## Produtos seed (7)

1. Polo Lacoste Sport Branca
2. Polo Lacoste Vermelha
3. Tênis Lacoste Marinho com Branco
4. Tênis Lacoste Preto com Vermelho
5. Boné Lacoste Clássico
6. Conjunto Lacoste Tactel
7. Camiseta Lacoste Jacaré Estampado

Todos com fotos reais em `projetos/miami-store/frontend/public/products/`.

## Cupons seed (2)

| Código | Tipo | Valor | Min | Limite |
|---|---|---|---|---|
| `PIXFIRST` | PERCENT | 5% | sem | 1× por user |
| `FRETE10` | FREE_SHIPPING | — | sem | 1× por user |

## Integrações específicas

✅ **MercadoPago** com `TEST-xxx` token (sandbox — Pix não cai dinheiro real)
⏳ **Cloudinary** configurado no código, falta env no Railway
❌ **Resend** não integrado (forgot-password só loga no console por ora)
❌ **Correios real** não — frete fixo R$ 15
❌ **Bling/Tiny** não — sem ERP integrado
❌ **Mercado Envios** não — ainda não conectado

## URLs em produção

| Componente | URL |
|---|---|
| Loja | https://e-commerce-kohl-five-85.vercel.app |
| Painel | https://miami-painel.vercel.app |
| API | https://e-commerce-production-cd06.up.railway.app |
| GitHub | https://github.com/gustaavowq/E-commerce |

## Credenciais

```
Admin painel:
  Email:  admin@miami.store
  Senha:  aIKPI2GIp3Vx
```

⚠️ **Senha admin atual é fraca** (12 chars sem special char). Trocar quando puder.

## Docs do template padrão (vão pra qualquer e-commerce)

- [`memoria/`](../../memoria/00-INICIO.md) — toda memória reusável
- [`.claude/skills/ecommerce-*/`](../../.claude/skills/) — 9 skills do Claude Code (agentes)
- [`outros/shared/messages/`](../../outros/shared/messages/) — comunicação entre agentes (mensagens do projeto)

## O que é única do Miami Store (NÃO copia direto pro próximo)

- Brand-brief específico (Lacoste-inspired, voz informal)
- Seed com 7 produtos Lacoste
- Categorias de moda (Polos, Tênis, etc)
- URLs Vercel/Railway específicas

## O que é template (COPIA direto pro próximo)

- Schema do banco (User, Product, Order, Cart, Coupon, etc)
- Auth flow (JWT + refresh + reset)
- CSP headers config
- Estrutura de pastas
- Endpoints da API (90% reusam)
- Componentes da loja (Header, Footer, ProductCard, ProductImage, NewsletterPopup, etc)
- Componentes do painel (Sidebar, KpiCard, etc)
- Lições aprendidas (10 críticas)

## Lições do Miami Store que mudaram o template

Adicionei essas no template depois de descobrir aqui:

1. **`tsx` em `dependencies`** (não devDeps) — descoberto deployando
2. **CSP `connect-src` lista hosts** — descoberto post-deploy
3. **Não setar `COOKIE_DOMAIN` em Railway** — descoberto no smoke
4. **Não clicar em "Suggested Variables" do Railway** — descoberto durante setup
5. **Senha admin: validar com Zod no seed** — descoberto no pentest

Próximo e-commerce já vai nascer sem essas armadilhas.
