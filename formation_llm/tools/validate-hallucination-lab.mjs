import { readFile } from 'node:fs/promises';
import vm from 'node:vm';
const html=await readFile(new URL('../modules/hallucination-lab.html',import.meta.url),'utf8');
const errors=[];
const must=['Hallucination Lab','Corpus contrôlé','Calibration Lab','Abstention Lab','Prémisse fausse','Vérification externe','TruthfulQA','On Calibration of Modern Neural Networks','formation-llm-role','setProjectorMode','Quitter · Échap','Test de maîtrise'];
for(const m of must) if(!html.includes(m)) errors.push('marqueur manquant: '+m);
if(/<script\s+[^>]*src=/i.test(html)||/<link\s+[^>]*href=/i.test(html)) errors.push('dépendance externe détectée');
if(/\bfetch\s*\(|XMLHttpRequest|WebSocket\s*\(/.test(html)) errors.push('appel réseau détecté');
const ids=[...html.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);
const dup=ids.filter((id,i)=>ids.indexOf(id)!==i);
if(dup.length) errors.push('id dupliqué(s): '+[...new Set(dup)].join(', '));
const script=html.match(/<script>([\s\S]*?)<\/script>/i)?.[1];
if(!script) errors.push('script introuvable'); else {try{new vm.Script(script)}catch(e){errors.push('JavaScript invalide: '+e.message)}}
if(!html.includes(':focus-visible')) errors.push('focus clavier absent');
if(!/@media\(max-width:650px\)/.test(html)) errors.push('responsive mobile absent');
if(!/@media\(prefers-reduced-motion:reduce\)/.test(html)) errors.push('prefers-reduced-motion absent');
if(!html.includes('Une réponse peut être fluide, assurée et pourtant fausse')) errors.push('distinction fluidité/factualité insuffisante');
if(!html.includes('Aucun appel réseau')) errors.push('garde-fou réseau absent');
if(errors.length){console.error('\n❌ HALLUCINATION LAB INVALIDE\n- '+errors.join('\n- '));process.exit(1)}
console.log('✅ Hallucination Lab valide — preuves, calibration, abstention, navigation et garde-fous présents.');
