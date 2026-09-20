import { readFile } from 'node:fs/promises';
const root=new URL('../',import.meta.url);
const pages=[
 'index.html','diagnostic.html','review.html',
 'modules/domaine-a.html','modules/domaine-b.html','modules/domaine-c.html',
 'modules/transformer-block-lab.html','modules/sampling-lab.html',
 'modules/hallucination-lab.html','modules/rag-lab.html','modules/dialoguer-specifier.html'
];
const errors=[];
for(const page of pages){
 const html=await readFile(new URL('../'+page,import.meta.url),'utf8');
 const p=page+': ';
 if(!html.includes('data-ui-system="latent-v1"')) errors.push(p+'marqueur LATENT UI absent');
 if(!html.includes('data-latent-ui="v1"')) errors.push(p+'feuille de style LATENT UI absente');
 if(!html.includes('class="skip-link"')||!html.includes('id="mainContent"')) errors.push(p+'navigation d’évitement clavier absente');
 if(!html.includes('prefers-reduced-motion')) errors.push(p+'reduced motion absent');
 if(!html.includes(':focus-visible')) errors.push(p+'focus visible absent');
 if(!/min-height:\s*44px/.test(html)) errors.push(p+'cible d’action 44px non verrouillée');
 if(/https?:\/\//.test((html.match(/<style data-latent-ui="v1">[\s\S]*?<\/style>/)||[''])[0])) errors.push(p+'URL distante dans le design system');
}
for(const page of pages.filter(p=>p.startsWith('modules/'))){
 const html=await readFile(new URL('../'+page,import.meta.url),'utf8');
 if(!html.includes('data-latent-nav="v2"')||!html.includes('layer-nav')) errors.push(page+': Layer Navigator V2 absent');
 if(!html.includes('aria-current","step"')) errors.push(page+': état de section courante absent');
}
function learnerStepSections(html){
 const main=(html.match(/<main\b[\s\S]*?<\/main>/)||[''])[0];
 return [...main.matchAll(/<section\b([^>]*)>([\s\S]*?)(?=<section\b|<\/main>)/g)]
  .filter(m=>/\bclass="[^"]*\bsection\b[^"]*"/.test(m[1])&&!/\btrainer-only\b/.test(m[1]))
  .map(m=>({attrs:m[1],body:m[2]}));
}
for(const page of pages.filter(p=>p.startsWith('modules/'))){
 const html=await readFile(new URL('../'+page,import.meta.url),'utf8');
 const steps=learnerStepSections(html);
 if(!html.includes('data-step-registry="v1"')) errors.push(page+': registre canonique des étapes absent');
 if(!html.includes('window.LATENT_STEP_REGISTRY=segments')) errors.push(page+': registre d’étapes non partagé');
 if(!html.includes('main > section.section')||!html.includes('!x.classList.contains("trainer-only")')) errors.push(page+': sélecteur canonique des étapes absent');
 if(html.includes('querySelectorAll("main > section")].filter(x=>!x.classList.contains("hero"))')) errors.push(page+': ancien comptage incluant les prérequis encore présent');
 if(!html.includes('progressiveStepIndex')) errors.push(page+': index de progression canonique absent');
 if(!html.includes('Number.isInteger(legacy)?Math.max(0,legacy-1)')) errors.push(page+': migration de l’ancien index non verrouillée');
 if(!html.includes('latent:stepchange')) errors.push(page+': synchronisation Runtime/Layer Navigator absente');
 if(!html.includes('data-step-badge-layout="v1"')) errors.push(page+': centrage canonique des badges d’étape absent');
 if(page.endsWith('dialoguer-specifier.html')){
  if(!html.includes('data-p2s1-visual-audit="v1"')) errors.push(page+': passe visuelle P2S1 absente');
  if(!html.includes('id="builderOutput" role="status" aria-live="polite" aria-atomic="true"')) errors.push(page+': Prompt Builder non annoncé aux technologies d’assistance');
  if(!html.includes('id="builderOptions" role="group"')) errors.push(page+': options du Prompt Builder sans groupe accessible');
  if(!html.includes('font-size:clamp(2.25rem,12vw,3.35rem)!important')) errors.push(page+': titre mobile P2S1 non stabilisé');
  if(!html.includes('#builder .criteria label{color:var(--text)!important')) errors.push(page+': libellés du Prompt Builder insuffisamment renforcés');
 }
 if(!html.includes('display:grid!important')||!html.includes('place-items:center!important')||!html.includes('flex:0 0 42px!important')) errors.push(page+': badge d’étape non centré/verrouillé');
 if(!html.includes('currentStep+1')||!html.includes('segments.length')) errors.push(page+': Runtime non branchée sur l’étape courante canonique');
 if(!html.includes('const sections=window.LATENT_STEP_REGISTRY')) errors.push(page+': Layer Navigator ne consomme pas le registre canonique');
 steps.forEach((step,i)=>{
   const badge=(step.body.match(/class="(?:num|section-num)"[^>]*>\s*([^<]+)</)||[])[1]?.trim();
   const expected=String(i+1).padStart(2,'0');
   if(badge!==expected) errors.push(page+': numérotation statique invalide à l’étape '+expected+' (trouvé '+String(badge)+')');
 });
 if(!steps.length) errors.push(page+': aucune étape pédagogique canonique détectée');
}
const index=await readFile(new URL('../index.html',import.meta.url),'utf8');
for(const marker of ['LATENT','latent-map','signal-rail','Neural learning workspace']){
 if(!index.includes(marker)) errors.push('index.html: signature manquante: '+marker);
}
if(index.includes('font-family:var(--display);') && !index.includes('--display:"Segoe UI Variable Display"')) errors.push('index.html: ancienne esthétique serif non neutralisée');

// Verrous de régression issus de l’audit ergonomique écran/projection.
const projectionPages=['index.html',...pages.filter(p=>p.startsWith('modules/'))];
for(const page of projectionPages){
 const html=await readFile(new URL('../'+page,import.meta.url),'utf8');
 if(!html.includes('data-projection-ux="v2"')) errors.push(page+': palette projection haute luminance absente');
 if(!html.includes('data-projection-audit="v3"')) errors.push(page+': garde-fous projection V3 absents');
 if(!html.includes('max-width:calc(100vw - 20px)!important')) errors.push(page+': sortie projection peut déborder du viewport');
 if(!html.includes('>✕ Quitter · Échap</button>')) errors.push(page+': libellé de sortie projection non compact');
 if(page.startsWith('modules/')&&!html.includes('html.projector .layer-nav{display:none!important}')) errors.push(page+': Layer Navigator non neutralisé en projection');
 if(page.startsWith('modules/')&&!html.includes('data-projection-module-audit="v3"')) errors.push(page+': neutralisation des surfaces sombres de module absente');
 if(page.startsWith('modules/')&&!html.includes('html.projector .section-head .num')) errors.push(page+': numéros de section sombres non neutralisés');
 if(!html.includes('--bg:#ffffff')||!html.includes('--text:#000000')) errors.push(page+': contraste structurel projection non verrouillé');
}
for(const page of pages.filter(p=>p.startsWith('modules/'))){
 const html=await readFile(new URL('../'+page,import.meta.url),'utf8');
 if(!html.includes('data-ux-audit="v1"')) errors.push(page+': correctifs responsive UX absents');
 if(!html.includes('@media(max-width:900px){.learning-guide{position:relative!important;top:auto!important}}')) errors.push(page+': Runtime Bar tablette non sécurisé');
 if(!html.includes('@media(max-width:1380px){.layer-nav{display:none!important}}')) errors.push(page+': seuil anti-chevauchement Layer Navigator absent');
 if(!html.includes('.q label{min-height:44px')) errors.push(page+': cibles tactiles du quiz non harmonisées');
}
// Le cockpit mobile doit conserver les trois commandes globales même lorsque la sidebar desktop disparaît.
for(const marker of ['data-mobile-cockpit-controls="v1"','data-mobile-cockpit-controls-runtime="v1"','class="mobile-modebar"','id="mobileThemeBtn"','id="mobileTrainerBtn"','id="mobileProjectorBtn"']){
 if(!index.includes(marker)) errors.push('index.html: cockpit mobile sans commandes de profil/vision ('+marker+')');
}
if(!index.includes('.mobile-modebar{')||!index.includes('grid-template-columns:repeat(3,minmax(0,1fr))')) errors.push('index.html: barre de modes mobile non répartie sur trois cibles tactiles');
if(!index.includes('.projector .mobile-modebar{display:none!important}')) errors.push('index.html: barre de modes mobile non neutralisée en projection');
if(!index.includes('mobileTrainer.textContent=trainerOn?"○ Stagiaire":"◆ Formateur"')) errors.push('index.html: libellé du profil mobile non synchronisé');
if(!index.includes('mobileProjector.textContent=projectorOn?"✕ Quitter":"▣ Projection"')) errors.push('index.html: libellé projection mobile non synchronisé');
if(!index.includes('data-ux-audit="v1"')||!index.includes('.mobile-nav{height:57px')||!index.includes('.topbar{top:57px')) errors.push('index.html: empilement sticky mobile non verrouillé');
if(!index.includes('.app{grid-template-columns:minmax(0,1fr)!important')||!index.includes('.main{grid-column:1/-1!important;width:100%!important')) errors.push('index.html: grille mobile peut retomber dans la colonne LATENT de 250px');
if(!index.includes('.topbar{position:relative!important;top:auto!important}')) errors.push('index.html: double barre sticky mobile encore possible');
if(!index.includes('.hero h1{font-size:clamp(2.45rem,10.5vw,3.6rem)!important')) errors.push('index.html: héros mobile non compacté');
if(!index.includes('.metrics{grid-template-columns:repeat(2,minmax(0,1fr))!important')) errors.push('index.html: métriques mobile non regroupées en 2x2');
if(!index.includes('.section-head{flex-direction:column!important;align-items:flex-start!important')) errors.push('index.html: en-tête de progression mobile encore comprimé');
if(!index.includes('html.projector .path-n{')||!index.includes('html.projector #learningSequence .module:after{')) errors.push('index.html: éléments sombres résiduels du cockpit en projection');
if(!index.includes('html.projector .state{font-size:.82rem')) errors.push('index.html: badges d’état trop petits en projection');
if(!index.includes('data-classic-surface-tuning="v1"')||!index.includes('data-classic-index-surfaces="v1"')) errors.push('index.html: adoucissement des surfaces sombres classiques absent');
for(const page of pages.filter(p=>p.startsWith('modules/'))){
 const html=await readFile(new URL('../'+page,import.meta.url),'utf8');
 if(!html.includes('data-classic-surface-tuning="v1"')||!html.includes('data-classic-module-surfaces="v1"')) errors.push(page+': surfaces techniques classiques encore trop noires');
 if(!html.includes('background:rgba(23,58,66,.96)!important')) errors.push(page+': Runtime Bar classique non adoucie');
}
for(const page of pages.filter(p=>p.startsWith('modules/'))){
 const html=await readFile(new URL('../'+page,import.meta.url),'utf8');
 if(!html.includes('data-mobile-module-ux="v1"')) errors.push(page+': barre d’outils mobile non stabilisée');
 if(!html.includes('grid-template-columns:repeat(3,minmax(0,1fr))')) errors.push(page+': commandes mobiles non réparties sur trois cibles');
 if(!html.includes('#trainerBtn[aria-pressed="true"]::after{content:"○ Stagiaire"}')) errors.push(page+': libellé mobile du mode formateur non synchronisé');
 if(!html.includes('#projectorBtn[aria-pressed="true"]::after{content:"✕ Quitter"}')) errors.push(page+': libellé mobile de projection non synchronisé');
 if(!html.includes('href="../index.html#dashboard"')) errors.push(page+': retour cockpit absent en fin de module');
}
for(const page of pages.filter(p=>p.startsWith('modules/'))){
 const html=await readFile(new URL('../'+page,import.meta.url),'utf8');
 if(!html.includes('data-assessment-ux="v1"')||!html.includes('data-assessment-guard="v1"')) errors.push(page+': garde-fous ergonomiques quiz/transfert absents');
 if(!html.includes('aria-live="polite" aria-atomic="true"')) errors.push(page+': résultat d’évaluation non annoncé');
 if(!html.includes('.transfer-card select{min-height:44px}')) errors.push(page+': sélecteurs de transfert trop petits');
 if(!html.includes('réponse"+(missing.length>1?"s":"")+" restante')) errors.push(page+': quiz incomplet peut encore être corrigé');
 if(!html.includes('choix restant"+(missing.length>1?"s":"")+" avant correction.')) errors.push(page+': transfert incomplet peut encore être corrigé');
}
for(const page of pages.filter(p=>p.startsWith('modules/'))){
 const html=await readFile(new URL('../'+page,import.meta.url),'utf8');
 if(!html.includes('data-microtype-contrast="v1"')) errors.push(page+': garde-fou microtypographie/contraste absent');
 if(/<\/strong>[\p{L}\d]/u.test(html)) errors.push(page+': texte collé après un libellé strong');
 if(!html.includes('.journey-card .k{')||!html.includes('color:#356d73!important')) errors.push(page+': micro-titres de parcours insuffisamment contrastés');
 if(!html.includes('.intuition>strong:first-child')) errors.push(page+': séparation structurelle des libellés inline absente');
}
for(const page of pages.filter(p=>p.startsWith('modules/'))){
 const html=await readFile(new URL('../'+page,import.meta.url),'utf8');
 if(html.includes('querySelectorAll("[data-answer]")')) errors.push(page+': activité de complétion utilise encore un sélecteur global data-answer');
 if(html.includes('id="completer"')&&html.includes('id="checkCompletion"')&&!html.includes('querySelectorAll("#completer [data-answer]")')&&!html.includes('querySelectorAll("#completer [data-completion]")')) errors.push(page+': activité de complétion non limitée à sa propre section');
}
for(const page of pages.filter(p=>p.startsWith('modules/'))){
 const html=await readFile(new URL('../'+page,import.meta.url),'utf8');
 if(!html.includes('data-completion-ux="v1"')||!html.includes('data-completion-guard="v1"')) errors.push(page+': garde-fou de complétion incomplète absent');
 if(!html.includes('id="completionFeedback" role="status" aria-live="polite" aria-atomic="true"')) errors.push(page+': feedback de complétion non annoncé');
 if(!html.includes('#completer select{min-height:44px}')) errors.push(page+': sélecteurs de complétion trop petits');
 if(!html.includes('choix restant"+(missing.length>1?"s":"")+" avant vérification.')) errors.push(page+': complétion vide encore comptée comme erreur');
}

if(errors.length){console.error('\n❌ LATENT UI INVALIDE\n- '+errors.join('\n- '));process.exit(1)}
console.log('✅ LATENT UI valide — identité, navigation, accessibilité et motion guard vérifiés.');
