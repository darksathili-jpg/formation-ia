import { readFile } from 'node:fs/promises';

const html=await readFile(new URL('../modules/dialoguer-tache-complexe.html',import.meta.url),'utf8');
const errors=[];

function visible(source){
 return source.replace(/<script[\s\S]*?<\/script>/gi,' ')
  .replace(/<style[\s\S]*?<\/style>/gi,' ')
  .replace(/<[^>]+>/g,' ')
  .replace(/\s+/g,' ').trim();
}

const order=['prerequisites','intuition','definition','worked-example','guided-practice','completion','misconception','self-explanation','retrieval','transfer','recap'];
let previous=-1;
for(const key of order){
 const pos=html.indexOf('data-pedagogy="'+key+'"');
 if(pos<0) errors.push('bloc pédagogique absent: '+key);
 else if(pos<previous) errors.push('ordre novice-first rompu autour de '+key);
 previous=Math.max(previous,pos);
}

const sectionCount=(html.match(/<section class="section"/g)||[]).length;
const quizCount=(html.match(/<fieldset class="q"/g)||[]).length;
const transferCount=(html.match(/class="transfer-card"/g)||[]).length;
const workflowCount=(html.match(/class="workflow-case"/g)||[]).length;
const feedbackCount=(html.match(/class="feedback"(?:\s|>)/g)||[]).length;
const transferFeedbackCount=(html.match(/class="transfer-feedback"(?:\s|>)/g)||[]).length;
const workflowFeedbackCount=(html.match(/class="workflow-feedback"(?:\s|>)/g)||[]).length;
const words=visible(html).split(/\s+/).filter(Boolean).length;

if(sectionCount!==10) errors.push('10 étapes canoniques attendues, trouvé '+sectionCount);
if(quizCount!==6||feedbackCount!==6) errors.push('quiz P2S5 incomplet ou feedbacks désynchronisés');
if(transferCount!==4||transferFeedbackCount!==4) errors.push('transfert P2S5 incomplet ou feedbacks désynchronisés');
if(workflowCount!==5||workflowFeedbackCount!==5) errors.push('Workflow Lab incomplet: 5 décisions attendues');
if(words<2200) errors.push('contenu novice-ready trop court: '+words+' mots');

for(const marker of [
 'P2S5 novice-ready','MODULE="P2S5"','data-success-criterion="v1"',
 'data-learning-system="v2"','data-step-registry="v1"','data-latent-nav="v2"',
 'data-mobile-module-ux="v1"','data-p2s5-visual-audit="v1"',
 'data-assessment-guard="v1"','data-completion-guard="v1"','data-workflow-guard="v1"',
 'data-latent-safe-storage="v1"','id="builderOutput" role="status" aria-live="polite" aria-atomic="true"',
 'id="completionFeedback" role="status" aria-live="polite" aria-atomic="true"',
 'href="dialoguer-multitour.html"','href="../index.html#dashboard"'
]){
 if(!html.includes(marker)) errors.push('marqueur P2S5 absent: '+marker);
}

for(const concept of [
 'Objectif final','Sous-tâche','Dépendance','Information bloquante','Séquentiel / parallèle',
 'Checkpoint','Critère d’arrêt','revalider','workflow observable','Plan observable ≠ chaîne de pensée'
]){
 if(!html.toLowerCase().includes(concept.toLowerCase())) errors.push('concept essentiel absent: '+concept);
}

for(const source of [
 'OpenAI — Prompt engineering',
 'OpenAI Help — créer un bon prompt',
 'Anthropic — Building effective agents',
 'Google Gemini — Prompt design strategies'
]){
 if(!html.includes(source)) errors.push('référence documentaire absente: '+source);
}

for(const id of [
 'P2S5.MORE_STEPS','P2S5.PARALLEL','P2S5.DEPENDENCY','P2S5.CHECKPOINT',
 'P2S5.STOP','P2S5.REVALIDATE','P2S5.BLOCKER'
]){
 if(!html.includes(id)) errors.push('misconception P2S5 non branchée: '+id);
}

for(const answer of ['data-answer="clarify"','data-answer="parallel"','data-answer="sequential"','data-answer="checkpoint"','data-answer="stop"']){
 if(!html.includes(answer)) errors.push('décision Workflow Lab absente: '+answer);
}

if(!html.includes('workflowSummary')||!html.includes('Analyser les trois documents en parallèle')||!html.includes('Valider le plan pédagogique avant production complète')) errors.push('workflow résultant incomplet');
if(!html.includes('Workflow incomplet.')) errors.push('Workflow Lab incomplet non protégé');
if(!html.includes('.workflow-case select{width:100%;min-width:0;max-width:100%;min-height:44px')) errors.push('sélecteurs du Workflow Lab non contraints au viewport');
if(!html.includes('#builder .grid2>*{min-width:0}')) errors.push('colonnes du Workflow Lab peuvent encore déborder par min-content');
if(!html.includes('#builder .grid2{align-items:start}')) errors.push('colonnes du Workflow Lab encore étirées verticalement');
if(!html.includes('html:not(.projector) #builder .grid2>.panel:last-child{position:sticky;top:132px}')) errors.push('workflow résultant desktop non maintenu visible');
if(!html.includes('html.projector .workflow-case select{background:#ffffff!important;color:#000000!important')) errors.push('sélecteurs Workflow Lab non sécurisés en projection');
if(!html.includes('#pieges .mis{')||!html.includes('grid-template-rows:auto 1fr auto')) errors.push('pièges sans hiérarchie visuelle stabilisée');
if(!html.includes('#transfert .transfer-card{display:flex;flex-direction:column;gap:8px;min-width:0}')) errors.push('cartes de transfert non normalisées ou susceptibles de déborder');
if(!html.includes('#transfert .transfer-card select{margin-top:auto;min-width:0;max-width:100%;width:100%')) errors.push('sélecteurs de transfert non contraints au viewport');
if(!html.includes('overflow-wrap:anywhere')) errors.push('textes longs P2S5 sans garde-fou de reflow');

if(/\bfetch\s*\(|XMLHttpRequest|WebSocket\s*\(/.test(html)) errors.push('appel réseau runtime détecté');
const noStorageHelper=html.replace(/<script data-latent-safe-storage="v1">[\s\S]*?<\/script>/,'');
if(/\blocalStorage\./.test(noStorageHelper)) errors.push('accès direct localStorage hors helper');
if(!html.includes('grid-template-columns:repeat(3,minmax(0,1fr))')) errors.push('commandes mobiles non stabilisées');
if(!html.includes('#trainerBtn[aria-pressed="true"]::after{content:"○ Stagiaire"}')) errors.push('libellé mobile profil non synchronisé');
if(!html.includes('#projectorBtn[aria-pressed="true"]::after{content:"✕ Quitter"}')) errors.push('libellé mobile projection non synchronisé');
if(!html.includes('choix restant"+(missing.length>1?"s":"")+" avant vérification."')) errors.push('complétion incomplète non protégée');
if(!html.includes('réponse"+(missing.length>1?"s":"")+" restante')) errors.push('quiz incomplet non protégé');
if(!html.includes('choix restant"+(missing.length>1?"s":"")+" avant correction."')) errors.push('transfert incomplet non protégé');

if(errors.length){
 console.error('\n❌ P2S5 INVALIDE\n- '+errors.join('\n- '));
 process.exit(1);
}
console.log('✅ P2S5 valide — décomposition, dépendances, parallèle, checkpoints, arrêt, NOVICE-FIRST et Learning System V2 vérifiés.');
