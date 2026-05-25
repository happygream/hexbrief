const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  platform: process.platform,
  isElectron: true,
  fetchRSS: (feedUrls) => ipcRenderer.invoke('fetch-rss', feedUrls),
});
