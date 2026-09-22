import { readFile } from 'node:fs/promises';
import vm from 'node:vm';

const html=await readFile(new URL('../modules/verification-sources.html',import.meta.url),'utf8');
const architecture=await readFile(new URL('../docs/PARCOURS_3_FIABILITE_EVALUATION.md',import.meta.url),'utf8');
const errors=[];

const must=[
 'Vérification & sources',
 'Parcours 3 · Fiabilité & évaluation · Étape 2',
 'Evidence Lab',
 'Provenance Lab',
 'claim → source → provenance/version → passage pertinent → soutien réel → verdict traçable',
 'Passage pertinent',
 'Indépendance',
 'Source primaire / secondaire',
 'ALCE',
 'FActScore',
 'Evaluation of Machine-Generated Reports',
 'data-p3s2-visual-audit="v1"',
 'MODULE="P3S2"',
 'hallucination-lab.html',
 'Test de maîtrise',
 'Aucun appel réseau'
];
for(const m of must) if(!html.includes(m)) errors.push('marqueur P3S2 manquant: '+m);

const forbidden=[
 'Calibration Lab',
 'Precision@',
 'Recall@',
 'F1 score',
 'Expected Calibration Error',
 'ECE =',
 'MODULE="HALL"'
];
for(const m of forbidden) if(html.includes(m)) errors.push('dette de périmètre P3S2: '+m);

if(!architecture.includes('P3S2 — Vérification & sources')) errors.push('architecture P3S2 absente');
if(!architecture.includes('P3S3 — Évaluation systématique')) errors.push('frontière P3S2→P3S3 absente');

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

const firstScript=html.match(/<script>\s*\(function\(\)\{[\s\S]*?<\/script>/i)?.[0];
if(!firstScript) errors.push('script principal introuvable');
else {
 const js=firstScript.replace(/^<script>|<\/script>$/g,'');
 try{new vm.Script(js)}catch(e){errors.push('JavaScript principal invalide: '+e.message)}
}

if(!html.includes(':focus-visible')) errors.push('focus clavier absent');
if(!/@media\(max-width:650px\)/.test(html)) errors.push('responsive mobile absent');
if(!/@media\(prefers-reduced-motion:reduce\)/.test(html)) errors.push('prefers-reduced-motion absent');
if(!html.includes('grid-template-columns:1fr!important')) errors.push('reflow mobile Evidence Lab non verrouillé');
if(!html.includes('Une citation visible ne prouve rien à elle seule')) errors.push('intuition citation/preuve absente');

if(errors.length){
 console.error('\n❌ P3S2 EVIDENCE LAB INVALIDE\n- '+errors.join('\n- '));
 process.exit(1);
}
console.log('✅ P3S2 Evidence Lab valide — provenance, passage, soutien, indépendance, transfert et frontière P3S3 vérifiés.');
