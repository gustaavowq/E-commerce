# Pesquisa de Nicho — Kore Tech

> Compilado pelo Tech Lead em 2026-04-26. Sources no final.
> **Direção validada com cliente:** e-commerce PRÓPRIO (single-vendor, estoque próprio, NÃO marketplace) de hardware/PC. Demo fictícia funcional.
> **Diferencial inovador combinado:** (1) PC Builder com checagem automática de compatibilidade + sugestão inteligente; (2) Catálogo organizado por PERSONA/USO com benchmark estimado.
> **Estrutura:** `projetos/projeto-tech/kore-tech/` (docs) + `src/projeto-tech/kore-tech/` (código).

---

## 1. Visão geral do mercado

Hardware/PC gamer no BR é mercado maduro online — Pichau, KaBuM e Terabyte dominam há ~10 anos. Faixa de preço subiu forte em 2025-2026 (RAM com reajuste de até 300% por causa de demanda IA generativa, escassez de GPU). Ticket médio do nicho está alto (R$ 4-14k pra PC montado completo), parcelamento crítico até 12x. Mercado tem 3 grandes "pains" não resolvidos pelos incumbentes: (a) UX de catálogo é ruim — paradoxo de escolha pesa, (b) builders existentes (Pichau/Kabum/Terabyte) são funcionais mas crus visualmente, (c) ninguém vende por **uso/persona** — cliente novato não sabe traduzir "quero rodar Valorant 240fps" em peças.

**Oportunidade clara:** existe ferramenta brasileira de compatibilidade (meupc.net) — mas é AGREGADOR de preço, não loja. Não tem ninguém vendendo direto com builder bonito + IA + personas.

## 2. Concorrentes top — 3 mercados

### 2.1 Brasil (referência de catálogo, preço, logística)

| # | Nome | URL | Por que olhar |
|---|---|---|---|
| 1 | Pichau | https://www.pichau.com.br | Líder em entry/mid, builder funcional cru, marca própria (Mancer/TGT), preço agressivo |
| 2 | KaBuM | https://www.kabum.com.br/monte-seu-pc | Maior catálogo, builder com filtro de jogos básico, logística robusta |
| 3 | Terabyte Shop | https://www.terabyteshop.com.br/pc-gamer/full-custom | Melhor builder técnico do BR ("Full Custom"), suporte humano valida montagem antes de fechar |
| 4 | meupc.net | https://meupc.net/build | **Não-concorrente, é agregador.** Mas tem o melhor builder BR (50+ checks de compatibilidade). Inspira UX. |
| 5 | 4Gamers | https://www.4gamers.com.br | Já vende "PC custo-benefício até R$ X" — começa a fazer venda por persona, mas ainda crua |

### 2.2 EUA (referência de inovação em builder + personas)

| # | Nome | URL | Por que olhar |
|---|---|---|---|
| 1 | NZXT BLD | https://nzxt.com/category/gaming-pcs | **Referência ouro.** Configurador por jogo + estimativa de FPS + GARANTIA de performance ("se não rodar X em Y FPS, devolve dinheiro"). Personas explícitas. |
| 2 | Maingear | https://maingear.com | Boutique premium, MG-RC (cabos atrás da placa-mãe — visual limpo), brand premium |
| 3 | Origin PC | https://www.originpc.com | Suporte 24/7 vitalício, customização extrema, garantia premium |
| 4 | iBUYPOWER | https://www.ibuypower.com | PCs prontos a partir de US$ 1.099, financiamento integrado |
| 5 | BuildCores | https://www.buildcores.com | **Não vende, mas referência.** Único builder com **visualizador 3D** + estimativa FPS via 3DMark integrado |

### 2.3 Europa (referência de UX simples + sustentabilidade)

