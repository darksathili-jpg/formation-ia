import assert from 'node:assert/strict';
import http from 'node:http';
import { readFile } from 'node:fs/promises';
import path from 'node:path';

const WATCHDOG_MS = 60_000;

const MIME = new Map([
  ['.html', 'text/html; charset=utf-8'],
  ['.mjs', 'text/javascript; charset=utf-8'],
  ['.js', 'text/javascript; charset=utf-8'],
  ['.css', 'text/css; charset=utf-8'],
  ['.json', 'application/json; charset=utf-8']
]);

function stage(label) {
  console.log(`▶ E2E ${label}`);
}

function safeStaticPath(appRoot, pathname) {
  const relative = decodeURIComponent(pathname).replace(/^\/+/, '');
  const target = path.resolve(appRoot, relative);
  if (target !== appRoot && !target.startsWith(`${appRoot}${path.sep}`)) return null;
  return target;
}

async function startStaticServer(appRoot) {
  const server = http.createServer(async (request, response) => {
    const requestUrl = new URL(request.url || '/', 'http://127.0.0.1');
    const target = safeStaticPath(appRoot, requestUrl.pathname);
    if (!target) {
      response.writeHead(403).end('Forbidden');
      return;
    }
    try {
      const body = await readFile(target);
      response.writeHead(200, {
        'Content-Type': MIME.get(path.extname(target).toLowerCase()) || 'application/octet-stream',
        'Cache-Control': 'no-store'
      });
      response.end(body);
    } catch {
      response.writeHead(404).end('Not found');
    }
  });
  await new Promise((resolve, reject) => {
    server.once('error', reject);
    server.listen(0, '127.0.0.1', resolve);
  });
  const address = server.address();
  return {
    server,
    origin: `http://127.0.0.1:${address.port}`
  };
}

async function closeServer(server) {
  if (!server) return;
  server.closeIdleConnections?.();
  server.closeAllConnections?.();
  await new Promise((resolve) => server.close(resolve));
}

async function waitFor(win, expression, { timeout = 8000, interval = 50, label = expression } = {}) {
  const deadline = Date.now() + timeout;
  let lastError = null;
  while (Date.now() < deadline) {
    if (win.isDestroyed()) throw new Error(`Window destroyed while waiting for ${label}`);
    try {
      const value = await win.webContents.executeJavaScript(`Boolean(${expression})`, true);
      if (value) return;
    } catch (error) {
      lastError = error;
    }
    await new Promise((resolve) => setTimeout(resolve, interval));
  }
  throw new Error(`Timeout waiting for ${label}${lastError ? `: ${lastError.message}` : ''}`);
}

async function reloadAndWait(win, expression, label) {
  win.webContents.reload();
  await waitFor(win, expression, { label });
}

async function assertRuntime(win, expectedPrefix) {
  const runtime = await win.webContents.executeJavaScript(`document.getElementById('runtimeCard')?.textContent || ''`, true);
  assert.ok(runtime.startsWith(expectedPrefix), `Expected runtime ${expectedPrefix}, got ${runtime}`);
}

async function smokeP0(win, expectedRuntime) {
  const readyExpression = `document.querySelector('#moduleRoot')?.dataset.renderedFrom === 'declarative-content' && document.querySelectorAll('.module-section').length === 6`;
  await waitFor(win, readyExpression, { label: `${expectedRuntime} P0 declarative render` });
  await assertRuntime(win, expectedRuntime);

  const source = await win.webContents.executeJavaScript(`({
    moduleId: document.querySelector('#moduleRoot')?.dataset.moduleId,
    title: document.querySelector('.module-hero h1')?.textContent
  })`, true);
  assert.equal(source.moduleId, 'p0');
  assert.match(source.title, /assistant IA/i);

  await win.webContents.executeJavaScript(`localStorage.clear(); true`, true);
  await reloadAndWait(win, readyExpression, `${expectedRuntime} P0 clean reload`);

  const attempted = await win.webContents.executeJavaScript(`(() => {
    const quiz = document.getElementById('p0-quiz');
    if (!quiz) return false;
    for (const fieldset of quiz.querySelectorAll('fieldset.question')) {
      const first = fieldset.querySelector('input[type="radio"]');
      if (!first) return false;
      first.checked = true;
      first.dispatchEvent(new Event('change', { bubbles: true }));
    }
    const submit = [...quiz.querySelectorAll('button')].find((button) => /Corriger le quiz/.test(button.textContent));
    if (!submit) return false;
    submit.click();
    return true;
  })()`, true);
  assert.equal(attempted, true, `${expectedRuntime} quiz could not be completed`);

  await waitFor(win, `localStorage.getItem('latent-v3-progress')?.includes('"quiz"')`, { label: `${expectedRuntime} progress persistence` });
  await waitFor(win, `document.getElementById('masteryStatus')?.dataset.state && document.getElementById('masteryStatus').dataset.state !== 'not-started'`, { label: `${expectedRuntime} mastery transition` });

  const beforeReload = await win.webContents.executeJavaScript(`document.getElementById('masteryStatus').dataset.state`, true);
  assert.ok(['learning', 'evidence', 'mastered'].includes(beforeReload));
  await reloadAndWait(win, readyExpression, `${expectedRuntime} P0 persisted reload`);
  const afterReload = await win.webContents.executeJavaScript(`document.getElementById('masteryStatus').dataset.state`, true);
  assert.equal(afterReload, beforeReload, `${expectedRuntime} mastery state must survive reload`);
}

