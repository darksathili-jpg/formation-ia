import { readFile } from 'node:fs/promises';
import vm from 'node:vm';

const html=await readFile(new URL('../modules/rag-lab.html',import.meta.url),'utf8');
const errors=[];
const must=[
  'RAG Lab','BM25','Vectoriel · cosinus','Vectoriel · ANN','Hybride · RRF','Reranking',
  'Precision@k','Recall@k','MRR corpus','nDCG@k','Reciprocal Rank Fusion',
  'Simulation didactique, calculs réels.','corpusMRR','function bm25','function vectorSearch',
  'function annSearch','function rrf','function rerank','function metrics'
];
for(const marker of must) if(!html.includes(marker)) errors.push('marqueur manquant: '+marker);

for(let i=1;i<=12;i++) if(!html.includes('id:"C'+String(i).padStart(2,'0')+'"')) errors.push('chunk C'+String(i).padStart(2,'0')+' manquant');
for(let i=1;i<=6;i++) if(!html.includes('id:"Q'+i+'"')) errors.push('question Q'+i+' manquante');

if(/<script\s+[^>]*src=/i.test(html)||/<link\s+[^>]*href=/i.test(html)) errors.push('dépendance externe détectée');
if(/\bfetch\s*\(|XMLHttpRequest|WebSocket\s*\(/.test(html)) errors.push('appel réseau détecté');

const ids=[...html.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);
const dup=ids.filter((id,i)=>ids.indexOf(id)!==i);
if(dup.length) errors.push('id dupliqué(s): '+[...new Set(dup)].join(', '));

const script=html.match(/<script>([\s\S]*?)<\/script>/i)?.[1];
if(!script) errors.push('script du RAG Lab introuvable');
else {
  try{new vm.Script(script)}
  catch(e){errors.push('JavaScript invalide: '+e.message)}
}

if(!/@media\(max-width:650px\)/.test(html)) errors.push('responsive mobile absent');
if(!/@media\(prefers-reduced-motion:reduce\)/.test(html)) errors.push('prefers-reduced-motion absent');
if(!html.includes('Aucun appel réseau')) errors.push('garde-fou réseau non explicite');
if(!html.includes('ne peut pas récupérer un chunk')) errors.push('limite du reranker non enseignée');
if(!html.includes('ne garantit pas une réponse vraie')) errors.push('limite du RAG non enseignée');

if(errors.length){
  console.error('\n❌ RAG LAB INVALIDE\n- '+errors.join('\n- '));
  process.exit(1);
}
console.log('✅ RAG Lab valide — corpus, retrieval, reranking, métriques et garde-fous présents.');