| # | Nome | URL | Por que olhar |
|---|---|---|---|
| 1 | PCSpecialist (UK) | https://www.pcspecialist.co.uk/pc-configurator/ | Configurador "5 passos jargon-free" — UX didática pra iniciante |
| 2 | Overclockers UK | https://www.overclockers.co.uk/pc-systems/custom-pcs | Builder sólido + comunidade forte (fórum integrado) |
| 3 | Caseking (DE) | https://www.caseking.de/en/pc-systems/pc-configurator | Configurador de **workstation** (vídeo, 3D, CAD, IA) — separado de gamer. Boa segmentação por uso. |
| 4 | LDLC (FR) | https://www.ldlc.com/en/pc-builder | Notificação em tempo real de chegada de GPU/CPU em estoque (anti-paper-launch) |
| 5 | Back Market (FR) | https://www.backmarket.com | Refurbish/trade-in mainstream — modelo circular forte na EU |

## 3. Faixa de preço típica (BR, 2026)

| Segmento | Range | Observação |
|---|---|---|
| Entry gamer | R$ 2.500 – 4.000 | Roda jogos atuais 1080p baixo/médio. CPU iGPU ou GPU básica (RTX 4060 / RX 7600) |
| Mid gamer | R$ 4.000 – 7.500 | "Custo-benefício" — RTX 4060/4070, 16-32GB DDR5, AM5/LGA1700 |
| Premium gamer | R$ 7.500 – 15.000 | RTX 4080/5080, Ryzen 7/9 ou Core i7/i9, watercooler, RGB pesado |
| Workstation/IA | R$ 15.000 – 40.000+ | RTX 5090, 64-128GB RAM, dual NVMe, fonte 1000W+, ECC RAM em alguns casos |
| Periférico isolado | R$ 50 – 5.000 | Mouse R$ 50–800, teclado mecânico R$ 200–2.500, monitor R$ 800–8.000 |
| Componente isolado | R$ 100 – 25.000 | RAM 16GB DDR5 ~R$ 400, RTX 5090 ~R$ 25k |

**Ticket médio estimado** (PC montado): R$ 6.500 — **parcelamento crítico até 12x sem juros** (cliente sente o estrago no cartão se for à vista).

⚠️ **Atenção 2026:** preço de RAM e GPU está volátil por causa de demanda IA. Pricing dinâmico (snapshot 24h) + alerta de "preço subiu, fecha agora" é diferencial real.

## 4. Variações de produto (Schema Prisma)

Hardware é um nicho **com 2 modos de catálogo** que precisam coexistir:

### 4.1 Modo "PC montado" (produto = build pronto)

- `Product` representa um PC inteiro pré-configurado ("Kore Tech Valorant Pro")
- `ProductVariation` quase não usa cor/tamanho — usa **tier** (Bronze/Prata/Ouro com pequenos upgrades de RAM/SSD)
- `Product.specSheet` = JSON estruturado com TODAS as peças do build (CPU, mobo, RAM, GPU, storage, fonte, gabinete, cooler, fan)
- `Product.benchmark` = JSON com FPS estimado em jogos específicos ({ "valorant_1080p_high": 280, "fortnite_1440p_epic": 165, ... })

### 4.2 Modo "Componente" (produto = peça avulsa)

- `Product` = uma peça (RTX 4070, Ryzen 7 7700X, gabinete Lian Li, etc)
- Atributos críticos para checagem de compatibilidade do builder:
  - CPU: socket (`AM5`, `LGA1700`, `LGA1851`), TDP (W), suporte memória (`DDR5-5200`)
  - Placa-mãe: socket, chipset (`B650`, `X670E`, `Z790`, `B760`), slots RAM, fator (`ATX`, `mATX`, `ITX`), suporte PCIe
  - RAM: tipo (`DDR4`/`DDR5`), velocidade MHz, capacidade GB, latência CL
  - GPU: comprimento mm, largura slots, consumo W, conector PSU
  - Fonte: wattagem, certificação (`80+ Bronze/Gold/Platinum`), modular (S/N/Semi)
  - Gabinete: GPU max length mm, cooler max height mm, fator (`ATX`/`mATX`/`ITX`/`E-ATX`)
  - Cooler: socket compatível, altura mm
  - Storage: tipo (`NVMe Gen4`/`NVMe Gen5`/`SATA SSD`/`HDD`), capacidade

### 4.3 Schema additions (delta vs `eletronicos.md`)

