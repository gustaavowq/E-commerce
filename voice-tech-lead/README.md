# Voice Tech-Lead

Telinha desktop pra falar por voz e transcrever pra texto. Você fala, ele transcreve, você copia e cola no terminal do Claude Code.

## Quick start

```bash
npm install     # ~30s
npm start       # abre a janela
```

Primeira vez baixa o modelo Whisper (~40MB, ~30s). Depois roda 100% offline.

## Como funciona

1. Janela 480x640 abre, sempre on top
2. Espera o status mudar pra **"Pronto. Clica gravar e fala."** (bolinha verde)
3. Clica **🎤 Gravar**, fala em pt-BR enquanto navega no e-commerce
4. Clica **⏹ Parar** → Whisper transcreve em ~2-5s
5. Texto aparece no textarea (e já vai pro clipboard automaticamente)
6. Edita se quiser, clica **Copiar**, cola no terminal do Claude Code

Pode gravar várias vezes seguidas — cada nova gravação concatena no textarea.

## Stack

- **Electron 30** (Chromium + Node)
- **@xenova/transformers** + **Whisper-tiny** rodando local (ONNX runtime, WASM)
- **Web Audio API** pra captura (sem MediaRecorder, vai direto pra Float32 16kHz)
- **Vanilla HTML/CSS/JS** (~250 LoC, zero build)
- **Custo zero** — sem APIs pagas; modelo offline depois do primeiro download

## Estrutura

```
voice-tech-lead/
├── package.json          Electron + transformers.js
├── main.js               processo principal + IPC + Whisper pipeline
├── preload.js            bridge segura main↔renderer
├── index.html            UI
├── renderer.js           Web Audio capture + IPC
├── styles.css            dark theme
└── assets/
    └── robo.png          avatar (DiceBear bottts-neutral)
```

## Permissões

Na 1ª execução o Windows pede mic — autoriza. Modelo Whisper baixa do HuggingFace na 1ª vez (precisa internet só nesse momento), depois fica em cache em `%APPDATA%/voice-tech-lead/transformers-cache/`.

## Out of scope (V2)

- Gravação contínua com transcrição streaming (em vez de "para → transcreve")
- TTS resposta do robô
- Hotkey global pra gravar
- Whisper-base ou whisper-small (mais preciso, ~150MB)
