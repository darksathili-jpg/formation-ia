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
 rows.push({module:m.label,status:m.status,words,present:required.filter(k=>present[k]).length,total:required.length});
 if(m.status==='novice-ready'){
   for(const k of required) if(!present[k]) errors.push(m.path+': bloc pédagogique obligatoire absent: '+k);
   if(words<1200) errors.push(m.path+': contenu visible très court pour un module novice-ready ('+words+' mots) — revue humaine obligatoire');
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
console.log('\n✅ Manifeste pédagogique valide. Les modules novice-ready respectent le contrat structurel ; les dettes historiques restent explicitement suivies.');
