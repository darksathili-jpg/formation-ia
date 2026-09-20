import { readFile } from 'node:fs/promises';
const root=new URL('../',import.meta.url);
const cfg=JSON.parse(await readFile(new URL('../data/learning-system.json',import.meta.url),'utf8'));
const errors=[];
function extractEmbeddedArray(html,decl){
 const p=html.indexOf(decl);if(p<0)return null;
 const start=p+decl.length;let depth=0,inString=false,escape=false;
 for(let i=start;i<html.length;i++){
  const ch=html[i];
  if(inString){if(escape)escape=false;else if(ch==='\\')escape=true;else if(ch==='"')inString=false;continue}
  if(ch==='"'){inString=true;continue}
  if(ch==='[')depth++;
  else if(ch===']'){depth--;if(depth===0){try{return JSON.parse(html.slice(start,i+1))}catch{return null}}}
 }
 return null;
}
function extractIdArray(html,name){
 const m=html.match(new RegExp(name+'=\\\\[([^\\\\]]*)\\\\]'));if(!m)return[];
 return [...m[1].matchAll(/"([^"]+)"/g)].map(x=>x[1]);
}

if(cfg.version!=='2.0.0') errors.push('version Learning System attendue: 2.0.0');
if(cfg.storage_key!=='formation-llm-learning-v2') errors.push('storage_key inattendue');
if(cfg.mastery_policy?.diagnostic_grants_mastery!==false) errors.push('le diagnostic ne doit jamais attribuer la maîtrise');
if(cfg.mastery_policy?.quiz_threshold!==0.8 || cfg.mastery_policy?.transfer_threshold!==0.8) errors.push('seuils de maîtrise attendus: quiz=0.8 et transfert=0.8');
if(JSON.stringify(cfg.spacing_policy?.intervals_days)!==JSON.stringify([1,3,7,14,30])) errors.push('intervalles de réactivation inattendus');
const ids=new Set(),mis=new Set();
for(const m of cfg.modules||[]){
 if(ids.has(m.id)) errors.push('module dupliqué: '+m.id); ids.add(m.id);
 if(!m.href||!m.quiz_total||!m.transfer_total) errors.push('module incomplet: '+m.id);
 for(const x of m.misconceptions||[]){if(mis.has(x.id)) errors.push('misconception dupliquée: '+x.id);mis.add(x.id);if(!x.anchor||!x.label) errors.push('misconception incomplète: '+x.id)}
}
for(const q of cfg.diagnostic?.questions||[]){if(!ids.has(q.module))errors.push('diagnostic module inconnu: '+q.id);if(!mis.has(q.misconception))errors.push('diagnostic misconception inconnue: '+q.id);if(q.answer<0||q.answer>=q.choices.length)errors.push('diagnostic answer invalide: '+q.id)}
for(const q of cfg.review_bank||[]){if(!ids.has(q.module))errors.push('review module inconnu: '+q.id);if(!mis.has(q.misconception))errors.push('review misconception inconnue: '+q.id)}
if((cfg.diagnostic?.questions||[]).length!==15) errors.push('15 questions diagnostiques attendues');
if((cfg.review_bank||[]).length<14) errors.push('banque de réactivation trop courte');
const diag=await readFile(new URL('../diagnostic.html',import.meta.url),'utf8').catch(()=> '');
const review=await readFile(new URL('../review.html',import.meta.url),'utf8').catch(()=> '');
const index=await readFile(new URL('../index.html',import.meta.url),'utf8');
const expectedDiagnostic=(cfg.diagnostic?.questions||[]).map(q=>[q.id,q.module,q.misconception,q.q,q.choices,q.answer]);
const embeddedDiagnostic=extractEmbeddedArray(diag,'const questions=');
if(!embeddedDiagnostic||JSON.stringify(embeddedDiagnostic)!==JSON.stringify(expectedDiagnostic)) errors.push('diagnostic.html: banque embarquée désynchronisée de learning-system.json');
const expectedReview=(cfg.review_bank||[]).map(q=>[q.id,q.module,q.misconception,q.q,q.choices,q.answer]);
const embeddedReview=extractEmbeddedArray(review,'bank=');
if(!embeddedReview||JSON.stringify(embeddedReview)!==JSON.stringify(expectedReview)) errors.push('review.html: banque embarquée désynchronisée de learning-system.json');
for(const m of cfg.modules||[]){
 const html=await readFile(new URL('../'+m.href,import.meta.url),'utf8');
 const quizCount=(html.match(/<fieldset class="q"/g)||[]).length;
 const transferCount=(html.match(/class="transfer-card"/g)||[]).length;
 const quizMis=extractIdArray(html,'QUIZ_MIS');
 const transferMis=extractIdArray(html,'TRANSFER_MIS');
 if(quizCount!==m.quiz_total) errors.push(m.href+': quiz_total config='+m.quiz_total+' mais DOM='+quizCount);
 if(transferCount!==m.transfer_total) errors.push(m.href+': transfer_total config='+m.transfer_total+' mais DOM='+transferCount);
 if(quizMis.length!==quizCount) errors.push(m.href+': mapping QUIZ_MIS incomplet ('+quizMis.length+'/'+quizCount+')');
 if(transferMis.length!==transferCount) errors.push(m.href+': mapping TRANSFER_MIS incomplet ('+transferMis.length+'/'+transferCount+')');
 for(const id of [...quizMis,...transferMis]){if(!mis.has(id))errors.push(m.href+': mapping vers misconception inconnue '+id);if(!id.startsWith(m.id+'.'))errors.push(m.href+': mapping de misconception hors module '+id)}
 for(const x of m.misconceptions||[]){if(!html.includes('id="'+x.anchor+'"'))errors.push(m.href+': ancre de remédiation absente #'+x.anchor+' pour '+x.id)}
}
for(const m of cfg.modules||[]){if((cfg.review_bank||[]).filter(q=>q.module===m.id).length<2)errors.push('review_bank insuffisante pour '+m.id)}