```prisma
model Product {
  // ... campos padrão
  buildType          String?  // 'pc_pronto' | 'componente' | 'periferico' | 'monitor'
  category           String   // 'cpu' | 'gpu' | 'mobo' | 'ram' | 'storage' | 'psu' | 'case' | 'cooler' | 'pc_full' | ...
  persona            String?  // 'valorant', 'fortnite_competitivo', 'edicao_4k', 'ia_local', ... (só pra pc_pronto)
  specs              Json     // ficha técnica estruturada — chave por categoria (ver compatibilityKeys.md)
  compatibility      Json?    // { socket: 'AM5', tdpW: 105, length_mm: 320, ... } pra builder calcular
  benchmarkFps       Json?    // { 'valorant_1080p_high': 280, 'cs2_1440p_high': 220, ... }
  weightGrams        Int?     @map("weight_grams")
  dimensionsMm       Json?    // { length, width, height }
  warrantyMonths     Int      @default(12)
}

model PCBuild {
  id           String   @id @default(cuid())
  ownerId      String?  // null = guest, com id = salvo na conta
  name         String?
  parts        Json     // { cpu_id, mobo_id, ram_ids[], gpu_id, ... }
  totalPrice   Decimal
  isPublic     Boolean  @default(false)
  shareSlug    String?  @unique
  createdAt    DateTime @default(now())
}

model CompatibilityRule {
  // tabela de regras pra builder não ser hardcoded
  id          String  @id
  ruleType    String  // 'socket_match', 'psu_min_wattage', 'gpu_fits_case', 'ram_speed', ...
  description String
  // ... (semente fixa, raramente muda)
}
```

## 5. Jargão / glossário do setor

Crítico pro Copywriter usar certo. Errar termo = perde credibilidade no nicho.

| Termo | Significado | Onde aparece |
|---|---|---|
| **Socket / Soquete** | Encaixe físico CPU↔mobo. AM5 (AMD Ryzen 7000+), LGA1700 (Intel 12-14ª), LGA1851 (Intel 15ª/Core Ultra) | PDP CPU/mobo, builder |
| **Chipset** | Controlador da mobo. AM5: A620/B650/B650E/X670/X670E. Intel: B760/Z790/B860/Z890 | PDP mobo, builder |
| **DDR5** | Geração atual de RAM (DDR4 ainda existe em LGA1700). AM5 só aceita DDR5. Velocidade típica 5200-7200 MHz | PDP RAM, builder |
| **PCIe 5.0** | Barramento da GPU/SSD. Dobra banda do 4.0. Importa em RTX 50 e SSD Gen5 | PDP mobo/GPU/SSD |
| **NVMe** | SSD M.2 que usa PCIe (vs SATA). Gen4 ~7000 MB/s, Gen5 ~14000 MB/s | PDP SSD |
| **TDP** | Thermal Design Power (W). Ryzen 7700X = 105W, 7800X3D = 120W, 5090 = 575W | PDP CPU/GPU, builder (cálculo PSU) |
| **Watercooler / AIO** | Refrigeração líquida selada. Tamanhos 120/240/280/360 mm | PDP cooler |
| **Modular / Semi / Não-modular** | Cabos da fonte destacáveis (modular = melhor cable management) | PDP PSU |
| **80+ Bronze/Gold/Platinum** | Eficiência energética da fonte | PDP PSU |
| **FPS** | Frames per second — métrica de performance | Catálogo persona, PDP PC |
| **Ray Tracing / DLSS / FSR** | Tecnologias de renderização (RT pesado, DLSS/FSR upscaling NVIDIA/AMD) | PDP GPU/PC, blog |
| **Refresh rate** | Hz do monitor (60/144/165/240/360 Hz) | PDP monitor |
| **Bottleneck** | Quando uma peça segura o resto (CPU fraca pra GPU forte ou vice-versa) | Builder warnings, blog |
| **Cable management** | Organização de cabos no gabinete | Marketing, fotos |
| **Form factor** | Tamanho da mobo/gabinete: ATX, mATX, ITX, E-ATX | Builder (gabinete↔mobo) |
| **Paper launch** | Quando lança produto que não tem estoque real | Comunidade — evitar! |
| **BTO / Build-to-Order** | Modelo onde monta sob pedido | Sobre nós, prazo de entrega |

## 6. Mood visual dominante

