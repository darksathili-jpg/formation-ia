import { readFile } from 'node:fs/promises';

const root=new URL('../',import.meta.url);
const specs=[
 {id:'P2S1',path:'modules/dialoguer-specifier.html',visual:'data-p2s1-visual-audit="v1"',prev:null,next:'dialoguer-exemples.html'},
 {id:'P2S2',path:'modules/dialoguer-exemples.html',visual:'data-p2s2-visual-audit="v2"',prev:'dialoguer-specifier.html',next:'dialoguer-iterer.html'},
 {id:'P2S3',path:'modules/dialoguer-iterer.html',visual:'data-p2s3-visual-audit="v1"',prev:'dialoguer-exemples.html',next:'dialoguer-multitour.html'},
 {id:'P2S4',path:'modules/dialoguer-multitour.html',visual:'data-p2s4-visual-audit="v1"',prev:'dialoguer-iterer.html',next:'dialoguer-tache-complexe.html'},
 {id:'P2S5',path:'modules/dialoguer-tache-complexe.html',visual:'data-p2s5-visual-audit="v1"',prev:'dialoguer-multitour.html',next:null}
];
const errors=[];
const pages={};
for(const spec of specs){
 const html=await readFile(new URL('../'+spec.path,import.meta.url),'utf8');
 pages[spec.id]=html;
 if(!html.includes('MODULE="'+spec.id+'"')) errors.push(spec.id+': identifiant Learning System absent');
 if(!html.includes(spec.visual)) errors.push(spec.id+': audit visuel gelé absent ('+spec.visual+')');
 if(!html.includes('data-success-criterion="v1"')) errors.push(spec.id+': critère de réussite absent');
 if(!html.includes('data-assessment-guard="v1"')) errors.push(spec.id+': garde-fou évaluation absent');
 if(!html.includes('data-completion-guard="v1"')) errors.push(spec.id+': garde-fou complétion absent');
 if(!html.includes('href="../index.html#dashboard"')) errors.push(spec.id+': retour cockpit absent');
 const steps=(html.match(/<section class="section"/g)||[]).length;
 if(steps!==10) errors.push(spec.id+': 10 étapes attendues, trouvé '+steps);
 const quiz=(html.match(/<fieldset class="q"/g)||[]).length;
 const transfer=(html.match(/class="transfer-card"/g)||[]).length;
 if(quiz!==6) errors.push(spec.id+': 6 questions attendues, trouvé '+quiz);
 if(transfer!==4) errors.push(spec.id+': 4 transferts attendus, trouvé '+transfer);
 if(spec.prev&&!html.includes('href="'+spec.prev+'"')) errors.push(spec.id+': lien retour vers '+spec.prev+' absent');
 if(spec.next&&!html.includes('href="'+spec.next+'"')) errors.push(spec.id+': lien suite vers '+spec.next+' absent');
}
if(!pages.P2S5.includes('data-workflow-guard="v1"')) errors.push('P2S5: Workflow Lab incomplet non protégé');
if(!pages.P2S5.includes('grid-template-columns:minmax(0,1fr)')) errors.push('P2S5: reflow étroit du Workflow Lab non gelé');

const learning=JSON.parse(await readFile(new URL('../data/learning-system.json',import.meta.url),'utf8'));
const ids=learning.modules.map(m=>m.id);
const positions=specs.map(s=>ids.indexOf(s.id));
if(positions.some(i=>i<0)) errors.push('Learning System: un module P2 est absent');
for(let i=1;i<positions.length;i++) if(positions[i]<=positions[i-1]) errors.push('Learning System: ordre P2S1→P2S5 rompu');
for(const spec of specs){
 const m=learning.modules.find(x=>x.id===spec.id);
 if(!m) continue;
 if(m.quiz_total!==6||m.transfer_total!==4) errors.push(spec.id+': contrat de maîtrise 6 quiz / 4 transfert rompu');
 if(!Array.isArray(m.misconceptions)||m.misconceptions.length<6) errors.push(spec.id+': couverture misconceptions insuffisante');
 const reviews=learning.review_bank.filter(q=>q.module===spec.id);
 if(reviews.length<2) errors.push(spec.id+': banque de réactivation insuffisante');
}

const manifest=JSON.parse(await readFile(new URL('../data/pedagogy-manifest.json',import.meta.url),'utf8'));
for(const spec of specs){
 const m=manifest.modules.find(x=>x.path===spec.path);
 if(!m) errors.push(spec.id+': absent du manifeste pédagogique');
 else if(m.status!=='novice-ready'||m.legacy_debt!==false) errors.push(spec.id+': statut de gel pédagogique invalide');
}

const index=await readFile(new URL('../index.html',import.meta.url),'utf8');
for(const spec of specs){
 if(!index.includes('data-transversal-card="'+spec.id+'"')) errors.push('Cockpit: carte '+spec.id+' absente');
 if(!index.includes('data-mastery-status="'+spec.id+'"')) errors.push('Cockpit: statut de maîtrise '+spec.id+' absent');
}

if(errors.length){
 console.error('\n❌ PARCOURS 2 NON GELABLE\n- '+errors.join('\n- '));
 process.exit(1);
}
console.log('✅ PARCOURS 2 GELÉ — P2S1→P2S5 restent intacts ; le compteur global peut évoluer avec les autres parcours.');
