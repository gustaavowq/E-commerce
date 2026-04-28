# Copy Produtos Exemplo — Kore Tech

> Descrições modelo para 3 SKUs, usadas pelo Backend (Agente 01) como molde no `prisma/seed.ts`.
> Cada SKU é um arquétipo: 1 componente avulso, 1 PC montado, 1 periférico.
> Mantido pelo Copywriter (Agente 07). Última atualização: 2026-04-26.

**Voz aplicada:** sem travessão, sem palavras proibidas (lista de 10 do `BRAND-BRIEF.md` seção 2), número antes de adjetivo, "você" sempre. Pix com 5% off precede parcelamento. Garantia explícita.

**Estrutura de cada bloco abaixo (campos pro seed):**
- `name` (h1 da PDP, ≤ 60 chars)
- `slug` (URL kebab-case)
- `tagline` (1 frase abaixo do h1)
- `description_short` (cartão PLP, ≤ 200 chars)
- `description_long` (corpo da PDP, em markdown)
- `bullets_benefit` (3 bullets que entram no bloco "destaques")
- `specs` (JSON estruturado da ficha técnica)
- `compatibility` (JSON usado pelo Builder)
- `benchmark_fps` (JSON, só PC montado)
- `personas_alvo` (slugs de persona, só PC montado e periférico de uso específico)
- `warranty_months`
- `installments_copy` (linha curta de parcela e Pix)

---

## SKU 1 — Componente avulso (GPU)

```yaml
name: GeForce RTX 4070 Super Gainward Phoenix 12GB
slug: rtx-4070-super-gainward-phoenix-12gb
tagline: 12GB GDDR6X. PCIe 4.0. Cabe em gabinete ATX padrão.
description_short: GPU pra Valorant 240 FPS, Fortnite 1440p competitivo e edição 4K em DaVinci. 12GB GDDR6X, pede 750W de fonte, comprimento 312mm.
warranty_months: 36
installments_copy: 12x R$ 458 sem juros, ou Pix R$ 5.230 (5% off)
```

### description_long

```markdown
A RTX 4070 Super resolve o ponto cego do tier mid-high: roda Valorant a 240 FPS estável e ainda dá conta de DaVinci Resolve em 4K sem ficar com VRAM no limite.

12GB GDDR6X é o que separa essa GPU da 4070 base. Em Fortnite competitivo no 1440p com Lumen ligado, isso vira 144 FPS sem stutter. Em edição de vídeo, vira projeto pesado aberto sem precisar reduzir preview.

A versão Phoenix da Gainward usa 2 ventoinhas axiais, fica em 312mm de comprimento (cabe na maioria dos gabinetes ATX, confere o seu antes) e pede fonte de 750W. Se a sua é menor, o Builder sugere upgrade na hora.

Vem com cabo PCIe nativo de 16 pinos, suporte de GPU vertical (opcional) e nota fiscal. Garantia de 36 meses Gainward, intermediada pela Kore.
```

### bullets_benefit

```yaml
- 240 FPS no Valorant 1080p high, 144 FPS no Fortnite 1440p DX12 com Lumen
- 12GB GDDR6X: timeline 4K em DaVinci sem swap pra RAM
- Pede fonte 750W. Builder calcula e sugere fonte se a sua não cobrir
```

### specs (JSON)

```json
{
  "chipset": "NVIDIA GeForce RTX 4070 Super",
  "vram": "12GB GDDR6X",
  "memory_bus": "192-bit",
  "memory_speed_gbps": 504,
  "cuda_cores": 7168,
  "rt_cores": "56 (3ª geração)",
  "tensor_cores": "224 (4ª geração)",
  "boost_clock_mhz": 2475,
  "base_clock_mhz": 1980,
  "tdp_watts": 220,
  "psu_recommended_watts": 750,
  "power_connector": "1x 16-pin (12VHPWR), adaptador 2x 8-pin incluso",
  "outputs": "3x DisplayPort 1.4a, 1x HDMI 2.1",
  "max_resolution": "7680x4320",
  "directx": "12 Ultimate",
  "opengl": "4.6",
  "ray_tracing": "Sim, 3ª gen",
  "dlss": "DLSS 3 com Frame Generation",
  "length_mm": 312,
  "width_slots": 2.5,
  "weight_grams": 1180,
  "cooler": "2 ventoinhas axiais, heatsink dual-slot",
  "warranty_months": 36
}
```

### compatibility (JSON usado pelo Builder)

