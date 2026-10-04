import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const read=(relative)=>readFile(path.join(ROOT,relative),'utf8');
const errors=[];
const domain=await read('src/domain/activities/attention.mjs');
const adapter=await read('src/adapters/web/attention-renderer.mjs');
const app=await read('src/entrypoints/web/app.mjs');
const main=await read('src/entrypoints/electron/main.mjs');
const e2e=await read('tests/p1s2-e2e.mjs');
const visual=await read('tests/p1s2-visual-a11y.mjs');
const moduleJson=JSON.parse(await read('content/modules/p1s2.json'));
const bank=JSON.parse(await read('content/assessment-banks/p1s2.json'));

for(const token of ['document.','window.','localStorage','sessionStorage',"from 'electron'",'ipcRenderer','BrowserWindow']){
  if(domain.includes(token))errors.push(`attention domain: dépendance runtime interdite ${token}`);
}
for(const marker of ['evaluateAttention','stableSoftmax','applyCausalMask','weightedSum','scaleAttentionScore'])if(!domain.includes(marker))errors.push(`attention domain: fonction attendue absente ${marker}`);
if(!adapter.includes("from '../../domain/activities/attention.mjs'"))errors.push('attention renderer: moteur de domaine non importé');
if(!adapter.includes('evaluateAttention('))errors.push('attention renderer: evaluateAttention non consommé');
for(const forbidden of ['Math.exp(','Math.sqrt(','reduce((sum, value, index) => sum + vector'])if(adapter.includes(forbidden))errors.push(`attention renderer: calcul métier dupliqué ${forbidden}`);
if(!adapter.includes("'data-domain-engine': 'attention-engine'"))errors.push('attention renderer: preuve de délégation domaine absente');
if(!app.includes("from '../../adapters/web/attention-renderer.mjs'"))errors.push('app: adaptateur attention non importé');
if(!app.includes('enhanceAttentionActivities({'))errors.push('app: activité attention non améliorée après rendu générique');
if(!main.includes('--latent-e2e-p1s2')||!main.includes("../../../tests/p1s2-e2e.mjs"))errors.push('Electron main: gate P1S2 non lancé via le main de production');
for(const marker of ['smokeP1S2','?module=p1s2','runP1S2VisualAccessibilityMatrix','data-attention-causal','data-attention-scaling'])if(!e2e.includes(marker))errors.push(`P1S2 E2E: marqueur absent ${marker}`);
for(const marker of ['390','844','1360','900','projector','attention-engine','masked','controlsStacked'])if(!visual.includes(marker))errors.push(`P1S2 visual gate: invariant absent ${marker}`);
if(moduleJson.moduleId!=='p1s2'||moduleJson.status!=='design-ready')errors.push('p1s2.json: identité/statut inattendu');
if(moduleJson.pedagogy?.fieldValidation?.status!=='pending')errors.push('p1s2.json: validation terrain doit rester pending');
if(moduleJson.activities.find(a=>a.id==='p1s2-attention-lab')?.config?.domainEngine!=='attention-engine')errors.push('p1s2.json: attention lab non délégué au moteur pur');
if((bank.quiz||[]).length!==6||(bank.transfer||[]).length!==4)errors.push('p1s2 assessment: 6 quiz et 4 transferts attendus');
const firstSection=moduleJson.sections?.[0];
if(firstSection?.activityIds?.[0]!=='p1s2-context-prediction')errors.push('p1s2 pédagogie: le besoin de contexte doit précéder Q/K/V');
const qkvSection=moduleJson.sections?.find(s=>s.id==='qkv');
if(!qkvSection||moduleJson.sections.indexOf(qkvSection)<=moduleJson.sections.indexOf(firstSection))errors.push('p1s2 pédagogie: Q/K/V apparaît trop tôt');

if(errors.length){console.error(`\n❌ P1S2 ARCHITECTURE INVALIDE\n- ${errors.join('\n- ')}`);process.exit(1)}
console.log('✅ P1S2 architecture valide — contextualisation avant jargon, moteur attention pur, renderer sans calcul métier, E2E Web/Electron et Visual/A11y dédiés.');
