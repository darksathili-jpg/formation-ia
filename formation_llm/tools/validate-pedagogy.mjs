import { readFile, readdir } from 'node:fs/promises';

const root=new URL('../',import.meta.url);
const manifest=JSON.parse(await readFile(new URL('../data/pedagogy-manifest.json',import.meta.url),'utf8'));
const required=[
 'prerequisites','intuition','definition','worked-example','guided-practice','completion',
 'misconception','self-explanation','retrieval','feedback','transfer','recap'
];
const errors=[],rows=[];

function visible(html){
 return html.replace(/<script[\s\S]*?<\/script>/gi,' ')
  .replace(/<style[\s\S]*?<\/style>/gi,' ')
  .replace(/<[^>]+>/g,' ').replace(/\s+/g,' ').trim();
}

const files=(await readdir(new URL('../modules/',import.meta.url))).filter(x=>x.endsWith('.html'));
const listed=new Set(manifest.modules.map(m=>m.path.replace('modules/','')));
for(const f of files){
 if(!listed.has(f)) errors.push('Nouveau module non déclaré dans pedagogy-manifest.json: modules/'+f);
}

for(const m of manifest.modules){
 const html=await readFile(new URL('../'+m.path,import.meta.url),'utf8');
 const words=visible(html).split(/\s+/).filter(Boolean).length;
 const present=Object.fromEntries(required.map(k=>[k,html.includes('data-pedagogy="'+k+'"')]));
 const pOf=k=>html.indexOf('data-pedagogy="'+k+'"');
 const fixedOrder=['prerequisites','intuition','definition','worked-example','misconception','self-explanation','retrieval','transfer','recap'];
 let previous=-1;
 for(const k of fixedOrder){
   const pos=pOf(k);
   if(pos>=0){
     if(previous>pos) errors.push(m.path+': ordre novice-first rompu autour de '+k);
     previous=pos;
   }
 }
 const workedPos=pOf('worked-example'),misPos=pOf('misconception');
 for(const k of ['guided-practice','completion']){
   const pos=pOf(k);
   if(pos>=0&&workedPos>=0&&pos<workedPos) errors.push(m.path+': '+k+' placé avant l’exemple travaillé');
   if(pos>=0&&misPos>=0&&pos>misPos) errors.push(m.path+': '+k+' placé après les misconceptions');
 }
 rows.push({module:m.label,status:m.status,words,present:required.filter(k=>present[k]).length,total:required.length});
 if(m.status==='novice-ready'||m.status==='pilot-ready'){
   for(const k of required) if(!present[k]) errors.push(m.path+': bloc pédagogique obligatoire absent: '+k);
   if(words<1200) errors.push(m.path+': contenu visible très court pour un module '+m.status+' ('+words+' mots) — revue humaine obligatoire');
   if(!html.includes('data-learning-system="v2"')) errors.push(m.path+': moteur Learning System V2 absent');
   if(!html.includes('learning-guide')) errors.push(m.path+': progressive disclosure absent');
   if(!html.includes('formation-llm-learning-v2')) errors.push(m.path+': stockage de maîtrise V2 absent');
   if(!html.includes('data-success-criterion="v1"')) errors.push(m.path+': critère de réussite observable absent');
   const selfMatch=html.match(/<section\b[^>]*data-pedagogy="self-explanation"[^>]*>([\s\S]*?)<\/section>/);
   if(!selfMatch||!/<textarea\b/i.test(selfMatch[1])) errors.push(m.path+': auto-explication sans champ de rédaction');
   if(selfMatch&&(selfMatch[1].match(/type="checkbox"/g)||[]).length<3) errors.push(m.path+': auto-explication sans critères d’auto-contrôle suffisants');
   const quizCount=(html.match(/<fieldset class="q"/g)||[]).length;
   const feedbackCount=(html.match(/class="feedback"(?:\s|>)/g)||[]).length;
   const transferCount=(html.match(/class="transfer-card"(?:\s|>)/g)||[]).length;
   const transferFeedbackCount=(html.match(/class="transfer-feedback"(?:\s|>)/g)||[]).length;
   if(quizCount && feedbackCount!==quizCount) errors.push(m.path+': chaque question de quiz doit avoir un feedback ('+feedbackCount+'/'+quizCount+')');
   if(transferCount && transferFeedbackCount!==transferCount) errors.push(m.path+': chaque transfert doit avoir un feedback ('+transferFeedbackCount+'/'+transferCount+')');
   const defMatch=html.match(/<section\b[^>]*data-pedagogy="definition"[^>]*>([\s\S]*?)<\/section>/);
   const definitionItems=defMatch?(defMatch[1].match(/<h3\b/g)||[]).length:0;
   if(definitionItems>=9 && !defMatch[1].includes('data-novice-priority="v1"')) errors.push(m.path+': glossaire chargé ('+definitionItems+' notions) sans priorité de première lecture');
   if(m.status==='pilot-ready'){
     if(m.pedagogy_version!=='2.0') errors.push(m.path+': pilot-ready sans pedagogy_version 2.0');
     if(!m.learner_validation||!String(m.learner_validation.status||'').startsWith('pending')) errors.push(m.path+': pilot-ready sans validation terrain explicitement en attente');
     const meaningful=(html.match(/data-manipulation="meaningful"/g)||[]).length;
     if(meaningful<3) errors.push(m.path+': V2 exige au moins 3 manipulations significatives, trouvé '+meaningful);
     const first=html.indexOf('data-manipulation="meaningful"');
     if(first>=0){
       const before=visible(html.slice(0,first)).split(/\s+/).filter(Boolean).length;
       if(before>350) errors.push(m.path+': première manipulation V2 trop tardive ('+before+' mots avant action)');
     }
     if(definitionItems>6) errors.push(m.path+': V2 interdit un glossaire central massif avant microcycles ('+definitionItems+' notions)');
   }
 }
 if(m.status==='remediation-required' && !m.legacy_debt){
   errors.push(m.path+': remediation-required interdit sans legacy_debt explicite');
 }
}

console.table(rows);
if(errors.length){
 console.error('\n❌ GARDE-FOU PÉDAGOGIQUE ÉCHOUÉ\n- '+errors.join('\n- '));
 process.exit(1);
}
console.log('\n✅ Manifeste pédagogique valide. Les modules novice-ready respectent le contrat structurel ; les pilotes V2 respectent les garde-fous manipulation-first sans prétendre être validés terrain.');