- **Paletas:** dark mode default (preto + grafite), acentos NEON (cyan elétrico, verde gamer, magenta) ou alternativa "tech limpo" (azul-marinho + branco + dourado pra premium)
- **Fotografia:** PCs com RGB ligado em ambiente escuro, closeup de componentes (placa-mãe iluminada lateralmente), lifestyle gamer (setup completo)
- **Tipografia:** sans-serif geométrica (Inter, Geist, Space Grotesk) ou display tecnológica (JetBrains Mono em specs)
- **Densidade:** **alta** — cliente do nicho QUER ver specs, benchmarks, números. Diferente de moda. Mas a Home pode ser limpa pra atrair iniciante.
- **Referências fora do BR:** NZXT (limpo, moderno, gamer respeitável), Maingear (premium boutique), Razer (escuro + verde), Apple (limpeza extrema pra contrastar com gamer berrante)

**Direção definida pro Kore Tech (Tech Lead, 2026-04-26):** dark mode + acento **cyan elétrico (`#00E5FF`)** único, tipografia **Inter** (UI) + **JetBrains Mono** (specs/números). Fotografia com bastante closeup de componentes iluminados. **Anti-padrão:** RGB explosivo no site — soa cafona. RGB nas FOTOS sim, na UI não. Designer pode refinar tons mas mantém: dark mode + cyan único + Inter/JetBrains.

## 7. Canais de aquisição (ordem de prioridade)

1. **YouTube + Twitch** — público é audiovisual, decisão muito influenciada por reviews (canais BR: Adrenaline, Tec Mundo Hardware, Mexido de Ideias, Pichau Arena). **Anúncios em vídeos de review = ouro.** Patrocínio de streamers em jogos (Valorant/CS2/Fortnite) tem ROI alto.
2. **Google Search (intent alto)** — quem pesquisa "melhor PC pra Valorant 2026" está no fundo do funil. SEO técnico pesado + Performance Max.
3. **Reddit / fóruns nicho** (r/buildapcbrasil, Clube do Hardware, Adrenaline fórum) — comunidade DESCONFIA de marca, presença orgânica vale mais que anúncio.
4. **Instagram / TikTok** — secundário no nicho, mas vídeo de "unboxing PC novo" performa bem (use-case "primeiro PC gamer").
5. **Email marketing** — lista de espera pra GPU em estoque (anti-paper-launch tipo LDLC) → conversão altíssima.

## 8. SEO — Keywords de cauda longa

Pra Growth implementar em metadata + blog + landing pages:

- **"melhor pc gamer custo benefício 2026"** (intent: comparação, alta conversão)
- **"pc para rodar [jogo] em [resolução]"** (intent: persona — VIRA URL DE LANDING POR PERSONA)
  - "pc pra rodar valorant 240fps", "pc pra rodar fortnite competitivo", "pc pra rodar cyberpunk ultra"
- **"montar pc gamer R$ [valor]"** (intent: budget — lista de orçamentos prontos)
- **"compatibilidade ryzen 7 7700x placa mãe"** (intent: builder — atrai pra ferramenta)
- **"calcular fonte pc"** (intent: builder — atrai pra ferramenta)
- **"pc para edição de vídeo 4k"** (intent: persona profissional)
- **"pc para rodar llama 70b local"** (intent: persona IA — emergente, baixa concorrência)
- **"diferença ddr5 ddr4"** (intent: tutorial — atrai iniciante)
- **"placa mãe am5 vs lga1700"** (intent: comparação técnica)
- **"como saber se a fonte é suficiente"** (intent: trust — baixa concorrência)

**SEO killer feature:** cada persona vira landing page indexável (`/builds/valorant-240fps`, `/builds/edicao-4k`, `/builds/ia-local-llama`). 8-12 personas no MVP, escalando até 30-50.

## 9. Regulamentação / legal

Itens que se ignorados quebram o projeto:

