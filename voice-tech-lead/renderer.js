const $ = (sel) => document.querySelector(sel);

const els = {
  record: $('#record'),
  stop: $('#stop'),
  copy: $('#copy'),
  clear: $('#clear'),
  send: $('#send'),
  transcript: $('#transcript'),
  status: $('#status'),
  dot: $('#dot'),
  timer: $('#timer'),
  toast: $('#toast'),
};

const state = {
  recording: false,
  modelReady: false,
  transcribing: false,
  mediaStream: null,
  audioCtx: null,
  processor: null,
  source: null,
  samples: [],
  startedAt: null,
  timerHandle: null,
};

// ---- model progress ----
function setupModelProgress() {
  window.api.onModelProgress((data) => {
    if (data.status === 'downloading') {
      const file = (data.file || '').split('/').pop() || 'modelo';
      els.status.textContent = `Baixando ${file}… ${data.progress}%`;
      els.record.disabled = true;
    } else if (data.status === 'ready') {
      state.modelReady = true;
      els.status.textContent = 'Pronto. Clica gravar e fala.';
      els.dot.classList.add('ready');
      els.record.disabled = false;
    } else if (data.status === 'error') {
      els.status.textContent = 'Falha ao carregar modelo: ' + data.error;
      els.record.disabled = true;
      showToast('Modelo não carregou: ' + data.error, 'err');
    }
  });
}

// ---- audio capture ----
async function startRecording() {
  if (state.recording || state.transcribing) return;

  if (!state.modelReady) {
    showToast('aguarda o modelo terminar de carregar', 'err');
    return;
  }

  try {
    state.mediaStream = await navigator.mediaDevices.getUserMedia({
      audio: { echoCancellation: true, noiseSuppression: true, channelCount: 1 },
    });
  } catch (e) {
    showToast('mic negado: ' + e.message, 'err');
    return;
  }

  state.audioCtx = new AudioContext({ sampleRate: 16000 });
  state.source = state.audioCtx.createMediaStreamSource(state.mediaStream);
  state.processor = state.audioCtx.createScriptProcessor(4096, 1, 1);
  state.samples = [];

  state.processor.onaudioprocess = (e) => {
    const chunk = e.inputBuffer.getChannelData(0);
    for (let i = 0; i < chunk.length; i++) state.samples.push(chunk[i]);
  };

  state.source.connect(state.processor);
  state.processor.connect(state.audioCtx.destination);

  state.recording = true;
  state.startedAt = Date.now();

  els.record.disabled = true;
  els.stop.disabled = false;
  els.dot.classList.add('recording');
  els.dot.classList.remove('ready');
  els.status.textContent = 'Ouvindo… fale o que está vendo.';
  startTimer();
}

async function stopRecording() {
  if (!state.recording) return;
  state.recording = false;
  stopTimer();

  try { state.processor && state.processor.disconnect(); } catch (_) {}
  try { state.source && state.source.disconnect(); } catch (_) {}
  try { state.audioCtx && state.audioCtx.close(); } catch (_) {}
  if (state.mediaStream) {
    state.mediaStream.getTracks().forEach((t) => t.stop());
  }
  state.mediaStream = null;
  state.audioCtx = null;
  state.processor = null;
  state.source = null;

  els.dot.classList.remove('recording');
  els.dot.classList.add('ready');

  if (state.samples.length < 16000 * 0.3) {
    els.status.textContent = 'Áudio muito curto. Tenta de novo.';
    state.samples = [];
    els.record.disabled = false;
    els.stop.disabled = true;
    return;
  }

  await transcribeSamples();
}

async function transcribeSamples() {
  state.transcribing = true;
  els.record.disabled = true;
  els.stop.disabled = true;
  els.status.textContent = 'Transcrevendo…';

  const float32 = new Float32Array(state.samples);
  state.samples = [];

  try {
    const result = await window.api.transcribe({ buffer: float32.buffer });
    if (result.ok && result.text) {
      const existing = els.transcript.value.trimEnd();
      els.transcript.value = (existing ? existing + ' ' : '') + result.text;
      els.status.textContent = 'Pronto. Continua falando ou envia.';
      // Auto-copia pra clipboard
      try { await navigator.clipboard.writeText(els.transcript.value); } catch (_) {}
    } else {
      showToast('Falha na transcrição: ' + (result.error || 'erro desconhecido'), 'err');
      els.status.textContent = 'Erro. Tenta de novo.';
    }
  } catch (e) {
    showToast('Erro: ' + e.message, 'err');
    els.status.textContent = 'Erro. Tenta de novo.';
  } finally {
    state.transcribing = false;
    els.record.disabled = false;
    els.stop.disabled = true;
    updateActions();
  }
}

// ---- timer ----
function startTimer() {
  stopTimer();
  state.timerHandle = setInterval(() => {
    const sec = Math.floor((Date.now() - state.startedAt) / 1000);
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    els.timer.textContent = `${m}:${String(s).padStart(2, '0')}`;
  }, 250);
}

function stopTimer() {
  if (state.timerHandle) {
    clearInterval(state.timerHandle);
    state.timerHandle = null;
  }
}

// ---- transcript actions ----
function updateActions() {
  const has = els.transcript.value.trim().length > 0;
  els.copy.disabled = !has;
  els.clear.disabled = !has;
  els.send.disabled = !has || state.transcribing || state.recording;
}

async function copyTranscript() {
  const text = els.transcript.value.trim();
  if (!text) return;
  try {
    await navigator.clipboard.writeText(text);
    showToast('✅ copiado pro clipboard', 'ok');
  } catch (e) {
    showToast('falha ao copiar: ' + e.message, 'err');
  }
}

function clearTranscript() {
  els.transcript.value = '';
  els.timer.textContent = '0:00';
  els.status.textContent = state.modelReady
    ? 'Pronto. Clica gravar e fala.'
    : 'Aguardando modelo…';
  updateActions();
}

async function sendToTerminal() {
  const text = els.transcript.value.trim();
  if (!text) return;
  // Garantir que clipboard tem o texto
  try {
    await navigator.clipboard.writeText(text);
  } catch (_) {}
  els.send.disabled = true;
  els.status.textContent = 'Mandando pro terminal…';
  try {
    const result = await window.api.pasteToActive();
    if (result.ok) {
      showToast('📤 enviado pro terminal', 'ok');
      els.transcript.value = '';
      els.timer.textContent = '0:00';
      els.status.textContent = 'Mandado. Volta pro Claude Code pra ver a resposta.';
    } else {
      showToast('falha ao enviar: ' + (result.error || 'erro'), 'err');
      els.status.textContent = 'Erro ao enviar. Cola manualmente.';
    }
  } catch (e) {
    showToast('erro: ' + e.message, 'err');
  } finally {
    updateActions();
  }
}

// ---- toast ----
function showToast(msg, kind = 'ok') {
  els.toast.textContent = msg;
  els.toast.className = `toast ${kind}`;
  els.toast.hidden = false;
  setTimeout(() => { els.toast.hidden = true; }, 3000);
}

// ---- wire up ----
els.record.addEventListener('click', startRecording);
els.stop.addEventListener('click', stopRecording);
els.copy.addEventListener('click', copyTranscript);
els.clear.addEventListener('click', clearTranscript);
els.send.addEventListener('click', sendToTerminal);
els.transcript.addEventListener('input', updateActions);

window.addEventListener('DOMContentLoaded', () => {
  setupModelProgress();
  updateActions();
});
