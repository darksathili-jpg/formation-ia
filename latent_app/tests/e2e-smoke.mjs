import assert from 'node:assert/strict';
import http from 'node:http';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

const WATCHDOG_MS = 90_000;
const MIME = new Map([
  ['.html', 'text/html; charset=utf-8'], ['.mjs', 'text/javascript; charset=utf-8'],
  ['.js', 'text/javascript; charset=utf-8'], ['.css', 'text/css; charset=utf-8'],
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
      response.writeHead(200, { 'Content-Type': MIME.get(path.extname(target).toLowerCase()) || 'application/octet-stream', 'Cache-Control': 'no-store' });
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
  win.webContents.on('render-process-gone', (_event, details) => console.error(`E2E ${label} renderer gone`, details));
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
    } catch (error) { lastError = error; }
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
  const value = await win.webContents.executeJavaScript(`document.getElementById('runtimeCard')?.textContent || ''`, true);
  assert.ok(value.startsWith(prefix), `Expected runtime ${prefix}, got ${value}`);
}

async function smokeP0(win, runtime) {
  const ready = `document.querySelector('#moduleRoot')?.dataset.renderedFrom === 'declarative-content' && document.querySelectorAll('.module-section').length === 6`;
  await waitFor(win, ready, { label: `${runtime} P0 declarative render` });
  await assertRuntime(win, runtime);
  const source = await win.webContents.executeJavaScript(`({moduleId:document.querySelector('#moduleRoot')?.dataset.moduleId,title:document.querySelector('.module-hero h1')?.textContent})`, true);
  assert.equal(source.moduleId, 'p0');
  assert.match(source.title, /assistant IA/i);
  await win.webContents.executeJavaScript(`localStorage.clear(); true`, true);
  await reloadAndWait(win, ready, `${runtime} P0 clean reload`);
  assert.equal(await win.webContents.executeJavaScript(`(() => {
    const quiz=document.getElementById('p0-quiz'); if(!quiz)return false;
    for(const q of quiz.querySelectorAll('fieldset.question')){const input=q.querySelector('input[type="radio"]');if(!input)return false;input.checked=true;input.dispatchEvent(new Event('change',{bubbles:true}));}
    const submit=[...quiz.querySelectorAll('button')].find(b=>/Corriger le quiz/.test(b.textContent)); if(!submit)return false; submit.click(); return true;
  })()`, true), true);
  await waitFor(win, `localStorage.getItem('latent-v3-progress')?.includes('"quiz"')`, { label: `${runtime} progress persistence` });
  await waitFor(win, `document.getElementById('masteryStatus')?.dataset.state && document.getElementById('masteryStatus').dataset.state !== 'not-started'`, { label: `${runtime} mastery transition` });
  const before = await win.webContents.executeJavaScript(`document.getElementById('masteryStatus').dataset.state`, true);
  assert.ok(['learning','evidence','mastered'].includes(before));
  await reloadAndWait(win, ready, `${runtime} P0 persisted reload`);
  assert.equal(await win.webContents.executeJavaScript(`document.getElementById('masteryStatus').dataset.state`, true), before);
}

async function smokeTokenizer(win, runtime) {
  await waitFor(win, `document.querySelector('[data-activity-type="tokenizer-lab"]') && document.querySelector('[data-tokenizer-input]')`, { label: `${runtime} Tokenizer render` });
  await assertRuntime(win, runtime);
  const subword = await win.webContents.executeJavaScript(`(() => {
    const text=document.querySelector('[data-tokenizer-input]'),mode=document.querySelector('[data-tokenizer-mode]'),limit=document.querySelector('[data-tokenizer-limit]');
    text.value='extraordinaire';text.dispatchEvent(new Event('input',{bubbles:true}));mode.value='subword';mode.dispatchEvent(new Event('change',{bubbles:true}));limit.value='2';limit.dispatchEvent(new Event('input',{bubbles:true}));
    return {tokens:[...document.querySelectorAll('[data-tokenizer-tokens] .tokenizer-token')].map(n=>n.textContent),inside:[...document.querySelectorAll('[data-tokenizer-tokens] .tokenizer-token')].map(n=>n.dataset.inContext),status:document.querySelector('[data-tokenizer-context-status]')?.textContent||'',trace:document.querySelector('[data-tokenizer-trace-result]')?.textContent||''};
  })()`, true);
  assert.deepEqual(subword.tokens, ['extra','ord','inaire']);
  assert.deepEqual(subword.inside, ['true','true','false']);
  assert.match(subword.status, /1 hors fenêtre/);
  assert.match(subword.trace, /extra \| ord \| inaire/);
  assert.deepEqual(await win.webContents.executeJavaScript(`(() => {const text=document.querySelector('[data-tokenizer-input]'),mode=document.querySelector('[data-tokenizer-mode]');text.value='é';text.dispatchEvent(new Event('input',{bubbles:true}));mode.value='byte';mode.dispatchEvent(new Event('change',{bubbles:true}));return [...document.querySelectorAll('[data-tokenizer-tokens] .tokenizer-token')].map(n=>n.textContent)})()`, true), ['0xC3','0xA9']);
  assert.equal(await win.webContents.executeJavaScript(`(()=>{const b=document.querySelector('[data-tokenizer-snapshot]');if(!b)return false;b.click();return true})()`, true), true);
  await waitFor(win, `Number((document.getElementById('eventCount')?.textContent||'0').match(/\\d+/)?.[0]||0)>=3`, { label: `${runtime} Tokenizer events` });
}

