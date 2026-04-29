# Auditoria UX - Loja + Painel (Miami Store)

DE: 02-designer + 03-frontend
PARA: 00-tech-lead
DATA: 2026-04-26
URLs auditadas: loja Vercel, painel Vercel, código `src/dashboard` e `src/frontend`

---

## ALTO IMPACTO / FÁCIL DE IMPLEMENTAR (priorize estes)

1. **[painel/notif] Som + toast quando entra pedido novo.** Por quê: lojista não vai ficar atualizando F5. Como: polling 30s no `adminDashboard.summary`, comparar ordersToday, dispara `new Audio('/ding.mp3')` + toast "Novo pedido #1234 - R$ 290".
2. **[painel/sidebar] Badge de contagem em "Pedidos" (PENDING_PAYMENT + PREPARING).** Por quê: hoje precisa clicar pra saber se tem pedido parado. Como: query leve `summary.pendingActions`, badge vermelho/amarelo no `Sidebar.tsx`.
3. **[painel/produtos] Filtros: marca, categoria, estoque (zerado/baixo/ok), destaque, busca por nome/SKU.** Hoje só tem ativo/inativo. Como: query string + chips horizontais (mesmo padrão dos pedidos).
4. **[painel/produtos] Bulk actions: ativar/inativar em massa, marcar destaque.** Checkbox por linha + barra flutuante "3 selecionados [Inativar] [Destaque]".
5. **[painel/pedidos] Imprimir etiqueta/declaração de conteúdo (1 pedido).** PDF simples com endereço + itens. Caixinha do lojista vai amar.
6. **[painel/pedidos] Email automático ao mudar status.** "Pedido enviado, código AA123". Hoje muda status mas cliente não fica sabendo.
7. **[painel/pedidos] Timeline visual do pedido** (comprou > pago > separação > enviado > entregue) com data em cada etapa, no detalhe. Substitui os 3 botões soltos.
8. **[loja/checkout] Cupom NÃO aparece no checkout.** Vi `CheckoutFlow.tsx`, não tem campo de cupom. Crítico - cliente que recebe cupom no IG não consegue aplicar. Adicionar input "Tem cupom?" colapsável.
9. **[loja/PDP] Quantidade no botão "Adicionar".** Hoje sempre adiciona 1; quem quer 2 do mesmo precisa adicionar duas vezes.
10. **[loja/cart] Salvar cupom + aplicar no carrinho** antes do checkout (mostrar desconto já no resumo).
11. **[loja/PDP] "Frete grátis acima de R$ X" - barra de progresso no carrinho.** Lojista já configurou `freeShippingMinValue` mas não exibe. "Faltam R$ 32 pra frete grátis" converte muito.
12. **[loja/home] Trust signals do rodapé subir pro Hero**: selo "Site seguro", "Compra protegida", bandeiras de pagamento. PaymentBadges existe mas só no Footer.
13. **[loja/PDP] Compartilhar produto (WhatsApp, copiar link).** Botão simples ao lado do coração. Vendedor passa link pro cliente o tempo todo.
14. **[painel/dashboard] Gráfico comparativo "vs período anterior"** sobreposto no LineChart. KPIs já tem `change`, mas gráfico não - cliente quer ver curva.
15. **[painel/empty-states] Empty state de produtos diz "Bora cadastrar" mas sem dica de "comece importando do CSV / colando do Bling". Adicionar 2-3 atalhos.
16. **[loja/PLP] Sort visível**. Filters.tsx tem sort? Confirmar - se não tem dropdown "Mais novo / Menor preço / Mais vendido", adicionar.
17. **[loja/PDP] Avaliações com estrelas no topo** (já tem ProductReviews mas embaixo). Subir resumo "4.8 (32 avaliações)" perto do nome.

## ALTO IMPACTO / MÉDIO ESFORÇO