- ✅ **CDC — Garantia legal 90 dias** (bens duráveis). Conta a partir do recebimento. Defeito oculto reinicia a contagem.
- ✅ **Garantia contratual fabricante** (12 meses padrão BR, 24 em alguns componentes premium). Loja deve INTERMEDIAR (não jogar pro fabricante e lavar as mãos — Procon multa).
- ✅ **Direito de arrependimento — 7 dias** (CDC art. 49) pra compra online. Cliente devolve sem motivo, loja reembolsa integral incluindo frete.
- ✅ **Nota fiscal eletrônica obrigatória** — emite NFe a cada pedido (integração Bling/Tiny/Omie quando faturamento ≥ R$ 10k/mês justifica).
- ✅ **ICMS por estado** — frete + tributação variam. Tem que ter calculadora correta. Difal (diferencial de alíquota) em vendas interestaduais B2C.
- ✅ **Anatel** — periféricos com radiofrequência (mouse/teclado wireless, headset Bluetooth) precisam de selo Anatel homologado. Vender produto não-homologado = autuação.
- ✅ **Inmetro** — fontes de alimentação devem ter selo Inmetro (segurança elétrica).
- ✅ **LGPD** — banner cookie + privacy policy + tela de consentimento + DPO indicado em rodapé.
- ✅ **Marco Civil + LGPD** — preservar logs de acesso 6 meses (já tem no template).

⚠️ **Especifico de hardware:**
- **Lacre violado = perde garantia do fabricante** — fotografar lacre antes de despachar evita disputa.
- **Garantia DOA (Dead on Arrival) primeiros 7-14 dias** — troca sem perícia, melhor pro cliente. Precisa ter estoque pra honrar.

## 10. KPIs específicos do nicho (pro painel)

Pra Data Analyst priorizar no dashboard:

| KPI | Por quê neste nicho |
|---|---|
| **Ticket médio** | Hardware tem range enorme (R$ 50 mouse → R$ 25k GPU). Segmentar por categoria. |
| **Taxa de parcelamento (% Pix vs 12x)** | Pix dá 5-10% off — quanto da margem vai pra parcelamento? |
| **Builder → checkout (funil)** | Quantos começam montagem, quantos terminam, quantos compram? Identifica abandono em etapa específica. |
| **Persona → conversão** | Qual persona converte mais? (Valorant ganha de Edição 4K?) |
| **Margem por categoria** | Periférico/cooler têm margem maior que GPU. Realocar destaque na home. |
| **Garantia DOA acionada (%)** | Detecta lote ruim de fornecedor antes de virar epidemia. |
| **Devolução por arrependimento (CDC 7 dias %)** | Acima de 5% = problema (foto enganosa? expectativa errada?) |
| **Estoque vs demanda em GPU/CPU/RAM (alerta)** | Volatilidade 2026 — alerta quando produto popular cai abaixo de N unidades. |
| **Tempo médio de montagem (BTO)** | SLA prometido vs entregue — se passa de 7 dias, mexer no fluxo. |
| **Reviews ≥ 4 estrelas (%)** | Confiança no nicho é tudo. Acompanhar score por categoria. |

## 11. Pains do comprador

| Dor | Como a loja aborda |
|---|---|
| **"Não sei se as peças são compatíveis"** | Builder com 50+ checks visíveis ("✅ socket OK", "⚠️ fonte insuficiente"). Mata o medo. |
| **"Não sei o que rodaria meu jogo"** | Catálogo por persona: "PC pra Valorant 240fps R$ 4.500" com FPS estimado em destaque. |
| **"Tenho medo de paper launch / produto não tem"** | Estoque REAL e visível ("3 unidades em SP — chega em 2 dias"). Lista de espera com notificação. |
| **"Custa caro, preciso parcelar"** | "12x R$ X" em destaque na PDP, antes do preço total. Calculadora de juros transparente. |
| **"Frete vai destruir o gabinete"** | Fotos da embalagem reforçada, "frete asseguro+ até R$ 15k", política de DOA clara. |
| **"E se chegar com defeito?"** | Página `/garantia` clara: 7 dias arrependimento + 90 dias CDC + 12 meses fabricante intermediado por nós. |
| **"Não sei se a fonte aguenta"** | Builder calcula automaticamente + sugere upgrade. Nunca deixa cliente errar. |
| **"Quero upgradar peça avulsa depois"** | Programa "RigForge Upgrade" — manda peça antiga, paga só diferença (modelo trade-in). |
| **"Suporte é ruim, não responde"** | WhatsApp do lojista no header, FAQ técnico bem feito, chat humano em horário comercial. |
| **"Não sei se vale comprar montado ou peças soltas"** | Comparador no site: "este build montado R$ X vs comprando peças soltas R$ Y + R$ 350 montagem". |