async function makeWebWindow(BrowserWindow, url, label) {
  const win = diagnoseWindow(new BrowserWindow({ width:1360,height:900,show:false,webPreferences:{nodeIntegration:false,contextIsolation:true,sandbox:true,webSecurity:true} }), label);
  await win.loadURL(url);
  return win;
}

async function setViewport(win, width, height) {
  const [minWidth, minHeight] = win.getMinimumSize();
  if (minWidth > width || minHeight > height) win.setMinimumSize(Math.min(320, width), Math.min(480, height));
  win.setContentSize(width, height);
  await pause(120);
}

async function chooseTheme(win, mode) {
  const changed = await win.webContents.executeJavaScript(`(() => {
    const button=document.querySelector('[data-display-mode="${mode}"]');
    if(!button)return false;
    button.click();
    return document.documentElement.dataset.theme==='${mode}' && button.getAttribute('aria-pressed')==='true';
  })()`, true);
  assert.equal(changed, true, `Could not activate ${mode} display mode`);
  await pause(80);
}

async function prepareTokenizerStress(win) {
  await win.webContents.executeJavaScript(`(() => {
    const text=document.querySelector('[data-tokenizer-input]');
    const mode=document.querySelector('[data-tokenizer-mode]');
    const limit=document.querySelector('[data-tokenizer-limit]');
    if(!text||!mode||!limit)return false;
    text.value='extraordinaire déjà 😊 anticonstitutionnellement — contexte pédagogique répété';
    text.dispatchEvent(new Event('input',{bubbles:true}));
    mode.value='subword';mode.dispatchEvent(new Event('change',{bubbles:true}));
    limit.value='8';limit.dispatchEvent(new Event('input',{bubbles:true}));
    return true;
  })()`, true);
}