for(const m of cfg.modules||[]){
 const html=await readFile(new URL('../'+m.href,import.meta.url),'utf8');
 if(!html.includes('function resolveMis')) errors.push(m.href+': résolution des misconceptions absente');
 if(!html.includes('trainerToggle')) errors.push(m.href+': synchronisation mode formateur/guidage absente');
 if(!html.includes('data-learning-system="v2"')) errors.push(m.href+': intégration Learning System V2 absente');
}
for(const [name,html] of [['diagnostic.html',diag],['review.html',review]]){
 if(!html) errors.push(name+' absent');
 else {
  if(!html.includes(cfg.storage_key)) errors.push(name+': stockage v2 absent');
  if(/\bfetch\s*\(|XMLHttpRequest|WebSocket\s*\(/.test(html)) errors.push(name+': appel réseau détecté');
  if(!html.includes(':focus-visible')) errors.push(name+': focus clavier absent');
  if(name==='review.html' && !html.includes('resolvedAt')) errors.push('review.html: résolution des remédiations absente');
 }
}
if(!diag.includes('resolvedAt:null,resolvedSource:null')) errors.push('diagnostic.html: une misconception résolue ne peut pas être rouverte lors d’un nouveau diagnostic');
if(!diag.includes('resolvedSource="diagnostic-retake"')) errors.push('diagnostic.html: une ancienne erreur diagnostique corrigée reste active');
if(!diag.includes('data-diagnostic-ux="v1"')) errors.push('diagnostic.html: passe ergonomique mobile absente');
if(!diag.includes("href='index.html#dashboard'")) errors.push('diagnostic.html: retour explicite au cockpit absent');
if(!diag.includes('.hero h1{font-size:clamp(2.45rem,11vw,3.7rem)!important')) errors.push('diagnostic.html: héros mobile encore surdimensionné');
if(!diag.includes('.nav{display:grid!important;grid-template-columns:1fr 1fr!important')) errors.push('diagnostic.html: navigation mobile Précédent/Suivant non stabilisée');
if(!diag.includes('--ink:#173a42')) errors.push('diagnostic.html: surfaces classiques non adoucies');
if(index.includes('Marquer acquis')) errors.push('index: auto-déclaration « Marquer acquis » encore présente');
if(!index.includes('Évaluer ma maîtrise')) errors.push('index: action de maîtrise fondée sur preuves absente');
if(!index.includes('diagnostic.html')) errors.push('index: diagnostic non intégré');
if(!index.includes('review.html')) errors.push('index: réactivation non intégrée');
if(!index.includes(cfg.storage_key)) errors.push('index: moteur v2 non branché');
if(!index.includes('resolvedAt')) errors.push('index: les misconceptions résolues ne sont pas filtrées');
if(errors.length){console.error('\n❌ LEARNING SYSTEM V2 INVALIDE\n- '+errors.join('\n- '));process.exit(1)}
console.log('✅ Learning System V2 valide — diagnostic, maîtrise, misconceptions, répétition espacée et intégration vérifiés.');
