import { readFile } from 'node:fs/promises';

const html=await readFile(new URL('../modules/dialoguer-iterer.html',import.meta.url),'utf8');
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
const labOptions=(html.match(/data-builder=/g)||[]).length;
const feedbackCount=(html.match(/class="feedback"(?:\s|>)/g)||[]).length;
const transferFeedbackCount=(html.match(/class="transfer-feedback"(?:\s|>)/g)||[]).length;
const words=visible(html).split(/\s+/).filter(Boolean).length;

if(sectionCount!==10) errors.push('10 étapes canoniques attendues, trouvé '+sectionCount);
if(quizCount!==6||feedbackCount!==6) errors.push('quiz P2S3 incomplet ou feedbacks désynchronisés');
if(transferCount!==4||transferFeedbackCount!==4) errors.push('transfert P2S3 incomplet ou feedbacks désynchronisés');
if(labOptions<4) errors.push('Iteration Lab trop pauvre: '+labOptions+' modifications testables');
if(words<1900) errors.push('contenu novice-ready trop court: '+words+' mots');

for(const marker of [
 'P2S3 novice-ready','MODULE="P2S3"','data-success-criterion="v1"',
 'data-learning-system="v2"','data-step-registry="v1"','data-latent-nav="v2"',
 'data-mobile-module-ux="v1"','data-p2s3-visual-audit="v1"',
 'data-assessment-guard="v1"','data-completion-guard="v1"',
 'data-latent-safe-storage="v1"','id="builderOutput" role="status" aria-live="polite" aria-atomic="true"',
 'id="completionFeedback" role="status" aria-live="polite" aria-atomic="true"',
 'href="dialoguer-exemples.html"','href="../index.html#dashboard"'
]){
 if(!html.includes(marker)) errors.push('marqueur P2S3 absent: '+marker);
}

for(const concept of [
 'Baseline','Échec observé','Hypothèse','Jeu de tests','Modification contrôlée','Régression',
 'ça semble mieux','sur-ajustement','rejouer','une seule variable'
]){
 if(!html.toLowerCase().includes(concept.toLowerCase())) errors.push('concept essentiel absent: '+concept);
}

for(const source of [
 'OpenAI — Prompt engineering & Evals',
 'OpenAI — Systematically test agent skills with evals',
 'Google Cloud — LLM-Evalkit',
 'Anthropic — Prompting best practices'
]){
 if(!html.includes(source)) errors.push('référence documentaire absente: '+source);
}

for(const id of ['P2S3.FEEL','P2S3.MULTI_CHANGE','P2S3.TEST_SET','P2S3.REGRESSION','P2S3.OVERFIT','P2S3.SCORE_ONLY']){
 if(!html.includes(id)) errors.push('misconception P2S3 non branchée: '+id);
}

if(!html.includes('targeted:{score:6')||!html.includes('oneExample:{score:5')||!html.includes('expertRole:{score:4')||!html.includes('multi:{score:6')) errors.push('scénarios de comparaison de l’Iteration Lab incomplets');
if(!html.includes("<b>Hypothèse.</b>")||!html.includes("<b>Variable testée.</b>")||!html.includes("<b>Régressions.</b>")||!html.includes("<b>Mesure.</b>")) errors.push('Iteration Lab ne rend pas visible la chaîne hypothèse → variable → régression → mesure');
if(!html.includes('Décision expérimentale.')) errors.push('Iteration Lab sans décision expérimentale explicite');
if(!html.includes('Aucune hypothèse isolable')) errors.push('cas multi-variable sans signal pédagogique d’hypothèse non isolable');

if(!html.includes('Baseline : 4 / 6')||!html.includes('baseline 4 / 6')) errors.push('baseline non rendue visible dans l’Iteration Lab et sa comparaison');
if(!html.includes('cause du gain est indéterminée')||!html.includes('Aucune hypothèse isolable')) errors.push('cas multi-variable sans avertissement causal');
if(!html.includes('généralisation incomplète')) errors.push('cas de sur-ajustement local non explicité');
if(!html.includes('#builder .criteria label{')||!html.includes('min-height:44px')) errors.push('Iteration Lab sans cibles tactiles renforcées');
if(!html.includes('#pieges .mis{')||!html.includes('grid-template-rows:auto 1fr auto')) errors.push('pièges sans hiérarchie visuelle stabilisée');
if(!html.includes('#transfert .transfer-card{display:flex;flex-direction:column;gap:8px}')) errors.push('cartes de transfert non normalisées');
if(!html.includes('html.projector #builder .criteria label{background:#ffffff!important')) errors.push('Iteration Lab non sécurisé en projection');

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
 console.error('\n❌ P2S3 INVALIDE\n- '+errors.join('\n- '));
 process.exit(1);
}
console.log('✅ P2S3 valide — boucle expérimentale, régressions, sur-ajustement, NOVICE-FIRST, mobile et Learning System V2 vérifiés.');
