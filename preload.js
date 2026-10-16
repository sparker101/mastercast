const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
  loadData: () => ipcRenderer.invoke('data:load'),
  saveData: (data) => ipcRenderer.invoke('data:save', data),
  copyText: (text) => ipcRenderer.invoke('clipboard:write', text),
  openMediaFolder: (p) => ipcRenderer.invoke('media:open', p),
  openExternal: (url) => ipcRenderer.invoke('shell:external', url),
});
