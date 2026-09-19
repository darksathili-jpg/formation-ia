import { readFile } from 'node:fs/promises';
import vm from 'node:vm';
const html=await readFile(new URL('../modules/sampling-lab.html',import.meta.url),'utf8');
const errors=[];
const must=[
 'Sampling Lab','Logits → distribution','Greedy ≠ sampling','Top-k ou top-p',
 'Autoregressive Loop Lab','température basse ≠ exactitude','softmax(logits / T)',
 'nucleus','formation-llm-role','Mode formateur actif','Quitter la projection',
 'setProjectorMode','Test de maîtrise','The Curious Case of Neural Text Degeneration'
];
for(const m of must) if(!html.includes(m)) errors.push('marqueur manquant: '+m);
const visibleMarkup=html.replace(new RegExp('<script[\\s\\S]*?</script>','gi'),'').replace(new RegExp('<style[\\s\\S]*?</style>','gi'),'');
if(/>[^<]*(?:Domaine [A-Z]|DOMAINE [A-Z]|[A-Z]\\d{2})[^<]*</.test(visibleMarkup)) errors.push('nomenclature technique visible');
if(/<script\s+[^>]*src=/i.test(html)||/<link\s+[^>]*href=/i.test(html)) errors.push('dépendance externe détectée');
if(/\bfetch\s*\(|XMLHttpRequest|WebSocket\s*\(/.test(html)) errors.push('appel réseau détecté');
const ids=[...html.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);
const dup=ids.filter((id,i)=>ids.indexOf(id)!==i);
if(dup.length) errors.push('id dupliqué(s): '+[...new Set(dup)].join(', '));
const script=html.match(/<script>([\s\S]*?)<\/script>/i)?.[1];
if(!script) errors.push('script introuvable'); else {try{new vm.Script(script)}catch(e){errors.push('JavaScript invalide: '+e.message)}}
if(!/@media\(max-width:650px\)/.test(html)) errors.push('responsive mobile absent');
if(!/@media\(prefers-reduced-motion:reduce\)/.test(html)) errors.push('prefers-reduced-motion absent');
if(!html.includes('T = 0 n’est pas utilisé comme division littérale')) errors.push('garde-fou température zéro absent');
if(!html.includes('probabilité locale de continuation')) errors.push('distinction probabilité / vérité insuffisante');
if(!html.includes('Simulation didactique, pas un modèle commercial')) errors.push('statut didactique insuffisant');
if(errors.length){console.error('\n❌ SAMPLING LAB INVALIDE\n- '+errors.join('\n- '));process.exit(1)}
console.log('✅ Sampling Lab valide — logits, softmax, température, décodage, filtres, autorégression et garde-fous présents.');
