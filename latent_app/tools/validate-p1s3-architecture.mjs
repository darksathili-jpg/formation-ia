import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const errors=[];
const text=(file)=>readFile(path.join(ROOT,file),'utf8');

const domainFiles=['src/domain/activities/transformer-block.mjs','src/domain/activities/position.mjs','src/domain/activities/kv-cache.mjs'];
const forbidden=['document.','window.','localStorage','sessionStorage',"from 'electron'",'ipcRenderer','BrowserWindow','fetch('];
for(const file of domainFiles){const source=await text(file);for(const token of forbidden)if(source.includes(token))errors.push(`${file}: dépendance runtime interdite ${token}`)}

const renderer=await text('src/adapters/web/transformer-block-renderer.mjs');
for(const marker of [
  "from '../../domain/activities/transformer-block.mjs'",
  "from '../../domain/activities/position.mjs'",
  "from '../../domain/activities/kv-cache.mjs'",
  'evaluatePreNormBlock(', 'representAtPosition(', 'evaluateKvCache('
]) if(!renderer.includes(marker)) errors.push(`transformer-block-renderer: délégation manquante ${marker}`);
for(const forbiddenLogic of ['Math.tanh(', 'Math.cos(', 'Math.sin(', 'rmsNormalize(']) if(renderer.includes(forbiddenLogic)) errors.push(`transformer-block-renderer: logique domaine dupliquée ${forbiddenLogic}`);

const app=await text('src/entrypoints/web/app.mjs');
if(!app.includes("from '../../adapters/web/transformer-block-renderer.mjs'")) errors.push('app.mjs: renderer P1S3 non importé');
if(!app.includes('enhanceTransformerBlockActivities(')) errors.push('app.mjs: enhancer P1S3 non exécuté');

const module=JSON.parse(await text('content/modules/p1s3.json'));
const types=new Set(module.activities.map((activity)=>activity.type));
for(const type of ['prediction-cards','position-lab','transformer-block-lab','kv-cache-lab','quiz','transfer-cards']) if(!types.has(type)) errors.push(`p1s3.json: activité ${type} absente`);
if(module.status!=='design-ready') errors.push('p1s3.json: statut doit rester design-ready avant test terrain');
if(module.pedagogy?.fieldValidation?.status!=='pending') errors.push('p1s3.json: validation terrain doit rester pending');
const first=module.sections?.[0]?.activityIds?.[0];
if(first!=='p1s3-role-prediction') errors.push('p1s3.json: première action manipulation-first absente');

if(errors.length){console.error(`\n❌ P1S3 ARCHITECTURE INVALIDE\n- ${errors.join('\n- ')}`);process.exit(1)}
console.log('✅ P1S3 architecture valide — trois moteurs purs, renderer délégué, contrat manipulation-first et statut terrain protégé.');
