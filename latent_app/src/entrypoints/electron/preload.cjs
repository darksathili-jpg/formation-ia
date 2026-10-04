const { contextBridge, ipcRenderer } = require('electron');

const api = Object.freeze({
  getRuntimeInfo: () => ipcRenderer.invoke('runtime:get-info')
});

contextBridge.exposeInMainWorld('latentDesktop', api);