18. **[painel/produto-form] SEO fields** (meta title, meta description, OG image). Hoje produto não tem. Mata orgânico.
19. **[painel/produto-form] Tabela de medidas estruturada**. Hoje é JSON (vi no PDP renderizando measureTable). Form com linhas: tamanho | busto | cintura | comprimento.
20. **[painel/produto-form] Tags livres** (#novidade, #queima, #verao). Vira filtro na loja.
21. **[painel/produto-form] Upload de imagem real** (drag&drop, S3/Cloudinary). Hoje pede URL - lojista não-técnico não usa.
22. **[painel/cupons] Métricas: receita gerada pelo cupom, ticket médio, quantos converteram.** Hoje só "usedCount".
23. **[painel/cupons] Duplicar cupom** (botão clone). Cria PIXFIRST10, depois quer PIXFIRST15 - reescrever tudo é dor.
24. **[painel/clientes] Perfil do cliente** (link `/customers/${id}` aparece na ordem mas não tem página de listagem - confirmar). Histórico de pedidos, LTV, último pedido.
25. **[loja/PDP] "Quem comprou X também levou Y"** (cross-sell). Backend já tem categoria/marca - basta query "mais vendidos da mesma categoria".
26. **[loja/cart] Carrinho salvo entre devices** (já tem `clearServerCart` - falta sync ao logar). "Você deixou X no carrinho ontem".
27. **[loja/checkout] Resumo dos itens com miniatura sticky no mobile** durante checkout. Hoje some.
28. **[loja] WhatsApp opt-in pós-compra** ("avisar pelo zap quando enviar?"). Drive ENORME de retenção.
29. **[loja/home] Newsletter capture** (popup soft após 30s ou exit-intent). "Cupom de 5% pra primeira compra".
30. **[painel/dashboard] Top clientes** (LTV) - quem devo cuidar.
31. **[painel/dashboard] Produtos sem foto / sem descrição** card de alerta (afeta conversão).

## MÉDIO IMPACTO / FÁCIL

32. **[painel/pedidos] Coluna "última atualização"** + ordenação. Quem tá parado há mais tempo subir.
33. **[painel/produtos] Mostrar miniatura da imagem na linha**. Hoje só nome - cansa.
34. **[loja/PLP] Skeleton enquanto carrega** (já tem em outros lugares, faltou aqui).
35. **[loja/PDP] Breadcrumb com categoria/marca clicável.**
36. **[painel/settings] Validação visual do WhatsApp** ("teste o link" abre wa.me).
37. **[painel/settings] Preview do logo/favicon** ao colar URL.
38. **[loja/header] Anúncio fino no topo** ("FRETE FIXO R$15 BRASIL TODO · PIX 5% OFF") - PromoStrip existe? Subir prominência.
39. **[loja/footer] Selo "Loja segura SSL", política de troca em destaque com ícone.**
40. **[painel] Atalho "?" abre lista de hotkeys** (G+P produtos, G+O pedidos, N novo).

## EXTRA (se sobrar tempo de pensar)

41. **Onboarding do lojista** (5 passos: completar settings, cadastrar 1 produto, criar cupom, conectar zap, primeiro pedido) - barra de progresso na home do painel.
42. **Onboarding do cliente** primeira visita: tooltip "passa o mouse pra ver cores", explicar Pix.
43. **Modo "Apresentação"** do painel pra mostrar pra investidor (esconde dados sensíveis).
44. **Dark mode no painel** (lojista usa de noite).
45. **Exportar relatório PDF** (receita, top produtos) - mandar pro contador.
46. **Integração Bling/Tiny** import produtos.
47. **Webhook outbound** ("quando entra pedido manda pra Zapier").
48. **Frete real (Correios API + Melhor Envio)** em vez de fixo.
49. **PIX copia-e-cola + QR na tela de obrigado** (verificar se já tem - se não, crítico).
50. **Pixel Meta + GA4** events (purchase, add_to_cart) - lojista vai querer rodar ads.

---

**Resumo executivo pro tech-lead:** painel já tem fundação sólida (KPIs, alertas, funil) mas falta a "vida" do dia-a-dia: notificação de pedido novo, badge no menu, filtros/bulk em produtos, etiqueta/email automático em pedidos. Loja peca em 3 conversões: cupom no checkout (CRÍTICO - implementar agora), barra de frete grátis, e cross-sell na PDP. Itens 1-17 são fáceis e mexem ponteiro.