async function visualAccessibilitySnapshot(win, pageKind) {
  return win.webContents.executeJavaScript(`(() => {
    const visible=(el)=>{const s=getComputedStyle(el),r=el.getBoundingClientRect();return s.display!=='none'&&s.visibility!=='hidden'&&r.width>0&&r.height>0};
    const labelled=(el)=>{
      if(el.getAttribute('aria-label')?.trim())return true;
      if(el.getAttribute('aria-labelledby')?.trim())return true;
      if(el.labels?.length)return true;
      if(el.closest('label'))return true;
      if(['BUTTON','A'].includes(el.tagName)&&el.textContent?.trim())return true;
      return false;
    };
    const interactive=[...document.querySelectorAll('a[href],button,input,select,textarea')].filter(visible);
    const unnamed=interactive.filter(el=>!labelled(el)).map(el=>({tag:el.tagName,type:el.type||'',id:el.id||'',className:el.className||''}));
    const positiveTabindex=[...document.querySelectorAll('[tabindex]')].filter(el=>Number(el.getAttribute('tabindex'))>0).map(el=>el.outerHTML.slice(0,180));
    const smallTargets=interactive.filter(el=>!el.matches('.skip,input[type="checkbox"],input[type="radio"]')).map(el=>{const r=el.getBoundingClientRect();return {el,r}}).filter(({r})=>r.width<40||r.height<40).map(({el,r})=>({tag:el.tagName,label:(el.textContent||el.getAttribute('aria-label')||'').trim().slice(0,60),width:Math.round(r.width),height:Math.round(r.height)}));
    const majors=[...document.querySelectorAll('.app-shell,main,.module-hero,.activity,.tokenizer-grid,.tokenizer-controls,.tokenizer-output')].filter(visible);
    const clipped=majors.map(el=>{const r=el.getBoundingClientRect();return {el,r}}).filter(({r})=>r.left<-2||r.right>innerWidth+2).map(({el,r})=>({className:el.className||el.tagName,left:Math.round(r.left),right:Math.round(r.right),viewport:innerWidth}));

    const focusTarget=document.querySelector('[data-display-mode="dark"]');
    focusTarget?.focus();
    const focusStyle=focusTarget?getComputedStyle(focusTarget):null;
    const outline=focusStyle?{width:parseFloat(focusStyle.outlineWidth)||0,style:focusStyle.outlineStyle,color:focusStyle.outlineColor}:null;

    const parseHex=(value)=>{const v=value.trim();if(!/^#[0-9a-f]{6}$/i.test(v))return null;return [1,3,5].map(i=>parseInt(v.slice(i,i+2),16)/255)};
    const lum=(rgb)=>{const c=rgb.map(v=>v<=.04045?v/12.92:((v+.055)/1.055)**2.4);return .2126*c[0]+.7152*c[1]+.0722*c[2]};
    const ratio=(a,b)=>{const x=parseHex(a),y=parseHex(b);if(!x||!y)return 0;const l1=lum(x),l2=lum(y);return (Math.max(l1,l2)+.05)/(Math.min(l1,l2)+.05)};
    const root=getComputedStyle(document.documentElement);
    const colors={};
    for(const bg of ['--bg','--panel'])for(const fg of ['--text','--muted','--cyan','--danger','--good']){
      const key=fg+'/'+bg;colors[key]=ratio(root.getPropertyValue(fg),root.getPropertyValue(bg));
    }

    const tokenizer=${JSON.stringify(pageKind)}==='tokenizer'?(()=>{
      const controls=document.querySelector('.tokenizer-controls')?.getBoundingClientRect();
      const output=document.querySelector('.tokenizer-output')?.getBoundingClientRect();
      return {stacked:Boolean(controls&&output&&output.top>=controls.bottom-2),tokens:document.querySelectorAll('.tokenizer-token').length,kpis:document.querySelectorAll('.tokenizer-kpis>div').length};
    })():null;

    return {
      theme:document.documentElement.dataset.theme,
      width:innerWidth,
      height:innerHeight,
      h1Count:document.querySelectorAll('h1').length,
      main:Boolean(document.querySelector('main')),
      unnamed,
      positiveTabindex,
      smallTargets,
      clipped,
      documentOverflow:Math.max(document.documentElement.scrollWidth,document.body.scrollWidth)-innerWidth,
      outline,
      colors,
      tokenizer
    };
  })()`, true);
}

function assertVisualAccessibility(report, { runtime, pageKind, viewport, mode }) {
  const label = `${runtime} ${pageKind} ${viewport.name}/${mode}`;
  assert.equal(report.theme, mode, `${label}: theme mismatch`);
  assert.equal(report.h1Count, 1, `${label}: expected exactly one h1`);
  assert.equal(report.main, true, `${label}: missing main landmark`);
  assert.deepEqual(report.unnamed, [], `${label}: unnamed interactive controls`);
  assert.deepEqual(report.positiveTabindex, [], `${label}: positive tabindex forbidden`);
  assert.deepEqual(report.smallTargets, [], `${label}: interactive target below 40px`);
  assert.deepEqual(report.clipped, [], `${label}: major layout element clipped horizontally`);
  assert.ok(report.documentOverflow <= 2, `${label}: horizontal overflow ${report.documentOverflow}px`);
  assert.ok(report.outline && report.outline.width >= 3 && report.outline.style !== 'none', `${label}: visible focus ring missing`);
  const minimumContrast = mode === 'projector' ? 7 : 4.5;
  for (const [pair, ratio] of Object.entries(report.colors)) assert.ok(ratio >= minimumContrast, `${label}: contrast ${pair}=${ratio.toFixed(2)} < ${minimumContrast}`);
  if (pageKind === 'tokenizer') {
    assert.equal(report.tokenizer.kpis, 4, `${label}: Tokenizer KPI grid incomplete`);
    assert.ok(report.tokenizer.tokens > 0, `${label}: Tokenizer tokens missing`);
    assert.equal(report.tokenizer.stacked, viewport.name === 'mobile', `${label}: Tokenizer density/grid does not match viewport`);
  }
}