```json
{
  "type": "gpu",
  "psu_min_watts": 750,
  "length_mm": 312,
  "width_slots": 2.5,
  "power_connector": "16pin_12vhpwr",
  "interface": "PCIe 4.0 x16"
}
```

### Conteúdo aba "Especificações" (renderizada do JSON)

Frontend usa `SpecsTable` lendo `specs`. Header da tabela: "Ficha técnica". Categorias agrupadas: GPU, memória, conectividade, alimentação, dimensões.

### Conteúdo aba "Compatibilidade"

```markdown
**Essa GPU serve com:**
- Qualquer placa-mãe PCIe 4.0 ou 5.0 (compatível para baixo)
- Fonte mínima 750W, de preferência 80+ Gold modular
- Gabinete com espaço pra 312mm de comprimento
- Cabo PCIe 16 pinos (acompanha adaptador 2x 8-pin)

[Testar no Builder]
```

### Trust signals (puxados de `ui.pdp.trust.*`)

- Original, com nota fiscal
- Garantia 36 meses Gainward, intermediada pela Kore
- Frete asseguro até R$ 15.000
- Defeito de fábrica nos primeiros 7 dias? Trocamos sem perícia

### Cross-sell sugerido (Frontend renderiza)

- Fonte Corsair RM750x 80+ Gold (cobre essa GPU)
- Monitor LG UltraGear 27" 1440p 240Hz (aproveita os FPS)
- Build prontos com essa GPU: "Valorant Pro", "Fortnite Competitivo"

---

## SKU 2 — PC montado

```yaml
name: Kore Tech Valorant Pro
slug: kore-tech-valorant-pro
tagline: 240 FPS no Valorant 1080p high, em estoque para envio em 24h após pagamento.
description_short: PC montado pra Valorant a 240 FPS estáveis. RTX 4070 Super, Ryzen 7 7700, 32GB DDR5. Testado 24h em estresse antes de sair daqui.
warranty_months: 12
installments_copy: 12x R$ 541 sem juros, ou Pix R$ 6.175 (5% off)
personas_alvo: ["valorant-240fps", "fortnite-competitivo"]
```

### description_long

```markdown
Esse build foi desenhado pra resolver um problema específico: rodar Valorant a 240 FPS estáveis no 1080p high, sem queda em smoke pesada nem em ronda 5x5 cheia de utilitário.

A combinação CPU + GPU é o que entrega o número. Ryzen 7 7700 tem cache L3 generoso (32MB), que é o que o motor do Valorant ama. RTX 4070 Super dá conta da renderização sem nem suar (a Riot otimizou bem o jogo, então sobra GPU pra você usar resolução nativa do monitor).

32GB DDR5 6000MHz são o teto saudável: você roda Valorant, Discord, Spotify e 30 abas do Chrome sem swap pra disco. A fonte de 750W cobre a GPU com 25% de folga, dá pra subir pra 4080 Super daqui um ano sem trocar.

Vem montado, com cable management feito por dentro do gabinete (NZXT H7 Flow), testado em estresse 24h ligado (Cinebench R23 + 3DMark Time Spy + Memtest86) antes de sair daqui. Se chegar com defeito de montagem nos primeiros 7 dias, trocamos sem perícia.
```

### bullets_benefit

```yaml
- 240 FPS estáveis no Valorant 1080p high, 165 FPS no Fortnite 1440p DX12
- Vem testado: 24h ligado em Cinebench, 3DMark e Memtest antes do envio
- Garantia de performance: se não rodar 240 FPS no Valorant, devolve em 7 dias
```

### O que vem dentro

```markdown
**Peças que vêm dentro:**

- **CPU:** Ryzen 7 7700, 8 núcleos 16 threads, 105W TDP
- **Placa-mãe:** ASUS TUF Gaming B650-Plus WiFi
- **Memória:** 32GB DDR5 6000MHz CL30 (2x 16GB Kingston Fury Beast)
- **GPU:** GeForce RTX 4070 Super 12GB Gainward Phoenix
- **Armazenamento:** SSD Kingston KC3000 1TB NVMe Gen4 (7000 MB/s leitura)
- **Fonte:** Corsair RM750x 80+ Gold modular, 10 anos de garantia
- **Gabinete:** NZXT H7 Flow preto, mesh frontal, fluxo de ar otimizado
- **Cooler:** Watercooler AIO 240mm Lian Li Galahad II

[Comparar com peças soltas]
```

### benchmark_fps (JSON)

