import { readFile } from 'node:fs/promises';
import vm from 'node:vm';
const html=await readFile(new URL('../modules/transformer-block-lab.html',import.meta.url),'utf8');
const errors=[];
const must=[
 'Transformer Block Lab','Position Lab','RoPE simplifié','Block Lab','Attention ou MLP',
 'Stack Lab','KV Cache Lab','Connexion résiduelle','Normalisation','MLP / feed-forward',
 'formation-llm-role','Mode formateur actif','Test de maîtrise',
 'Attention = communiquer','calcul contre davantage de mémoire'
];
for(const m of must) if(!html.includes(m)) errors.push('marqueur manquant: '+m);
if(/>[^<]*(?:Domaine [ABC]|DOMAINE [ABC]|[ABC]\d{2})[^<]*</.test(html)) errors.push('nomenclature technique visible');
if(/<script\s+[^>]*src=/i.test(html)||/<link\s+[^>]*href=/i.test(html)) errors.push('dépendance externe détectée');
if(/\bfetch\s*\(|XMLHttpRequest|WebSocket\s*\(/.test(html)) errors.push('appel réseau détecté');
const ids=[...html.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);
const dup=ids.filter((id,i)=>ids.indexOf(id)!==i);
if(dup.length) errors.push('id dupliqué(s): '+[...new Set(dup)].join(', '));
const script=html.match(/<script>([\s\S]*?)<\/script>/i)?.[1];
if(!script) errors.push('script introuvable'); else {try{new vm.Script(script)}catch(e){errors.push('JavaScript invalide: '+e.message)}}
if(!/@media\(max-width:650px\)/.test(html)) errors.push('responsive mobile absent');
if(!/@media\(prefers-reduced-motion:reduce\)/.test(html)) errors.push('prefers-reduced-motion absent');
if(!html.includes('architecture causale pré-norm simplifiée')) errors.push('limite architecturale non explicite');
if(errors.length){console.error('\n❌ TRANSFORMER BLOCK LAB INVALIDE\n- '+errors.join('\n- '));process.exit(1)}
console.log('✅ Transformer Block Lab valide — position, bloc, MLP, empilement, KV cache et garde-fous présents.');