async function captureGateScreenshot(win, target) {
  const image = await win.webContents.capturePage();
  await writeFile(target, image.toPNG());
}

async function runVisualAccessibilityMatrix(win, { runtime, pageKind, artifactDir }) {
  if (pageKind === 'tokenizer') await prepareTokenizerStress(win);
  const viewports = runtime === 'Web'
    ? [{ name:'desktop', width:1360, height:900 }, { name:'mobile', width:390, height:844 }]
    : [{ name:'desktop', width:1360, height:900 }];
  const modes = ['dark','light','projector'];

  for (const viewport of viewports) {
    await setViewport(win, viewport.width, viewport.height);
    for (const mode of modes) {
      await chooseTheme(win, mode);
      const report = await visualAccessibilitySnapshot(win, pageKind);
      assertVisualAccessibility(report, { runtime, pageKind, viewport, mode });
      const name = `${runtime.toLowerCase()}-${pageKind}-${viewport.name}-${mode}.png`;
      await captureGateScreenshot(win, path.join(artifactDir, name));
      console.log(`  ✓ VISUAL ${runtime} ${pageKind} ${viewport.name} ${mode}`);
    }
  }
}

export async function runE2ESmoke({ app, BrowserWindow, APP_ROOT, WEB_ENTRY, createWindow }) {
  console.log('▶ E2E production main ready');
  const watchdog = setTimeout(() => { console.error(`❌ E2E watchdog exceeded ${WATCHDOG_MS} ms`); app.exit(1); }, WATCHDOG_MS);
  let server; const windows=[]; let exitCode=0;
  const artifactDir = path.join(APP_ROOT, 'artifacts', 'visual-a11y');
  try {
    await mkdir(artifactDir, { recursive:true });
    const host=await startStaticServer(APP_ROOT); server=host.server; stage(`static server ${host.origin}`);

    stage('P0 Web');
    const webP0=await makeWebWindow(BrowserWindow,`${host.origin}/${WEB_ENTRY}`,'P0 Web');windows.push(webP0);
    await smokeP0(webP0,'Web');
    await runVisualAccessibilityMatrix(webP0,{runtime:'Web',pageKind:'p0',artifactDir});
    stage('P0 Web ✓');

    stage('P0 Electron');
    const electronP0=diagnoseWindow(createWindow({showWhenReady:false}),'P0 Electron');windows.push(electronP0);
    await smokeP0(electronP0,'Electron');
    await runVisualAccessibilityMatrix(electronP0,{runtime:'Electron',pageKind:'p0',artifactDir});
    stage('P0 Electron ✓');

    stage('Tokenizer Web');
    const webTokenizer=await makeWebWindow(BrowserWindow,`${host.origin}/src/entrypoints/web/tokenizer.html`,'Tokenizer Web');windows.push(webTokenizer);
    await smokeTokenizer(webTokenizer,'Web');
    await runVisualAccessibilityMatrix(webTokenizer,{runtime:'Web',pageKind:'tokenizer',artifactDir});
    stage('Tokenizer Web ✓');

    stage('Tokenizer Electron');
    const electronTokenizer=diagnoseWindow(createWindow({entry:'src/entrypoints/web/tokenizer.html',showWhenReady:false}),'Tokenizer Electron');windows.push(electronTokenizer);
    await smokeTokenizer(electronTokenizer,'Electron');
    await runVisualAccessibilityMatrix(electronTokenizer,{runtime:'Electron',pageKind:'tokenizer',artifactDir});
    stage('Tokenizer Electron ✓');

    console.log(`✅ E2E LATENT V3 — fonctionnel + Visual & Accessibility Gate validés. Captures: ${artifactDir}`);
  } catch(error) { exitCode=1; console.error('❌ E2E LATENT V3 FAILED'); console.error(error?.stack||error); }
  finally { stage('cleanup'); clearTimeout(watchdog); for(const win of windows)if(!win.isDestroyed())win.destroy(); await closeServer(server); stage(`return ${exitCode}`); }
  return exitCode;
}
