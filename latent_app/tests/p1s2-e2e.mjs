import assert from 'node:assert/strict';
import http from 'node:http';
import { mkdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { runP1S2VisualAccessibilityMatrix } from './p1s2-visual-a11y.mjs';

const MIME=new Map([['.html','text/html; charset=utf-8'],['.mjs','text/javascript; charset=utf-8'],['.js','text/javascript; charset=utf-8'],['.cjs','text/javascript; charset=utf-8'],['.css','text/css; charset=utf-8'],['.json','application/json; charset=utf-8']]);
const pause=(ms)=>new Promise(resolve=>setTimeout(resolve,ms));

function safePath(root,pathname){const relative=decodeURIComponent(pathname).replace(/^\/+/, '');const target=path.resolve(root,relative);return target===root||target.startsWith(`${root}${path.sep}`)?target:null}
async function startServer(root){const server=http.createServer(async(req,res)=>{const url=new URL(req.url||'/','http://127.0.0.1'),target=safePath(root,url.pathname);if(!target)return res.writeHead(403).end('Forbidden');try{const body=await readFile(target);res.writeHead(200,{'Content-Type':MIME.get(path.extname(target).toLowerCase())||'application/octet-stream','Cache-Control':'no-store'});res.end(body)}catch{res.writeHead(404).end('Not found')}});await new Promise((resolve,reject)=>{server.once('error',reject);server.listen(0,'127.0.0.1',resolve)});return{server,origin:`http://127.0.0.1:${server.address().port}`}}
async function closeServer(server){if(!server)return;server.closeIdleConnections?.();server.closeAllConnections?.();await new Promise(resolve=>server.close(resolve))}
function diagnose(win,label){win.webContents.on('did-fail-load',(_e,code,description,url)=>console.error(`P1S2 ${label} load ${code} ${url} ${description}`));win.webContents.on('console-message',(_e,level,message,line,source)=>{if(level>=2)console.error(`P1S2 ${label} console[${level}] ${message} @ ${source}:${line}`)});return win}
async function waitFor(win,expression,label,timeout=8000){const deadline=Date.now()+timeout;while(Date.now()<deadline){if(win.isDestroyed())throw new Error(`P1S2 window destroyed: ${label}`);try{if(await win.webContents.executeJavaScript(`Boolean(${expression})`,true))return}catch{}await pause(50)}throw new Error(`P1S2 timeout: ${label}`)}
async function assertRuntime(win,prefix){const value=await win.webContents.executeJavaScript(`document.getElementById('runtimeCard')?.textContent||''`,true);assert.ok(value.startsWith(prefix),`P1S2 runtime expected ${prefix}, got ${value}`)}

async function smokeP1S2(win,runtime){
  const ready=`document.querySelector('#moduleRoot')?.dataset.moduleId==='p1s2' && document.querySelectorAll('.module-section').length===5 && document.getElementById('p1s2-attention-lab')?.dataset.domainEngine==='attention-engine'`;
  await waitFor(win,ready,`${runtime} declarative render`);await assertRuntime(win,runtime);
  const identity=await win.webContents.executeJavaScript(`({title:document.querySelector('.module-hero h1')?.textContent||'',module:document.getElementById('moduleIdentity')?.textContent||'',unsupported:[...document.querySelectorAll('.activity-intro')].filter(n=>/adaptateur de rendu V3 n’est pas encore installé/.test(n.textContent||'')).length})`,true);
  assert.match(identity.title,/Transformer et attention/);assert.match(identity.module,/P1S2/);assert.equal(identity.unsupported,0,`${runtime} P1S2 unsupported activity visible`);

  await win.webContents.executeJavaScript(`localStorage.clear();true`,true);win.webContents.reload();await waitFor(win,ready,`${runtime} clean reload`);

  const prediction=await win.webContents.executeJavaScript(`(() => {const a=document.getElementById('p1s2-context-prediction');if(!a)return null;const selects=[...a.querySelectorAll('select')];const values=['plaide + tribunal','mange + citron'];selects.forEach((s,i)=>{s.value=values[i];s.dispatchEvent(new Event('change',{bubbles:true}))});const b=[...a.querySelectorAll('button')].find(x=>/Vérifier mes prédictions/.test(x.textContent||''));b?.click();return {states:[...a.querySelectorAll('.prediction-row')].map(n=>n.dataset.state),feedback:a.querySelector('.feedback')?.textContent||''}})()`,true);
  assert.deepEqual(prediction?.states,['correct','correct']);assert.match(prediction?.feedback||'',/2\/2/);

  const causal=await win.webContents.executeJavaScript(`(() => {const lab=document.getElementById('p1s2-attention-lab');const scenario=lab?.querySelector('[data-attention-scenario]'),mask=lab?.querySelector('[data-attention-causal]'),scale=lab?.querySelector('[data-attention-scaling]');if(!scenario||!mask||!scale)return null;scenario.value='causal';scenario.dispatchEvent(new Event('change',{bubbles:true}));mask.checked=true;mask.dispatchEvent(new Event('change',{bubbles:true}));scale.checked=true;scale.dispatchEvent(new Event('change',{bubbles:true}));return {weights:[...lab.querySelectorAll('[data-attention-rows] tr')].map(tr=>tr.children[3]?.textContent),masked:[...lab.querySelectorAll('.attention-token[data-masked="true"]')].map(n=>n.textContent),output:lab.querySelector('[data-attention-output]')?.textContent||''}})()`,true);
  assert.deepEqual(causal?.weights?.slice(2),['0.000','0.000']);assert.equal(causal?.masked?.length,2);assert.match(causal?.output||'',/sortie = \[/);

  const unmasked=await win.webContents.executeJavaScript(`(() => {const lab=document.getElementById('p1s2-attention-lab'),mask=lab?.querySelector('[data-attention-causal]');mask.checked=false;mask.dispatchEvent(new Event('change',{bubbles:true}));return [...lab.querySelectorAll('[data-attention-rows] tr')].map(tr=>Number(tr.children[3]?.textContent||0))})()`,true);
  assert.ok(unmasked[2]>0&&unmasked[3]>0,`${runtime} future positions must regain non-zero weight without mask`);

  const captured=await win.webContents.executeJavaScript(`(() => {const b=document.querySelector('#p1s2-attention-lab [data-attention-snapshot]');if(!b)return false;b.click();return true})()`,true);assert.equal(captured,true);
  await waitFor(win,`Number((document.getElementById('eventCount')?.textContent||'0').match(/\\d+/)?.[0]||0)>=3`,`${runtime} attention events`);

  const submitted=await win.webContents.executeJavaScript(`(() => {function complete(id,re){const a=document.getElementById(id);if(!a)return false;for(const q of a.querySelectorAll('fieldset.question')){const input=q.querySelector('input[type="radio"]');if(!input)return false;input.checked=true;input.dispatchEvent(new Event('change',{bubbles:true}))}const b=[...a.querySelectorAll('button')].find(x=>re.test(x.textContent||''));if(!b)return false;b.click();return true}return complete('p1s2-quiz',/Corriger le quiz/)&&complete('p1s2-transfer',/Vérifier le transfert/)})()`,true);
  assert.equal(submitted,true,`${runtime} P1S2 assessment could not be submitted`);
  await waitFor(win,`(() => {const raw=localStorage.getItem('latent-v3-progress')||'';return raw.includes('"p1s2"')&&raw.includes('"quiz"')&&raw.includes('"transfer"')})()`,`${runtime} P1S2 persistence`);
  const before=await win.webContents.executeJavaScript(`document.getElementById('masteryStatus')?.dataset.state||''`,true);assert.ok(['learning','evidence','mastered'].includes(before));
  win.webContents.reload();await waitFor(win,ready,`${runtime} persisted reload`);const after=await win.webContents.executeJavaScript(`document.getElementById('masteryStatus')?.dataset.state||''`,true);assert.equal(after,before,`${runtime} P1S2 mastery must persist`);
}

async function makeWebWindow(BrowserWindow,url,label){const win=diagnose(new BrowserWindow({width:1360,height:900,show:false,webPreferences:{nodeIntegration:false,contextIsolation:true,sandbox:true,webSecurity:true}}),label);await win.loadURL(url);return win}

export async function runP1S2E2E({app,BrowserWindow,APP_ROOT,WEB_ENTRY,createWindow}){
  const artifactDir=path.join(APP_ROOT,'artifacts','visual-a11y');await mkdir(artifactDir,{recursive:true});
  let server;const windows=[];let exitCode=0;
  try{
    const host=await startServer(APP_ROOT);server=host.server;
    console.log('▶ P1S2 E2E Web');const web=await makeWebWindow(BrowserWindow,`${host.origin}/${WEB_ENTRY}?module=p1s2`,'Web');windows.push(web);await smokeP1S2(web,'Web');await runP1S2VisualAccessibilityMatrix(web,{runtime:'Web',artifactDir});console.log('▶ P1S2 E2E Web ✓');
    console.log('▶ P1S2 E2E Electron');const electron=diagnose(createWindow({entry:`${WEB_ENTRY}?module=p1s2`,showWhenReady:false}),'Electron');windows.push(electron);await smokeP1S2(electron,'Electron');await runP1S2VisualAccessibilityMatrix(electron,{runtime:'Electron',artifactDir});console.log('▶ P1S2 E2E Electron ✓');
    console.log('✅ P1S2 LATENT V3 — attention domain + Web/Electron + Visual/A11y validés.');
  }catch(error){exitCode=1;console.error('❌ P1S2 E2E FAILED');console.error(error?.stack||error)}finally{for(const win of windows)if(!win.isDestroyed())win.destroy();await closeServer(server)}
  return exitCode;
}
