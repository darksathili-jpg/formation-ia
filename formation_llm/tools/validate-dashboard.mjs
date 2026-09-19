import { readFile } from 'node:fs/promises';

const html=await readFile(new URL('../index.html',import.meta.url),'utf8');
const errors=[];
const sequence=['A','B','C','P1S3','P1S4'];

const seqMatch=html.match(/<div class="now-grid" id="learningSequence"[\s\S]*?<\/div><\/div>\s*<div class="section" id="laboratoire-transversal"/);
if(!seqMatch){
  errors.push('bloc progression guidée introuvable ou laboratoire transversal non séparé');
}else{
  const block=seqMatch[0];
  const cards=[...block.matchAll(/data-progress-card="([^"]+)"/g)].map(m=>m[1]);
  if(cards.length!==5) errors.push('la progression guidée doit contenir exactement 5 cartes');
  if(cards.join(',')!==sequence.join(',')) errors.push('ordre attendu: '+sequence.join(' → ')+' ; trouvé: '+cards.join(' → '));
  if(block.includes('data-transversal-card')) errors.push('un laboratoire transversal est mélangé à la progression guidée');
  for(const id of sequence){
    if(!block.includes('data-complete="'+id+'"')) errors.push('bouton Marquer acquis absent pour '+id);
    if(!block.includes('data-module="'+id+'"')) errors.push('lien de module absent pour '+id);
  }
}

const transversal=html.match(/<div class="transversal-grid" id="transversalLabs">[\s\S]*?<\/div>\s*<\/div>/)?.[0]||'';
if(!transversal) errors.push('bloc transversalLabs absent');
else{
  if(!transversal.includes('data-transversal-card="RAG"')) errors.push('RAG absent du bloc transversal');
  if(!transversal.includes('data-transversal-card="HALL"')) errors.push('Hallucination Lab absent du bloc transversal');
  if(transversal.includes('data-complete=')) errors.push('un laboratoire transversal ne doit pas modifier la progression guidée');
  if(!transversal.includes('Hors progression guidée')) errors.push('statut transversal non expliqué');
}

if(/<span class="badge ready">Nouveau<\/span>/.test(html)) errors.push('badge temporel "Nouveau" interdit dans le tableau de bord persistant');
if(!html.includes('<div class="value">5</div><div class="label">Modules actifs</div>')) errors.push('compteur Modules actifs incohérent');
if(!html.includes('id="doneMetric">0/5</div>')) errors.push('compteur initial de progression incohérent');
if(!/done=\["A","B","C","P1S3","P1S4"\]/.test(html)) errors.push('liste de progression JS incohérente');
if(!html.includes('.module-actions{display:flex;gap:8px;align-items:center;flex-wrap:wrap;margin-top:auto;padding-top:14px}')) errors.push('alignement vertical des actions de cartes non verrouillé');
if(html.includes('maîtrise formateur.</p>')) errors.push('ancien libellé "maîtrise formateur" encore visible');
if(html.includes('Hallucination Lab à construire')) errors.push('roadmap obsolète : Hallucination Lab est déjà actif');

if(errors.length){
  console.error('\n❌ TABLEAU DE BORD INCOHÉRENT\n- '+errors.join('\n- '));
  process.exit(1);
}
console.log('✅ Tableau de bord cohérent — progression guidée séparée des labs transversaux, ordre, actions, statuts et compteurs vérifiés.');
