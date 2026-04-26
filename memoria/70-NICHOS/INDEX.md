# Templates de Nicho

> Variações dos modelos canônicos por vertical. Use o template do nicho do cliente como base, adapta o resto.

## Disponíveis

- [[moda-roupas]] — roupas, calçados, acessórios (Miami Store)
- [[eletronicos]] — celulares, tablets, periféricos
- [[alimentacao]] — comida, bebida, suplementos
- [[beleza]] — cosméticos, perfumaria, skincare
- [[casa-decoracao]] — móveis, decoração, utensílios
- [[infantil]] — brinquedos, roupas infantis, escolar
- [[pet]] — produtos pra animais
- [[esportes]] — equipamento, suplemento, vestuário esportivo

## Como usar

1. Cliente diz nicho específico
2. Tech Lead abre o template correspondente (input pra **Fase 0 — Pesquisa de nicho** do kickoff)
3. Tech Lead complementa com pesquisa fresca (concorrentes, jargão, regulação) — ver [[../50-PADROES/pesquisa-nicho-template]]
4. Template diz:
   - Quais campos do schema variam (size → voltagem? sabor?)
   - Que páginas extras a loja precisa (ex: alimentação precisa de "tabela nutricional")
   - Que filtros são essenciais (ex: pet precisa de "tamanho do animal")
   - Que KPIs específicos vão no painel
   - Trust signals do nicho (ex: alimentação: "validade", "armazenamento")
   - Integrações típicas (ex: Correios pra peso, Mercado Envios)

5. Adapta o que for específico, mantém todo o resto canônico.

## Acumulação entre projetos (obrigatória)

Após **cada projeto** deployado, Tech Lead atualiza o template do nicho com:

- **Concorrentes novos** descobertos na pesquisa (não estavam aqui)
- **Jargão novo** que apareceu (cliente usou termos específicos)
- **Integrações pedidas** pelo cliente (vira opção pro próximo)
- **Pains** que apareceram no pós-venda (não previmos)
- **Cupons que performaram** melhor (vira default pro nicho)
- **Bugs específicos do nicho** (vira lição em `30-LICOES/`)

**Por que é obrigatório:** sem isso, projeto N+1 do mesmo nicho parte do mesmo ponto que o N. Com isso, cada projeto deixa a máquina mais inteligente.

Exemplo prático: se Miami Store (1º) descobriu que "selo de autenticidade" é trust signal crítico pra moda premium revenda, esse aprendizado fica em `moda-roupas.md` e o 2º cliente do mesmo nicho já nasce com isso no brief.

## Princípio

**O e-commerce é 80% igual em todo nicho.** As variações são:
- Atributos do produto (size, color, voltagem, sabor, etc)
- Faixa de preço (afeta se cabe parcelar, frete grátis, etc)
- Informações extras (tabela nutricional, manual técnico, dimensões)
- Filtros essenciais
- Cross-sell/upsell típicos

Layout, auth, checkout, painel — tudo igual.

## Quando criar template novo

Se o nicho NÃO estiver na lista acima, criar arquivo novo seguindo o template:

```markdown
# Nicho: [nome]

## Brief típico do cliente
- Faixa de preço: ...
- Cliente típico: ...
- Sazonalidade: ...

## Schema adaptations
- ProductVariation.size → ...
- ProductVariation.color → ...
- Product.measureTable → ...
- Product.tags sugeridas: ...

## Filtros essenciais (loja)
- ...

## KPIs específicos (painel)
- ...

## Trust signals do nicho
- ...

## Integrações típicas
- ...

## Cross-sell/upsell padrão
- ...

## Exemplos de produto pro seed
- ...
```
