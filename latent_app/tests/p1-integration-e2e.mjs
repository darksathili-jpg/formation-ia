import assert from 'node:assert/strict';
import http from 'node:http';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { runP1IntegrationVisualAccessibilityMatrix } from './p1-integration-visual-a11y.mjs';

const MIME = new Map([['.html','text/html; charset=utf-8'],['.mjs','text/javascript; charset=utf-8'],['.js','text/javascript; charset=utf-8'],['.cjs','text/javascript; charset=utf-8'],['.css','text/css; charset=utf-8'],['.json','application/json; charset=utf-8']]);
const pause = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const sequence = ['p0', 'p1s1', 'p1s2', 'p1s3', 'p1s4'];

function safePath(root, pathname) {
  const relative = decodeURIComponent(pathname).replace(/^\/+/, '');
  const target = path.resolve(root, relative);
  return target === root || target.startsWith(`${root}${path.sep}`) ? target : null;
}

async function startServer(root) {
  const server = http.createServer(async (req, res) => {
    const url = new URL(req.url || '/', 'http://127.0.0.1');
    const target = safePath(root, url.pathname);
    if (!target) return res.writeHead(403).end('Forbidden');
    try {
      const body = await readFile(target);
      res.writeHead(200, { 'Content-Type': MIME.get(path.extname(target).toLowerCase()) || 'application/octet-stream', 'Cache-Control': 'no-store' });
      res.end(body);
    } catch {
      res.writeHead(404).end('Not found');
    }
  });
  await new Promise((resolve, reject) => { server.once('error', reject); server.listen(0, '127.0.0.1', resolve); });
  return { server, origin: `http://127.0.0.1:${server.address().port}` };
}

async function closeServer(server) {
  if (!server) return;
  server.closeIdleConnections?.();
  server.closeAllConnections?.();
  await new Promise((resolve) => server.close(resolve));
}

function diagnose(win, label) {
  win.webContents.on('did-fail-load', (_event, code, description, url) => console.error(`P1 Integration ${label} load ${code} ${url} ${description}`));
  win.webContents.on('console-message', (_event, level, message, line, source) => {
    if (level >= 2 && !/frame-ancestors/.test(message)) console.error(`P1 Integration ${label} console[${level}] ${message} @ ${source}:${line}`);
  });
  return win;
}

async function waitFor(win, expression, label, timeout = 8000) {
  const deadline = Date.now() + timeout;
  while (Date.now() < deadline) {
    if (win.isDestroyed()) throw new Error(`P1 Integration window destroyed: ${label}`);
    try { if (await win.webContents.executeJavaScript(`Boolean(${expression})`, true)) return; } catch {}
    await pause(50);
  }
  throw new Error(`P1 Integration timeout: ${label}`);
}

async function assertModuleShell(win, moduleId, runtime) {
  await waitFor(win, `document.querySelector('#moduleRoot')?.dataset.moduleId==='${moduleId}'`, `${runtime} ${moduleId} render`);
  const snapshot = await win.webContents.executeJavaScript(`(() => ({
    courseLinks:[...document.querySelectorAll('#courseNav a')].map(a=>({id:a.dataset.courseModule,current:a.getAttribute('aria-current'),href:a.getAttribute('href')})),
    active:document.querySelector('#courseNav a[aria-current="page"]')?.dataset.courseModule||'',
    p2:document.getElementById('p2LockState')?.textContent||'',
    gate:document.getElementById('learnerGateLink')?.getAttribute('href')||'',
    pagerNext:document.querySelector('#coursePager .next')?.textContent||''
  }))()`, true);
  assert.deepEqual(snapshot.courseLinks.map((entry) => entry.id), sequence, `${runtime}: ordre du parcours altéré`);
  assert.equal(snapshot.active, moduleId, `${runtime}: module actif incorrect`);
  assert.match(snapshot.p2, /Verrouillé/i, `${runtime}: P2 ne doit pas être ouvert`);
  assert.equal(snapshot.gate, './learner-gate.html', `${runtime}: Learner Gate link absent`);
  assert.equal(snapshot.courseLinks.filter((entry) => entry.current === 'page').length, 1, `${runtime}: un seul module doit être aria-current`);
  return snapshot;
}

async function walkCourse(win, runtime) {
  for (let index = 0; index < sequence.length; index += 1) {
    const moduleId = sequence[index];
    const snapshot = await assertModuleShell(win, moduleId, runtime);
    if (index < sequence.length - 1) {
      assert.match(snapshot.pagerNext, new RegExp(sequence[index + 1] === 'p1s1' ? 'Tokens' : sequence[index + 1] === 'p1s2' ? 'Transformer et attention' : sequence[index + 1] === 'p1s3' ? 'Transformer Block' : 'Sampling'));
      const clicked = await win.webContents.executeJavaScript(`(() => {const a=document.querySelector('#coursePager .next');if(!a)return false;a.click();return true})()`, true);
      assert.equal(clicked, true, `${runtime}: navigation suivante impossible depuis ${moduleId}`);
      await waitFor(win, `document.querySelector('#moduleRoot')?.dataset.moduleId==='${sequence[index + 1]}'`, `${runtime} transition ${moduleId} -> ${sequence[index + 1]}`);
    }
  }

  const gateClicked = await win.webContents.executeJavaScript(`(() => {const a=document.querySelector('#coursePager .next.gate');if(!a)return false;a.click();return true})()`, true);
  assert.equal(gateClicked, true, `${runtime}: accès au Learner Gate impossible`);
  await waitFor(win, `document.getElementById('participantCode')?.textContent?.includes('P-') && document.querySelectorAll('#moduleObservationGrid .observer-card').length===5`, `${runtime} Learner Gate ready`);
  const gate = await win.webContents.executeJavaScript(`(() => ({
    title:document.querySelector('.gate-hero h1')?.textContent||'',
    code:document.getElementById('participantCode')?.textContent||'',
    thresholdCount:document.querySelectorAll('#thresholdSummary .threshold-item').length,
    observerCards:document.querySelectorAll('#moduleObservationGrid .observer-card').length,
    decision:document.getElementById('cohortDecision')?.dataset.state||'',
    privacy:document.body.textContent.includes('Aucune identité'),
    lock:document.body.textContent.includes('P2 reste verrouillé'),
    pack:document.querySelector('.field-trial-pack-link')?.getAttribute('href')||''
  }))()`, true);
  assert.match(gate.title, /vraiment apprenable/i);
  assert.match(gate.code, /P-[A-Z0-9]{6,12}/);
  assert.equal(gate.observerCards, 5);
  assert.ok(gate.thresholdCount >= 10);
  assert.equal(gate.decision, 'pending-field-evidence');
  assert.equal(gate.privacy, true);
  assert.equal(gate.lock, true);
  assert.equal(gate.pack, './field-trial-pack.html', `${runtime}: lien Session Pack absent`);
}

