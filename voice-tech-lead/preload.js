const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
  transcribe: (payload) => ipcRenderer.invoke('transcribe', payload),
  pasteToActive: () => ipcRenderer.invoke('paste-to-active'),
  onModelProgress: (cb) => {
    ipcRenderer.on('model-progress', (_e, data) => cb(data));
  },
});
