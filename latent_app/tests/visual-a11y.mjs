import assert from 'node:assert/strict';
import { writeFile } from 'node:fs/promises';
import path from 'node:path';

const pause = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

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

async function keyboardFocusProbe(win) {
  win.show();
  win.focus();
  win.webContents.focus();
  await win.webContents.executeJavaScript(`document.querySelector('.skip')?.focus(); true`, true);
  win.webContents.sendInputEvent({ type:'keyDown', keyCode:'Tab' });
  win.webContents.sendInputEvent({ type:'keyUp', keyCode:'Tab' });
  await pause(80);
}

async function snapshot(win, pageKind) {
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

    const active=document.activeElement;
    const activeStyle=active?getComputedStyle(active):null;
    const keyboardFocus=active?{
      tag:active.tagName,
      label:(active.textContent||active.getAttribute('aria-label')||'').trim().slice(0,80),
      isBody:active===document.body,
      width:activeStyle?parseFloat(activeStyle.outlineWidth)||0:0,
      style:activeStyle?.outlineStyle||'none',
      color:activeStyle?.outlineColor||''
    }:null;

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
      keyboardFocus,
      colors,
      tokenizer
    };
  })()`, true);
}

function assertSnapshot(report, { runtime, pageKind, viewport, mode }) {
  const label = `${runtime} ${pageKind} ${viewport.name}/${mode}`;
  assert.equal(report.theme, mode, `${label}: theme mismatch`);
  assert.equal(report.h1Count, 1, `${label}: expected exactly one h1`);
  assert.equal(report.main, true, `${label}: missing main landmark`);
  assert.deepEqual(report.unnamed, [], `${label}: unnamed interactive controls`);
  assert.deepEqual(report.positiveTabindex, [], `${label}: positive tabindex forbidden`);
  assert.deepEqual(report.smallTargets, [], `${label}: interactive target below 40px`);
  assert.deepEqual(report.clipped, [], `${label}: major layout element clipped horizontally`);
  assert.ok(report.documentOverflow <= 2, `${label}: horizontal overflow ${report.documentOverflow}px`);
  assert.ok(report.keyboardFocus && !report.keyboardFocus.isBody, `${label}: Tab did not reach an interactive control`);
  assert.ok(report.keyboardFocus.width >= 3 && report.keyboardFocus.style !== 'none', `${label}: visible keyboard focus ring missing on ${JSON.stringify(report.keyboardFocus)}`);
  const minimumContrast = mode === 'projector' ? 7 : 4.5;
  for (const [pair, value] of Object.entries(report.colors)) assert.ok(value >= minimumContrast, `${label}: contrast ${pair}=${value.toFixed(2)} < ${minimumContrast}`);
  if (pageKind === 'tokenizer') {
    assert.equal(report.tokenizer.kpis, 4, `${label}: Tokenizer KPI grid incomplete`);
    assert.ok(report.tokenizer.tokens > 0, `${label}: Tokenizer tokens missing`);
    assert.equal(report.tokenizer.stacked, viewport.name === 'mobile', `${label}: Tokenizer density/grid does not match viewport`);
  }
}

async function capture(win, target) {
  const image = await win.webContents.capturePage();
  await writeFile(target, image.toPNG());
}

export async function runVisualAccessibilityMatrix(win, { runtime, pageKind, artifactDir }) {
  if (pageKind === 'tokenizer') await prepareTokenizerStress(win);
  const viewports = runtime === 'Web'
    ? [{ name:'desktop', width:1360, height:900 }, { name:'mobile', width:390, height:844 }]
    : [{ name:'desktop', width:1360, height:900 }];
  const modes = ['dark','light','projector'];

  for (const viewport of viewports) {
    await setViewport(win, viewport.width, viewport.height);
    for (const mode of modes) {
      await chooseTheme(win, mode);
      await keyboardFocusProbe(win);
      const report = await snapshot(win, pageKind);
      assertSnapshot(report, { runtime, pageKind, viewport, mode });
      const name = `${runtime.toLowerCase()}-${pageKind}-${viewport.name}-${mode}.png`;
      await capture(win, path.join(artifactDir, name));
      console.log(`  ✓ VISUAL ${runtime} ${pageKind} ${viewport.name} ${mode}`);
    }
  }
}