async function assertFieldTrialPack(win, runtime) {
  const clicked = await win.webContents.executeJavaScript(`(() => {const a=document.querySelector('.field-trial-pack-link');if(!a)return false;a.click();return true})()`, true);
  assert.equal(clicked, true, `${runtime}: ouverture Session Pack impossible`);
  await waitFor(win, `document.body?.dataset.packVersion==='1.0'`, `${runtime} Session Pack ready`);
  const pack = await win.webContents.executeJavaScript(`(() => ({
    modules:[...document.querySelectorAll('.transfer-card')].map(card=>card.dataset.module),
    teacher:Boolean(document.querySelector('.teacher-sheet')),
    student:Boolean(document.querySelector('.student-instructions')),
    observation:Boolean(document.querySelector('.observation-sheet')),
    cohort:Boolean(document.querySelector('.cohort-analysis')),
    privacy:document.body.textContent.includes('Ne saisissez ni nom, ni prénom, ni identifiant scolaire'),
    lock:document.body.textContent.includes('P2 reste verrouillé'),
    overflow:Math.max(0,document.documentElement.scrollWidth-window.innerWidth),
    css:[...document.styleSheets].some(sheet=>sheet.href?.endsWith('/field-trial-pack.css'))
  }))()`, true);
  assert.deepEqual(pack.modules, sequence, `${runtime}: cartes de transfert incomplètes`);
  assert.equal(pack.teacher && pack.student && pack.observation && pack.cohort, true, `${runtime}: section du pack absente`);
  assert.equal(pack.privacy, true, `${runtime}: garde privacy absente du pack`);
  assert.equal(pack.lock, true, `${runtime}: verrou P2 absent du pack`);
  assert.equal(pack.css, true, `${runtime}: feuille d'impression du pack absente`);
  assert.ok(pack.overflow <= 1, `${runtime}: Session Pack déborde horizontalement de ${pack.overflow}px`);
}

async function makeWebWindow(BrowserWindow, url) {
  const win = diagnose(new BrowserWindow({ width: 1360, height: 900, show: false, webPreferences: { nodeIntegration: false, contextIsolation: true, sandbox: true, webSecurity: true } }), 'Web');
  await win.loadURL(url);
  return win;
}

export async function runP1IntegrationE2E({ BrowserWindow, APP_ROOT, WEB_ENTRY, createWindow }) {
  let server;
  const windows = [];
  let exitCode = 0;
  const artifactDir = path.join(APP_ROOT, 'artifacts', 'visual-a11y');
  try {
    const host = await startServer(APP_ROOT);
    server = host.server;
    console.log('▶ P1 Integration Freeze E2E Web');
    const web = await makeWebWindow(BrowserWindow, `${host.origin}/${WEB_ENTRY}?module=p0`);
    windows.push(web);
    await web.webContents.executeJavaScript(`localStorage.clear();true`, true);
    web.webContents.reload();
    await walkCourse(web, 'Web');
    await runP1IntegrationVisualAccessibilityMatrix(web, { runtime: 'Web', artifactDir });
    await assertFieldTrialPack(web, 'Web');
    console.log('▶ P1 Integration Freeze E2E Web ✓');

    console.log('▶ P1 Integration Freeze E2E Electron');
    const electron = diagnose(createWindow({ entry: `${WEB_ENTRY}?module=p0`, showWhenReady: false }), 'Electron');
    windows.push(electron);
    await waitFor(electron, `document.querySelector('#moduleRoot')?.dataset.moduleId==='p0'`, 'Electron initial P0');
    await electron.webContents.executeJavaScript(`localStorage.clear();true`, true);
    electron.webContents.reload();
    await walkCourse(electron, 'Electron');
    await runP1IntegrationVisualAccessibilityMatrix(electron, { runtime: 'Electron', artifactDir });
    await assertFieldTrialPack(electron, 'Electron');
    console.log('▶ P1 Integration Freeze E2E Electron ✓');
    console.log('✅ P1 Integration Freeze — parcours P0→P1S4, Learner Gate, Session Pack, Visual/A11y et verrou P2 validés Web/Electron.');
  } catch (error) {
    exitCode = 1;
    console.error('❌ P1 INTEGRATION E2E FAILED');
    console.error(error?.stack || error);
  } finally {
    for (const win of windows) if (!win.isDestroyed()) win.destroy();
    await closeServer(server);
  }
  return exitCode;
}
