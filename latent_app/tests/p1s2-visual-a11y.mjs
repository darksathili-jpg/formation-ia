import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

const pause = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function setViewport(win, width, height) {
  const [minWidth, minHeight] = win.getMinimumSize();
  if (minWidth > width || minHeight > height) win.setMinimumSize(Math.min(320, width), Math.min(480, height));
  win.setContentSize(width, height);
  await pause(100);
}

async function setTheme(win, mode) {
  const ok = await win.webContents.executeJavaScript(`(() => {
    const b=document.querySelector('[data-display-mode="${mode}"]');
    if(!b)return false;b.click();return document.documentElement.dataset.theme==='${mode}';
  })()`, true);
  assert.equal(ok, true, `P1S2: impossible d'activer ${mode}`);
  await pause(60);
}

async function prepareStress(win) {
  const ok = await win.webContents.executeJavaScript(`(() => {
    const lab=document.getElementById('p1s2-attention-lab');
    const scenario=lab?.querySelector('[data-attention-scenario]');
    const causal=lab?.querySelector('[data-attention-causal]');
    const scaling=lab?.querySelector('[data-attention-scaling]');
    if(!scenario||!causal||!scaling)return false;
    scenario.value='causal';scenario.dispatchEvent(new Event('change',{bubbles:true}));
    causal.checked=true;causal.dispatchEvent(new Event('change',{bubbles:true}));
    scaling.checked=true;scaling.dispatchEvent(new Event('change',{bubbles:true}));
    return true;
  })()`, true);
  assert.equal(ok, true, 'P1S2: Attention Lab incomplet pendant la préparation visuelle');
}

async function focusProbe(win) {
  if (!win.isVisible()) win.show();
  win.focus();win.webContents.focus();await pause(60);
  const ok = await win.webContents.executeJavaScript(`(() => {
    const target=document.querySelector('[data-display-mode="dark"]');
    if(!target)return false;target.focus({preventScroll:true});return document.activeElement===target;
  })()`, true);
  assert.equal(ok, true, 'P1S2: impossible de focaliser un contrôle réel');
}

async function snapshot(win) {
  return win.webContents.executeJavaScript(`(() => {
    const visible=(el)=>{const s=getComputedStyle(el),r=el.getBoundingClientRect();return s.display!=='none'&&s.visibility!=='hidden'&&r.width>0&&r.height>0};
    const labelled=(el)=>Boolean(el.getAttribute('aria-label')?.trim()||el.getAttribute('aria-labelledby')?.trim()||el.labels?.length||el.closest('label')||(['BUTTON','A'].includes(el.tagName)&&el.textContent?.trim()));
    const interactive=[...document.querySelectorAll('a[href],button,input,select,textarea')].filter(visible);
    const unnamed=interactive.filter(el=>!labelled(el)).map(el=>({tag:el.tagName,id:el.id||'',className:el.className||''}));
    const positiveTabindex=[...document.querySelectorAll('[tabindex]')].filter(el=>Number(el.getAttribute('tabindex'))>0).map(el=>el.outerHTML.slice(0,160));
    const unfocusable=interactive.filter(el=>el.tabIndex<0||el.disabled).map(el=>({tag:el.tagName,label:(el.textContent||el.getAttribute('aria-label')||'').trim().slice(0,60)}));
    const smallTargets=interactive.filter(el=>!el.matches('.skip,input[type="checkbox"],input[type="radio"]')).map(el=>({el,r:el.getBoundingClientRect()})).filter(({r})=>r.width<40||r.height<40).map(({el,r})=>({tag:el.tagName,label:(el.textContent||el.getAttribute('aria-label')||'').trim().slice(0,60),width:Math.round(r.width),height:Math.round(r.height)}));
    const majors=[...document.querySelectorAll('.app-shell,main,.module-hero,.activity,.attention-activity,.attention-controls,.attention-table-wrap,.attention-output')].filter(visible);
    const clipped=majors.map(el=>({el,r:el.getBoundingClientRect()})).filter(({r})=>r.left<-2||r.right>innerWidth+2).map(({el,r})=>({className:el.className||el.tagName,left:Math.round(r.left),right:Math.round(r.right),viewport:innerWidth}));
    const active=document.activeElement,s=active?getComputedStyle(active):null;
    const focus=active?{label:(active.textContent||active.getAttribute('aria-label')||'').trim().slice(0,60),width:parseFloat(s.outlineWidth)||0,style:s.outlineStyle,isBody:active===document.body}:null;
    const parseHex=(value)=>{const v=value.trim();if(!/^#[0-9a-f]{6}$/i.test(v))return null;return [1,3,5].map(i=>parseInt(v.slice(i,i+2),16)/255)};
    const lum=(rgb)=>{const c=rgb.map(v=>v<=.04045?v/12.92:((v+.055)/1.055)**2.4);return .2126*c[0]+.7152*c[1]+.0722*c[2]};
    const ratio=(a,b)=>{const x=parseHex(a),y=parseHex(b);if(!x||!y)return 0;const l1=lum(x),l2=lum(y);return (Math.max(l1,l2)+.05)/(Math.min(l1,l2)+.05)};
    const root=getComputedStyle(document.documentElement),colors={};
    for(const bg of ['--bg','--panel'])for(const fg of ['--text','--muted','--cyan','--danger','--good'])colors[fg+'/'+bg]=ratio(root.getPropertyValue(fg),root.getPropertyValue(bg));
    const lab=document.getElementById('p1s2-attention-lab');
    const controlRects=[...lab?.querySelectorAll('.attention-controls>*')||[]].map(el=>el.getBoundingClientRect());
    const controlsStacked=controlRects.length<2?true:controlRects[1].top>=controlRects[0].bottom-2;
    return {
      theme:document.documentElement.dataset.theme,width:innerWidth,height:innerHeight,
      h1Count:document.querySelectorAll('h1').length,main:Boolean(document.querySelector('main')),
      unnamed,positiveTabindex,unfocusable,smallTargets,clipped,
      documentOverflow:Math.max(document.documentElement.scrollWidth,document.body.scrollWidth)-innerWidth,
      focus,colors,
      attention:{
        engine:lab?.dataset.domainEngine||'',
        rows:lab?.querySelectorAll('[data-attention-rows] tr').length||0,
        tokens:lab?.querySelectorAll('.attention-token').length||0,
        masked:lab?.querySelectorAll('.attention-token[data-masked="true"]').length||0,
        output:lab?.querySelector('[data-attention-output]')?.textContent||'',
        unsupported:[...document.querySelectorAll('.activity-intro')].filter(n=>/adaptateur de rendu V3 n’est pas encore installé/.test(n.textContent||'')).length,
        controlsStacked
      }
    };
  })()`, true);
}

