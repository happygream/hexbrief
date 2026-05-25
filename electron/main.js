const { app, BrowserWindow, shell, nativeTheme, session } = require('electron');
const path = require('path');
const fs = require('fs');

const isDev = process.env.NODE_ENV === 'development';

let mainWindow;

function findIndexHtml() {
  const candidates = [
    path.join(process.resourcesPath, 'out', 'index.html'),
    path.join(app.getAppPath(), 'out', 'index.html'),
    path.join(app.getAppPath(), '..', 'out', 'index.html'),
    path.join(__dirname, '..', 'out', 'index.html'),
  ];
  for (const p of candidates) {
    if (fs.existsSync(p)) return p;
  }
  return candidates[0];
}

function createWindow() {
  nativeTheme.themeSource = 'dark';

  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 960,
    minHeight: 640,
    backgroundColor: '#0a0f1e',
    autoHideMenuBar: true,      // hides Edit/View/Window bar
    menuBarVisible: false,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
    },
    show: false,
  });

  // Remove menu bar entirely
  mainWindow.setMenu(null);

  if (isDev) {
    mainWindow.loadURL('http://localhost:3000');
  } else {
    mainWindow.loadFile(findIndexHtml());
  }

  mainWindow.once('ready-to-show', () => mainWindow.show());

  // Open external links in browser
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });

  mainWindow.webContents.on('will-navigate', (event, url) => {
    const isLocal = url.startsWith('file://') || (isDev && url.startsWith('http://localhost'));
    if (!isLocal) { event.preventDefault(); shell.openExternal(url); }
  });

  mainWindow.on('closed', () => { mainWindow = null; });
}

app.whenReady().then(() => {
  // Allow all external API calls — needed for Open-Meteo, ip-api, RSS feeds
  session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
    callback({
      responseHeaders: {
        ...details.responseHeaders,
        'Content-Security-Policy': [
          "default-src 'self' file: 'unsafe-inline' 'unsafe-eval'; " +
          "connect-src *; " +
          "img-src 'self' file: data: https:; " +
          "font-src 'self' file: data: https://fonts.gstatic.com https://fonts.googleapis.com; " +
          "style-src 'self' file: 'unsafe-inline' https://fonts.googleapis.com;"
        ]
      }
    });
  });

  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