```json
{
  "valorant_1080p_high": 240,
  "valorant_1440p_high": 200,
  "fortnite_1440p_dx12_lumen": 144,
  "fortnite_1080p_performance": 240,
  "cs2_1080p_high": 380,
  "cs2_1440p_high": 280,
  "fps_method": "FRAPS, build idêntico, mapas oficiais, qualidade indicada"
}
```

### specs (JSON resumido)

```json
{
  "build_type": "pc_pronto",
  "cpu": "Ryzen 7 7700",
  "gpu": "RTX 4070 Super 12GB",
  "ram_gb": 32,
  "ram_speed": "DDR5-6000",
  "storage": "1TB NVMe Gen4",
  "psu_watts": 750,
  "psu_certification": "80+ Gold",
  "case": "NZXT H7 Flow",
  "cooler": "AIO 240mm",
  "warranty_months": 12,
  "warranty_type": "BTO Kore: 12 meses cobrindo montagem + garantia individual de cada peça",
  "bto_assembly_days": 3,
  "bto_test_hours": 24
}
```

### Trust signals específicos de PC montado

- Garantia BTO Kore: cobre montagem por 12 meses
- Cada peça mantém garantia individual do fabricante
- Lacre fotografado antes do envio (proteção pra você e pra gente)
- Frete asseguro até R$ 15.000

### Cross-sell sugerido

- Monitor LG UltraGear 27" 1440p 240Hz (aproveita o FPS)
- Mouse Logitech G Pro X Superlight 2
- Teclado mecânico Keychron K2 Pro switch vermelho
- Headset HyperX Cloud III

---

## SKU 3 — Periférico (monitor)

```yaml
name: Monitor LG UltraGear 27GP850-B 27" 1440p IPS 240Hz
slug: lg-ultragear-27gp850-b-27-1440p-ips-240hz
tagline: IPS 1ms, G-Sync e FreeSync Premium. Pra quem joga competitivo no 240 FPS.
description_short: Monitor 27" IPS 1440p 240Hz com 1ms de resposta. G-Sync compatível, HDR400, suporte ergonômico ajustável. Pra Valorant, CS2 e Fortnite competitivo.
warranty_months: 36
installments_copy: 12x R$ 312 sem juros, ou Pix R$ 3.560 (5% off)
personas_alvo: ["valorant-240fps", "fortnite-competitivo", "cs2-high-tier"]
```

### description_long

```markdown
Esse monitor foi feito pra acompanhar GPU forte. Se você tem RTX 4070 Super ou superior, está jogando no 1080p e vendo o FPS passar de 240 sem o monitor renderizar tudo, é hora de subir pro 1440p sem perder a taxa de atualização.

O painel IPS Nano cobre 98% DCI-P3, mantém ângulo de visão sem lavar a cor (importante se a sala não é totalmente escura). 1ms GtG é real, não é "1ms MPRT" enganador. G-Sync compatível e FreeSync Premium funcionam no mesmo cabo DisplayPort 1.4.

HDR400 é a entrada do HDR (não esperar OLED), mas em jogo competitivo isso pouco importa: quem joga Valorant rankeado deixa contraste alto e brilho fixo de qualquer jeito.

Suporte ergonômico ajusta altura, inclinação, rotação e pivot 90 graus (pra programar ou usar como secundário em portrait). VESA 100x100 se quiser braço articulado.

Vem com cabo DisplayPort 1.4 e HDMI 2.1. Garantia LG de 36 meses, intermediada pela Kore.
```

### bullets_benefit

```yaml
- 1440p 240Hz IPS Nano com 1ms GtG: aproveita GPU forte sem perder taxa
- G-Sync compatível e FreeSync Premium no mesmo cabo DisplayPort
- Suporte ergonômico completo: altura, inclinação, pivot 90 graus
```

### specs (JSON)

```json
{
  "size_inches": 27,
  "panel_type": "IPS Nano",
  "resolution": "2560x1440",
  "refresh_rate_hz": 240,
  "response_time_gtg_ms": 1,
  "color_gamut_dci_p3": "98%",
  "color_depth": "10-bit (8-bit + FRC)",
  "hdr": "VESA DisplayHDR 400",
  "contrast_ratio": "1000:1",
  "brightness_nits": 400,
  "viewing_angle": "178/178",
  "adaptive_sync": "G-Sync Compatible, AMD FreeSync Premium",
  "inputs": "2x HDMI 2.1, 1x DisplayPort 1.4, 2x USB 3.0",
  "audio": "Sem alto-falantes (saída 3.5mm)",
  "ergonomics": {
    "height_adjustable_mm": 110,
    "tilt": "-5 a +15 graus",
    "swivel": "-15 a +15 graus",
    "pivot": "90 graus"
  },
  "vesa_mount": "100x100",
  "weight_with_stand_kg": 6.7,
  "warranty_months": 36
}
```

