import { readFile } from 'node:fs/promises';
import vm from 'node:vm';
const html=await readFile(new URL('../index.html',import.meta.url),'utf8');
const errors=[];
if(/>[^<]*(?:Domaine [ABC]|DOMAINE [ABC]|[ABC]\\d{2})[^<]*</.test(html)) errors.push('nomenclature technique A/B/C visible dans l’interface apprenant');
const must=['formation-llm-role','Mode formateur actif','Tableau de bord','Parcours 0 → 7','Laboratoires','Progression','Profil : stagiaire','Activer mode formateur','modules/domaine-a.html','modules/domaine-b.html','modules/domaine-c.html','Module d’entrée actif','Tokenizer Lab','Attention Lab','RAG Lab','localStorage'];
for(const marker of must) if(!html.includes(marker)) errors.push('marqueur manquant: '+marker);
if(!html.includes('trainer-banner')) errors.push('bandeau de mode formateur absent');
if(/<script\s+[^>]*src=/i.test(html)||/<link\s+[^>]*href=/i.test(html)) errors.push('dépendance externe détectée dans le shell');
if(/\bfetch\s*\(|XMLHttpRequest|WebSocket\s*\(/.test(html)) errors.push('appel réseau détecté dans le shell');
const ids=[...html.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);
const dup=ids.filter((id,i)=>ids.indexOf(id)!==i);
if(dup.length) errors.push('id dupliqué(s): '+[...new Set(dup)].join(', '));
const script=html.match(/<script>([\s\S]*?)<\/script>/i)?.[1];
if(!script) errors.push('script applicatif introuvable'); else {try{new vm.Script(script)}catch(e){errors.push('JavaScript invalide: '+e.message)}}
if(!/@media\(max-width:650px\)/.test(html)) errors.push('responsive mobile absent');
if(!/@media\(prefers-reduced-motion:reduce\)/.test(html)) errors.push('prefers-reduced-motion absent');
if(errors.length){console.error('\n❌ APPLICATION INVALIDE\n- '+errors.join('\n- '));process.exit(1)}
console.log('✅ Application shell valide — navigation, progression locale, statuts/actions explicites et parcours apprenant 0/1/4 présents.');