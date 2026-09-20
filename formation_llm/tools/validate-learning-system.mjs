import { readFile } from 'node:fs/promises';
const root=new URL('../',import.meta.url);
const cfg=JSON.parse(await readFile(new URL('../data/learning-system.json',import.meta.url),'utf8'));
const errors=[];
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
if(index.includes('Marquer acquis')) errors.push('index: auto-déclaration « Marquer acquis » encore présente');
if(!index.includes('Évaluer ma maîtrise')) errors.push('index: action de maîtrise fondée sur preuves absente');
if(!index.includes('diagnostic.html')) errors.push('index: diagnostic non intégré');
if(!index.includes('review.html')) errors.push('index: réactivation non intégrée');
if(!index.includes(cfg.storage_key)) errors.push('index: moteur v2 non branché');
if(!index.includes('resolvedAt')) errors.push('index: les misconceptions résolues ne sont pas filtrées');
if(errors.length){console.error('\n❌ LEARNING SYSTEM V2 INVALIDE\n- '+errors.join('\n- '));process.exit(1)}
console.log('✅ Learning System V2 valide — diagnostic, maîtrise, misconceptions, répétition espacée et intégration vérifiés.');