function assertReport(report, { runtime, viewport, mode }) {
  const label=`${runtime} P1S2 ${viewport.name}/${mode}`;
  assert.equal(report.theme,mode,`${label}: thème incorrect`);
  assert.equal(report.h1Count,1,`${label}: un h1 attendu`);
  assert.equal(report.main,true,`${label}: main absent`);
  assert.deepEqual(report.unnamed,[],`${label}: contrôle sans nom accessible`);
  assert.deepEqual(report.positiveTabindex,[],`${label}: tabindex positif interdit`);
  assert.deepEqual(report.unfocusable,[],`${label}: contrôle visible hors navigation clavier`);
  assert.deepEqual(report.smallTargets,[],`${label}: cible interactive <40px`);
  assert.deepEqual(report.clipped,[],`${label}: élément majeur tronqué horizontalement`);
  assert.ok(report.documentOverflow<=2,`${label}: overflow horizontal ${report.documentOverflow}px`);
  assert.ok(report.focus&&!report.focus.isBody&&report.focus.width>=3&&report.focus.style!=='none',`${label}: focus visible insuffisant ${JSON.stringify(report.focus)}`);
  const minimum=mode==='projector'?7:4.5;
  for(const [pair,value] of Object.entries(report.colors))assert.ok(value>=minimum,`${label}: contraste ${pair}=${value.toFixed(2)} < ${minimum}`);
  assert.equal(report.attention.engine,'attention-engine',`${label}: moteur de domaine non identifié`);
  assert.equal(report.attention.rows,4,`${label}: 4 lignes d'attention attendues`);
  assert.equal(report.attention.tokens,4,`${label}: 4 tokens attendus`);
  assert.equal(report.attention.masked,2,`${label}: le scénario causal doit masquer 2 positions futures`);
  assert.match(report.attention.output,/sortie = \[/,`${label}: sortie vectorielle absente`);
  assert.equal(report.attention.unsupported,0,`${label}: activité non supportée visible`);
  assert.equal(report.attention.controlsStacked,viewport.name==='mobile',`${label}: densité des contrôles incorrecte`);
}

export async function runP1S2VisualAccessibilityMatrix(win,{runtime,artifactDir}){
  await mkdir(artifactDir,{recursive:true});
  await prepareStress(win);
  const viewports=runtime==='Web'?[{name:'desktop',width:1360,height:900},{name:'mobile',width:390,height:844}]:[{name:'desktop',width:1360,height:900}];
  for(const viewport of viewports){
    await setViewport(win,viewport.width,viewport.height);
    for(const mode of ['dark','light','projector']){
      await setTheme(win,mode);await focusProbe(win);
      const report=await snapshot(win);
      await writeFile(path.join(artifactDir,`${runtime.toLowerCase()}-p1s2-${viewport.name}-${mode}.json`),JSON.stringify({runtime,pageKind:'p1s2',viewport,mode,report},null,2)+'\n','utf8');
      assertReport(report,{runtime,viewport,mode});
      console.log(`  ✓ VISUAL ${runtime} p1s2 ${viewport.name} ${mode}`);
    }
  }
}
