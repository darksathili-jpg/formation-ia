import { readFile } from 'node:fs/promises';
import vm from 'node:vm';

const html=await readFile(new URL('../modules/evaluation-systematique.html',import.meta.url),'utf8');
const architecture=await readFile(new URL('../docs/PARCOURS_3_FIABILITE_EVALUATION.md',import.meta.url),'utf8');
const errors=[];

const must=[
 'Évaluation systématique',
 'Parcours 3 · Fiabilité & évaluation · Étape 3',
 'Eval Lab',
 'Regression Lab',
 'objectif observable → cas de test → critères de jugement → baseline → verdicts → catégories d’échec → régressions',
 'Baseline',
 'Catégorie d’échec',
 'Régression',
 'data-p3s3-visual-audit="v1"',
 'MODULE="P3S3"',
 'verification-sources.html',
 'NIST AI 200-3',
 'HELM',
 'Test de maîtrise',
 'Aucun appel réseau'
];
for(const m of must) if(!html.includes(m)) errors.push('marqueur P3S3 manquant: '+m);

const forbidden=[
 'Expected Calibration Error',
 'ECE =',
 'reliability diagram',
 'diagramme de fiabilité',
 'selective prediction',
 'risk-coverage',
 'MODULE="P3S2"'
];
for(const m of forbidden) if(html.includes(m)) errors.push('dette de périmètre P3S3→P3S4: '+m);

if(!architecture.includes('P3S3 — Évaluation systématique')) errors.push('architecture P3S3 absente');
if(!architecture.includes('P3S4 — Incertitude, calibration & décision à risque')) errors.push('frontière P3S3→P3S4 absente');

const sections=(html.match(/<section class="section"/g)||[]).length;
const quiz=(html.match(/<fieldset class="q"/g)||[]).length;
const transfer=(html.match(/class="transfer-card"/g)||[]).length;
if(sections!==12) errors.push('12 étapes attendues, trouvé '+sections);
if(quiz!==6) errors.push('6 questions attendues, trouvé '+quiz);
if(transfer!==4) errors.push('4 transferts attendus, trouvé '+transfer);

const pedagogical=['prerequisites','intuition','definition','worked-example','completion','guided-practice','misconception','self-explanation','retrieval','feedback','transfer','recap'];
for(const p of pedagogical) if(!html.includes('data-pedagogy="'+p+'"')) errors.push('marqueur pédagogique absent: '+p);

if(/<script\s+[^>]*src=/i.test(html)||/<link\s+[^>]*href=/i.test(html)) errors.push('dépendance externe détectée');
if(/\bfetch\s*\(|XMLHttpRequest|WebSocket\s*\(/.test(html)) errors.push('appel réseau détecté');

const ids=[...html.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);
const dup=ids.filter((id,i)=>ids.indexOf(id)!==i);
if(dup.length) errors.push('id dupliqué(s): '+[...new Set(dup)].join(', '));

for(const [i,m] of [...html.matchAll(/<script(?: [^>]*)?>([\s\S]*?)<\/script>/g)].entries()){
 try{new vm.Script(m[1])}catch(e){errors.push('JavaScript '+i+' invalide: '+e.message)}
}

if(!html.includes(':focus-visible')) errors.push('focus clavier absent');
if(!/@media\(max-width:650px\)/.test(html)) errors.push('responsive mobile absent');
if(!/@media\(prefers-reduced-motion:reduce\)/.test(html)) errors.push('prefers-reduced-motion absent');
if(!html.includes('.case-row{display:grid')) errors.push('liste de cas Eval Lab absente');
if(!html.includes('@media(max-width:650px)')) errors.push('reflow mobile Eval Lab absent');
if(!html.includes('html.projector .case-cell')) errors.push('contraste projection Eval Lab absent');
if(!html.includes('score global ne suffit pas')&&!html.includes('score agrégé ne suffit pas')&&!html.includes('score agrégé')) errors.push('distinction score/diagnostic insuffisante');

if(errors.length){
 console.error('\n❌ P3S3 EVAL LAB INVALIDE\n- '+errors.join('\n- '));
 process.exit(1);
}
console.log('✅ P3S3 Eval Lab valide — objectif, cas, rubric, baseline, échecs, régressions, transfert et frontière P3S4 vérifiés.');
