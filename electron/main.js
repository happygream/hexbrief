const { app, BrowserWindow, shell, nativeTheme, session, ipcMain, Notification } = require('electron');
const path = require('path');
const fs = require('fs');
const https = require('https');
const http = require('http');
const { URL } = require('url');

const isDev = process.env.NODE_ENV === 'development';
let mainWindow;

// ── SECURITY: Allowed origins for external navigation ───────────────
const ALLOWED_PROTOCOLS = ['https:', 'http:'];

// ── SECURITY: RSS feed URL validation ───────────────────────────────
function isValidFeedUrl(urlStr) {
  try {
    const u = new URL(urlStr);
    // Only allow http/https — block file://, javascript:, data:, etc.
    if (!ALLOWED_PROTOCOLS.includes(u.protocol)) return false;
    // Block localhost and private IP ranges — no SSRF
    const host = u.hostname.toLowerCase();
    if (host === 'localhost' || host === '127.0.0.1' || host === '::1') return false;
    if (/^10\./.test(host)) return false;
    if (/^192\.168\./.test(host)) return false;
    if (/^172\.(1[6-9]|2\d|3[0-1])\./.test(host)) return false;
    if (/^169\.254\./.test(host)) return false;
    if (host === '0.0.0.0') return false;
    return true;
  } catch {
    return false;
  }
}

// ── SECURITY: Notification input sanitisation ────────────────────────
function sanitiseText(str, maxLen = 200) {
  if (typeof str !== 'string') return '';
  return str.replace(/[<>]/g, '').slice(0, maxLen);
}

