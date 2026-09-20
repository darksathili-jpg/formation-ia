import { readFile } from 'node:fs/promises';

const html=await readFile(new URL('../modules/dialoguer-multitour.html',import.meta.url),'utf8');
const errors=[];

function visible(source){
 return source.replace(/<script[\s\S]*?<\/script>/gi,' ')
  .replace(/<style[\s\S]*?<\/style>/gi,' ')
  .replace(/<[^>]+>/g,' ')
  .replace(/\s+/g,' ').trim();
}

const pedagogicalOrder=[
 'prerequisites','intuition','definition','worked-example','guided-practice',
 'completion','misconception','self-explanation','retrieval','transfer','recap'
];
let previous=-1;
for(const key of pedagogicalOrder){
 const pos=html.indexOf('data-pedagogy="'+key+'"');
 if(pos<0) errors.push('bloc pédagogique absent: '+key);
 else if(pos<previous) errors.push('ordre novice-first rompu autour de '+key);
 previous=Math.max(previous,pos);
}

const sectionCount=(html.match(/<section class="section"/g)||[]).length;
const quizCount=(html.match(/<fieldset class="q"/g)||[]).length;
const transferCount=(html.match(/class="transfer-card"/g)||[]).length;
const turnCount=(html.match(/class="turn-case"/g)||[]).length;
const feedbackCount=(html.match(/class="feedback"(?:\s|>)/g)||[]).length;
const transferFeedbackCount=(html.match(/class="transfer-feedback"(?:\s|>)/g)||[]).length;
const turnFeedbackCount=(html.match(/class="turn-feedback"(?:\s|>)/g)||[]).length;
const words=visible(html).split(/\s+/).filter(Boolean).length;

if(sectionCount!==10) errors.push('10 étapes canoniques attendues, trouvé '+sectionCount);
if(quizCount!==6||feedbackCount!==6) errors.push('quiz P2S4 incomplet ou feedbacks désynchronisés');
if(transferCount!==4||transferFeedbackCount!==4) errors.push('transfert P2S4 incomplet ou feedbacks désynchronisés');
if(turnCount!==5||turnFeedbackCount!==5) errors.push('Context Ledger incomplet: 5 tours décisionnels attendus');
if(words<2100) errors.push('contenu novice-ready trop court: '+words+' mots');

for(const marker of [
 'P2S4 novice-ready','MODULE="P2S4"','data-success-criterion="v1"',
 'data-learning-system="v2"','data-step-registry="v1"','data-latent-nav="v2"',
 'data-mobile-module-ux="v1"','data-p2s4-visual-audit="v1"',
 'data-assessment-guard="v1"','data-completion-guard="v1"','data-ledger-guard="v1"',
 'data-latent-safe-storage="v1"','id="builderOutput" role="status" aria-live="polite" aria-atomic="true"',
 'id="completionFeedback" role="status" aria-live="polite" aria-atomic="true"',
 'href="dialoguer-iterer.html"','href="../index.html#dashboard"'
]){
 if(!html.includes(marker)) errors.push('marqueur P2S4 absent: '+marker);
}

for(const concept of [
 'Contrat actif','Contexte transitoire','Mise à jour explicite','Clarification',
 'Checkpoint','Dérive de consigne','mémoire parfaite','contexte est une ressource finie'
]){
 if(!html.toLowerCase().includes(concept.toLowerCase())) errors.push('concept essentiel absent: '+concept);
}

for(const source of [
 'OpenAI — Prompt engineering',
 'OpenAI — Prompt generation',
 'Anthropic — Effective context engineering',
 'Google Gemini — Interactions & prompting strategies'
]){
 if(!html.includes(source)) errors.push('référence documentaire absente: '+source);
}

for(const id of [
 'P2S4.HISTORY_MEMORY','P2S4.STABLE_TRANSIENT','P2S4.CLARIFY',
 'P2S4.RECAP','P2S4.DRIFT','P2S4.CONTEXT_BUDGET'
]){
 if(!html.includes(id)) errors.push('misconception P2S4 non branchée: '+id);
}

for(const answer of ['data-answer="update"','data-answer="ask"','data-answer="drop"']){
 if(!html.includes(answer)) errors.push('opération Ledger absente: '+answer);
}
if(!html.includes('ledger.stable.join')||!html.includes('ledger.updates.join')||!html.includes('ledger.open.join')||!html.includes('ledger.dropped.join')) errors.push('checkpoint du Context Ledger incomplet');
if(!html.includes('<b>Stable.</b>')||!html.includes('<b>Mises à jour.</b>')||!html.includes('<b>Questions ouvertes.</b>')||!html.includes('<b>Écarté.</b>')) errors.push('état conversationnel non rendu visible dans le Ledger');
if(!html.includes('Décisions incomplètes.')) errors.push('Context Ledger incomplet non protégé');
if(!html.includes('.turn-case select{width:100%;min-height:44px;border:1px solid var(--line);background:var(--panel2);color:var(--text)')) errors.push('sélecteurs du Context Ledger sans surface/contraste explicites');
if(!html.includes('#builder .grid2{align-items:start}')) errors.push('colonnes du Context Ledger encore étirées verticalement');
if(!html.includes('html:not(.projector) #builder .grid2>.panel:last-child{position:sticky;top:132px}')) errors.push('checkpoint desktop non maintenu visible pendant le Ledger');
if(!html.includes('html.projector .context-ledger-mini')) errors.push('Context Ledger non sécurisé en projection');
if(!html.includes('html.projector .turn-case select{background:#ffffff!important;color:#000000!important')) errors.push('sélecteurs Ledger non sécurisés en projection');
if(!html.includes('#pieges .mis{')||!html.includes('grid-template-rows:auto 1fr auto')) errors.push('pièges sans hiérarchie visuelle stabilisée');
if(!html.includes('#transfert .transfer-card{display:flex;flex-direction:column;gap:8px}')) errors.push('cartes de transfert non normalisées');

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
 console.error('\n❌ P2S4 INVALIDE\n- '+errors.join('\n- '));
 process.exit(1);
}
console.log('✅ P2S4 valide — contrat actif, clarification, checkpoints, dérive, mobile et Learning System V2 vérifiés.');
