import { readFile } from 'node:fs/promises';
const html=await readFile(new URL('../index.html',import.meta.url),'utf8');
const errors=[],sequence=['A','B','C','P1S3','P1S4'];
const seqMatch=html.match(/<div class="now-grid" id="learningSequence"[\s\S]*?<\/div><\/div>\s*<div class="section" id="laboratoire-transversal"/);
if(!seqMatch) errors.push('bloc progression guidée introuvable ou labs transversaux non séparés');
else{
 const block=seqMatch[0],cards=[...block.matchAll(/data-progress-card="([^"]+)"/g)].map(m=>m[1]);
 if(cards.length!==5) errors.push('la progression guidée doit contenir exactement 5 cartes');
 if(cards.join(',')!==sequence.join(',')) errors.push('ordre attendu: '+sequence.join(' → ')+' ; trouvé: '+cards.join(' → '));
 if(block.includes('data-transversal-card')) errors.push('lab transversal mélangé à la progression guidée');
 for(const id of sequence){
   if(!block.includes('data-evaluate="'+id+'"')) errors.push('action Évaluer ma maîtrise absente pour '+id);
   if(!block.includes('data-mastery-status="'+id+'"')) errors.push('statut de maîtrise absent pour '+id);
   if(!block.includes('data-module="'+id+'"')) errors.push('lien de module absent pour '+id);
 }
}
const transversal=html.match(/<div class="transversal-grid" id="transversalLabs">[\s\S]*?<\/div>\s*<\/div>/)?.[0]||'';
if(!transversal) errors.push('bloc transversalLabs absent');
else{
 if(!transversal.includes('data-transversal-card="RAG"')) errors.push('RAG absent du bloc transversal');
 if(!transversal.includes('data-transversal-card="HALL"')) errors.push('Hallucination Lab absent du bloc transversal');
 if(!transversal.includes('data-transversal-card="P2S1"')) errors.push('Parcours 2 · Spécifier une tâche absent du bloc transversal');
 if(!transversal.includes('data-transversal-card="P2S2"')) errors.push('Parcours 2 · Exemples, frontières & format absent du bloc transversal');
 if(!transversal.includes('data-transversal-card="P2S3"')) errors.push('Parcours 2 · Tester et itérer absent du bloc transversal');
 if(!transversal.includes('data-transversal-card="P2S4"')) errors.push('Parcours 2 · Dialogue multi-tour absent du bloc transversal');
 if(!transversal.includes('data-mastery-status="RAG"')||!transversal.includes('data-mastery-status="HALL"')||!transversal.includes('data-mastery-status="P2S1"')||!transversal.includes('data-mastery-status="P2S2"')||!transversal.includes('data-mastery-status="P2S3"')||!transversal.includes('data-mastery-status="P2S4"')) errors.push('statut de maîtrise transversal absent');
 if(!transversal.includes('Hors progression guidée')) errors.push('statut transversal non expliqué');
}
if(html.includes('Marquer acquis')||html.includes('data-complete=')) errors.push('ancienne auto-déclaration de maîtrise interdite');
if(!html.includes('Évaluer ma maîtrise')) errors.push('action de maîtrise fondée sur preuves absente');
if(!html.includes('id="view-apprentissage"')) errors.push('cockpit apprentissage adaptatif absent');
if(!html.includes('diagnostic.html')) errors.push('diagnostic initial absent');
if(!html.includes('review.html')) errors.push('réactivation cumulative absente');
if(!html.includes('id="progressiveBtn"')) errors.push('contrôle progressive disclosure absent');
if(!html.includes('formation-llm-learning-v2')) errors.push('storage Learning System V2 absent');
if(!html.includes('<div class="value">11</div><div class="label">Modules novice-ready</div>')) errors.push('compteur novice-ready incohérent');
if(!html.includes('id="doneMetric">0/5</div>')) errors.push('compteur initial de maîtrise incohérent');
if(!html.includes('id="dueMetric">0</div>')) errors.push('compteur réactivation due absent');
if(!/const GUIDED=\["A","B","C","P1S3","P1S4"\]/.test(html)) errors.push('liste guidée JS incohérente');
if(!html.includes('.module-actions{display:flex;gap:8px;align-items:center;flex-wrap:wrap;margin-top:auto;padding-top:14px}')) errors.push('alignement vertical des actions non verrouillé');
if(!html.includes('Réinitialiser apprentissage')) errors.push('action de reset apprentissage mal nommée');
if(/<span class="badge ready">Nouveau<\/span>/.test(html)) errors.push('badge temporel Nouveau interdit');
if(errors.length){console.error('\n❌ TABLEAU DE BORD INCOHÉRENT\n- '+errors.join('\n- '));process.exit(1)}
console.log('✅ Dashboard V2 cohérent — diagnostic, maîtrise mesurée, réactivation, remédiation et progression guidée vérifiés.');