async function smokeTokenizer(win, expectedRuntime) {
  const readyExpression = `document.querySelector('[data-activity-type="tokenizer-lab"]') && document.querySelector('[data-tokenizer-input]')`;
  await waitFor(win, readyExpression, { label: `${expectedRuntime} Tokenizer Lab render` });
  await assertRuntime(win, expectedRuntime);

  const subword = await win.webContents.executeJavaScript(`(() => {
    const text = document.querySelector('[data-tokenizer-input]');
    const mode = document.querySelector('[data-tokenizer-mode]');
    const limit = document.querySelector('[data-tokenizer-limit]');
    text.value = 'extraordinaire';
    text.dispatchEvent(new Event('input', { bubbles: true }));
    mode.value = 'subword';
    mode.dispatchEvent(new Event('change', { bubbles: true }));
    limit.value = '2';
    limit.dispatchEvent(new Event('input', { bubbles: true }));
    return {
      tokens: [...document.querySelectorAll('[data-tokenizer-tokens] .tokenizer-token')].map((node) => node.textContent),
      inContext: [...document.querySelectorAll('[data-tokenizer-tokens] .tokenizer-token')].map((node) => node.dataset.inContext),
      status: document.querySelector('[data-tokenizer-context-status]')?.textContent || '',
      trace: document.querySelector('[data-tokenizer-trace-result]')?.textContent || ''
    };
  })()`, true);
  assert.deepEqual(subword.tokens, ['extra', 'ord', 'inaire']);
  assert.deepEqual(subword.inContext, ['true', 'true', 'false']);
  assert.match(subword.status, /1 hors fenêtre/);
  assert.match(subword.trace, /extra \| ord \| inaire/);

  const bytes = await win.webContents.executeJavaScript(`(() => {
    const text = document.querySelector('[data-tokenizer-input]');
    const mode = document.querySelector('[data-tokenizer-mode]');
    text.value = 'é';
    text.dispatchEvent(new Event('input', { bubbles: true }));
    mode.value = 'byte';
    mode.dispatchEvent(new Event('change', { bubbles: true }));
    return [...document.querySelectorAll('[data-tokenizer-tokens] .tokenizer-token')].map((node) => node.textContent);
  })()`, true);
  assert.deepEqual(bytes, ['0xC3', '0xA9']);

  const snapshot = await win.webContents.executeJavaScript(`(() => {
    const button = document.querySelector('[data-tokenizer-snapshot]');
    if (!button) return false;
    button.click();
    return true;
  })()`, true);
  assert.equal(snapshot, true);
  await waitFor(win, `Number((document.getElementById('eventCount')?.textContent || '0').match(/\\d+/)?.[0] || 0) >= 3`, { label: `${expectedRuntime} Tokenizer events` });
}

async function makeWebWindow(BrowserWindow, url) {
  const win = new BrowserWindow({
    width: 1360,
    height: 900,
    show: false,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: true,
      webSecurity: true
    }
  });
  await win.loadURL(url);
  return win;
}

export async function runE2ESmoke({ app, BrowserWindow, APP_ROOT, WEB_ENTRY, createWindow }) {
  console.log('▶ E2E production main ready');
  const watchdog = setTimeout(() => {
    console.error(`❌ E2E watchdog exceeded ${WATCHDOG_MS} ms`);
    app.exit(1);
  }, WATCHDOG_MS);

  let server;
  const windows = [];
  let exitCode = 0;
  try {
    const staticHost = await startStaticServer(APP_ROOT);
    server = staticHost.server;
    stage(`static server ${staticHost.origin}`);

    stage('P0 Web');
    const webP0 = await makeWebWindow(BrowserWindow, `${staticHost.origin}/${WEB_ENTRY}`);
    windows.push(webP0);
    await smokeP0(webP0, 'Web');
    stage('P0 Web ✓');

    stage('P0 Electron');
    const electronP0 = createWindow({ showWhenReady: false });
    windows.push(electronP0);
    await smokeP0(electronP0, 'Electron');
    stage('P0 Electron ✓');

    stage('Tokenizer Web');
    const webTokenizer = await makeWebWindow(BrowserWindow, `${staticHost.origin}/src/entrypoints/web/tokenizer.html`);
    windows.push(webTokenizer);
    await smokeTokenizer(webTokenizer, 'Web');
    stage('Tokenizer Web ✓');

    stage('Tokenizer Electron');
    const electronTokenizer = createWindow({ entry: 'src/entrypoints/web/tokenizer.html', showWhenReady: false });
    windows.push(electronTokenizer);
    await smokeTokenizer(electronTokenizer, 'Electron');
    stage('Tokenizer Electron ✓');

    console.log('✅ E2E LATENT V3 — P0 Web/Electron, reprise de session et Tokenizer Lab validés.');
  } catch (error) {
    exitCode = 1;
    console.error('❌ E2E LATENT V3 FAILED');
    console.error(error?.stack || error);
  } finally {
    stage('cleanup');
    clearTimeout(watchdog);
    for (const win of windows) {
      if (!win.isDestroyed()) win.destroy();
    }
    await closeServer(server);
    stage(`return ${exitCode}`);
  }
  return exitCode;
}
