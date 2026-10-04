import assert from 'node:assert/strict';
import http from 'node:http';
import { mkdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { runVisualAccessibilityMatrix } from './visual-a11y.mjs';

const WATCHDOG_MS = 90_000;
const MIME = new Map([
  ['.html', 'text/html; charset=utf-8'],
  ['.mjs', 'text/javascript; charset=utf-8'],
  ['.js', 'text/javascript; charset=utf-8'],
  ['.cjs', 'text/javascript; charset=utf-8'],
  ['.css', 'text/css; charset=utf-8'],
  ['.json', 'application/json; charset=utf-8']
]);
const stage = (label) => console.log(`▶ E2E ${label}`);
const pause = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function safeStaticPath(root, pathname) {
  const relative = decodeURIComponent(pathname).replace(/^\/+/, '');
  const target = path.resolve(root, relative);
  return target === root || target.startsWith(`${root}${path.sep}`) ? target : null;
}

async function startStaticServer(root) {
  const server = http.createServer(async (request, response) => {
    const url = new URL(request.url || '/', 'http://127.0.0.1');
    const target = safeStaticPath(root, url.pathname);
    if (!target) return response.writeHead(403).end('Forbidden');
    try {
      const body = await readFile(target);
      response.writeHead(200, {
        'Content-Type': MIME.get(path.extname(target).toLowerCase()) || 'application/octet-stream',
        'Cache-Control': 'no-store'
      });
      response.end(body);
    } catch {
      console.error(`E2E HTTP 404 ${url.pathname} -> ${target}`);
      response.writeHead(404).end('Not found');
    }
  });
  await new Promise((resolve, reject) => {
    server.once('error', reject);
    server.listen(0, '127.0.0.1', resolve);
  });
  return { server, origin: `http://127.0.0.1:${server.address().port}` };
}

async function closeServer(server) {
  if (!server) return;
  server.closeIdleConnections?.();
  server.closeAllConnections?.();
  await new Promise((resolve) => server.close(resolve));
}

function diagnoseWindow(win, label) {
  win.webContents.on('did-fail-load', (_event, code, description, url, isMainFrame) => {
    console.error(`E2E ${label} did-fail-load code=${code} main=${isMainFrame} url=${url} ${description}`);
  });
  win.webContents.on('console-message', (_event, level, message, line, sourceId) => {
    if (level >= 2) console.error(`E2E ${label} console[${level}] ${message} @ ${sourceId}:${line}`);
  });
  win.webContents.on('render-process-gone', (_event, details) => {
    console.error(`E2E ${label} renderer gone`, details);
  });
  return win;
}

async function snapshot(win) {
  try {
    return await win.webContents.executeJavaScript(`({
      url: location.href,
      title: document.title,
      state: document.readyState,
      theme: document.documentElement.dataset.theme,
      moduleRoot: document.getElementById('moduleRoot')?.outerHTML?.slice(0, 1200) || null,
      tokenizerRoot: document.getElementById('tokenizerRoot')?.outerHTML?.slice(0, 1200) || null,
      body: document.body?.innerText?.slice(0, 1200) || null
    })`, true);
  } catch (error) {
    return { diagnosticError: error.message };
  }
}

async function waitFor(win, expression, { timeout = 8000, interval = 50, label = expression } = {}) {
  const deadline = Date.now() + timeout;
  let lastError = null;
  while (Date.now() < deadline) {
    if (win.isDestroyed()) throw new Error(`Window destroyed while waiting for ${label}`);
    try {
      if (await win.webContents.executeJavaScript(`Boolean(${expression})`, true)) return;
    } catch (error) {
      lastError = error;
    }
    await pause(interval);
  }
  const diagnostic = JSON.stringify(await snapshot(win));
  throw new Error(`Timeout waiting for ${label}${lastError ? `: ${lastError.message}` : ''}\nDOM snapshot: ${diagnostic}`);
}

async function reloadAndWait(win, expression, label) {
  win.webContents.reload();
  await waitFor(win, expression, { label });
}

async function assertRuntime(win, prefix) {
  const value = await win.webContents.executeJavaScript(
    `document.getElementById('runtimeCard')?.textContent || ''`,
    true
  );
  assert.ok(value.startsWith(prefix), `Expected runtime ${prefix}, got ${value}`);
}

async function smokeP0(win, runtime) {
  const ready = `document.querySelector('#moduleRoot')?.dataset.renderedFrom === 'declarative-content' && document.querySelectorAll('.module-section').length === 6`;
  await waitFor(win, ready, { label: `${runtime} P0 declarative render` });
  await assertRuntime(win, runtime);

  const source = await win.webContents.executeJavaScript(`({
    moduleId: document.querySelector('#moduleRoot')?.dataset.moduleId,
    title: document.querySelector('.module-hero h1')?.textContent
  })`, true);
  assert.equal(source.moduleId, 'p0');
  assert.match(source.title, /assistant IA/i);

  await win.webContents.executeJavaScript(`localStorage.clear(); true`, true);
  await reloadAndWait(win, ready, `${runtime} P0 clean reload`);

  const attempted = await win.webContents.executeJavaScript(`(() => {
    const quiz=document.getElementById('p0-quiz');
    if(!quiz)return false;
    for(const q of quiz.querySelectorAll('fieldset.question')){
      const input=q.querySelector('input[type="radio"]');
      if(!input)return false;
      input.checked=true;
      input.dispatchEvent(new Event('change',{bubbles:true}));
    }
    const submit=[...quiz.querySelectorAll('button')].find(b=>/Corriger le quiz/.test(b.textContent));
    if(!submit)return false;
    submit.click();
    return true;
  })()`, true);
  assert.equal(attempted, true, `${runtime} quiz could not be completed`);

  await waitFor(win, `localStorage.getItem('latent-v3-progress')?.includes('"quiz"')`, {
    label: `${runtime} progress persistence`
  });
  await waitFor(win, `document.getElementById('masteryStatus')?.dataset.state && document.getElementById('masteryStatus').dataset.state !== 'not-started'`, {
    label: `${runtime} mastery transition`
  });

  const before = await win.webContents.executeJavaScript(
    `document.getElementById('masteryStatus').dataset.state`,
    true
  );
  assert.ok(['learning', 'evidence', 'mastered'].includes(before));
  await reloadAndWait(win, ready, `${runtime} P0 persisted reload`);
  const after = await win.webContents.executeJavaScript(
    `document.getElementById('masteryStatus').dataset.state`,
    true
  );
  assert.equal(after, before, `${runtime} mastery state must survive reload`);
}

async function smokeTokenizer(win, runtime) {
  const ready = `document.querySelector('[data-activity-type="tokenizer-lab"]') && document.querySelector('[data-tokenizer-input]')`;
  await waitFor(win, ready, { label: `${runtime} Tokenizer render` });
  await assertRuntime(win, runtime);

  const subword = await win.webContents.executeJavaScript(`(() => {
    const text=document.querySelector('[data-tokenizer-input]');
    const mode=document.querySelector('[data-tokenizer-mode]');
    const limit=document.querySelector('[data-tokenizer-limit]');
    text.value='extraordinaire';
    text.dispatchEvent(new Event('input',{bubbles:true}));
    mode.value='subword';
    mode.dispatchEvent(new Event('change',{bubbles:true}));
    limit.value='2';
    limit.dispatchEvent(new Event('input',{bubbles:true}));
    return {
      tokens:[...document.querySelectorAll('[data-tokenizer-tokens] .tokenizer-token')].map(n=>n.textContent),
      inside:[...document.querySelectorAll('[data-tokenizer-tokens] .tokenizer-token')].map(n=>n.dataset.inContext),
      status:document.querySelector('[data-tokenizer-context-status]')?.textContent||'',
      trace:document.querySelector('[data-tokenizer-trace-result]')?.textContent||''
    };
  })()`, true);
  assert.deepEqual(subword.tokens, ['extra', 'ord', 'inaire']);
  assert.deepEqual(subword.inside, ['true', 'true', 'false']);
  assert.match(subword.status, /1 hors fenêtre/);
  assert.match(subword.trace, /extra \| ord \| inaire/);

  const bytes = await win.webContents.executeJavaScript(`(() => {
    const text=document.querySelector('[data-tokenizer-input]');
    const mode=document.querySelector('[data-tokenizer-mode]');
    text.value='é';
    text.dispatchEvent(new Event('input',{bubbles:true}));
    mode.value='byte';
    mode.dispatchEvent(new Event('change',{bubbles:true}));
    return [...document.querySelectorAll('[data-tokenizer-tokens] .tokenizer-token')].map(n=>n.textContent);
  })()`, true);
  assert.deepEqual(bytes, ['0xC3', '0xA9']);

  const snapshotMade = await win.webContents.executeJavaScript(`(() => {
    const b=document.querySelector('[data-tokenizer-snapshot]');
    if(!b)return false;
    b.click();
    return true;
  })()`, true);
  assert.equal(snapshotMade, true);
  await waitFor(win, `Number((document.getElementById('eventCount')?.textContent||'0').match(/\\d+/)?.[0]||0)>=3`, {
    label: `${runtime} Tokenizer events`
  });
}

async function makeWebWindow(BrowserWindow, url, label) {
  const win = diagnoseWindow(new BrowserWindow({
    width: 1360,
    height: 900,
    show: false,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: true,
      webSecurity: true
    }
  }), label);
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
  const artifactDir = path.join(APP_ROOT, 'artifacts', 'visual-a11y');

  try {
    await mkdir(artifactDir, { recursive: true });
    const host = await startStaticServer(APP_ROOT);
    server = host.server;
    stage(`static server ${host.origin}`);

    stage('P0 Web');
    const webP0 = await makeWebWindow(BrowserWindow, `${host.origin}/${WEB_ENTRY}`, 'P0 Web');
    windows.push(webP0);
    await smokeP0(webP0, 'Web');
    await runVisualAccessibilityMatrix(webP0, { runtime: 'Web', pageKind: 'p0', artifactDir });
    stage('P0 Web ✓');

    stage('P0 Electron');
    const electronP0 = diagnoseWindow(createWindow({ showWhenReady: false }), 'P0 Electron');
    windows.push(electronP0);
    await smokeP0(electronP0, 'Electron');
    await runVisualAccessibilityMatrix(electronP0, { runtime: 'Electron', pageKind: 'p0', artifactDir });
    stage('P0 Electron ✓');

    stage('Tokenizer Web');
    const webTokenizer = await makeWebWindow(
      BrowserWindow,
      `${host.origin}/src/entrypoints/web/tokenizer.html`,
      'Tokenizer Web'
    );
    windows.push(webTokenizer);
    await smokeTokenizer(webTokenizer, 'Web');
    await runVisualAccessibilityMatrix(webTokenizer, { runtime: 'Web', pageKind: 'tokenizer', artifactDir });
    stage('Tokenizer Web ✓');

    stage('Tokenizer Electron');
    const electronTokenizer = diagnoseWindow(createWindow({
      entry: 'src/entrypoints/web/tokenizer.html',
      showWhenReady: false
    }), 'Tokenizer Electron');
    windows.push(electronTokenizer);
    await smokeTokenizer(electronTokenizer, 'Electron');
    await runVisualAccessibilityMatrix(electronTokenizer, {
      runtime: 'Electron',
      pageKind: 'tokenizer',
      artifactDir
    });
    stage('Tokenizer Electron ✓');

    console.log(`✅ E2E LATENT V3 — fonctionnel + Visual & Accessibility Gate validés. Captures: ${artifactDir}`);
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
