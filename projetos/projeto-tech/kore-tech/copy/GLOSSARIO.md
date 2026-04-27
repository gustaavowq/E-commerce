# Glossário Kore Tech

> Termo técnico explicado pra quem nunca montou PC. Usado em `/glossario` (página dedicada), tooltips do Builder, e como base pros tooltips inline da PDP.
> Mantido pelo Copywriter (Agente 07). Última atualização: 2026-04-26.

**Como usar:**
- Cada termo tem 4 partes: o que é, tradução amigável, por que importa, onde aparece no site.
- Tooltip do Builder usa só "tradução amigável" + "por que importa" (1-2 frases).
- Página `/glossario` mostra tudo, em ordem alfabética, com link de âncora `#termo`.
- PDP/blog linka termos quando aparecem pela 1ª vez: `[DDR5](/glossario#ddr5)`.

---

## A

### AM5
**Tradução amigável:** É o "encaixe" que segura a CPU AMD na placa-mãe. AMD usa AM5 desde 2022. CPU Ryzen 7000, 8000 e 9000 só servem aqui.
**Por que importa:** Se sua CPU é AM5, sua placa-mãe TEM que ser AM5. Não tem adaptador.
**Onde aparece:** PDP CPU (todas Ryzen 7000+), PDP placa-mãe, Builder (filtro automático).

### ATX / mATX / ITX / E-ATX
**Tradução amigável:** É o tamanho da placa-mãe. ATX é grande, mATX é médio, ITX é pequeno, E-ATX é gigante (workstation).
**Por que importa:** Placa-mãe ITX só cabe em gabinete ITX (ou maior). Placa ATX não cabe em gabinete ITX. Builder checa.
**Onde aparece:** PDP placa-mãe, PDP gabinete, Builder (filtro automático).

---

## B

### Benchmark
**Tradução amigável:** Um teste padronizado que mede o quão rápido um PC é. 3DMark e Cinebench são os mais conhecidos.
**Por que importa:** Permite comparar 2 PCs com o mesmo número. "PC A faz 12 mil pontos no Time Spy, PC B faz 9 mil."
**Onde aparece:** Blog, PDP de PC montado (futuro), comparador.

### Bottleneck
**Tradução amigável:** É quando uma peça segura a outra. CPU fraca demais pra GPU forte = bottleneck. A GPU fica esperando ordens.
**Por que importa:** Você paga caro numa GPU mas perde 30% de performance porque a CPU não acompanha. Builder avisa quando isso acontece.
**Onde aparece:** Builder warning, blog ("evite bottleneck"), FAQ.

---

## C

### Cable Management
**Tradução amigável:** Organizar os cabos do PC pra não virar bagunça atrás da placa-mãe. Visual fica limpo, ar passa melhor, fica mais fácil mexer depois.
**Por que importa:** Não muda performance, mas muda durabilidade (componentes mais frescos) e facilita upgrades futuros.
**Onde aparece:** Marketing, fotos de PC montado, blog.

### Chipset
**Tradução amigável:** O "miolo de controle" da placa-mãe. Define quais CPUs servem, quantas portas USB, suporte a overclock, PCIe Gen5.
**Por que importa:** AM5 tem A620 (básico), B650/B650E (custo-benefício), X670/X670E (top). Quanto melhor o chipset, mais features.
**Onde aparece:** PDP placa-mãe, comparativos, Builder (informativo).

### Cooler / AIO / Watercooler
**Tradução amigável:** O que resfria o processador. "Cooler" é refrigerador a ar. "AIO" ou "Watercooler" é refrigeração líquida selada (radiador + bomba prontos).
**Por que importa:** CPU sem cooler queima em segundos. Cooler básico não dá conta de Ryzen 9 ou Core i9. Watercooler começa em 240mm e vai até 360mm (quanto maior, melhor a refrigeração).
**Onde aparece:** PDP cooler, Builder (alerta se cooler insuficiente pra TDP da CPU).

---

## D

### DDR4 / DDR5
**Tradução amigável:** A geração da memória RAM. DDR5 é a atual, mais rápida. DDR4 ainda existe em PCs Intel mais antigos (LGA1700).
**Por que importa:** Placa-mãe AM5 só aceita DDR5. Placa LGA1700 aceita DDR4 OU DDR5 (depende do modelo). Não dá pra misturar.
**Onde aparece:** PDP RAM, PDP placa-mãe, Builder (filtro automático).

### DOA (Dead on Arrival)
**Tradução amigável:** Quando o produto chega já com defeito (não liga, não funciona). DOA tem regra especial: troca direta sem perícia nos primeiros 7 dias.
**Por que importa:** Você não precisa esperar laudo de assistência técnica se o produto já chegou quebrado. Loja troca na hora.
**Onde aparece:** Página `/garantia`, FAQ, política de troca.