// ── SECURITY: Redirect depth guard to prevent infinite loops ─────────
function nodeFetch(url, depth = 0) {
  if (depth > 3) return Promise.reject(new Error('Too many redirects'));
  if (!isValidFeedUrl(url)) return Promise.reject(new Error('Blocked URL: ' + url));

  return new Promise((resolve, reject) => {
    const lib = url.startsWith('https') ? https : http;
    const req = lib.get(url, {
      timeout: 8000,
      headers: { 'User-Agent': 'HexBrief/1.0 (RSS Reader)' },
      // Cap response size — prevent memory exhaustion from huge responses
      maxHeaderSize: 16384,
    }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return nodeFetch(res.headers.location, depth + 1).then(resolve).catch(reject);
      }

      let data = '';
      let size = 0;
      const MAX_SIZE = 2 * 1024 * 1024; // 2MB cap

      res.on('data', chunk => {
        size += chunk.length;
        if (size > MAX_SIZE) {
          req.destroy();
          reject(new Error('Response too large'));
          return;
        }
        data += chunk;
      });
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
      // Sanitise tag name to prevent ReDoS via regex injection
      const safeTag = tag.replace(/[^a-zA-Z0-9:_-]/g, '');
      const patterns = [
        new RegExp(`<${safeTag}[^>]*><!\\[CDATA\\[([\\s\\S]*?)\\]\\]><\\/${safeTag}>`, 'i'),
        new RegExp(`<${safeTag}[^>]*>([\\s\\S]*?)<\\/${safeTag}>`, 'i'),
      ];
      for (const p of patterns) {
        const m = str.match(p);
        if (m) return m[1].trim();
      }
      return '';
    }

    function getAttr(str, tag, attr) {
      const safeTag = tag.replace(/[^a-zA-Z0-9:_-]/g, '');
      const safeAttr = attr.replace(/[^a-zA-Z0-9:_-]/g, '');
      const m = str.match(new RegExp(`<${safeTag}[^>]+${safeAttr}=["']([^"']+)["']`, 'i'));
      return m ? m[1] : '';
    }

    function extractImage(str) {
      let m = str.match(/<media:content[^>]+url=["']([^"']+)["'][^>]*medium=["']image["']/i);
      if (!m) m = str.match(/<media:content[^>]+medium=["']image["'][^>]*url=["']([^"']+)["']/i);
      if (m) return validateImageUrl(m[1]);
      m = str.match(/<media:thumbnail[^>]+url=["']([^"']+)["']/i);
      if (m) return validateImageUrl(m[1]);
      m = str.match(/<enclosure[^>]+type=["']image\/[^"']*["'][^>]+url=["']([^"']+)["']/i);
      if (!m) m = str.match(/<enclosure[^>]+url=["']([^"']+)["'][^>]*type=["']image\/[^"']*["']/i);
      if (m) return validateImageUrl(m[1]);
      m = str.match(/<img[^>]+src=["']([^"']+)["']/i);
      if (m) return validateImageUrl(m[1]);
      return '';
    }

    // Only allow https image URLs — no data: URIs, no javascript:, no file:
    function validateImageUrl(url) {
      try {
        const u = new URL(url);
        return u.protocol === 'https:' ? url : '';
      } catch { return ''; }
    }

    function stripHtml(str) {
      return str
        .replace(/<[^>]+>/g, '')
        .replace(/&amp;/g,'&').replace(/&lt;/g,'<').replace(/&gt;/g,'>')
        .replace(/&quot;/g,'"').replace(/&#39;/g,"'")
        .trim();
    }

    // Validate extracted links — must be http/https
    function validateLink(link) {
      try {
        const u = new URL(link);
        return ALLOWED_PROTOCOLS.includes(u.protocol) ? link : '';
      } catch { return ''; }
    }

    const itemRegex = /<item[\s>]([\s\S]*?)<\/item>/gi;
    const entryRegex = /<entry[\s>]([\s\S]*?)<\/entry>/gi;
    let match, count = 0;

    while ((match = itemRegex.exec(xml)) !== null && count < 4) {
      const block = match[1];
      const title = sanitiseText(stripHtml(getTag(block, 'title')), 300);
      const rawLink = getTag(block, 'link') || getAttr(block, 'link', 'href') || getTag(block, 'guid');
      const link = validateLink(rawLink.trim());
      const image = extractImage(block);
      const rawDesc = getTag(block, 'description') || getTag(block, 'content:encoded') || '';
      const description = sanitiseText(stripHtml(rawDesc), 200);
      if (title && link) { items.push({ title, link, source: sourceName, image, description }); count++; }
    }

    if (items.length === 0) {
      count = 0;
      while ((match = entryRegex.exec(xml)) !== null && count < 4) {
        const block = match[1];
        const title = sanitiseText(stripHtml(getTag(block, 'title')), 300);
        const rawLink = getAttr(block, 'link', 'href') || getTag(block, 'link');
        const link = validateLink(rawLink.trim());
        const image = extractImage(block);
        if (title && link) { items.push({ title, link, source: sourceName, image, description: '' }); count++; }
      }
    }
  } catch (e) { console.error('RSS parse error:', e); }
  return items;
}

// ── IPC HANDLERS ─────────────────────────────────────────────────────

ipcMain.handle('fetch-rss', async (event, feedUrls) => {
  // Validate input type
  if (!Array.isArray(feedUrls)) return [];
  // Cap number of feeds
  const urls = feedUrls.slice(0, 20);
  // Validate each URL before fetching
  const validUrls = urls.filter(u => typeof u === 'string' && isValidFeedUrl(u));

  const results = await Promise.allSettled(
    validUrls.map(async (url) => {
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
  // Validate input is boolean
  if (typeof enable !== 'boolean') return false;
  app.setLoginItemSettings({ openAtLogin: enable, openAsHidden: false, name: 'HexBrief' });
  return true;
});

ipcMain.handle('get-auto-start', () => {
  return app.getLoginItemSettings().openAtLogin;
});

ipcMain.handle('notify', (event, title, body) => {
  // Sanitise notification content
  const safeTitle = sanitiseText(title, 100);
  const safeBody = sanitiseText(body, 300);
  if (Notification.isSupported() && safeTitle) {
    new Notification({ title: safeTitle, body: safeBody }).show();
  }
});

// ── WINDOW CONTROLS (custom frameless titlebar) ───────────────────────
ipcMain.on('window-minimize', () => {
  if (mainWindow) mainWindow.minimize();
});

ipcMain.on('window-maximize', () => {
  if (!mainWindow) return;
  if (mainWindow.isMaximized()) {
    mainWindow.unmaximize();
  } else {
    mainWindow.maximize();
  }
});

ipcMain.on('window-close', () => {
  if (mainWindow) mainWindow.close();
});

ipcMain.handle('window-is-maximized', () => {
  return mainWindow ? mainWindow.isMaximized() : false;
});

// ── WINDOW ────────────────────────────────────────────────────────────

function createWindow() {
  nativeTheme.themeSource = 'dark';

  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 960,
    minHeight: 640,
    backgroundColor: '#0a0f1e',
    frame: false,                    // Custom titlebar — no OS chrome
    titleBarStyle: 'hidden',         // macOS: hide bar but keep traffic lights inset
    titleBarOverlay: false,
    autoHideMenuBar: true,
    menuBarVisible: false,
    webPreferences: {
      nodeIntegration: false,          // Never allow Node in renderer
      contextIsolation: true,          // Renderer cannot access preload scope
      sandbox: true,                   // Renderer runs in OS sandbox
      webSecurity: true,               // Enforce same-origin
      allowRunningInsecureContent: false,
      experimentalFeatures: false,
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

  // Notify renderer when maximize state changes so titlebar icon updates
  mainWindow.on('maximize', () => {
    if (mainWindow) mainWindow.webContents.send('window-maximized-changed', true);
  });
  mainWindow.on('unmaximize', () => {
    if (mainWindow) mainWindow.webContents.send('window-maximized-changed', false);
  });

  // Block all new window creation — all external links go to system browser
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    try {
      const u = new URL(url);
      if (ALLOWED_PROTOCOLS.includes(u.protocol)) {
        shell.openExternal(url);
      }
    } catch {}
    return { action: 'deny' };
  });

  // Block in-app navigation to anything except the local file
  mainWindow.webContents.on('will-navigate', (event, url) => {
    const isLocal = url.startsWith('file://') || (isDev && url.startsWith('http://localhost'));
    if (!isLocal) {
      event.preventDefault();
      try {
        const u = new URL(url);
        if (ALLOWED_PROTOCOLS.includes(u.protocol)) shell.openExternal(url);
      } catch {}
    }
  });

  // Block any attempt to create child windows or webviews
  mainWindow.webContents.on('will-attach-webview', (event) => {
    event.preventDefault();
  });

  mainWindow.on('closed', () => { mainWindow = null; });
}

function findIndexHtml() {
  const candidates = [
    // asarUnpack puts files in app.asar.unpacked/
    path.join(process.resourcesPath, 'app.asar.unpacked', 'out', 'index.html'),
    path.join(process.resourcesPath, 'out', 'index.html'),
    path.join(app.getAppPath(), 'out', 'index.html'),
    path.join(app.getAppPath().replace('app.asar', 'app.asar.unpacked'), 'out', 'index.html'),
    path.join(__dirname, '..', 'out', 'index.html'),
  ];
  for (const p of candidates) {
    if (fs.existsSync(p)) return p;
  }
  return candidates[1]; // fallback to resourcesPath/out
}

app.whenReady().then(() => {
  // ── CSP: Tighter than before ─────────────────────────────────────
  // connect-src * needed for weather/calendar/RSS APIs
  // unsafe-inline needed for Next.js inline styles — unavoidable with static export
  // unsafe-eval removed — Next.js static export doesn't need it
  session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
    callback({
      responseHeaders: {
        ...details.responseHeaders,
        'Content-Security-Policy': [
          "default-src 'self' file:; " +
          "script-src 'self' file: 'unsafe-inline'; " +
          "style-src 'self' file: 'unsafe-inline' https://fonts.googleapis.com; " +
          "font-src 'self' file: data: https://fonts.gstatic.com; " +
          "connect-src *; " +
          "img-src 'self' file: data: https: http:; " +
          "media-src 'none'; " +
          "object-src 'none'; " +
          "frame-src 'none'; " +
          "worker-src 'none';"
        ],
        // Additional hardening headers
        'X-Content-Type-Options': ['nosniff'],
        'X-Frame-Options': ['DENY'],
        'Referrer-Policy': ['no-referrer'],
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
