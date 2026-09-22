import { readFile } from 'node:fs/promises';

const errors=[];
const p3s1=await readFile(new URL('../modules/hallucination-lab.html',import.meta.url),'utf8');
const p3s2=await readFile(new URL('../modules/verification-sources.html',import.meta.url),'utf8');
const learning=JSON.parse(await readFile(new URL('../data/learning-system.json',import.meta.url),'utf8'));
const manifest=JSON.parse(await readFile(new URL('../data/pedagogy-manifest.json',import.meta.url),'utf8'));
const index=await readFile(new URL('../index.html',import.meta.url),'utf8');

if(!p3s1.includes('MODULE="HALL"')) errors.push('P3S1: identifiant Learning System absent');
if(!p3s1.includes('verification-sources.html')) errors.push('P3S1: passage vers P3S2 absent');

const must=[
 'MODULE="P3S2"',
 'data-p3s2-visual-audit="v2"',
 'data-success-criterion="v1"',
 'Evidence Lab',
 'Provenance Lab',
 '#evidenceLab table{min-width:0!important;table-layout:fixed}',
 'overflow-wrap:anywhere',
 'html.projector .provenance-flow button',
 'hallucination-lab.html',
 'Étape suivante · P3S3 Évaluation systématique'
];
for(const m of must) if(!p3s2.includes(m)) errors.push('P3S2 gel: marqueur absent '+m);

const sections=(p3s2.match(/<section class="section"/g)||[]).length;
const quiz=(p3s2.match(/<fieldset class="q"/g)||[]).length;
const transfer=(p3s2.match(/class="transfer-card"/g)||[]).length;
if(sections!==12) errors.push('P3S2: 12 étapes attendues, trouvé '+sections);
if(quiz!==6) errors.push('P3S2: 6 quiz attendus, trouvé '+quiz);
if(transfer!==4) errors.push('P3S2: 4 transferts attendus, trouvé '+transfer);

const ids=learning.modules.map(m=>m.id);
const h=ids.indexOf('HALL'),p=ids.indexOf('P3S2');
if(h<0||p<0||p<=h) errors.push('Learning System: ordre P3S1→P3S2 rompu');
const lm=learning.modules.find(m=>m.id==='P3S2');
if(!lm||lm.quiz_total!==6||lm.transfer_total!==4) errors.push('P3S2: contrat de maîtrise 6/4 rompu');
if(!lm||!Array.isArray(lm.misconceptions)||lm.misconceptions.length<6) errors.push('P3S2: couverture misconceptions insuffisante');
if((learning.review_bank||[]).filter(q=>q.module==='P3S2').length<3) errors.push('P3S2: banque de réactivation insuffisante');

const pm=manifest.modules.find(m=>m.path==='modules/verification-sources.html');
if(!pm||pm.status!=='novice-ready'||pm.legacy_debt!==false) errors.push('P3S2: statut pédagogique gelé invalide');

if(!index.includes('data-transversal-card="P3S2"')) errors.push('Cockpit: carte P3S2 absente');
if(!index.includes('data-mastery-status="P3S2"')) errors.push('Cockpit: maîtrise P3S2 absente');
if(!index.includes('modules/verification-sources.html#evidenceLab')) errors.push('Cockpit: Evidence Lab absent');
if(!index.includes('P3S1–P3S2 actifs')) errors.push('Cockpit: état Parcours 3 incohérent');

const forbidden=['Expected Calibration Error','ECE =','Precision@','Recall@','F1 score'];
for(const x of forbidden) if(p3s2.includes(x)) errors.push('P3S2: dette de périmètre vers P3S3/P3S4: '+x);

if(errors.length){
 console.error('\n❌ P3S2 NON GELABLE\n- '+errors.join('\n- '));
 process.exit(1);
}
console.log('✅ P3S2 GELÉ — P3S1→P3S2, Evidence Lab v2, maîtrise, réactivation, navigation, mobile et projection verrouillés.');