---

## F

### Form Factor
**Tradução amigável:** Outro nome pra "tamanho da placa-mãe ou do gabinete". ATX, mATX, ITX, E-ATX. Veja [ATX/mATX/ITX](#atx--matx--itx--e-atx).
**Por que importa:** Diz se a placa cabe no gabinete.
**Onde aparece:** PDP placa-mãe, PDP gabinete, Builder.

### FPS (Frames Per Second)
**Tradução amigável:** Quantas imagens por segundo o PC desenha no jogo. Quanto mais, mais fluido. 60 FPS é o mínimo confortável, 144+ é competitivo, 240+ é pro.
**Por que importa:** Define se você consegue jogar Valorant competitivo (precisa 240+) ou só casual (60 basta). Cada PC pronto Kore Tech mostra FPS estimado em jogos populares.
**Onde aparece:** PDP PC montado, landing de persona, badge cyan no card de build.

---

## G

### GPU (Placa de Vídeo)
**Tradução amigável:** O componente que gera as imagens do jogo. NVIDIA RTX, AMD Radeon. É a peça mais cara do PC gamer e a que mais pesa no FPS.
**Por que importa:** Trocar GPU é o upgrade que mais muda performance em jogo. Mas exige fonte adequada e gabinete que comporte (algumas GPUs têm 35cm de comprimento).
**Onde aparece:** PDP GPU, Builder (filtro por consumo + comprimento), card de PC montado.

---

## L

### LGA1700 / LGA1851
**Tradução amigável:** Encaixes Intel pra CPU. LGA1700 é da 12ª, 13ª e 14ª geração (Core i5/i7/i9 13600K, 14700K, etc). LGA1851 é da 15ª (Core Ultra).
**Por que importa:** Igual ao AM5: CPU LGA1700 só serve em placa LGA1700. Não tem adaptador.
**Onde aparece:** PDP CPU Intel, PDP placa-mãe Intel, Builder.

---

## M

### M.2 / NVMe
**Tradução amigável:** SSD pequeno que parafusa direto na placa-mãe (sem cabo). NVMe é o "tipo" de M.2 mais rápido (vs SATA).
**Por que importa:** NVMe Gen4 chega a 7000 MB/s, NVMe Gen5 a 14000 MB/s. SSD SATA antigo fica em 550 MB/s. Diferença prática: jogo abre em 5 segundos vs 25.
**Onde aparece:** PDP SSD, PDP placa-mãe (quantos slots M.2), Builder.

---

## P

### Paper Launch
**Tradução amigável:** Quando uma marca anuncia um produto novo (GPU, CPU) mas não tem estoque real. O cliente fica sem comprar por meses.
**Por que importa:** Kore Tech evita isso com lista de espera ativa: você é avisado quando entra em estoque, com 24h de reserva.
**Onde aparece:** Comunicação anti-paper-launch, blog, marketing.

### PCIe (PCIe 4.0 / PCIe 5.0)
**Tradução amigável:** O "trilho" interno que liga GPU e SSD à placa-mãe. PCIe 5.0 é o dobro mais rápido que PCIe 4.0.
**Por que importa:** GPUs e SSDs Gen5 só usam toda a velocidade em placa que suporta. Placa antiga limita peça nova.
**Onde aparece:** PDP placa-mãe, PDP GPU/SSD, comparativos.

### Pix
**Tradução amigável:** Pagamento instantâneo do Banco Central. Confirma em segundos. Na Kore Tech, sempre dá 5% off.
**Por que importa:** Não tem juros (vs parcelamento), confirma na hora (libera envio mais rápido) e custa menos pra você.
**Onde aparece:** Checkout, PDP (badge "Pix 5% off"), email de confirmação.

### PSU (Power Supply Unit) / Fonte
**Tradução amigável:** A fonte de energia. Tem wattagem (350W, 550W, 750W, 1000W) e certificação (80+ Bronze, Gold, Platinum) que mede eficiência.
**Por que importa:** Fonte fraca queima ou desliga o PC sob carga. Builder calcula consumo de TODAS as peças e sugere fonte com ~30% de folga.
**Onde aparece:** PDP fonte, Builder (sugestão automática), warning de "fonte insuficiente".

---

## R

### RAM (Memória RAM)
**Tradução amigável:** Memória rápida que o PC usa enquanto está ligado. Joga, ela se enche. Desligou, esvazia.
**Por que importa:** 16GB é o mínimo pra jogo atual. 32GB é o sweet-spot pra jogar + abas de Chrome + Discord. 64GB+ é pra edição/IA.
**Onde aparece:** PDP RAM, Builder (slot count), spec de PC montado.

### Refresh Rate (Hz)
**Tradução amigável:** Quantas vezes por segundo o monitor atualiza a imagem. 60Hz é padrão escritório, 144Hz é gamer entry, 240Hz é competitivo, 360Hz é esports profissional.
**Por que importa:** Adianta pouco ter PC que faz 240 FPS num monitor de 60Hz, ele só vai mostrar 60. Casa o monitor com a GPU.
**Onde aparece:** PDP monitor, recomendação cross-sell.

### Ryzen / Core (Marcas de CPU)
**Tradução amigável:** Ryzen é AMD, Core (i5/i7/i9 ou Ultra) é Intel. Brigam pelo melhor custo-benefício a cada 6-12 meses.
**Por que importa:** Define socket (AM5 ou LGA1700/1851) e por consequência placa-mãe e RAM.
**Onde aparece:** PDP CPU, filtros, Builder.

---

## S

### Socket / Soquete
**Tradução amigável:** O "encaixe físico" da CPU na placa-mãe. AM5 (AMD), LGA1700 e LGA1851 (Intel). Veja [AM5](#am5) e [LGA1700/1851](#lga1700--lga1851).
**Por que importa:** É a regra nº 1 do PC builder. Erro de socket é o erro mais comum de quem monta PC sem ajuda.
**Onde aparece:** PDP CPU, PDP placa-mãe, Builder (regra principal de filtro).

---

## T

### TDP (Thermal Design Power)
**Tradução amigável:** Quanto calor a CPU ou GPU gera, medido em Watts. Ryzen 7700X = 105W, RTX 5090 = 575W.
**Por que importa:** Define se o cooler aguenta (CPU) e quanto a fonte precisa entregar (PSU). Builder usa isso pra calcular tudo.
**Onde aparece:** PDP CPU, PDP GPU, Builder (somatório pro PSU).

### Throttling
**Tradução amigável:** Quando uma peça reduz a própria velocidade pra não esquentar demais. Acontece em CPU/GPU com cooler insuficiente.
**Por que importa:** Você paga por CPU de 5GHz mas roda a 3.5GHz porque está esquentando. Cooler bom evita.
**Onde aparece:** Blog, FAQ, builder warning.

---

## V

### VRAM
**Tradução amigável:** A memória RAM dedicada da placa de vídeo. RTX 4060 = 8GB, RTX 4070 Super = 12GB, RTX 4090 = 24GB.
**Por que importa:** Jogos modernos pedem 8GB no mínimo em 1080p, 12GB em 1440p e 16GB em 4K. Pouco VRAM trava o jogo mesmo com GPU forte.
**Onde aparece:** PDP GPU, comparativos, Builder.

---

## W

### Wattagem (W)
**Tradução amigável:** A unidade de potência. CPU usa 65-170W, GPU usa 150-575W, fonte entrega 350-1500W.
**Por que importa:** Soma do consumo de todas as peças tem que caber na fonte, com folga de 20-30%. Builder calcula.
**Onde aparece:** PDP de cada peça, Builder (barra inferior com soma total).

---

## Termos de loja (não-técnicos, mas frequentes)

### Build / Montar
**Tradução:** "Build" é o conjunto de peças que forma um PC. "Montar" é escolher peça por peça no Builder.
**Onde:** Builder, PCs prontos ("Kore Valorant Build"), blog.

### Cross-sell
**Tradução:** Quando a loja sugere produtos que combinam com o que você está olhando. Ex: comprou PC, sugere monitor + mouse + teclado.
**Onde:** PDP (seção "Quem comprou também levou"), checkout.

### Lista de espera
**Tradução:** Você ativa "me avise" num produto sem estoque. Quando entra, recebe email + WhatsApp e tem 24h de reserva pra comprar antes da fila.
**Onde:** PDP de produto fora de estoque, página `/conta/lista-de-espera`.

---

## Como o glossário aparece no site

| Local | Como |
|---|---|
| `/glossario` | Página dedicada com busca e índice alfabético |
| Tooltip Builder | Hover/tap em qualquer chip de spec mostra tradução amigável + 1 frase |
| PDP componente | Termo aparece como link sublinhado fino, abre tooltip ou link `#termo` |
| Blog | 1ª vez que termo aparece em cada post vira link |
| FAQ | Resposta usa termos linkados pro glossário |

---

## Critério pra adicionar termo novo

Adiciona termo se:
1. Aparece em pelo menos 2 PDPs ou em 1 página de SEO importante
2. Cliente iniciante razoavelmente vai precisar olhar de novo
3. Tem definição prática que muda decisão de compra

Não adiciona:
- Jargão de overclocker hardcore (LN2, IHS delidding) — fora do escopo
- Marca de modelo específico (RTX 4070 não vira termo do glossário, vira PDP)
- Termo que aparece 1x no site inteiro
