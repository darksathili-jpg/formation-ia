import { contextBridge, ipcRenderer } from 'electron';

const api = Object.freeze({
  getRuntimeInfo: () => ipcRenderer.invoke('runtime:get-info')
});

contextBridge.exposeInMainWorld('latentDesktop', api);
