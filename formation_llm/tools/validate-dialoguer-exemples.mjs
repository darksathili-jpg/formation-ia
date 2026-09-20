import { readFile } from 'node:fs/promises';

const html=await readFile(new URL('../modules/dialoguer-exemples.html',import.meta.url),'utf8');
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
const exampleControls=(html.match(/data-builder=/g)||[]).length;
const feedbackCount=(html.match(/class="feedback"(?:\s|>)/g)||[]).length;
const transferFeedbackCount=(html.match(/class="transfer-feedback"(?:\s|>)/g)||[]).length;
const words=visible(html).split(/\s+/).filter(Boolean).length;

if(sectionCount!==10) errors.push('10 étapes canoniques attendues, trouvé '+sectionCount);
if(quizCount!==6||feedbackCount!==6) errors.push('quiz P2S2 incomplet ou feedbacks désynchronisés');
if(transferCount!==4||transferFeedbackCount!==4) errors.push('transfert P2S2 incomplet ou feedbacks désynchronisés');
if(exampleControls<6) errors.push('Example Lab trop pauvre: '+exampleControls+' contrôles');
if(words<1800) errors.push('contenu novice-ready trop court: '+words+' mots');

for(const marker of [
 'P2S2 novice-ready','MODULE="P2S2"','data-success-criterion="v1"',
 'data-learning-system="v2"','data-step-registry="v1"','data-latent-nav="v2"',
 'data-mobile-module-ux="v1"','data-p2s2-visual-audit="v2"','data-assessment-guard="v1"','data-completion-guard="v1"',
 'data-latent-safe-storage="v1"','id="builderOutput" role="status" aria-live="polite" aria-atomic="true"',
 'id="completionFeedback" role="status" aria-live="polite" aria-atomic="true"',
 'href="dialoguer-specifier.html"','href="../index.html#dashboard"'
]){
 if(!html.includes(marker)) errors.push('marqueur P2S2 absent: '+marker);
}

for(const concept of [
 'Zero-shot','Few-shot','Exemple contrastif','Cas frontière','Cas hors domaine','Contrat de sortie',
 'Diversité utile > répétition','Structure valide ≠ contenu vrai','Few-shot ≠ réentraînement des poids'
]){
 if(!html.includes(concept)) errors.push('concept essentiel absent: '+concept);
}

for(const source of ['OpenAI — Prompt engineering','Google AI — Prompt design strategies','Anthropic — Prompting best practices']){
 if(!html.includes(source)) errors.push('référence documentaire absente: '+source);
}

if(/\bfetch\s*\(|XMLHttpRequest|WebSocket\s*\(/.test(html)) errors.push('appel réseau runtime détecté');
if(/\blocalStorage\./.test(html.replace(/<script data-latent-safe-storage="v1">[\s\S]*?<\/script>/,''))) errors.push('accès direct localStorage hors helper');
if(!html.includes('#builder .criteria label{')||!html.includes('min-height:44px')) errors.push('Example Lab sans cibles tactiles renforcées');
if(!html.includes('#pieges .mis{')||!html.includes('grid-template-rows:auto 1fr auto')) errors.push('six pièges sans hiérarchie visuelle stabilisée');
if(!html.includes('#transfert .transfer-card{display:flex;flex-direction:column;gap:8px}')) errors.push('cartes de transfert non normalisées');
if(!html.includes('html.projector #builder .criteria label{background:#ffffff!important')) errors.push('Example Lab non sécurisé en projection');
if(!html.includes('html.projector #pieges .mis{border-top-color:#8b1f2b!important}')) errors.push('pièges non sécurisés en projection');
if(!html.includes('grid-template-columns:repeat(3,minmax(0,1fr))')) errors.push('commandes mobiles non stabilisées');
if(!html.includes('#trainerBtn[aria-pressed="true"]::after{content:"○ Stagiaire"}')) errors.push('libellé mobile profil non synchronisé');
if(!html.includes('#projectorBtn[aria-pressed="true"]::after{content:"✕ Quitter"}')) errors.push('libellé mobile projection non synchronisé');
if(!html.includes('choix restant"+(missing.length>1?"s":"")+" avant vérification."')) errors.push('complétion incomplète non protégée');
if(!html.includes('réponse"+(missing.length>1?"s":"")+" restante')) errors.push('quiz incomplet non protégé');
if(!html.includes('choix restant"+(missing.length>1?"s":"")+" avant correction."')) errors.push('transfert incomplet non protégé');

if(errors.length){
 console.error('\n❌ P2S2 INVALIDE\n- '+errors.join('\n- '));
 process.exit(1);
}
console.log('✅ P2S2 valide — exemples, frontières, format, NOVICE-FIRST, mobile et Learning System V2 vérifiés.');
