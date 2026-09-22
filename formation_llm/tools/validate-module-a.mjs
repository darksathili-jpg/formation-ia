import { readFile } from 'node:fs/promises';
import vm from 'node:vm';

const html=await readFile(new URL('../modules/domaine-a.html',import.meta.url),'utf8');
const errors=[];

function visible(x){
 return x.replace(/<script[\s\S]*?<\/script>/gi,' ')
  .replace(/<style[\s\S]*?<\/style>/gi,' ')
  .replace(/<[^>]+>/g,' ')
  .replace(/&[a-z#0-9]+;/gi,' ')
  .replace(/\s+/g,' ').trim();
}

const must=[
 'Comprendre ce qui se cache derrière un assistant IA',
 'PILOTE NOVICE-FIRST V2',
 'data-p0-manipulation-first="v2"',
 'Premier défi — qui fait réellement quoi ?',
 'System Builder — construisez l\'assistant capable de la mission',
 'Family Lab — où placer un LLM dans l\'IA ?',
 'Pilote V2 : ce module doit encore être re-testé auprès d\'élèves',
 'Test de maîtrise — sans remonter la page',
 'SRC-0006','SRC-0008'
];
for(const marker of must) if(!html.includes(marker)) errors.push('marqueur P0 V2 manquant: '+marker);

for(let i=1;i<=12;i++){
 const id='A'+String(i).padStart(2,'0');
 if(!html.includes('data-ref="'+id+'"')) errors.push(id+' manquant dans l’approfondissement');
}

const main=html.match(/<main[\s\S]*?<\/main>/i)?.[0]||html;
const firstMeaningful=main.indexOf('data-manipulation="meaningful"');
if(firstMeaningful<0) errors.push('aucune manipulation significative déclarée');
else{
 const wordsBefore=visible(main.slice(0,firstMeaningful)).split(/\s+/).filter(Boolean).length;
 if(wordsBefore>350) errors.push('première manipulation trop tardive: '+wordsBefore+' mots visibles avant action (cible ≤350)');
}

const meaningful=(html.match(/data-manipulation="meaningful"/g)||[]).length;
if(meaningful<3) errors.push('au moins 3 manipulations significatives attendues avant évaluation, trouvé '+meaningful);

const def=html.match(/<section\b[^>]*data-pedagogy="definition"[^>]*>([\s\S]*?)<\/section>/i)?.[1]||'';
const coreTerms=(def.match(/<h3\b/g)||[]).length;
if(coreTerms>4) errors.push('P0 V2: plus de 4 termes centraux présentés avant les microcycles ('+coreTerms+')');

const posChallenge=html.indexOf('id="premier-defi"');
const posDefinitions=html.indexOf('id="definitions"');
if(posChallenge<0||posDefinitions<0||posChallenge>posDefinitions) errors.push('P0 V2: la manipulation initiale doit précéder les définitions');

if(!html.includes('pedagogyVersion:"p0-v2"')) errors.push('ancienne progression P0 non invalidée après refonte V2');
if(!html.includes('unlocked=Number.isInteger(saved)?saved:Number.isInteger(legacy)?Math.max(0,legacy-1):0')) errors.push('le diagnostic peut encore court-circuiter les microcycles fondateurs P0');

const quizCount=(html.match(/<fieldset class="q"/g)||[]).length;
const transferCount=(html.match(/class="transfer-card"/g)||[]).length;
if(quizCount!==6) errors.push('6 questions de maîtrise attendues, trouvé '+quizCount);
if(transferCount!==4) errors.push('4 transferts attendus, trouvé '+transferCount);

if(/<script\s+[^>]*src=/i.test(html)||/<link\s+[^>]*href=/i.test(html)) errors.push('dépendance externe détectée');
if(/\bfetch\s*\(|XMLHttpRequest|WebSocket\s*\(/.test(html)) errors.push('appel réseau détecté');

const ids=[...html.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);
const dup=ids.filter((id,i)=>ids.indexOf(id)!==i);
if(dup.length) errors.push('id dupliqué(s): '+[...new Set(dup)].join(', '));

for(const [i,m] of [...html.matchAll(/<script(?: [^>]*)?>([\s\S]*?)<\/script>/g)].entries()){
 try{new vm.Script(m[1])}catch(e){errors.push('JavaScript '+i+' invalide: '+e.message)}
}

if(!/@media\(max-width:680px\)/.test(html)) errors.push('responsive mobile historique absent');
if(!/@media\(max-width:760px\)/.test(html)) errors.push('responsive des micro-labs V2 absent');
if(!/@media\(prefers-reduced-motion:reduce\)/.test(html)) errors.push('prefers-reduced-motion absent');

if(errors.length){
 console.error('\n❌ P0 NOVICE-FIRST V2 INVALIDE\n- '+errors.join('\n- '));
 process.exit(1);
}
console.log('✅ P0 pilote V2 valide — première action précoce, 3 manipulations significatives, vocabulaire juste-à-temps et garde-fous terrain présents.');
