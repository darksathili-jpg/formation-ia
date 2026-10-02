import { app, BrowserWindow, ipcMain, protocol } from 'electron';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const WEB_ROOT = path.resolve(__dirname, '../web');
const PRELOAD = path.resolve(__dirname, 'preload.mjs');
const TRUSTED_ORIGIN = 'latent://app';

protocol.registerSchemesAsPrivileged([
  {
    scheme: 'latent',
    privileges: {
      standard: true,
      secure: true,
      supportFetchAPI: true,
      corsEnabled: false,
      stream: true
    }
  }
]);

const MIME = new Map([
  ['.html', 'text/html; charset=utf-8'],
  ['.js', 'text/javascript; charset=utf-8'],
  ['.mjs', 'text/javascript; charset=utf-8'],
  ['.css', 'text/css; charset=utf-8'],
  ['.json', 'application/json; charset=utf-8'],
  ['.svg', 'image/svg+xml'],
  ['.png', 'image/png'],
  ['.jpg', 'image/jpeg'],
  ['.jpeg', 'image/jpeg'],
  ['.webp', 'image/webp']
]);

function isTrustedSender(event) {
  const url = event.senderFrame?.url || '';
  return url === `${TRUSTED_ORIGIN}/` || url.startsWith(`${TRUSTED_ORIGIN}/`);
}

function safeRendererPath(requestUrl) {
  const url = new URL(requestUrl);
  let relative = decodeURIComponent(url.pathname.replace(/^\/+/, '')) || 'index.html';
  if (relative.endsWith('/')) relative += 'index.html';
  const resolved = path.resolve(WEB_ROOT, relative);
  if (resolved !== WEB_ROOT && !resolved.startsWith(`${WEB_ROOT}${path.sep}`)) return null;
  return resolved;
}

async function registerAppProtocol() {
  protocol.handle('latent', async (request) => {
    const target = safeRendererPath(request.url);
    if (!target) return new Response('Forbidden', { status: 403 });
    try {
      const body = await readFile(target);
      return new Response(body, {
        status: 200,
        headers: {
          'Content-Type': MIME.get(path.extname(target).toLowerCase()) || 'application/octet-stream',
          'Cache-Control': 'no-store'
        }
      });
    } catch {
      return new Response('Not found', { status: 404 });
    }
  });
}

function registerIpc() {
  ipcMain.handle('runtime:get-info', (event) => {
    if (!isTrustedSender(event)) throw new Error('Untrusted IPC sender');
    return Object.freeze({
      runtime: 'electron',
      platform: process.platform,
      appVersion: app.getVersion(),
      electronVersion: process.versions.electron
    });
  });
}

function createWindow() {
  const win = new BrowserWindow({
    width: 1360,
    height: 900,
    minWidth: 960,
    minHeight: 640,
    show: false,
    backgroundColor: '#0d1a20',
    webPreferences: {
      preload: PRELOAD,
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: true,
      webSecurity: true
    }
  });

  win.webContents.setWindowOpenHandler(() => ({ action: 'deny' }));
  win.webContents.on('will-navigate', (event, url) => {
    if (!url.startsWith(`${TRUSTED_ORIGIN}/`)) event.preventDefault();
  });

  win.once('ready-to-show', () => win.show());
  win.loadURL(`${TRUSTED_ORIGIN}/index.html`);
  return win;
}

app.whenReady().then(async () => {
  await registerAppProtocol();
  registerIpc();
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
