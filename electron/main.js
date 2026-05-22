const { app, BrowserWindow, shell, nativeTheme, Menu } = require('electron');
const path = require('path');
const fs = require('fs');

const isDev = process.env.NODE_ENV === 'development';

let mainWindow;

function findIndexHtml() {
  // Try multiple paths in order — one will work depending on packaging method
  const candidates = [
    path.join(process.resourcesPath, 'out', 'index.html'),
    path.join(app.getAppPath(), 'out', 'index.html'),
    path.join(app.getAppPath(), '..', 'out', 'index.html'),
    path.join(__dirname, '..', 'out', 'index.html'),
    path.join(process.resourcesPath, 'out', 'index.html'),
  ];

  for (const p of candidates) {
    if (fs.existsSync(p)) {
      console.log('Found index.html at:', p);
      return p;
    }
    console.log('Not found:', p);
  }

  // Last resort — return first candidate and let it fail with an error
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
    titleBarStyle: process.platform === 'darwin' ? 'hiddenInset' : 'default',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
    },
    show: false,
  });

  if (isDev) {
    mainWindow.loadURL('http://localhost:3000');
    mainWindow.webContents.openDevTools();
  } else {
    const indexPath = findIndexHtml();
    mainWindow.loadFile(indexPath);
  }

  mainWindow.once('ready-to-show', () => mainWindow.show());

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });

  mainWindow.webContents.on('will-navigate', (event, url) => {
    const isLocal = url.startsWith('file://') ||
                    (isDev && url.startsWith('http://localhost'));
    if (!isLocal) {
      event.preventDefault();
      shell.openExternal(url);
    }
  });

  mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDesc, url) => {
    console.error('Load failed:', errorCode, errorDesc, url);
    // Show error in window so we can see what path was tried
    mainWindow.webContents.executeJavaScript(`
      document.body.innerHTML = '<div style="color:white;padding:40px;font-family:monospace;background:#0a0f1e;min-height:100vh">' +
        '<h2 style="color:#e8412a">HexBrief — Load Error</h2>' +
        '<p>Error ${errorCode}: ${errorDesc}</p>' +
        '<p>Tried to load: ${url}</p>' +
        '<p>App path: ' + require && '' + '</p>' +
      '</div>'
    `).catch(() => {});
  });

  mainWindow.on('closed', () => { mainWindow = null; });
}

function buildMenu() {
  const template = [
    ...(process.platform === 'darwin' ? [{
      label: app.name,
      submenu: [
        { role: 'about' },
        { type: 'separator' },
        { role: 'hide' }, { role: 'hideOthers' }, { role: 'unhide' },
        { type: 'separator' },
        { role: 'quit' },
      ],
    }] : []),
    {
      label: 'Edit',
      submenu: [
        { role: 'undo' }, { role: 'redo' },
        { type: 'separator' },
        { role: 'cut' }, { role: 'copy' }, { role: 'paste' }, { role: 'selectAll' },
      ],
    },
    {
      label: 'View',
      submenu: [
        { role: 'reload' },
        { type: 'separator' },
        { role: 'resetZoom' }, { role: 'zoomIn' }, { role: 'zoomOut' },
        { type: 'separator' },
        { role: 'togglefullscreen' },
        { role: 'toggleDevTools' },
      ],
    },
    {
      label: 'Window',
      submenu: [
        { role: 'minimize' },
        ...(process.platform === 'darwin'
          ? [{ type: 'separator' }, { role: 'front' }]
          : [{ role: 'close' }]),
      ],
    },
  ];
  Menu.setApplicationMenu(Menu.buildFromTemplate(template));
}

app.whenReady().then(() => {
  createWindow();
  buildMenu();
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
