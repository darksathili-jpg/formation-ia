import { readFile } from 'node:fs/promises';
import vm from 'node:vm';
const html=await readFile(new URL('../modules/domaine-a.html',import.meta.url),'utf8');
const errors=[];
const must=[
  'Situer les LLM','A01','A12','Model ≠ chatbot ≠ application',
  'Open weights n’est pas un synonyme d’open source','GPAI',
  'Catégorie juridique européenne','Concept Map Lab',
  'Test de maîtrise','SRC-0006','SRC-0008'
];
for(const marker of must) if(!html.includes(marker)) errors.push('marqueur manquant: '+marker);
for(let i=1;i<=12;i++){
  const id='A'+String(i).padStart(2,'0');
  if(!html.includes(id)) errors.push(id+' manquant');
}
if(/<script\s+[^>]*src=/i.test(html)||/<link\s+[^>]*href=/i.test(html)) errors.push('dépendance externe détectée');
if(/\bfetch\s*\(|XMLHttpRequest|WebSocket\s*\(/.test(html)) errors.push('appel réseau détecté');
const ids=[...html.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);
const dup=ids.filter((id,i)=>ids.indexOf(id)!==i);
if(dup.length) errors.push('id dupliqué(s): '+[...new Set(dup)].join(', '));
const script=html.match(/<script>([\s\S]*?)<\/script>/i)?.[1];
if(!script) errors.push('script introuvable'); else {try{new vm.Script(script)}catch(e){errors.push('JavaScript invalide: '+e.message)}}
if(!/@media\(max-width:680px\)/.test(html)) errors.push('responsive mobile absent');
if(!/@media\(prefers-reduced-motion:reduce\)/.test(html)) errors.push('prefers-reduced-motion absent');
if(!html.includes('LLM ≠ chatbot')) errors.push('distinction modèle/chatbot insuffisante');
if(!html.includes('Gratuit ≠ libre')) errors.push('distinction gratuit/libre absente');
if(errors.length){console.error('\n❌ DOMAINE A INVALIDE\n- '+errors.join('\n- '));process.exit(1)}
console.log('✅ Domaine A valide — A01–A12, ateliers, quiz et garde-fous présents.');
