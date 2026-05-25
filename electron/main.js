const { app, BrowserWindow, shell, nativeTheme, session, ipcMain, Notification } = require('electron');
const path = require('path');
const fs = require('fs');
const https = require('https');
const http = require('http');

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

function nodeFetch(url) {
  return new Promise((resolve, reject) => {
    const lib = url.startsWith('https') ? https : http;
    const req = lib.get(url, { timeout: 8000, headers: { 'User-Agent': 'HexBrief/1.0' } }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return nodeFetch(res.headers.location).then(resolve).catch(reject);
      }
      let data = '';
      res.on('data', chunk => { data += chunk; });
      res.on('end', () => resolve(data));
    });
    req.on('error', reject);
    req.on('timeout', () => { req.destroy(); reject(new Error('timeout')); });
  });
}

function parseRSS(xml, feedUrl) {
  const items = [];
  try {
    let sourceName = feedUrl;
    try { sourceName = new URL(feedUrl).hostname.replace('www.', '').replace('feeds.', ''); } catch {}

    function getTag(str, tag) {
      const patterns = [
        new RegExp(`<${tag}[^>]*><!\\[CDATA\\[([\\s\\S]*?)\\]\\]><\\/${tag}>`, 'i'),
        new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, 'i'),
      ];
      for (const p of patterns) {
        const m = str.match(p);
        if (m) return m[1].trim();
      }
      return '';
    }

    function getAttr(str, tag, attr) {
      const m = str.match(new RegExp(`<${tag}[^>]+${attr}=["']([^"']+)["']`, 'i'));
      return m ? m[1] : '';
    }

    function extractImage(str) {
      let m = str.match(/<media:content[^>]+url=["']([^"']+)["'][^>]*medium=["']image["']/i);
      if (!m) m = str.match(/<media:content[^>]+medium=["']image["'][^>]*url=["']([^"']+)["']/i);
      if (m) return m[1];
      m = str.match(/<media:thumbnail[^>]+url=["']([^"']+)["']/i);
      if (m) return m[1];
      m = str.match(/<enclosure[^>]+type=["']image\/[^"']*["'][^>]+url=["']([^"']+)["']/i);
      if (!m) m = str.match(/<enclosure[^>]+url=["']([^"']+)["'][^>]*type=["']image\/[^"']*["']/i);
      if (m) return m[1];
      m = str.match(/<img[^>]+src=["']([^"']+)["']/i);
      if (m) return m[1];
      return '';
    }

    function stripHtml(str) {
      return str.replace(/<[^>]+>/g, '').replace(/&amp;/g,'&').replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&quot;/g,'"').replace(/&#39;/g,"'").trim();
    }

    const itemRegex = /<item[\s>]([\s\S]*?)<\/item>/gi;
    const entryRegex = /<entry[\s>]([\s\S]*?)<\/entry>/gi;
    let match, count = 0;

    while ((match = itemRegex.exec(xml)) !== null && count < 4) {
      const block = match[1];
      const title = stripHtml(getTag(block, 'title'));
      let link = getTag(block, 'link') || getAttr(block, 'link', 'href') || getTag(block, 'guid');
      const image = extractImage(block);
      const rawDesc = getTag(block, 'description') || getTag(block, 'content:encoded') || '';
      const description = stripHtml(rawDesc).slice(0, 140);
      if (title && link) { items.push({ title, link, source: sourceName, image, description }); count++; }
    }

    if (items.length === 0) {
      count = 0;
      while ((match = entryRegex.exec(xml)) !== null && count < 4) {
        const block = match[1];
        const title = stripHtml(getTag(block, 'title'));
        const link = getAttr(block, 'link', 'href') || getTag(block, 'link');
        const image = extractImage(block);
        if (title && link) { items.push({ title, link, source: sourceName, image, description: '' }); count++; }
      }
    }
  } catch (e) { console.error('RSS parse error:', e); }
  return items;
}

// IPC handlers
ipcMain.handle('fetch-rss', async (event, feedUrls) => {
  const results = await Promise.allSettled(
    feedUrls.map(async (url) => {
      const xml = await nodeFetch(url);
      return parseRSS(xml, url);
    })
  );
  const items = [];
  for (const r of results) {
    if (r.status === 'fulfilled') items.push(...r.value);
  }
  return items.slice(0, 12);
});

ipcMain.handle('set-auto-start', (event, enable) => {
  app.setLoginItemSettings({
    openAtLogin: enable,
    openAsHidden: false,
    name: 'HexBrief',
  });
  return true;
});

ipcMain.handle('get-auto-start', () => {
  const settings = app.getLoginItemSettings();
  return settings.openAtLogin;
});

ipcMain.handle('notify', (event, title, body) => {
  if (Notification.isSupported()) {
    new Notification({ title, body }).show();
  }
});

function createWindow() {
  nativeTheme.themeSource = 'dark';

  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 960,
    minHeight: 640,
    backgroundColor: '#0a0f1e',
    autoHideMenuBar: true,
    menuBarVisible: false,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
    },
    show: false,
  });

  mainWindow.setMenu(null);

  if (isDev) {
    mainWindow.loadURL('http://localhost:3000');
  } else {
    mainWindow.loadFile(findIndexHtml());
  }

  mainWindow.once('ready-to-show', () => mainWindow.show());

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
  session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
    callback({
      responseHeaders: {
        ...details.responseHeaders,
        'Content-Security-Policy': [
          "default-src 'self' file: 'unsafe-inline' 'unsafe-eval'; connect-src *; img-src 'self' file: data: https: http:; font-src 'self' file: data: https://fonts.gstatic.com https://fonts.googleapis.com; style-src 'self' file: 'unsafe-inline' https://fonts.googleapis.com;"
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