## 12. Integrações

| Integração | Quando precisa | Prioridade MVP |
|---|---|---|
| **Cloudinary** | Sempre (template padrão) | Sim |
| **MercadoPago** | Sempre — Pix + Cartão até 12x configurado | Sim |
| **Correios PAC + SEDEX** | Sempre — peso real importa MUITO (gabinete 12-15kg, GPU 1-2kg). Schema precisa de `weightGrams` + `dimensionsMm`. | Sim |
| **Mercado Envios / Melhor Envio** | Frete competitivo + tracking automático | Sim (V2) |
| **Bling / Tiny ERP** | NFe automática + estoque | V2 (faturamento ≥ R$ 10k/mês) |
| **Resend** | Transacional (confirmação, "GPU chegou em estoque", DOA suporte) | Sim |
| **Garantia estendida (Cardif / Assurant)** | Upsell no checkout | V3 |
| **Banco de dados de produtos (TechPowerUp / GPU-Z)** | Pra não cadastrar specs manualmente em centenas de SKUs | V2 (acelera muito catálogo) |
| **3DMark / TimeSpy benchmark API** | Estimativa de FPS por build automatizada | V3 (no MVP, FPS estimado vem de tabela manual curada) |
| **Trade-in / refurb** | Programa upgrade ("manda a antiga, paga diferença") | V3 |

## 13. Sazonalidade

| Período | Pico/Vale | Cupom sugerido |
|---|---|---|
| Black Friday (Nov) | **Pico fortíssimo** — hardware é o nicho mais buscado em BF. | BLACK40 (até em PC montado), GPU40, BUILDER10 |
| Natal (Dez) | Pico moderado | NATAL15, COMBO20 (PC + periférico) |
| Volta às aulas (Fev) | Pico em notebooks/PCs entry pra estudante | ESTUDANTE15 |
| Lançamento de hardware (Q1/Q3) | Pico se Nvidia/AMD/Intel lançam. RTX 5060 lançou 2025, RTX 6000 esperada 2026. | LANÇAMENTO (+ lista de espera) |
| Semana do Gamer (Out) | Pico médio em periféricos | GAMER20 |
| Lançamento de jogo AAA (variável) | Pico pequeno mas previsível (GTA VI, novo CoD, etc) | "PC pra rodar [jogo] no lançamento" — landing dedicada |
| Janeiro (pós-festas) | Vale fortíssimo | esvazia estoque "OUTLET40" |

## 14. Features inovadoras por mercado (matriz de gaps)

> Esta seção é o coração da pesquisa — onde o Kore Tech encontra seu diferencial.

| Feature | BR (Pichau/Kabum/Terabyte) | EUA (NZXT BLD, BuildCores, Maingear) | Europa (PCSpecialist, LDLC, Caseking) | **Gap no BR?** |
|---|---|---|---|---|
| **Builder com checagem compatibilidade** | Cru funcional (Terabyte é o melhor) | NZXT BLD slick, BuildCores 50+ checks | PCSpecialist 5-passos jargon-free | ✅ **SIM** — UX bonito + 50+ checks ainda não tem |
| **Catálogo por persona/jogo** | Quase nada (4Gamers começa) | NZXT BLD vende por jogo + FPS estimado | Caseking separa workstation vs gamer | ✅ **SIM** — gap enorme |
| **Estimativa de FPS por jogo** | Não tem | NZXT BLD garante performance, BuildCores integra 3DMark | Não tem | ✅ **SIM** — diferencial técnico forte |
| **Visualizador 3D do build** | Não tem | BuildCores (não vende, só visualiza) | Não tem | ✅ **SIM** — V2/V3, mas referência |
| **Notificação de estoque (anti-paper-launch)** | Lista de espera básica | Origin/Maingear comunicam bem | LDLC notifica em tempo real chegada GPU/CPU | ✅ **SIM** — diferencial real (raro alguém fazer bem no BR) |
| **Garantia de performance (devolve dinheiro se não roda)** | NÃO tem | NZXT BLD tem em catálogo selecionado | Não tem | ✅ **SIM** — game changer pra confiança |
| **Programa de upgrade modular (trade-in)** | NÃO tem | Origin/Maingear suporte vitalício mas não trade-in | Back Market é mainstream, mas não vende novo | ✅ **SIM** — modelo de negócio diferente |
| **Suporte humano antes da compra (valida build)** | Terabyte tem (telefone) | Origin tem 24/7 vitalício | PCSpecialist tem | ⚠️ Médio — gap menor mas WhatsApp humano vence |
| **Cable management premium (cabos atrás)** | Não vende como diferencial | Maingear MG-RC | Caseking premium | ⚠️ V3 — depende de catalogo de gabinete específico |
| **PCs especializados pra IA local** | Quase ninguém | Aparecendo lentamente | Caseking workstation | ✅ **SIM** — emergente, baixa concorrência SEO |