### compatibility (JSON)

```json
{
  "type": "monitor",
  "min_gpu_dp_version": "1.4",
  "alt_input": "HDMI 2.1",
  "recommended_gpu_class": "rtx_4060_or_higher_for_native_240hz_1440p"
}
```

### Trust signals

- Original, com nota fiscal
- Garantia LG de 36 meses, intermediada pela Kore
- 7 dias para arrependimento (CDC)
- Frete asseguro

### Cross-sell sugerido

- GPU RTX 4070 Super ou superior (entrega 240 FPS no 1440p competitivo)
- Mouse Logitech G Pro X Superlight 2
- Suporte de monitor articulado (libera espaço na mesa)

---

## Padrões cross-SKU (regras pro Backend aplicar em outros produtos do seed)

### Estrutura do `description_long`

1. **Parágrafo 1:** dor que o produto resolve, com número específico no final.
2. **Parágrafo 2:** o "porquê técnico" (qual spec entrega o resultado).
3. **Parágrafo 3:** detalhes práticos (dimensões, conectores, garantia, o que vem na caixa).

### Estrutura do `description_short` (cartão PLP)

- Máximo 200 caracteres.
- Sempre tem 1 número (FPS, GB, Hz, MHz, W).
- Sempre tem o uso ("pra Valorant", "pra edição 4K") quando faz sentido.
- Nunca usa "incrível", "premium", "next-level".

### Bullets de benefício

- Sempre 3 bullets.
- Cada bullet começa com número ou verbo de ação.
- Pelo menos 2 dos 3 têm número mensurável (FPS, ms, W, GB, mm).

### Tom específico por categoria

| Categoria | Foco do tom |
|---|---|
| CPU | Socket, núcleos, cache, TDP. Mostra qual mobo aceita. |
| GPU | FPS estimado em jogos, VRAM, comprimento, fonte mínima. |
| Placa-mãe | Socket, chipset, slots RAM, suporte PCIe, fator. |
| RAM | Velocidade, latência (CL), capacidade, tipo (DDR4/DDR5). |
| Storage | MB/s leitura, geração (NVMe Gen4/Gen5), capacidade. |
| Fonte | Wattagem, certificação 80+, modular S/N, anos de garantia. |
| Gabinete | Suporte GPU max, cooler max, fator, fluxo de ar. |
| Cooler | Tipo (ar/AIO), socket compatível, altura, ruído. |
| Monitor | Painel, resolução, Hz, ms GtG, sync. |
| Periférico | Switch, sensor DPI, peso, conectividade. |
| PC montado | FPS por jogo, peças que vêm, BTO, garantia única. |

### Garantia (regra dura)

- **Componente:** garantia oficial fabricante + intermediada Kore + 90 dias CDC.
- **PC montado:** garantia BTO Kore 12 meses (cobre montagem) + cada peça mantém garantia fabricante.
- **Periférico:** garantia oficial fabricante + 7 dias arrependimento CDC.

Sempre escrito explícito na PDP. Nunca implícito.

### Parcelamento (regra dura)

- Linha sempre na ordem: parcela 12x, depois Pix com 5% off.
- Exemplo: `12x R$ 458 sem juros, ou Pix R$ 5.230 (5% off)`.
- Vírgula separa, nunca travessão.

---

## Pendências pra outros agentes

- **[Backend]** Use os 3 blocos acima como molde dos 30+ SKUs do seed. `specs` e `compatibility` são estruturas literais, copia o shape.
- **[Frontend]** `SpecsTable.tsx` lê `specs` JSON e renderiza agrupado. Frontend define ordem de categorias na tabela.
- **[Designer]** Componente `FPSBadge` recebe `{jogo, fps, resolucao, qualidade}` do `benchmark_fps` JSON.
- **[Growth]** Meta title, meta description e JSON-LD `Product` saem de `name`, `description_short`, `specs`. Growth pode reescrever meta para SEO sem mexer no PDP body.
- **[Data Analyst]** Evento `view_product` no GA4 com param `category` e `product_slug`.
