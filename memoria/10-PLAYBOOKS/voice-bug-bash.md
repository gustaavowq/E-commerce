# Playbook: Bug-bash voz

> Capturar achados em e-commerce sem parar de testar pra digitar. Você narra, app transcreve, você cola no terminal do Claude Code.

## Quando usar

- ✅ Smoke test em produção depois de deploy
- ✅ Bug bash de pré-release
- ✅ QA exploratório de feature nova
- ✅ Mãos ocupadas testando responsivo no celular
- ❌ Especificação de feature nova (use texto, voz é ruim pra spec longa)
- ❌ Decisões arquiteturais (idem)

## Setup (1 vez)

```bash
cd voice-tech-lead
npm install        # ~30s, baixa Electron + transformers.js
```

Primeira execução baixa o modelo Whisper-tiny (~40MB) do HuggingFace. Depois roda 100% offline.

## Uso

### 1. Abrir o app
```bash
cd voice-tech-lead
npm start
```

Janela 480x640 abre no canto, sempre on top. Avatar de robô + bolinha de status.

### 2. Esperar modelo
Status mostra "Inicializando…" → "Baixando whisper-tiny… 23%" (1ª vez) → "Pronto. Clica gravar e fala." (bolinha verde).

### 3. Gravar
Clica **🎤 Gravar**. Bolinha vermelha pulsando. Fala em pt-BR enquanto navega:

> "Acabei de abrir a home. Hero tá legal mas a foto demora pra carregar, parece sem lazy. Cliquei num produto, PDP abriu. Fotos secundárias estão pixeladas. Tentei adicionar ao carrinho, funcionou. Mas o ícone do header não atualizou o badge, só atualiza se eu der refresh. Fui pro checkout, tive que logar. Login funcionou rápido. No checkout, o botão Pix tá meio escondido, só aparece se rolar."

### 4. Parar
Clica **⏹ Parar**. Status muda pra "Transcrevendo…" (~2-5s no whisper-tiny).

Texto aparece no textarea. **Já vai pro clipboard automaticamente.**

### 5. Repetir se quiser
Pode gravar mais — concatena no textarea. Edita o texto se houver erro de Whisper antes de enviar.

### 6. Colar no terminal
Vai pro terminal do Claude Code. **Cola** o texto (Ctrl+V). Pode adicionar prefixo:

```
tech-lead, processa esse bug-bash:

[texto colado]
```

Ou simplesmente colar — eu reconheço o formato (várias frases corridas, transcrição de voz) e ativo modo bug-bash automaticamente.

## Como o tech-lead processa

1. Parsea cada frase como achado independente
2. Classifica P0/P1/P2 (`memoria/10-PLAYBOOKS/bug-bash-ux.md`)
3. Dispatcha agents por tipo:

| Tipo | Skills |
|------|--------|
| Visual (layout, espaçamento, sobreposição) | `ecommerce-frontend` + `ecommerce-designer` |
| Fluxo (botão dead, navegação, estado UI) | `ecommerce-frontend` + `ecommerce-qa` |
| API / dados / auth / payment | `ecommerce-backend` |
| Texto / copy | `ecommerce-copywriter` |
| Performance / cache | `ecommerce-frontend` + `ecommerce-devops` |
| SEO / OG | `ecommerce-growth` |
| Métrica / dashboard | `ecommerce-data-analyst` |

4. Reporta consolidado: bugs (com severidade) + agents dispatchados + ETA

## Anti-padrões

- ❌ **Ditar texto longo de spec** — voz é ruim pra precisão; use texto
- ❌ **Falar 1-2 frases e mandar** — tech-lead devolve "muito curto"
- ❌ **Não revisar antes de colar** — Whisper-tiny erra ~10-15%, ler antes evita ruído
- ❌ **Misturar especificação + bug-bash** — confunde dispatch; uma sessão por modo

## Trigger phrases (opcional, ajudam classificação)

- **"P-zero"** ou **"crítico"** → marca como P0 explicitamente
- **"detalhe"** ou **"polimento"** → marca como P2
- **"fim"** ou **"acho que é isso"** → você sabe que terminou

Não obrigatório — tech-lead consegue classificar sem.

## Stack

- **Electron 30** (open source, gratuito)
- **Whisper-tiny** local via `@xenova/transformers` (ONNX runtime + WASM, offline depois do download)
- **Web Audio API** captura (Float32 16kHz mono, sem MediaRecorder)
- **Vanilla JS** (~250 LoC)
- **Custo zero** — modelo offline, sem APIs pagas

Código em `voice-tech-lead/`.