### Síntese — Diferencial competitivo do Kore Tech (MVP)

**3 diferenciais que NINGUÉM no BR tem ao mesmo tempo:**

1. **Builder UX nível NZXT BLD + checks nível meupc.net + bonito**
   - 50+ regras de compatibilidade visíveis
   - Sugestão automática de upgrade ("essa GPU pede 750W, troca a fonte por +R$ 280")
   - Salva build, compartilha link, transforma em pedido com 1 clique
2. **Catálogo por PERSONA com FPS estimado**
   - Home não tem "Placas de vídeo" — tem "Builds prontos pra Valorant 240fps", "Builds pra editar 4K", "Builds pra IA local Llama"
   - Cada persona = landing page SEO indexável
   - FPS estimado em jogos populares destacado em cada PC pronto (curado manualmente no MVP, integração 3DMark depois)
3. **Lista de espera estoque + notificação ativa (anti-paper-launch)**
   - Cliente ativa "me avise" em produto sem estoque
   - Email + push WhatsApp quando entra
   - Reserva automática 24h pra quem ativou primeiro

**3 diferenciais V2/V3 (depois do MVP estabilizar):**

4. Garantia de performance ("se não rodar X em Y FPS, devolve") — começa em 5 builds selecionados
5. Programa de upgrade trade-in ("manda a antiga, paga diferença")
6. Visualizador 3D do build (estilo BuildCores)

## 15. Plano de execução (proposta pra cliente validar)

### Estrutura inicial (MVP — Sprint 1, 2-3h):

- **Loja (Next.js):**
  - Home com 4 personas em destaque + 3 builds prontos por persona + componentes em destaque
  - PDP de PC pronto: galeria + specs estruturadas + FPS estimado por jogo + parcelamento + cross-sell periféricos
  - PDP de componente: specs técnicas + compatibilidade hint ("compatível com socket AM5")
  - **Builder funcional MVP**: escolhe categoria por categoria, em cada etapa filtra automaticamente só compatíveis, mostra wattagem somada e sugere fonte adequada, salva build, finaliza compra
  - Páginas de persona como landing SEO (`/builds/valorant-240fps`, etc)
  - Lista de espera por produto fora de estoque
  - Páginas institucionais padrão (sobre, contato, garantia, troca, privacidade)

- **Painel admin:**
  - CRUD produtos com campos extras (compatibility JSON, benchmarkFps JSON, weight, dimensions)
  - CRUD personas (cria/edita persona com nome, descrição, jogos-alvo, FPS-alvo)
  - CRUD builds prontos (monta PC e marca como "venda como produto" associado a persona)
  - Dashboard com KPIs do nicho (ver seção 10)
  - Lista de espera por produto + botão "notificar agora que está em estoque"

- **Backend:**
  - Schema com adições (Product extras + PCBuild + persona + benchmarkFps)
  - Endpoint `/api/builder/check-compatibility` (recebe array de partes, retorna lista de erros/warnings/sugestões)
  - Endpoint `/api/builder/recommend-psu` (recebe partes, retorna fonte sugerida)
  - Endpoint `/api/products/by-persona/:slug`
  - Endpoint `/api/waitlist/subscribe` + `/api/waitlist/notify`
  - Cron diário pra checar produtos com lista de espera e estoque novo

