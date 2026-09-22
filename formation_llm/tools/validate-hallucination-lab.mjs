import { readFile } from 'node:fs/promises';
import vm from 'node:vm';

const html=await readFile(new URL('../modules/hallucination-lab.html',import.meta.url),'utf8');
const architecture=await readFile(new URL('../docs/PARCOURS_3_FIABILITE_EVALUATION.md',import.meta.url),'utf8');
const errors=[];

const must=[
  'Hallucinations & abstention',
  'Parcours 3 · Fiabilité & évaluation · Étape 1',
  'Corpus contrôlé',
  'Diagnostic Lab',
  'Abstention Lab',
  'Prémisse fausse',
  'Insuffisamment étayé',
  'Pont vers P3S2',
  'NIST AI 600-1',
  'TruthfulQA',
  'Uncertainty-Based Abstention in LLMs',
  'formation-llm-role',
  'setProjectorMode',
  'Quitter · Échap',
  'Test de maîtrise'
];
for(const m of must) if(!html.includes(m)) errors.push('marqueur P3S1 manquant: '+m);

const forbidden=[
  'Calibration Lab',
  'On Calibration of Modern Neural Networks',
  '<section class="section" id="calibration">',
  'Parcours 4 · RAG →'
];
for(const m of forbidden) if(html.includes(m)) errors.push('dette de périmètre P3S1: '+m);

const architectureMust=[
  'P3S1 — Hallucinations & abstention',
  'P3S2 — Vérification & sources',
  'P3S3 — Évaluation systématique',
  'P3S4 — Incertitude, calibration & décision à risque'
];
for(const m of architectureMust) if(!architecture.includes(m)) errors.push('contrat Parcours 3 incomplet: '+m);

if(/<script\s+[^>]*src=/i.test(html)||/<link\s+[^>]*href=/i.test(html)) errors.push('dépendance externe détectée');
if(/\bfetch\s*\(|XMLHttpRequest|WebSocket\s*\(/.test(html)) errors.push('appel réseau détecté');

const ids=[...html.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);
const dup=ids.filter((id,i)=>ids.indexOf(id)!==i);
if(dup.length) errors.push('id dupliqué(s): '+[...new Set(dup)].join(', '));

const script=html.match(/<script>([\s\S]*?)<\/script>/i)?.[1];
if(!script) errors.push('script introuvable');
else {
  try{new vm.Script(script)}
  catch(e){errors.push('JavaScript invalide: '+e.message)}
}

if(!html.includes(':focus-visible')) errors.push('focus clavier absent');
if(!/@media\(max-width:650px\)/.test(html)) errors.push('responsive mobile absent');
if(!/@media\(prefers-reduced-motion:reduce\)/.test(html)) errors.push('prefers-reduced-motion absent');
if(!html.includes('plausible, détaillé ou confiant ne signifie pas factuellement établi')) errors.push('distinction fluidité/factualité insuffisante');
if(!html.includes('Aucun appel réseau')) errors.push('garde-fou réseau absent');

if(errors.length){
  console.error('\n❌ P3S1 HALLUCINATIONS & ABSTENTION INVALIDE\n- '+errors.join('\n- '));
  process.exit(1);
}
console.log('✅ P3S1 Hallucinations & abstention valide — diagnostic, abstention, séparation P3S2/P3S4, navigation et garde-fous présents.');
