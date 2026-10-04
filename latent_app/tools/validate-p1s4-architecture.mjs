import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const errors=[];
const text=(file)=>readFile(path.join(ROOT,file),'utf8');

const domain=await text('src/domain/activities/sampling.mjs');
const forbidden=['document.','window.','localStorage','sessionStorage',"from 'electron'",'ipcRenderer','BrowserWindow','fetch('];
for(const token of forbidden) if(domain.includes(token)) errors.push(`sampling.mjs: dépendance runtime interdite ${token}`);
for(const marker of ['export function softmax(','export function topKMask(','export function topPMask(','export function sampleIndex(','export function decodeStep(','export function advanceAutoregressive(']) if(!domain.includes(marker)) errors.push(`sampling.mjs: primitive domaine absente ${marker}`);

const renderer=await text('src/adapters/web/sampling-renderer.mjs');
for(const marker of ["from '../../domain/activities/sampling.mjs'",'decodeStep(','advanceAutoregressive(','randomFromSeed(']) if(!renderer.includes(marker)) errors.push(`sampling-renderer: délégation manquante ${marker}`);
for(const forbiddenLogic of ['Math.exp(','Math.imul(','sort((a, b) => b.value','cumulative +=']) if(renderer.includes(forbiddenLogic)) errors.push(`sampling-renderer: logique domaine dupliquée ${forbiddenLogic}`);
for(const boundary of ['aucune source externe', 'aucune vérité']) if(!renderer.includes(boundary)) errors.push(`sampling-renderer: frontière vérité absente: ${boundary}`);

const app=await text('src/entrypoints/web/app.mjs');
if(!app.includes("from '../../adapters/web/sampling-renderer.mjs'")) errors.push('app.mjs: renderer P1S4 non importé');
if(!app.includes('enhanceSamplingActivities(')) errors.push('app.mjs: enhancer P1S4 non exécuté');

const module=JSON.parse(await text('content/modules/p1s4.json'));
const types=new Set(module.activities.map((activity)=>activity.type));
for(const type of ['prediction-cards','worked-example','sampling-lab','truth-temperature-lab','autoregressive-lab','self-explanation','quiz','transfer-cards']) if(!types.has(type)) errors.push(`p1s4.json: activité ${type} absente`);
if(module.status!=='design-ready') errors.push('p1s4.json: statut doit rester design-ready avant test terrain');
if(module.pedagogy?.fieldValidation?.status!=='pending') errors.push('p1s4.json: validation terrain doit rester pending');
if(module.pedagogy?.minimumMeaningfulManipulations!==4) errors.push('p1s4.json: 4 manipulations significatives doivent être imposées');
if((module.pedagogy?.firstMeaningfulActionTargetWords??Infinity)>140) errors.push('p1s4.json: première action trop tardive');
const first=module.sections?.[0]?.activityIds?.[0];
if(first!=='p1s4-three-candidate-prediction') errors.push('p1s4.json: trois candidats doivent précéder le jargon');
const firstSection=(module.sections?.[0]?.activityIds||[]).map(id=>module.activities.find(a=>a.id===id)?.type);
if(firstSection[0]!=='prediction-cards') errors.push('p1s4.json: la première micro-séquence doit commencer par une prédiction');
const sampling=module.activities.find(a=>a.id==='p1s4-sampling-lab');
if(JSON.stringify(sampling?.config?.tokens)!==JSON.stringify(['calcule','choisit','hésite'])||JSON.stringify(sampling?.config?.logits)!==JSON.stringify([2,1,0])) errors.push('p1s4.json: expérience initiale à trois candidats [2,1,0] altérée');
const truth=module.activities.find(a=>a.id==='p1s4-truth-lab');
if(!(truth?.config?.logits?.[0]>truth?.config?.logits?.[1])) errors.push('p1s4.json: Truth Trap doit rendre le candidat faux dominant avant température');

for(const required of ['tests/p1s4-e2e.mjs','tests/p1s4-visual-a11y.mjs']){try{await text(required)}catch{errors.push(`${required}: gate P1S4 absent`)}}

if(errors.length){console.error(`\n❌ P1S4 ARCHITECTURE INVALIDE\n- ${errors.join('\n- ')}`);process.exit(1)}
console.log('✅ P1S4 architecture valide — trois candidats avant jargon, décodage pur, vérité bornée, renderer délégué et statut terrain protégé.');