### Cupons sugeridos pra dia 1:
- **BEMVINDO5** (5% primeira compra)
- **PIXFIRST** (5-8% adicional pagando Pix — ajuda a fugir do parcelamento que come margem)
- **BUILDER10** (10% se montou no builder em vez de comprar PC pronto — incentiva uso da ferramenta)
- **COMBO15** (15% PC + periférico junto)
- **FRETE15** (frete grátis acima de R$ 5.000)

### KPIs prioritários (V1 dashboard):
1. Ticket médio por categoria
2. Funil builder: starts → adds → checkout
3. Conversão por persona
4. Lista de espera: total ativos por produto + tempo médio até notificação

## 16. Sources (URLs consultadas)

**Brasil:**
- https://adorocupom.com/blog/kabum-terabyte-pichau-qual-loja-gamer-compensa-mais/
- https://www.terabyteshop.com.br/pc-gamer/full-custom
- https://www.kabum.com.br/monte-seu-pc
- https://meupc.net/build
- https://meupc.net/sobre-nos
- https://blog.meupc.net/como-saber-se-as-pecas-do-pc-sao-compativeis/
- https://www.pichauarena.com.br/hardware/quanto-custa-pc-gamer/
- https://www.techtudo.com.br/guia/2026/01/como-montar-pc-gamer-basico-intermediario-e-premium-em-2026-veja-custo-edinfoeletro.ghtml
- https://olhardigital.com.br/2026/04/16/curiosidades/quanto-custa-montar-um-pc-gamer-basico-em-2026-veja-precos-atualizados/

**EUA:**
- https://nzxt.com/category/gaming-pcs
- https://nzxt.com/en-intl/collections/custom-pc
- https://www.pcgamer.com/bld-by-nzxt-review/
- https://maingear.com/
- https://www.windowscentral.com/gaming/pc-gaming/maingear-mg-1-mk-ii-launch
- https://www.buildcores.com/
- https://hyte.com/blog/buildcores-3d-building
- https://techguided.com/best-custom-pc-builders/

**Europa:**
- https://www.pcspecialist.co.uk/pc-configurator/
- https://www.overclockers.co.uk/pc-systems/custom-pcs
- https://www.caseking.de/en/pc-systems/pc-configurator
- https://www.ldlc.com/en/pc-builder/
- https://www.backmarket.com/en-us
- https://www.emeoutlookmag.com/technology/how-back-market-and-google-are-using-chromeos-flex-to-extend-laptop-lifecycles-and-reduce-e-waste

**Regulação BR:**
- https://itforum.com.br/colunas/quais-sao-as-garantias-dos-equipamentos-de-informatica/
- https://idec.org.br/consultas/dicas-e-direitos/garantia-entenda-os-prazos-para-reclamar-de-produto-com-defeito
- https://www.tjdft.jus.br/institucional/imprensa/campanhas-e-produtos/direito-facil/edicao-semanal/garantia-de-produtos
- https://www.procon.al.gov.br/noticia/22-randomicas/255-entenda-os-diferentes-tipos-de-garantias-asseguradas-pelo-codigo-de-defesa-do-consumidor

**Jargão técnico:**
- https://www.amd.com/pt/products/processors/chipsets/am5.html
- https://pt.wikipedia.org/wiki/Soquete_AM5
- https://www.pcgamer.com/intels-next-gen-lga1851-socket-for-800-series-motherboards-detailed/
- https://www.kabum.com.br/busca/placa-mae-am5

**Frete / logística:**
- https://olist.com/blog/pt/gestao-empresarial/operacao-e-logistica/pac-ou-sedex/
- https://ajuda.frenet.com.br/knowledge-base/qual-o-limite-de-peso-e-dimensoes-dos-correios/

---

**Status:** Validado pelo cliente em 2026-04-26. Cliente confirmou:
- Nome: **Kore Tech**
- Cores: Tech Lead decide (definido: dark `#0A0E14` + cyan elétrico `#00E5FF`)
- WhatsApp / MercadoPago / Cloudinary / domínio: placeholders (demo fictícia funcional)
