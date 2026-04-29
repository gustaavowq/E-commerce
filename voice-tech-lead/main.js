const { app, BrowserWindow, ipcMain, session, globalShortcut } = require('electron');
const path = require('node:path');
const { spawn } = require('node:child_process');

let mainWin = null;
let transcriber = null;
let lastProgress = -1;

async function getTranscriber(progressCallback) {
  if (transcriber) return transcriber;

  const { pipeline, env } = await import('@xenova/transformers');

  env.cacheDir = path.join(app.getPath('userData'), 'transformers-cache');
  env.allowLocalModels = false;

  transcriber = await pipeline(
    'automatic-speech-recognition',
    'Xenova/whisper-small',
    {
      quantized: true,
      progress_callback: progressCallback,
    }
  );
  return transcriber;
}

function pasteToActiveWindow() {
  return new Promise((resolve) => {
    if (mainWin && !mainWin.isDestroyed()) mainWin.minimize();

    setTimeout(() => {
      const psCmd = [
        "Add-Type -AssemblyName System.Windows.Forms",
        "[System.Windows.Forms.SendKeys]::SendWait('^v')",
        "Start-Sleep -Milliseconds 100",
        "[System.Windows.Forms.SendKeys]::SendWait('{ENTER}')",
      ].join('; ');

      const ps = spawn(
        'powershell.exe',
        ['-NoProfile', '-WindowStyle', 'Hidden', '-Command', psCmd],
        { windowsHide: true }
      );
      ps.on('close', (code) => resolve({ ok: code === 0 }));
      ps.on('error', (e) => resolve({ ok: false, error: e.message }));
    }, 280);
  });
}

function createWindow() {
  mainWin = new BrowserWindow({
    width: 480,
    height: 680,
    minWidth: 420,
    minHeight: 600,
    title: 'Tech-Lead — voz',
    backgroundColor: '#0a0a0a',
    alwaysOnTop: true,
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
    },
  });

  mainWin.loadFile('index.html');

  session.defaultSession.setPermissionRequestHandler((_wc, permission, callback) => {
    callback(
      permission === 'media' ||
      permission === 'clipboard-read' ||
      permission === 'clipboard-sanitized-write'
    );
  });

  mainWin.webContents.once('did-finish-load', () => {
    getTranscriber((p) => {
      if (p.status === 'progress') {
        const pct = Math.floor(p.progress || 0);
        if (pct !== lastProgress) {
          lastProgress = pct;
          mainWin.webContents.send('model-progress', { status: 'downloading', progress: pct, file: p.file });
        }
      }
    }).then(() => {
      mainWin.webContents.send('model-progress', { status: 'ready' });
    }).catch((e) => {
      mainWin.webContents.send('model-progress', { status: 'error', error: e.message });
    });
  });

  mainWin.on('closed', () => { mainWin = null; });
}

ipcMain.handle('transcribe', async (_evt, { buffer }) => {
  try {
    const t = await getTranscriber();
    const float32 = new Float32Array(buffer);
    if (float32.length < 16000 * 0.3) {
      return { ok: false, error: 'áudio muito curto (< 0.3s)' };
    }
    const result = await t(float32, {
      language: 'portuguese',
      task: 'transcribe',
      chunk_length_s: 30,
      stride_length_s: 5,
    });
    return { ok: true, text: (result.text || '').trim() };
  } catch (e) {
    return { ok: false, error: e.message };
  }
});

ipcMain.handle('paste-to-active', async () => {
  return pasteToActiveWindow();
});

app.whenReady().then(() => {
  createWindow();

  // Hotkey global: aperta F9 com terminal em foco -> Ctrl+V + Enter na janela ativa
  globalShortcut.register('F9', () => {
    pasteToActiveWindow();
  });
});

app.on('will-quit', () => {
  globalShortcut.unregisterAll();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});
