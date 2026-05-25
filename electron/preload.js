const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  platform: process.platform,
  isElectron: true,
  fetchRSS: (feedUrls) => ipcRenderer.invoke('fetch-rss', feedUrls),
  setAutoStart: (enable) => ipcRenderer.invoke('set-auto-start', enable),
  getAutoStart: () => ipcRenderer.invoke('get-auto-start'),
  notify: (title, body) => ipcRenderer.invoke('notify', title, body),
});
